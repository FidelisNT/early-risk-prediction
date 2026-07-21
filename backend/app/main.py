from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from schemas import SignupRequest, LoginRequest
# from auth import hash_password, verify_password
from .database import create_db_and_tables

from .routers import admin, institution, patient
from .ml.loader import load_models

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database...")
    create_db_and_tables()

    print("Loading ML models...")
    load_models()

    print("Application startup complete.")

    yield

    print("Application shutting down...")


app = FastAPI(title="Prediction System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(patient.router)
app.include_router(institution.router)

@app.on_event("startup")
def startup():
    load_models()

@app.get("/")
def health_check():
    return {"status": "ok"}
