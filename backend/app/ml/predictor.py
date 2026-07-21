# """
# Prediction integration for the four disease models.

# Each model's `.predict(...)` call is expected to return a dict shaped like:

#     {"prediction": 1, "probability": 0.87, "risk": "High"}

# - prediction: 0 or 1 (int) - cast to bool (positive/negative).
# - probability: 0.0-1.0 float - converted to a 0-100 percentage.
# - risk: a string ("Low"/"Moderate"/"High"/"Critical", case-insensitive) -
#   mapped to the RiskLevel enum. An unrecognized or missing risk string
#   falls back to percentage-based banding (see classify_risk_level) rather
#   than failing the whole prediction.

# ASSUMPTIONS - please confirm these against how the models actually work,
# since getting one wrong won't raise an error, it'll just produce a wrong
# (silently confident-looking) prediction:

# 1. Each .pkl is a ready-to-use object whose `.predict(...)` method itself
#    returns the dict above for a single row - not a bare sklearn estimator
#    you'd call `.predict_proba()` on and assemble the dict from yourself.
#    Any scaling/encoding used in training is assumed to already be handled
#    inside that object.
# 2. Calling convention: this module first tries `model.predict(vector)`
#    where `vector` is a single row (an ordered list of floats, per
#    FEATURE_ORDER). If that raises, it retries with `model.predict([vector])`
#    (in case the model expects a 2D batch input) and unwraps a single-item
#    list/array result. Adjust `_call_model()` below if your model's actual
#    calling convention differs from both of these.
# 3. Feature order matches FEATURE_ORDER below exactly, one row per disease.
# 4. Categorical fields (e.g. Sex, Gender, WorkType, EverMarried,
#    ResidenceType, SmokingStatus) must already be encoded as whatever
#    numbers the model was trained on (e.g. via a LabelEncoder fit during
#    training) - this module does not know or reconstruct that encoding. It
#    only casts each field to float; if your frontend/institution intake
#    sends human-readable strings ("Male", "Yes", "Rural"), you need to
#    encode them the same way before they reach here.
# """
# import os
# from pathlib import Path
# from typing import Dict, List

# import joblib

# from ..models import DiseaseType, RiskLevel

# # Directory holding the trained model files - defaults to a top-level
# # `ml_model/` folder next to `app/` (i.e. project_root/ml_model). Override
# # with the ML_MODEL_DIR env var if yours lives somewhere else.
# MODEL_DIR = Path(
#     os.getenv("ML_MODEL_DIR", str(Path(__file__).resolve().parents[2] / "ml_model"))
# )

# # Adjust these to match your actual filenames in ml_model/.
# MODEL_FILENAMES: Dict[DiseaseType, str] = {
#     DiseaseType.HEART: "heart_model.pkl",
#     DiseaseType.DIABETES: "diabetes_model.pkl",
#     DiseaseType.KIDNEY: "kidney_model.pkl",
#     DiseaseType.STROKE: "stroke_model.pkl",
# }

# # Exact feature order each model expects, as given.
# FEATURE_ORDER: Dict[DiseaseType, List[str]] = {
#     DiseaseType.HEART: [
#         "Age", "Sex", "Cp", "Trestbps", "Chol", "Fbs", "Restecg",
#         "Thalach", "Exang", "Oldpeak", "Slope", "Ca", "Thal",
#     ],
#     DiseaseType.DIABETES: [
#         "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
#         "Insulin", "BMI", "DiabetesPedigreeFunction", "Age",
#     ],
#     DiseaseType.KIDNEY: [
#         "Bp", "Sg", "Al", "Su", "Rbc", "Bu", "Sc", "Sod", "Pot",
#         "Hemo", "Wbcc", "Rbcc", "Htn",
#     ],
#     DiseaseType.STROKE: [
#         "Id", "Gender", "Age", "Hypertension", "HeartDisease",
#         "EverMarried", "WorkType", "ResidenceType", "AvgGlucoseLevel",
#         "Bmi", "SmokingStatus",
#     ],
# }

# _model_cache: Dict[DiseaseType, object] = {}


# CATEGORICAL_LABELS: Dict[DiseaseType, Dict[str, Dict[str, float]]] = {
#     DiseaseType.HEART: {
#         "sex": {"male": 1, "female": 0},
#         "cp": {
#             "typical angina": 0, "atypical angina": 1,
#             "non-anginal pain": 2, "asymptomatic": 3,
#         },
#         "fbs": {"yes": 1, "no": 0},
#         "restecg": {"normal": 0, "st-t abnormality": 1, "lv hypertrophy": 2},
#         "exang": {"yes": 1, "no": 0},
#         "slope": {"upsloping": 0, "flat": 1, "downsloping": 2},
#         "thal": {"normal": 0, "fixed defect": 1, "reversible defect": 2},
#     },
#     DiseaseType.DIABETES: {},
#     DiseaseType.KIDNEY: {
#         "rbc": {"normal": 1, "abnormal": 0},
#         "htn": {"yes": 1, "no": 0},
#     },
#     DiseaseType.STROKE: {
#         "gender": {"male": 1, "female": 0, "other": 2},
#         "hypertension": {"yes": 1, "no": 0},
#         "heartdisease": {"yes": 1, "no": 0},
#         "evermarried": {"yes": 1, "no": 0},
#         "worktype": {
#             "private": 0, "self-employed": 1, "government job": 2,
#             "children": 3, "never worked": 4,
#         },
#         "residencetype": {"urban": 1, "rural": 0},
#         "smokingstatus": {
#             "never smoked": 0, "formerly smoked": 1, "smokes": 2, "unknown": 3,
#         },
#     },
# }


# # Key names checked, in order, when a .pkl unpickles to a dict instead of a
# # bare estimator - covers the most common ways people bundle a trained
# # model (and optionally its scaler) together with joblib/pickle.
# _MODEL_KEY_CANDIDATES = ["model", "clf", "classifier", "estimator", "pipeline", "best_model"]
# _SCALER_KEY_CANDIDATES = ["scaler", "scalar", "standard_scaler", "sc"]
# _LABEL_ENCODER_KEY_CANDIDATES = ["label_encoder", "labelencoder", "encoder", "le", "target_encoder"]


# def _find_by_candidates(lower_map: dict, candidates: List[str], required_attr: str):
#     for key in candidates:
#         candidate = lower_map.get(key)
#         if candidate is not None and hasattr(candidate, required_attr):
#             return candidate
#     return None


# def _resolve_bundle(disease: DiseaseType, loaded):
#     """Returns (estimator, scaler_or_None, label_encoder_or_None) from
#     whatever `joblib.load()` produced. Handles three shapes:

#     1. A dict - matched by key name (case-insensitively), e.g.
#        {"Model": ..., "Preprocessor": ..., "LabelEncoder": ...}.
#     2. A tuple/list - matched by duck-typing each element, since there's no
#        key name to go on: the first element with a `.predict()` method is
#        the estimator; among the rest, anything with both `classes_` and
#        `.inverse_transform()` is treated as a label encoder (this
#        combination is fairly specific to Label/OneHot encoders); anything
#        else with `.transform()` is treated as a scaler/preprocessor.
#     3. Anything else - assumed to already be a ready-to-use estimator.

#     Raises UnrecognizedModelBundleError if a dict/tuple/list doesn't
#     contain anything identifiable as an estimator.
#     """
#     if isinstance(loaded, dict):
#         lower_map = {str(k).lower(): v for k, v in loaded.items()}

#         estimator = _find_by_candidates(lower_map, _MODEL_KEY_CANDIDATES, "predict")
#         if estimator is None:
#             raise UnrecognizedModelBundleError(disease, dict(loaded).keys())

#         scaler = _find_by_candidates(lower_map, _SCALER_KEY_CANDIDATES, "transform")
#         label_encoder = _find_by_candidates(
#             lower_map, _LABEL_ENCODER_KEY_CANDIDATES, "inverse_transform"
#         )
#         return estimator, scaler, label_encoder

#     if isinstance(loaded, (tuple, list)):
#         estimator = next((item for item in loaded if hasattr(item, "predict")), None)
#         if estimator is None:
#             raise UnrecognizedModelBundleError(
#                 disease, [type(item).__name__ for item in loaded]
#             )

#         remaining = [item for item in loaded if item is not estimator]
#         label_encoder = next(
#             (
#                 item
#                 for item in remaining
#                 if hasattr(item, "classes_") and hasattr(item, "inverse_transform")
#             ),
#             None,
#         )
#         scaler = next(
#             (
#                 item
#                 for item in remaining
#                 if item is not label_encoder and hasattr(item, "transform")
#             ),
#             None,
#         )
#         return estimator, scaler, label_encoder

#     return loaded, None, None


# class MissingFeaturesError(ValueError):
#     def __init__(self, disease: DiseaseType, missing: List[str]):
#         self.disease = disease
#         self.missing = missing
#         super().__init__(
#             f"Missing required field(s) for {disease.value} prediction: "
#             f"{', '.join(missing)}"
#         )


# class InvalidFeatureValueError(ValueError):
#     def __init__(self, disease: DiseaseType, field: str, value):
#         self.disease = disease
#         self.field = field
#         self.value = value
#         super().__init__(
#             f"Field '{field}' for {disease.value} prediction must be a "
#             f"number (pre-encoded to match the model's training data); "
#             f"got {value!r}"
#         )


# class ModelNotFoundError(FileNotFoundError):
#     def __init__(self, disease: DiseaseType, path: Path):
#         self.disease = disease
#         self.path = path
#         super().__init__(f"No model file found for {disease.value} at {path}")


# class UnrecognizedModelBundleError(ValueError):
#     def __init__(self, disease: DiseaseType, found):
#         self.disease = disease
#         self.found = found
#         super().__init__(
#             f"{disease.value}'s model file unpickled to something this "
#             f"module couldn't identify a usable estimator inside: {found!r}. "
#             f"None of the entries had a `.predict()` method. Update "
#             f"_resolve_bundle() in app/ml/predictor.py to match its actual "
#             f"structure."
#         )


# class UnexpectedModelOutputError(ValueError):
#     def __init__(self, disease: DiseaseType, output):
#         self.disease = disease
#         self.output = output
#         super().__init__(
#             f"{disease.value} model returned an unexpected output shape "
#             f"(expected a dict with 'prediction'/'probability'/'risk'); "
#             f"got {output!r}"
#         )


# class PredictionResult:
#     def __init__(self, prediction: bool, percentage: float, risk_level: RiskLevel):
#         self.prediction = prediction
#         self.percentage = percentage
#         self.risk_level = risk_level


# def get_model(disease: DiseaseType):
#     """Loads (and caches, so the .pkl is only read from disk once) the
#     model for a disease type."""
#     if disease not in _model_cache:
#         path = MODEL_DIR / MODEL_FILENAMES[disease]
#         if not path.exists():
#             raise ModelNotFoundError(disease, path)
#         loaded = joblib.load(path)
#         _model_cache[disease] = _resolve_bundle(disease, loaded)
#         # print(f"Model type for {disease.value}: {type(_model_cache[disease]).__name__}")
#     return _model_cache[disease]


# def build_feature_vector(disease: DiseaseType, data: dict) -> List[float]:
#     """Extracts and orders the fields a disease's model expects out of the
#     institution's submitted `data` payload.

#     Field names are matched case-insensitively (e.g. "age" and "Age" both
#     match), since intake forms may not match this exact casing.
#     """
#     order = FEATURE_ORDER[disease]
#     lower_map = {str(k).lower(): v for k, v in data.items()}
#     disease_labels = CATEGORICAL_LABELS.get(disease, {})

#     missing = [field for field in order if field.lower() not in lower_map]
#     if missing:
#         raise MissingFeaturesError(disease, missing)

#     vector: List[float] = []
#     for field in order:
#         raw = lower_map[field.lower()]
#         try:
#             vector.append(float(raw))
#             continue
#         except (TypeError, ValueError):
#             pass

#         field_labels = disease_labels.get(field.lower())
#         if field_labels is not None and isinstance(raw, str):
#             matched = field_labels.get(raw.strip().lower())
#             if matched is not None:
#                 vector.append(float(matched))
#                 continue

#         raise InvalidFeatureValueError(disease, field, raw)
#     return vector


# _RISK_STRING_MAP = {
#     "low": RiskLevel.LOW,
#     "moderate": RiskLevel.MODERATE,
#     "high": RiskLevel.HIGH,
#     "critical": RiskLevel.CRITICAL,
# }


# def classify_risk_level(percentage: float) -> RiskLevel:
#     """Fallback percentage -> RiskLevel banding, used only when a model's
#     `risk` string is missing or doesn't match a known RiskLevel. Tune
#     thresholds as needed, or replace with your own clinical banding."""
#     if percentage >= 75:
#         return RiskLevel.CRITICAL
#     if percentage >= 50:
#         return RiskLevel.HIGH
#     if percentage >= 25:
#         return RiskLevel.MODERATE
#     return RiskLevel.LOW


# def _call_model(model, vector: List[float]):
#     """Calls the model with a single row and returns whatever it produces.

#     Tries `model.predict(vector)` first (single-row calling convention);
#     if that raises, retries with `model.predict([vector])` (2D batch
#     convention) and unwraps a single-item result. See the module
#     docstring's assumption #2 if your model needs a different convention.
#     """
#     try:
#         return model.predict(vector)
#     except Exception:
#         pass

#     result = model.predict([vector])
#     if isinstance(result, (list, tuple)) and len(result) == 1:
#         return result[0]
#     try:
#         # numpy arrays / pandas Series support integer indexing the same way
#         if len(result) == 1:
#             return result[0]
#     except TypeError:
#         pass
#     return result


# def _parse_model_output(disease: DiseaseType, output) -> "PredictionResult":
#     """Parses a model's {"prediction", "probability", "risk"} dict output
#     into a PredictionResult."""
#     if not isinstance(output, dict) or "prediction" not in output or "probability" not in output:
#         raise UnexpectedModelOutputError(disease, output)

#     prediction = bool(int(output["prediction"]))
#     percentage = round(float(output["probability"]) * 100, 2)

#     risk_raw = output.get("risk")
#     risk_level = _RISK_STRING_MAP.get(str(risk_raw).strip().lower()) if risk_raw else None
#     if risk_level is None:
#         risk_level = classify_risk_level(percentage)

#     return PredictionResult(prediction=prediction, percentage=percentage, risk_level=risk_level)


# _POSITIVE_LABEL_HINTS = {
#     "1", "yes", "true", "positive", "present", "abnormal",
#     "diabetic", "disease", "high", "ckd", "stroke", "risk",
# }
# _NEGATIVE_LABEL_HINTS = {
#     "0", "no", "false", "negative", "absent", "normal",
#     "non-diabetic", "notckd", "not ckd", "no disease", "no stroke",
# }


# def _infer_positive_class_index(label_encoder, default: int = 1) -> int:
#     """Looks at a label encoder's actual class names (e.g. classes_ =
#     ["No", "Yes"] or ["Negative", "Positive"]) to figure out which encoded
#     index represents the positive/at-risk class, instead of assuming.
#     Falls back to `default` if there's no label encoder, or its class
#     names don't match anything recognizable - at which point it's a guess
#     like any binary classifier bundle without more context."""
#     if label_encoder is None or not hasattr(label_encoder, "classes_"):
#         return default
#     for idx, cls in enumerate(label_encoder.classes_):
#         cls_str = str(cls).strip().lower()
#         if cls_str in _POSITIVE_LABEL_HINTS:
#             return idx
#         if cls_str in _NEGATIVE_LABEL_HINTS:
#             return 1 - idx  # the *other* class is the positive one
#     return default


# def _parse_raw_estimator_output(
#     disease: DiseaseType, estimator, vector: List[float], raw_output, label_encoder
# ) -> "PredictionResult":
#     """Assembles a PredictionResult from a bare sklearn-style estimator's
#     output, for bundles like {"Model": ..., "Preprocessor": ...,
#     "LabelEncoder": ...} where nothing hands back a ready-made dict.

#     ASSUMPTIONS specific to this path (on top of the module-level ones):
#     - `raw_output` is the predicted class index (0, 1, 2, ...), matching
#       whatever the label encoder (if any) was fit on during training.
#     - Which class counts as "positive/at-risk" is inferred from the label
#       encoder's class names when possible (e.g. classes_ = ["No", "Yes"]
#       correctly picks index 1). If there's no label encoder, or its class
#       names don't match anything recognizable, this falls back to
#       assuming index 1 is positive - verify this against a couple of known
#       cases (a clearly low-risk and clearly high-risk submission) if
#       you're not certain.
#     - If the estimator exposes `predict_proba`, the reported percentage is
#       the model's own confidence in whatever class it predicted (not
#       specifically the positive class).
#     """
#     try:
#         predicted_class = int(raw_output)
#     except (TypeError, ValueError):
#         raise UnexpectedModelOutputError(disease, raw_output)

#     positive_class_index = _infer_positive_class_index(label_encoder)

#     confidence = None
#     if hasattr(estimator, "predict_proba"):
#         try:
#             proba = estimator.predict_proba([vector])[0]
#             confidence = float(proba[predicted_class])
#         except Exception:
#             confidence = None

#     if confidence is None:
#         # No usable predict_proba - fall back to a flat confidence based
#         # only on which class was predicted.
#         confidence = 1.0 if predicted_class == positive_class_index else 0.0

#     percentage = round(confidence * 100, 2)
#     prediction = predicted_class == positive_class_index

#     return PredictionResult(
#         prediction=prediction,
#         percentage=percentage,
#         risk_level=classify_risk_level(percentage),
#     )


# def run_prediction(disease: DiseaseType, data: dict) -> PredictionResult:
#     """Builds the feature vector, loads the right model, calls it, and
#     returns a PredictionResult - either by parsing a ready-made
#     {"prediction", "probability", "risk"} dict if the model returns one
#     directly, or by assembling the equivalent from a bare estimator's
#     predict()/predict_proba() output otherwise.

#     Raises MissingFeaturesError / InvalidFeatureValueError if `data` is
#     incomplete or has non-numeric values, ModelNotFoundError if the .pkl
#     isn't where MODEL_DIR/MODEL_FILENAMES expects it,
#     UnrecognizedModelBundleError if the .pkl is a dict whose model key
#     couldn't be identified, or UnexpectedModelOutputError if the model's
#     output doesn't match either expected shape - callers should catch
#     these and turn them into an HTTP error rather than a 500.
#     """
#     estimator, scaler, label_encoder = get_model(disease)
#     vector = build_feature_vector(disease, data)
#     if scaler is not None:
#         vector = list(scaler.transform([vector])[0])

#     output = _call_model(estimator, vector)

#     if isinstance(output, dict) and "prediction" in output and "probability" in output:
#         return _parse_model_output(disease, output)

#     return _parse_raw_estimator_output(disease, estimator, vector, output, label_encoder)





import pandas as pd

from ..ml.loader import MODELS
from ..ml.risk import get_risk


class PredictionResult:

    def __init__(self, prediction, probability, risk):

        self.prediction = prediction
        self.probability = probability
        self.risk = risk


def predict(disease: str, data: dict):

    print(MODELS)
    bundle = MODELS[disease]

    model = bundle["Model"]

    preprocessor = bundle["Preprocessor"]

    encoder = bundle["LabelEncoder"]

    df = pd.DataFrame([data])

    X = preprocessor.transform(df)

    prediction = model.predict(X)[0]

    probability = float(model.predict_proba(X)[0].max())
    print(f"Raw probability: {probability}")
    probability = round(probability * 100, 2)
    prediction = bool(prediction)

    risk = get_risk(
        probability,
        prediction
    )
    print(f"Probability as percentage: {probability}")

    return PredictionResult(
        prediction,
        probability,
        risk
    )