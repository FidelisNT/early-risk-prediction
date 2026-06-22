from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models"

DIABETES_MODEL = MODEL_PATH / "diabetes_model.pkl"
HEART_MODEL = MODEL_PATH / "heart_model.pkl"
KIDNEY_MODEL = MODEL_PATH / "kidney_model.pkl"
STROKE_MODEL = MODEL_PATH / "stroke_model.pkl"