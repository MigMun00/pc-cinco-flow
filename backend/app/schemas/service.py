from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class ServiceBase(BaseModel):
    client_id: int
    service_date: date
    description: Optional[str] = None
    invoiced: bool = False
    product_id: Optional[int] = None


class ServiceCreate(ServiceBase):
    amount: Optional[float] = None


class ServiceUpdate(BaseModel):
    client_id: Optional[int] = None
    service_date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    invoiced: Optional[bool] = None
    product_id: Optional[int] = None


class ServiceRead(ServiceBase):
    id: int
    user_id: str
    amount: float
    created_at: datetime

    model_config = {"from_attributes": True}
