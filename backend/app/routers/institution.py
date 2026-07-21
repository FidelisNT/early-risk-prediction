from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    AuditAction,
    DiseaseType,
    HealthRecord,
    HealthInstitution,
    Patient,
    Prediction,
    RoleName,
    User,
)
from ..schemas import (
    HealthDataIn,
    InstitutionProfileOut,
    InstitutionProfileUpdate,
    InstitutionSignupRequest,
    LoginRequest,
    PatientSearchResult,
    PredictionOut,
)
from ..security import create_session, hash_password, record_audit, require_role, verify_password
from ..ml import (
    # InvalidFeatureValueError,
    # MissingFeaturesError,
    # ModelNotFoundError,
    # UnexpectedModelOutputError,
    # UnrecognizedModelBundleError,
    predict,
)

router = APIRouter(prefix="/institution", tags=["institution"])


def _get_institution_for_user(db: Session, user: User) -> HealthInstitution:
    inst = db.exec(select(HealthInstitution).where(HealthInstitution.user_id == user.id)).first()
    if not inst:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Institution profile not found")
    return inst


# Note: the source spec listed "/institution/login" twice - the first entry's
# body (to_user / to_institution) matches a signup action, so it's implemented
# here as /institution/signup. Rename the route if you want to keep it at
# /institution/login instead.
@router.post("/signup", status_code=status.HTTP_201_CREATED)
def institution_signup(
    payload: InstitutionSignupRequest,
    request: Request,
    db: Session = Depends(get_session),
):
    if db.exec(select(User).where(User.email == payload.email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        role=RoleName.INSTITUTION,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    institution = HealthInstitution(
        user_id=user.id,
        institution_name=payload.name,
        license_number=payload.license_number,
        phone=payload.phone,
        address=payload.address,
        city=payload.city,
        country=payload.country,
    )
    db.add(institution)
    db.commit()
    db.refresh(institution)

    record_audit(db, user.id, AuditAction.CREATE, "institutions", institution.id, request)
    return {"message": "Signup successful"}


@router.post("/login")
def institution_login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_session),
):
    user = db.exec(
        select(User).where(
            User.email == payload.email, User.role == RoleName.INSTITUTION
        )
    ).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()

    create_session(db, user, response, request)
    record_audit(db, user.id, AuditAction.LOGIN, "users", user.id, request)
    return {"message": "Login successful"}


@router.get("", response_model=InstitutionProfileOut)
def get_profile(
    db: Session = Depends(get_session),
    user: User = Depends(require_role(RoleName.INSTITUTION)),
):
    inst = _get_institution_for_user(db, user)
    return InstitutionProfileOut(
        institution_name=inst.institution_name,
        email=user.email,
        phone_number=inst.phone,
        address=inst.address,
        city=inst.city,
        country=inst.country,
        license_number=inst.license_number,
    )


@router.put("", response_model=InstitutionProfileOut)
def update_profile(
    payload: InstitutionProfileUpdate,
    request: Request,
    db: Session = Depends(get_session),
    user: User = Depends(require_role(RoleName.INSTITUTION)),
):
    inst = _get_institution_for_user(db, user)

    if payload.institution_name is not None:
        inst.institution_name = payload.institution_name
    if payload.phone_number is not None:
        inst.phone = payload.phone_number
    if payload.address is not None:
        inst.address = payload.address
    if payload.city is not None:
        inst.city = payload.city
    if payload.country is not None:
        inst.country = payload.country
    if payload.license_number is not None:
        inst.license_number = payload.license_number
    if payload.email is not None:
        user.email = payload.email
    if payload.password:
        user.password_hash = hash_password(payload.password)

    db.add(inst)
    db.add(user)
    db.commit()
    db.refresh(inst)

    record_audit(db, user.id, AuditAction.UPDATE, "institutions", inst.id, request)
    return InstitutionProfileOut(
        institution_name=inst.institution_name,
        email=user.email,
        phone_number=inst.phone,
        address=inst.address,
        city=inst.city,
        country=inst.country,
        license_number=inst.license_number,
    )


@router.get("/predictions", response_model=list[PredictionOut])
def institution_predictions(
    db: Session = Depends(get_session),
    user: User = Depends(require_role(RoleName.INSTITUTION)),
):
    inst = _get_institution_for_user(db, user)
    rows = db.exec(
        select(Prediction)
        .where(Prediction.institution_id == inst.id)
        .order_by(Prediction.created_at.desc())
    ).all()
    return [
        PredictionOut(
            disease=r.disease_type, 
            prediction=r.prediction, 
            percentage=r.probability,
            risk_level=r.risk_level,
            created_at=r.created_at,
        )
        for r in rows
    ]

@router.get("/patients", response_model=List[PatientSearchResult])
def search_patients(
    search: Optional[str] = Query(
        default=None, description="Partial, case-insensitive match on full name"
    ),
    db: Session = Depends(get_session),
    _user: User = Depends(require_role(RoleName.INSTITUTION)),
):
    """Lets an institution look up a patient by name to select for a health
    data submission, instead of needing to already know their numeric ID.

    Note: any institution can search across all patients, not just ones
    they've previously submitted data for - there's nothing in the spec
    scoping patient visibility to a particular institution. Add a
    join/filter here if patient lists should be restricted per institution.
    """
    query = select(Patient, User).join(User, Patient.user_id == User.id)
    if search:
        query = query.where(Patient.full_name.ilike(f"%{search}%"))
    rows = db.exec(query.limit(20)).all()
    return [
        PatientSearchResult(id=patient.id, full_name=patient.full_name, email=user.email)
        for patient, user in rows
    ]

def _get_health_data_endpoint(disease: DiseaseType):
    def handler(
        db: Session = Depends(get_session),
        user: User = Depends(require_role(RoleName.INSTITUTION)),
    ):
        inst = _get_institution_for_user(db, user)
        records = db.exec(
            select(HealthRecord)
            .where(
                HealthRecord.institution_id == inst.id,
                HealthRecord.disease_type == disease,
            )
            .order_by(HealthRecord.created_at.desc())
        ).all()
        return [
            {"patient_id": r.patient_id, "created_at": r.created_at, **r.data}
            for r in records
        ]

    return handler


def _post_health_data_endpoint(disease: DiseaseType):
    def handler(
        payload: HealthDataIn,
        request: Request,
        db: Session = Depends(get_session),
        user: User = Depends(require_role(RoleName.INSTITUTION)),
    ):
        inst = _get_institution_for_user(db, user)
        patient = db.get(Patient, payload.patient_id)
        if not patient:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient not found")

        try:

            result = predict(
                disease.value.lower(),
                payload.data
            )
            print("Predicting")

        except FileNotFoundError as e:

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

        except ValueError as e:

            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )

        except Exception as e:

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Prediction failed: {str(e)}"
            )
        print(f"Received results from prediction: {result}")

        record = HealthRecord(
            patient_id=payload.patient_id,
            institution_id=inst.id,
            disease_type=disease,
            data=payload.data,
        )
        db.add(record)
        db.flush()  # flush to get record.id for the prediction row

        print(f"Health record created with ID: {record.id}")
        prediction_row = Prediction(
            patient_id=payload.patient_id,
            institution_id=inst.id,
            health_record_id=record.id,
            disease_type=disease,
            prediction=result.prediction,
            probability=result.probability,
            risk_level=result.risk,
        )
        print(f"Prediction row: {prediction_row}")
        db.add(prediction_row)
        print(f"Prediction row created with ID: {prediction_row.id}")
        db.commit()
        db.refresh(record)
        db.refresh(prediction_row)
        print(f"Health record and prediction committed to database with IDs: {record.id}, {prediction_row.id}")
        record_audit(
            db, user.id, AuditAction.CREATE, "health_records", record.id, request
        )
        print(f"Audit record created for health record ID: {record.id}")
        record_audit(
            db, user.id, AuditAction.CREATE, "predictions", prediction_row.id, request
        )
        print(f"Audit record created for prediction ID: {prediction_row.id}")
        return {
            "message": f"{disease.value} health data saved and prediction generated",
            "health_record_id": record.id,
            "prediction": {
                "id": prediction_row.id,
                "disease": disease.value,
                "prediction": result.prediction,
                "percentage": result.probability,
                "risk_level": result.risk.value if result.risk else None,
            },
        }

    return handler


router.add_api_route("/health_data/heart", _get_health_data_endpoint(DiseaseType.HEART), methods=["GET"])
router.add_api_route("/health_data/kidney", _get_health_data_endpoint(DiseaseType.KIDNEY), methods=["GET"])
router.add_api_route("/health_data/stroke", _get_health_data_endpoint(DiseaseType.STROKE), methods=["GET"])
router.add_api_route("/health_data/diabetes", _get_health_data_endpoint(DiseaseType.DIABETES), methods=["GET"])

router.add_api_route("/health_data/heart", _post_health_data_endpoint(DiseaseType.HEART), methods=["POST"])
router.add_api_route("/health_data/kidney", _post_health_data_endpoint(DiseaseType.KIDNEY), methods=["POST"])
router.add_api_route("/health_data/stroke", _post_health_data_endpoint(DiseaseType.STROKE), methods=["POST"])
router.add_api_route("/health_data/diabetes", _post_health_data_endpoint(DiseaseType.DIABETES), methods=["POST"])
