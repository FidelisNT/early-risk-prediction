from typing import Any, Optional

from pydantic import BaseModel, EmailStr


class InstitutionSignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    license_number: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None


class InstitutionProfileOut(BaseModel):
    institution_name: str
    email: EmailStr
    phone_number: Optional[str]
    address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    license_number: str


class InstitutionProfileUpdate(BaseModel):
    institution_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    license_number: Optional[str] = None
    password: Optional[str] = None


class HealthDataIn(BaseModel):
    """Body for institution POST /institution/health_data/{disease}."""

    patient_id: int
    data: dict[str, Any]

class PatientSearchResult(BaseModel):
    """Row shape for GET /institution/patients?search=... - just enough to
    let an institution find and select the right patient by name."""
 
    id: int
    full_name: str
    email: EmailStr