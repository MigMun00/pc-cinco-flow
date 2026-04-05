from fastapi import APIRouter, Depends
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/me")
def get_me(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id}