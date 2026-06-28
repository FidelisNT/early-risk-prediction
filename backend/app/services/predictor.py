import joblib

from app.config import (
    DIABETES_MODEL,
    HEART_MODEL,
    KIDNEY_MODEL,
    STROKE_MODEL,
)

diabetes_model = joblib.load(DIABETES_MODEL)["Model"]
heart_model = joblib.load(HEART_MODEL)["Model"]
kidney_model = joblib.load(KIDNEY_MODEL)["Model"]
stroke_model = joblib.load(STROKE_MODEL)["Model"]

diabetes_preprocessor = joblib.load(DIABETES_MODEL)["Preprocessor"]
heart_preprocessor = joblib.load(HEART_MODEL)["Preprocessor"]
kidney_preprocessor = joblib.load(KIDNEY_MODEL)["Preprocessor"]
stroke_preprocessor = joblib.load(STROKE_MODEL)["Preprocessor"]


def diabetes_predict(data):
    data = diabetes_preprocessor.transform(data)
    prediction = diabetes_model.predict(data)[0]
    probability = diabetes_model.predict_proba(data)[0].max()

    return prediction, probability


def heart_predict(data):
    data = heart_preprocessor.transform(data)
    prediction = heart_model.predict(data)[0]
    probability = heart_model.predict_proba(data)[0].max()

    return prediction, probability


def kidney_predict(data):
    data = kidney_preprocessor.transform(data)
    prediction = kidney_model.predict(data)[0]
    probability = kidney_model.predict_proba(data)[0].max()

    return prediction, probability


def stroke_predict(data):
    data = stroke_preprocessor.transform(data)
    prediction = stroke_model.predict(data)[0]
    probability = stroke_model.predict_proba(data)[0].max()

    return prediction, probability