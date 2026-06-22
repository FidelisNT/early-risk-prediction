import pandas as pd

from fastapi import APIRouter

from app.schemas.heart_schema import HeartRequest
from app.services.predictor import heart_predict

router = APIRouter()


@router.post("/")
def predict(request: HeartRequest):

    df = pd.DataFrame([request.model_dump()])  # Pydantic v2

    prediction, probability = heart_predict(df)

    return {
        "disease": "Heart Disease",
        "prediction": int(prediction),
        "probability": round(probability * 100, 2)
    }