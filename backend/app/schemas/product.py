from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    price: float


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None


class ProductRead(ProductBase):
    id: int
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}