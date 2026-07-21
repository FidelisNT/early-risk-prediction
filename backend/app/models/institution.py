from typing import List, Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .user import User
    from .health_record import HealthRecord
    from .prediction import Prediction


class HealthInstitution(TimestampMixin, SQLModel, table=True):
    __tablename__ = "health_institutions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, index=True)
    institution_name: str = Field(max_length=255)
    license_number: str = Field(unique=True, index=True, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    country: Optional[str] = Field(default=None, max_length=100)

    user: "User" = Relationship(back_populates="institution")
    health_records: List["HealthRecord"] = Relationship(back_populates="institution")
    predictions: List["Prediction"] = Relationship(back_populates="institution")
