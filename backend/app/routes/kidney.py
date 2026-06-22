import pandas as pd

from fastapi import APIRouter

from app.schemas.kidney_schema import KidneyRequest
from app.services.predictor import kidney_predict

router = APIRouter()


@router.post("/")
def predict(request: KidneyRequest):

    df = pd.DataFrame([request.model_dump()])  # Pydantic v2

    prediction, probability = kidney_predict(df)

    return {
        "disease": "Kidney Disease",
        "prediction": int(prediction),
        "probability": round(probability * 100, 2)
    }