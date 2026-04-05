from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectExpenseBase(BaseModel):
    project_id: int
    name: str
    description: Optional[str] = None
    amount: float


class ProjectExpenseCreate(ProjectExpenseBase):
    pass


class ProjectExpenseUpdate(BaseModel):
    project_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None


class ProjectExpenseRead(ProjectExpenseBase):
    id: int
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
