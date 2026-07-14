from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PatientSignupRequest(LoginRequest):
    full_name: str = Field(min_length=1, max_length=200)
    phone_number: str = Field(min_length=3, max_length=30)
    date_of_birth: date
    gender: str = Field(min_length=1, max_length=50)
    address: str = Field(min_length=1, max_length=500)
    emergency_phone: str = Field(min_length=3, max_length=30)
    blood_group: str = Field(min_length=1, max_length=10)


class PatientProfileUpdate(BaseModel):
    user_name: str | None = Field(default=None, min_length=1, max_length=200)
    email: str | None = None
    phone_number: str | None = Field(default=None, min_length=3, max_length=30)
    address: str | None = Field(default=None, min_length=1, max_length=500)
    blood_group: str | None = Field(default=None, min_length=1, max_length=10)
    password: str | None = Field(default=None, min_length=8)


class PatientProfile(BaseModel):
    user_name: str
    email: str
    phone_number: str
    address: str
    blood_group: str


class AdminAccountSummary(BaseModel):
    id: str
    name: str
    email: str
    phone_number: str | None = None
    created_at: datetime
    is_active: bool
    last_login: datetime | None = None
