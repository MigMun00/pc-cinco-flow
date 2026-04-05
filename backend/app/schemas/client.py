from pydantic import BaseModel
from typing import Optional


class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class ClientRead(ClientBase):
    id: int
    user_id: str

    model_config = {"from_attributes": True}
