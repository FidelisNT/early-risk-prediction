from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from ..models import DiseaseType, RiskLevel


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PredictionOut(BaseModel):
    disease: DiseaseType
    prediction: bool
    percentage: float
    risk_level: Optional[RiskLevel] = None
    created_at: Optional[datetime] = None
