from datetime import datetime
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field, Relationship

from .mixins import TimestampMixin
from .enums import DiseaseType

if TYPE_CHECKING:
    from .patient import Patient
    from .institution import HealthInstitution
    from .prediction import Prediction


class HealthRecord(TimestampMixin, SQLModel, table=True):
    """
    Stores the raw clinical data collected for a patient, used as the
    input feature set for the ML prediction models.

    Each disease model (heart, diabetes, kidney, stroke) needs a
    different set of features, so rather than having a wide table with
    dozens of mostly-null columns, the disease-specific fields are kept
    in the `data` JSONB column. `disease_type` says which schema that
    JSON should conform to. See app/schemas/health_data.py for the
    per-disease Pydantic models used to validate `data` before it is
    written to the DB.
    """

    __tablename__ = "health_records"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id", index=True)
    institution_id: Optional[int] = Field(
        default=None, foreign_key="health_institutions.id", index=True
    )
    disease_type: DiseaseType = Field(index=True)
    data: Dict[str, Any] = Field(sa_column=Column(JSONB, nullable=False))
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(default=None, max_length=1000)

    patient: "Patient" = Relationship(back_populates="health_records")
    institution: Optional["HealthInstitution"] = Relationship(
        back_populates="health_records"
    )
    predictions: List["Prediction"] = Relationship(
        back_populates="health_record",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
