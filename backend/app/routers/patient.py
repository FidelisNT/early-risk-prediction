from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlmodel import Session, select

from ..database import get_session
from ..models import AuditAction, DiseaseType, HealthRecord, Patient, Prediction, RoleName, User
from ..schemas import (
    LoginRequest,
    PatientProfileOut,
    PatientProfileUpdate,
    PatientSignupRequest,
    PredictionOut,
)
from ..security import create_session, hash_password, record_audit, require_role, verify_password

router = APIRouter(prefix="/patient", tags=["patient"])


def _get_patient_for_user(db: Session, user: User) -> Patient:
    patient = db.exec(select(Patient).where(Patient.user_id == user.id)).first()
    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient profile not found")
    return patient


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def patient_signup(
    payload: PatientSignupRequest,
    request: Request,
    db: Session = Depends(get_session),
):
    if db.exec(select(User).where(User.email == payload.email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        role=RoleName.PATIENT,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    patient = Patient(
        user_id=user.id,
        full_name=payload.full_name,
        phone=payload.phone_number,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        address=payload.address,
        emergency_contact=payload.emergency_phone,
        blood_group=payload.blood_group,
    )
    db.add(patient)
    db.commit()

    record_audit(db, user.id, AuditAction.CREATE, "patients", patient.id, request)
    return {"message": "Signup successful"}


@router.post("/login")
def patient_login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_session),
):
    user = db.exec(
        select(User).where(User.email == payload.email, User.role == RoleName.PATIENT)
    ).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()

    create_session(db, user, response, request)
    record_audit(db, user.id, AuditAction.LOGIN, "users", user.id, request)
    return {"message": "Login successful"}


@router.get("", response_model=PatientProfileOut)
def get_profile(
    db: Session = Depends(get_session),
    user: User = Depends(require_role(RoleName.PATIENT)),
):
    patient = _get_patient_for_user(db, user)
    return PatientProfileOut(
        user_name=patient.full_name,
        email=user.email,
        phone_number=patient.phone,
        address=patient.address,
        blood_group=patient.blood_group,
    )


@router.put("", response_model=PatientProfileOut)
def update_profile(
    payload: PatientProfileUpdate,
    request: Request,
    db: Session = Depends(get_session),
    user: User = Depends(require_role(RoleName.PATIENT)),
):
    patient = _get_patient_for_user(db, user)

    if payload.user_name is not None:
        patient.full_name = payload.user_name
    if payload.phone_number is not None:
        patient.phone = payload.phone_number
    if payload.address is not None:
        patient.address = payload.address
    if payload.blood_group is not None:
        patient.blood_group = payload.blood_group
    if payload.email is not None:
        user.email = payload.email
    if payload.password:
        user.password_hash = hash_password(payload.password)

    db.add(patient)
    db.add(user)
    db.commit()
    db.refresh(patient)

    record_audit(db, user.id, AuditAction.UPDATE, "patients", patient.id, request)
    return PatientProfileOut(
        user_name=patient.full_name,
        email=user.email,
        phone_number=patient.phone,
        address=patient.address,
        blood_group=patient.blood_group,
    )


@router.get("/prediction", response_model=list[PredictionOut])
def latest_predictions(
    db: Session = Depends(get_session),
    user: User = Depends(require_role(RoleName.PATIENT)),
):
    """Latest prediction per disease (up to 4 rows: stroke, heart, kidney, diabetes)."""
    patient = _get_patient_for_user(db, user)
    results = []
    for disease in DiseaseType:
        latest = db.exec(
            select(Prediction)
            .where(Prediction.patient_id == patient.id, Prediction.disease_type == disease)
            .order_by(Prediction.created_at.desc())
        ).first()
        if latest:
            results.append(
                PredictionOut(
                    disease=latest.disease_type,
                    prediction=latest.prediction,
                    percentage=latest.probability,
                    risk_level=latest.risk_level,
                    created_at=latest.created_at,
                )
            )
    return results


@router.get("/predictions", response_model=list[PredictionOut])
def all_predictions(
    db: Session = Depends(get_session),
    user: User = Depends(require_role(RoleName.PATIENT)),
):
    patient = _get_patient_for_user(db, user)
    rows = db.exec(
        select(Prediction)
        .where(Prediction.patient_id == patient.id)
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


def _health_data_endpoint(disease: DiseaseType):
    def handler(
        db: Session = Depends(get_session),
        user: User = Depends(require_role(RoleName.PATIENT)),
    ):
        patient = _get_patient_for_user(db, user)
        records = db.exec(
            select(HealthRecord)
            .where(
                HealthRecord.patient_id == patient.id,
                HealthRecord.disease_type == disease,
            )
            .order_by(HealthRecord.created_at.desc())
        ).all()
        return [{"created_at": r.created_at, **r.data} for r in records]

    return handler


router.add_api_route("/health_data/heart", _health_data_endpoint(DiseaseType.HEART), methods=["GET"])
router.add_api_route("/health_data/kidney", _health_data_endpoint(DiseaseType.KIDNEY), methods=["GET"])
router.add_api_route("/health_data/stroke", _health_data_endpoint(DiseaseType.STROKE), methods=["GET"])
router.add_api_route("/health_data/diabetes", _health_data_endpoint(DiseaseType.DIABETES), methods=["GET"])
