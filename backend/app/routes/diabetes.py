import pandas as pd
from fastapi import APIRouter

from app.schemas.diabetes_schema import DiabetesRequest
from app.services.predictor import diabetes_predict

router = APIRouter()


@router.post("/")
def predict(request: DiabetesRequest):

    df = pd.DataFrame([request.model_dump()])  # Pydantic v2
    # If using Pydantic v1, use: request.dict()

    prediction, probability = diabetes_predict(df)

    return {
        "disease": "Diabetes",
        "prediction": int(prediction),
        "probability": round(probability * 100, 2)
    }