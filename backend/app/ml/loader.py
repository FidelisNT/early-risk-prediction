from joblib import load

from ..config import (
    HEART_MODEL,
    DIABETES_MODEL,
    KIDNEY_MODEL,
    STROKE_MODEL,
)

MODELS = {}

def load_models():
    print("Loading models...")

    MODELS["heart"] = load(HEART_MODEL)
    MODELS["diabetes"] = load(DIABETES_MODEL)
    MODELS["kidney"] = load(KIDNEY_MODEL)
    MODELS["stroke"] = load(STROKE_MODEL)