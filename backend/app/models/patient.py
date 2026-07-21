from datetime import date
from typing import List, Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from .mixins import TimestampMixin
from .enums import Gender

if TYPE_CHECKING:
    from .user import User
    from .health_record import HealthRecord
    from .prediction import Prediction


class Patient(TimestampMixin, SQLModel, table=True):
    __tablename__ = "patients"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, index=True)
    full_name: str = Field(max_length=100)
    date_of_birth: date
    gender: Gender = Field(default=Gender.OTHER)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=255)
    emergency_contact: Optional[str] = Field(default=None, max_length=100)
    blood_group: Optional[str] = Field(default=None, max_length=5)

    user: "User" = Relationship(back_populates="patient")
    health_records: List["HealthRecord"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    predictions: List["Prediction"] = Relationship(back_populates="patient")
