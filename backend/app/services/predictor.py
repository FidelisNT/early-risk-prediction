import joblib

from app.config import (
    DIABETES_MODEL,
    HEART_MODEL,
    KIDNEY_MODEL,
    STROKE_MODEL,
)

diabetes_model = joblib.load(DIABETES_MODEL)
heart_model = joblib.load(HEART_MODEL)
kidney_model = joblib.load(KIDNEY_MODEL)
stroke_model = joblib.load(STROKE_MODEL)


def diabetes_predict(data):
    prediction = diabetes_model.predict(data)[0]
    probability = diabetes_model.predict_proba(data)[0].max()

    return prediction, probability


def heart_predict(data):
    prediction = heart_model.predict(data)[0]
    probability = heart_model.predict_proba(data)[0].max()

    return prediction, probability


def kidney_predict(data):
    prediction = kidney_model.predict(data)[0]
    probability = kidney_model.predict_proba(data)[0].max()

    return prediction, probability


def stroke_predict(data):
    prediction = stroke_model.predict(data)[0]
    probability = stroke_model.predict_proba(data)[0].max()

    return prediction, probability