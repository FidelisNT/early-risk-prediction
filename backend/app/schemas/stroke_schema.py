from pydantic import BaseModel


class StrokeRequest(BaseModel):

    Id: int
    Gender: str
    Age: int
    Hypertension: int
    HeartDisease: int
    EverMarried: str
    WorkType: str
    ResidenceType: str
    AvgGlucoseLevel: float
    Bmi: float
    SmokingStatus: str