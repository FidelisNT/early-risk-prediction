import enum


class RoleName(str, enum.Enum):
    ADMIN = "admin"
    PATIENT = "patient"
    INSTITUTION = "institution"
    DOCTOR = "doctor"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class DiseaseType(str, enum.Enum):
    HEART = "heart"
    DIABETES = "diabetes"
    KIDNEY = "kidney"
    STROKE = "stroke"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class AuditAction(str, enum.Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
