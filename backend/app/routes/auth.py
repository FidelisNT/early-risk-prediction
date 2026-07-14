from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.repositories.accounts import account_repository

security = HTTPBearer(auto_error=False)


def current_user(role: str):
    def dependency(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
        if credentials is None or credentials.scheme.lower() != "bearer":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer authentication is required")
        return account_repository.get_user_for_token(credentials.credentials, role)

    return dependency
