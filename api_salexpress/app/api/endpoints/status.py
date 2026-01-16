from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.conn import get_db
from app.schemas.status import StatusCreate, StatusUpdate, StatusResponse
from app.crud.status import create_status, get_status, list_statuses, update_status, delete_status

router = APIRouter()

@router.post("/", response_model=StatusResponse)
def create_status_endpoint(payload: StatusCreate, db: Session = Depends(get_db)):
    return create_status(db, payload)

@router.get("/{status_id}", response_model=StatusResponse)
def get_status_endpoint(status_id: int, db: Session = Depends(get_db)):
    status = get_status(db, status_id)
    if not status:
        raise HTTPException(status_code=404, detail="Status não encontrado")
    return status

@router.get("/", response_model=List[StatusResponse])
def list_statuses_endpoint(id_business: int = None, type_user: str = None, db: Session = Depends(get_db)):
    return list_statuses(db, id_business, type_user)

@router.put("/{status_id}", response_model=StatusResponse)
def update_status_endpoint(status_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    return update_status(db, status_id, payload)

@router.delete("/{status_id}")
def delete_status_endpoint(status_id: int, db: Session = Depends(get_db)):
    delete_status(db, status_id)
    return {"success": True}
