from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from .mixins import TimestampMixin
from .enums import RoleName

if TYPE_CHECKING:
    from .patient import Patient
    from .institution import HealthInstitution
    from .session import Session
    from .audit_log import AuditLog


class User(TimestampMixin, SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=1024)

    # Replaces the old role_id FK + Role table. RoleName is a plain
    # Python/DB enum, stored as a native Postgres enum column by SQLModel.
    role: RoleName = Field(index=True, nullable=False)

    is_active: bool = Field(default=True, nullable=False)
    last_login: Optional[datetime] = Field(default=None)

    patient: Optional["Patient"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False, "cascade": "all, delete-orphan"},
    )
    institution: Optional["HealthInstitution"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False, "cascade": "all, delete-orphan"},
    )
    sessions: List["Session"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    audit_logs: List["AuditLog"] = Relationship(back_populates="user")
