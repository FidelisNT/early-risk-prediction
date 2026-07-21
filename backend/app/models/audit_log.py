from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from .enums import AuditAction

if TYPE_CHECKING:
    from .user import User


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    action: AuditAction = Field(index=True)
    table_name: str = Field(max_length=100, index=True)
    record_id: Optional[int] = Field(default=None)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, nullable=False, index=True
    )

    user: Optional["User"] = Relationship(back_populates="audit_logs")
