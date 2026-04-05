from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_user
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceRead

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=List[ServiceRead])
def get_services(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    return db.query(Service).filter(Service.user_id == user_id).all()


@router.post("/", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    service = Service(**payload.model_dump(), user_id=user_id)
    db.add(service)
    try:
        db.commit()
        db.refresh(service)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create service")
    return service


@router.put("/{service_id}", response_model=ServiceRead)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.id == service_id, Service.user_id == user_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    try:
        db.commit()
        db.refresh(service)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update service")
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.id == service_id, Service.user_id == user_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    db.delete(service)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete service")
