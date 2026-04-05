from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from app.core.auth import verify_token

security = HTTPBearer()

def get_current_user(credentials: str = Depends(security)):
    try:
        token = credentials.credentials
        payload = verify_token(token)
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")