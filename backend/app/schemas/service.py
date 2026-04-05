from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ServiceBase(BaseModel):
    client_id: int
    name: str
    description: Optional[str] = None
    amount: float
    invoiced: bool = False


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    client_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    invoiced: Optional[bool] = None


class ServiceRead(ServiceBase):
    id: int
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
