import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, Request, Response, status
from pwdlib import PasswordHash
from sqlmodel import Session, select

from .database import get_session
from .models import AuditAction, AuditLog, RoleName as RoleEnum, UserSession, User

password_hasher = PasswordHash.recommended()

SESSION_COOKIE_NAME = "session_id"
SESSION_TTL_HOURS = 24

SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"

SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "lax")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password.
    """
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against its stored hash.
    """
    return password_hasher.verify(plain_password, hashed_password)


def create_session(
    db: Session,
    user: User,
    response: Response,
    request: Optional[Request] = None,
) -> str:
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=SESSION_TTL_HOURS)

    ip_address = request.client.host if request and request.client else None
    user_agent = request.headers.get("user-agent") if request else None

    token = UserSession(
        user_id=user.id,
        session_token=session_token,
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=expires_at,
    )
    db.add(token)
    db.commit()

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        httponly=True,
        samesite=SESSION_COOKIE_SAMESITE,
        secure=SESSION_COOKIE_SECURE,
        max_age=SESSION_TTL_HOURS * 3600,
    )
    return session_token


def destroy_session(db: Session, session_token: str, response: Response) -> None:
    token = db.exec(
        select(UserSession).where(UserSession.session_token == session_token)
    ).first()
    if token:
        db.delete(token)
        db.commit()
    response.delete_cookie(
        SESSION_COOKIE_NAME,
        samesite=SESSION_COOKIE_SAMESITE,
        secure=SESSION_COOKIE_SECURE,
    )


def get_current_user(
    request: Request, db: Session = Depends(get_session)
) -> User:
    session_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    token = db.exec(
        select(UserSession).where(UserSession.session_token == session_token)
    ).first()
    if not token or token.expires_at < datetime.utcnow():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired or invalid")

    user = db.get(User, token.user_id)
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User inactive or not found")

    return user

def require_role(role: RoleEnum):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role != role:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Requires {role.value} role")
        return user

    return checker

def record_audit(
    db: Session,
    user_id: Optional[int],
    action: AuditAction,
    table_name: str,
    record_id: Optional[int] = None,
    request: Optional[Request] = None,
) -> None:
    """Writes a row to audit_logs. Called from routers after
    security-relevant events: signup, login, profile edits, data writes.

    `table_name` should be the table the event relates to (e.g. "users",
    "patients", "health_records", "predictions"), and `record_id` the
    primary key of the affected row. Pass the incoming `request` when
    available so `ip_address` gets captured automatically.
    """
    ip_address = request.client.host if request and request.client else None
    entry = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
