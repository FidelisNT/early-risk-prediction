from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


class PatientSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_phone: Optional[str] = None
    blood_group: Optional[str] = None


class PatientProfileOut(BaseModel):
    user_name: str
    email: EmailStr
    phone_number: Optional[str]
    address: Optional[str]
    blood_group: Optional[str]


class PatientProfileUpdate(BaseModel):
    user_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    password: Optional[str] = None
