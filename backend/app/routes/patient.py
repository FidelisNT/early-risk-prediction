from fastapi import APIRouter, Depends, status

from app.repositories.accounts import account_repository
from app.routes.auth import current_user
from app.schemas.accounts import (
    LoginRequest,
    PatientProfile,
    PatientProfileUpdate,
    PatientSignupRequest,
    TokenResponse,
)

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: PatientSignupRequest) -> TokenResponse:
    """Create the user and patient records described in the API specification."""
    account_repository.create_patient(payload.model_dump())
    return TokenResponse(access_token=account_repository.authenticate(payload.email, payload.password, "patient"))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    return TokenResponse(access_token=account_repository.authenticate(payload.email, payload.password, "patient"))


@router.get("", response_model=PatientProfile)
def get_profile(user: dict = Depends(current_user("patient"))) -> PatientProfile:
    return _profile(user)


@router.put("", response_model=PatientProfile)
def update_profile(payload: PatientProfileUpdate, user: dict = Depends(current_user("patient"))) -> PatientProfile:
    updated_user = account_repository.update_patient(user["id"], payload.model_dump(exclude_unset=True))
    return _profile(updated_user)


def _profile(user: dict) -> PatientProfile:
    profile = user["profile"]
    return PatientProfile(
        user_name=profile["user_name"],
        email=user["email"],
        phone_number=profile["phone_number"],
        address=profile["address"],
        blood_group=profile["blood_group"],
    )
