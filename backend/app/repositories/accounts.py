"""Temporary in-memory storage for account-related route handlers.

Replace this module with PostgreSQL-backed repositories once the project's
database models and connection configuration are added.  Keeping all storage
behind this interface prevents route handlers from depending on a database.
"""

from __future__ import annotations

from datetime import datetime, timezone
from threading import RLock
from uuid import uuid4

from fastapi import HTTPException, status
from passlib.context import CryptContext


_password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _now() -> datetime:
    return datetime.now(timezone.utc)


class AccountRepository:
    def __init__(self) -> None:
        self._lock = RLock()
        self._users: dict[str, dict] = {}
        self._tokens: dict[str, str] = {}

    def create_patient(self, payload: dict) -> dict:
        with self._lock:
            self._ensure_email_available(payload["email"])
            user_id = str(uuid4())
            user = {
                "id": user_id,
                "role": "patient",
                "email": payload["email"].lower(),
                "hashed_password": _password_context.hash(payload["password"]),
                "created_at": _now(),
                "is_active": True,
                "last_login": None,
                "profile": {
                    "user_name": payload["full_name"],
                    "phone_number": payload["phone_number"],
                    "date_of_birth": payload["date_of_birth"],
                    "gender": payload["gender"],
                    "address": payload["address"],
                    "emergency_phone": payload["emergency_phone"],
                    "blood_group": payload["blood_group"],
                },
            }
            self._users[user_id] = user
            return user

    def authenticate(self, email: str, password: str, role: str) -> str:
        with self._lock:
            user = next(
                (
                    candidate for candidate in self._users.values()
                    if candidate["email"] == email.lower() and candidate["role"] == role
                ),
                None,
            )
            if not user or not user["is_active"] or not _password_context.verify(password, user["hashed_password"]):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            user["last_login"] = _now()
            token = str(uuid4())
            self._tokens[token] = user["id"]
            return token

    def get_user_for_token(self, token: str, role: str) -> dict:
        with self._lock:
            user = self._users.get(self._tokens.get(token, ""))
            if not user or user["role"] != role or not user["is_active"]:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
            return user

    def update_patient(self, user_id: str, changes: dict) -> dict:
        with self._lock:
            user = self._users[user_id]
            if changes.get("email") and changes["email"].lower() != user["email"]:
                self._ensure_email_available(changes["email"])
                user["email"] = changes["email"].lower()
            for field in ("user_name", "phone_number", "address", "blood_group"):
                if changes.get(field) is not None:
                    user["profile"][field] = changes[field]
            if changes.get("password"):
                user["hashed_password"] = _password_context.hash(changes["password"])
            return user

    def list_users(self, role: str) -> list[dict]:
        with self._lock:
            return [user for user in self._users.values() if user["role"] == role]

    def _ensure_email_available(self, email: str) -> None:
        if any(user["email"] == email.lower() for user in self._users.values()):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")


account_repository = AccountRepository()
