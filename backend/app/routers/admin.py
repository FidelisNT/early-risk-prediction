from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlmodel import Session, select

from ..database import get_session
from ..models import AuditAction, HealthInstitution, Patient, RoleName, User
from ..schemas import AdminInstitutionRow, AdminUserRow, LoginRequest
from ..security import create_session, record_audit, require_role, verify_password

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/login")
def admin_login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_session),
):
    user = db.exec(
        select(User).where(User.email == payload.email, User.role == RoleName.ADMIN)
    ).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()

    create_session(db, user, response, request)
    record_audit(db, user.id, AuditAction.LOGIN, "users", user.id, request)
    return {"message": "Login successful"}


@router.get("/patients", response_model=list[AdminUserRow])
def list_patients(
    db: Session = Depends(get_session),
    _admin: User = Depends(require_role(RoleName.ADMIN)),
):
    rows = db.exec(select(Patient, User).join(User, Patient.user_id == User.id)).all()
    return [
        AdminUserRow(
            name=patient.full_name,
            email=user.email,
            phone_number=patient.phone,
            created_at=user.created_at,
            is_active=user.is_active,
            last_login=user.last_login,
        )
        for patient, user in rows
    ]


@router.get("/institution", response_model=list[AdminInstitutionRow])
def list_institutions(
    db: Session = Depends(get_session),
    _admin: User = Depends(require_role(RoleName.ADMIN)),
):
    rows = db.exec(
        select(HealthInstitution, User).join(User, HealthInstitution.user_id == User.id)
    ).all()
    return [
        AdminInstitutionRow(
            name=inst.institution_name,
            email=user.email,
            license_number=inst.license_number,
            address=inst.address,
            created_at=user.created_at,
            is_active=user.is_active,
            last_login=user.last_login,
        )
        for inst, user in rows
    ]
