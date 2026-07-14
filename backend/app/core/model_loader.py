import joblib

from app.config import (
    DIABETES_MODEL,
    HEART_MODEL,
    KIDNEY_MODEL,
    STROKE_MODEL
)

diabetes_model = joblib.load(DIABETES_MODEL)
heart_model = joblib.load(HEART_MODEL)
kidney_model = joblib.load(KIDNEY_MODEL)
stroke_model = joblib.load(STROKE_MODEL)