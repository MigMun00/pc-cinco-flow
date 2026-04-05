from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_user
from app.models.project_expense import ProjectExpense
from app.schemas.project_expense import ProjectExpenseCreate, ProjectExpenseUpdate, ProjectExpenseRead

router = APIRouter(prefix="/project-expenses", tags=["project-expenses"])


@router.get("/", response_model=List[ProjectExpenseRead])
def get_project_expenses(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    return db.query(ProjectExpense).filter(ProjectExpense.user_id == user_id).all()


@router.post("/", response_model=ProjectExpenseRead, status_code=status.HTTP_201_CREATED)
def create_project_expense(
    payload: ProjectExpenseCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    expense = ProjectExpense(**payload.model_dump(), user_id=user_id)
    db.add(expense)
    try:
        db.commit()
        db.refresh(expense)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create project expense")
    return expense


@router.put("/{expense_id}", response_model=ProjectExpenseRead)
def update_project_expense(
    expense_id: int,
    payload: ProjectExpenseUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    expense = db.query(ProjectExpense).filter(ProjectExpense.id == expense_id, ProjectExpense.user_id == user_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project expense not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    try:
        db.commit()
        db.refresh(expense)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update project expense")
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    expense = db.query(ProjectExpense).filter(ProjectExpense.id == expense_id, ProjectExpense.user_id == user_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project expense not found")
    db.delete(expense)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete project expense")
