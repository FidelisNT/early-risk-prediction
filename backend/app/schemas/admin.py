from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class AdminUserRow(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str]
    created_at: datetime
    is_active: bool
    last_login: Optional[datetime]


class AdminInstitutionRow(BaseModel):
    name: str
    email: EmailStr
    license_number: str
    address: Optional[str]
    created_at: datetime
    is_active: bool
    last_login: Optional[datetime]
