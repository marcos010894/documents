from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.conn import get_db
from app.schemas.busnessSite import (
    BusinessDataCreate,
    BusinessDataUpdate,
    BusinessDataResponse
)
from app.crud.busnessSite import (
    create_business_data,
    get_all_business_data,
    get_business_data_by_id,
    update_business_data
)

router = APIRouter()

@router.post("/", response_model=BusinessDataResponse)
def create_business(data: BusinessDataCreate, db: Session = Depends(get_db)):
    return create_business_data(db, data)

@router.get("/", response_model=List[BusinessDataResponse])
def list_business_data(db: Session = Depends(get_db)):
    return get_all_business_data(db)

@router.get("/{business_id}/{type_user}", response_model=BusinessDataResponse)
def get_business(business_id: int, type_user: str, db: Session = Depends(get_db)):
    return get_business_data_by_id(db, business_id, type_user)

@router.patch("/{business_id}/{type_user}", response_model=BusinessDataResponse)
def update_business(business_id: int, type_user: str, data: BusinessDataUpdate, db: Session = Depends(get_db)):
    return update_business_data(db, business_id, type_user, data)