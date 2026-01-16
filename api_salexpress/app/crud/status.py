from sqlalchemy.orm import Session
from app.models.status import Status
from app.schemas.status import StatusCreate, StatusUpdate
from typing import List

def create_status(db: Session, data: StatusCreate) -> Status:
    status = Status(**data.dict())
    db.add(status)
    db.commit()
    db.refresh(status)
    return status

def get_status(db: Session, status_id: int) -> Status:
    return db.query(Status).filter(Status.id == status_id).first()

def list_statuses(db: Session, id_business: int = None, type_user: str = None) -> List[Status]:
    query = db.query(Status)
    if id_business is not None:
        query = query.filter(Status.id_business == id_business)
    if type_user is not None:
        query = query.filter(Status.type_user == type_user)
    return query.all()

def update_status(db: Session, status_id: int, data: StatusUpdate) -> Status:
    status = get_status(db, status_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(status, k, v)
    db.commit()
    db.refresh(status)
    return status

def delete_status(db: Session, status_id: int):
    status = get_status(db, status_id)
    db.delete(status)
    db.commit()
