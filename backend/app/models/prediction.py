from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from .enums import DiseaseType, RiskLevel

if TYPE_CHECKING:
    from .patient import Patient
    from .institution import HealthInstitution
    from .health_record import HealthRecord


class Prediction(SQLModel, table=True):
    __tablename__ = "predictions"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id", index=True)
    institution_id: Optional[int] = Field(
        default=None, foreign_key="health_institutions.id", index=True
    )
    health_record_id: int = Field(foreign_key="health_records.id", index=True)
    disease_type: DiseaseType = Field(index=True)
    prediction: str = Field(max_length=100)  # e.g. "positive" / "negative" or class label
    risk_level: RiskLevel = Field(index=True)
    probability: float = Field(ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    patient: "Patient" = Relationship(back_populates="predictions")
    institution: Optional["HealthInstitution"] = Relationship(
        back_populates="predictions"
    )
    health_record: "HealthRecord" = Relationship(back_populates="predictions")
