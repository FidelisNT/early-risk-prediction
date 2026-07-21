"""
Central import point for every SQLModel table model.

Importing this package guarantees that every table class below gets
registered on SQLModel.metadata, which is required BEFORE calling
SQLModel.metadata.create_all(engine) or generating Alembic migrations.

Usage in main.py:
    import app.models  # noqa: F401 -- registers all tables
"""
from .mixins import TimestampMixin
from .enums import RoleName, Gender, DiseaseType, RiskLevel, AuditAction

from .user import User
from .patient import Patient
from .institution import HealthInstitution
from .session import Session as UserSession  # renamed to avoid clashing with
                                            # sqlmodel's own Session class
from .health_record import HealthRecord
from .prediction import Prediction
from .audit_log import AuditLog

__all__ = [
    "TimestampMixin",
    "RoleName",
    "Gender",
    "DiseaseType",
    "RiskLevel",
    "AuditAction",
    "User",
    "Patient",
    "HealthInstitution",
    "UserSession",
    "HealthRecord",
    "Prediction",
    "AuditLog",
]
