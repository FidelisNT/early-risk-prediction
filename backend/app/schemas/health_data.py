"""
Pydantic schemas describing the exact feature set each prediction model
expects. These are used to validate the `HealthRecord.data` JSONB
payload before it's persisted, and again before it's fed to a model.
"""
from enum import Enum
from typing import Dict, Type

from pydantic import BaseModel


# --------------------------------------------------------------------------
# Heart disease model
# --------------------------------------------------------------------------
class HeartRecordData(BaseModel):
    Age: int
    Sex: int  # 0 = female, 1 = male
    Cp: int  # chest pain type (0-3)
    Trestbps: float  # resting blood pressure (mm Hg)
    Chol: float  # serum cholesterol (mg/dl)
    Fbs: int  # fasting blood sugar > 120 mg/dl (0/1)
    Restecg: int  # resting ECG results (0-2)
    Thalach: float  # max heart rate achieved
    Exang: int  # exercise induced angina (0/1)
    Oldpeak: float  # ST depression induced by exercise
    Slope: int  # slope of the peak exercise ST segment
    Ca: int  # number of major vessels colored by fluoroscopy (0-3)
    Thal: int  # thalassemia (0-3)


# --------------------------------------------------------------------------
# Diabetes model
# --------------------------------------------------------------------------
class DiabetesRecordData(BaseModel):
    Pregnancies: int
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: int


# --------------------------------------------------------------------------
# Kidney disease model
# --------------------------------------------------------------------------
class KidneyRecordData(BaseModel):
    Bp: float  # blood pressure
    Sg: float  # specific gravity
    Al: float  # albumin
    Su: float  # sugar
    Rbc: int  # red blood cells (0 = normal, 1 = abnormal)
    Bu: float  # blood urea
    Sc: float  # serum creatinine
    Sod: float  # sodium
    Pot: float  # potassium
    Hemo: float  # hemoglobin
    Wbcc: float  # white blood cell count
    Rbcc: float  # red blood cell count
    Htn: int  # hypertension (0/1)


# --------------------------------------------------------------------------
# Stroke model
# --------------------------------------------------------------------------
class WorkType(str, Enum):
    PRIVATE = "Private"
    SELF_EMPLOYED = "Self-employed"
    GOVT_JOB = "Govt_job"
    CHILDREN = "children"
    NEVER_WORKED = "Never_worked"


class ResidenceType(str, Enum):
    URBAN = "Urban"
    RURAL = "Rural"


class SmokingStatus(str, Enum):
    NEVER_SMOKED = "never smoked"
    FORMERLY_SMOKED = "formerly smoked"
    SMOKES = "smokes"
    UNKNOWN = "Unknown"


class StrokeRecordData(BaseModel):
    Id: int
    Gender: int
    Age: float
    Hypertension: int  # 0/1
    HeartDisease: int  # 0/1
    EverMarried: str
    WorkType: WorkType
    ResidenceType: ResidenceType
    AvgGlucoseLevel: float
    Bmi: float
    SmokingStatus: SmokingStatus


# --------------------------------------------------------------------------
# Lookup used by disease_type -> schema when validating HealthRecord.data
# --------------------------------------------------------------------------
DISEASE_SCHEMA_MAP: Dict[str, Type[BaseModel]] = {
    "heart": HeartRecordData,
    "diabetes": DiabetesRecordData,
    "kidney": KidneyRecordData,
    "stroke": StrokeRecordData,
}


def validate_health_data(disease_type: str, data: dict) -> dict:
    """
    Validate a raw health-record payload against the schema for the
    given disease type and return a plain dict ready to store in
    HealthRecord.data (JSONB).

    Raises pydantic.ValidationError if `data` doesn't match the
    expected feature set, or ValueError if disease_type is unknown.
    """
    schema_cls = DISEASE_SCHEMA_MAP.get(disease_type)
    if schema_cls is None:
        raise ValueError(f"Unsupported disease type: {disease_type}")
    validated = schema_cls(**data)
    return validated.model_dump()
