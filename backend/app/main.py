from fastapi import FastAPI

from app.routes.diabetes import router as diabetes_router
from app.routes.heart import router as heart_router
from app.routes.kidney import router as kidney_router
from app.routes.stroke import router as stroke_router
from app.routes.admin import router as admin_router
from app.routes.patient import router as patient_router

app = FastAPI(
    title="Machine Learning Early Risk Prediction API",
    version="1.0.0"
)

app.include_router(
    diabetes_router,
    prefix="/predict/diabetes",
    tags=["Diabetes"]
)

app.include_router(
    heart_router,
    prefix="/predict/heart",
    tags=["Heart Disease"]
)

app.include_router(
    kidney_router,
    prefix="/predict/kidney",
    tags=["Kidney Disease"]
)

app.include_router(
    stroke_router,
    prefix="/predict/stroke",
    tags=["Stroke"]
)

app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(patient_router, prefix="/patient", tags=["Patient"])


@app.get("/")
def home():
    return {
        "message": "Machine Learning Disease Prediction API"
    }


@app.get("/health")
def health():
    return {
        "status": "Running"
    }
