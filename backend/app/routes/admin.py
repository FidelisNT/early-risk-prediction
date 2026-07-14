from fastapi import APIRouter, Depends

from app.repositories.accounts import account_repository
from app.routes.auth import current_user
from app.schemas.accounts import AdminAccountSummary, LoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    """Authenticate a pre-provisioned administrator."""
    return TokenResponse(access_token=account_repository.authenticate(payload.email, payload.password, "admin"))


@router.get("/patients", response_model=list[AdminAccountSummary])
def list_patients(_: dict = Depends(current_user("admin"))) -> list[AdminAccountSummary]:
    return [_summary(user) for user in account_repository.list_users("patient")]


@router.get("/institution", response_model=list[AdminAccountSummary])
def list_institutions(_: dict = Depends(current_user("admin"))) -> list[AdminAccountSummary]:
    return [_summary(user) for user in account_repository.list_users("institution")]


def _summary(user: dict) -> AdminAccountSummary:
    profile = user["profile"]
    return AdminAccountSummary(
        id=user["id"],
        name=profile.get("user_name") or profile.get("institution_name") or profile.get("name", ""),
        email=user["email"],
        phone_number=profile.get("phone_number"),
        created_at=user["created_at"],
        is_active=user["is_active"],
        last_login=user["last_login"],
    )
