from sqlalchemy.orm import Session
from app.models.busnessSite import BusinessData
from app.schemas.busnessSite import BusinessDataCreate, BusinessDataUpdate
from fastapi import HTTPException

def create_business_data(db: Session, data: BusinessDataCreate):
    new_entry = BusinessData(**data.dict())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

def get_all_business_data(db: Session):
    return db.query(BusinessData).all()


def get_business_data_by_id(db: Session, business_id: int, type_user: str):
    obj = (
        db.query(BusinessData)
        .filter(BusinessData.id_busness == business_id, BusinessData.type_user == type_user)
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    return obj


def update_business_data(db: Session, business_id: int, type_user: str, data: BusinessDataUpdate):
    db_data = get_business_data_by_id(db, business_id, type_user)
    if not db_data:
        raise HTTPException(status_code=404, detail="Registro não encontrado")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(db_data, key, value)

    db.commit()
    db.refresh(db_data)
    return db_data