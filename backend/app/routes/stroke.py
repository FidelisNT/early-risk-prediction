import pandas as pd

from fastapi import APIRouter

from app.schemas.stroke_schema import StrokeRequest
from app.services.predictor import diabetes_predict, stroke_predict

router = APIRouter()


@router.post("/")
def predict(request: StrokeRequest):

    df = pd.DataFrame([request.model_dump()])  # Pydantic v2

    prediction, probability = stroke_predict(df)

    return {
        "disease": "Stroke",
        "prediction": int(prediction),
        "probability": round(probability * 100, 2)
    }