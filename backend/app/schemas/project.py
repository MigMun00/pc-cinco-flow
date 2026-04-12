from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    client_id: int
    name: str
    description: Optional[str] = None
    win_margin: float
    custom_fee: float = 0.0
    invoiced: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    client_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    win_margin: Optional[float] = None
    custom_fee: Optional[float] = None
    invoiced: Optional[bool] = None


class ProjectRead(ProjectBase):
    id: int
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
