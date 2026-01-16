from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.photosAndDocuments import PhotoProfile, PhotoPlan
from app.schemas.photos import PhotoProfileBase, PhotoPlanBase
from typing import List
import json
from app.utils.photos import upload_file_to_api
# PhotoProfile CRUDs

def create_photo_profile(db: Session, data: PhotoProfileBase):
    photo = PhotoProfile(**data.dict())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

def get_photo_profile_by_user(db: Session, id_user: int, type_user: str):
    return db.query(PhotoProfile).filter_by(id_user=id_user, type_user=type_user).all()

def update_photo_profile(db: Session, id_user: int, type_user: str, data: PhotoProfileBase):
    item = db.query(PhotoProfile).filter_by(id_user=id_user, type_user=type_user).first()
    if not item:
        raise HTTPException(status_code=404, detail="Foto não encontrada.")
    for key, value in data.dict().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def delete_photo_profile(db: Session, id_user: int, type_user: str):
    item = db.query(PhotoProfile).filter_by(id_user=id_user, type_user=type_user).first()
    if not item:
        raise HTTPException(status_code=404, detail="Foto não encontrada.")
    db.delete(item)
    db.commit()
    return {"msg": "Foto deletada com sucesso"}

# PhotoPlan CRUDs

def create_photo_plan(db: Session, data: PhotoPlanBase):
    # Supondo que `urlPhoto` é um campo do tipo lista de strings
    photo = PhotoPlan(**data.dict())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo
def get_photo_plan_by_user(db: Session, id_user: int, type_user: str):
    return db.query(PhotoPlan).filter_by(id_user=id_user, type_user=type_user).all()

def update_photo_plan(db: Session, id_user: int, type_user: str, data: PhotoPlanBase):
    item = db.query(PhotoPlan).filter_by(id_user=id_user, type_user=type_user).first()
    if not item:
        raise HTTPException(status_code=404, detail="Foto do plano não encontrada.")
    for key, value in data.dict().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def delete_photo_plan(db: Session, id_user: int, type_user: str):
    item = db.query(PhotoPlan).filter_by(id_user=id_user, type_user=type_user).first()
    if not item:
        raise HTTPException(status_code=404, detail="Foto do plano não encontrada.")
    db.delete(item)
    db.commit()
    return {"msg": "Foto do plano deletada com sucesso"}
