from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.schemas.photos import *
from app.crud.photos import *
from app.core.conn import get_db
from typing import List
from app.utils.photos import upload_file_to_api
import shutil
import os
router = APIRouter()
# --- Photo Profile Endpoints ---

@router.post("/photo/profile", response_model=PhotoProfileResponse)
def create_photo_profile_endpoint(data: PhotoProfileBase, db: Session = Depends(get_db)):
    return create_photo_profile(db=db, data=data)

@router.get("/photo/profile", response_model=List[PhotoProfileResponse])
def get_profile_photos(id_user: int, type_user: str, db: Session = Depends(get_db)):
    return get_photo_profile_by_user(db=db, id_user=id_user, type_user=type_user)

@router.put("/photo/profile", response_model=PhotoProfileResponse)
def update_profile_photo(id_user: int, type_user: str, data: PhotoProfileBase, db: Session = Depends(get_db)):
    return update_photo_profile(db=db, id_user=id_user, type_user=type_user, data=data)

@router.delete("/photo/profile")
def delete_profile_photo(id_user: int, type_user: str, db: Session = Depends(get_db)):
    return delete_photo_profile(db=db, id_user=id_user, type_user=type_user)

# --- Photo Plan Endpoints ---

@router.post("/photo/plan", response_model=PhotoPlanResponse)
def create_photo_plan_endpoint(
    data: PhotoPlanBase = Depends(),  # Certifique-se que os campos de PhotoPlanBase usam Form()
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Upload do arquivo
        uploaded_url = upload_file_to_api(file)
        data.urlPhoto = uploaded_url

        # Resetar o ponteiro do arquivo para o início antes de salvar localmente
        file.file.seek(0)

        # Salvar arquivo localmente
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Criar plano de foto
    return create_photo_plan(db=db, data=data)



@router.put("/photo/plan", response_model=PhotoPlanResponse)
def update_plan_photo(
    id_user: int = Form(...),
    type_user: str = Form(...),
    data: PhotoPlanBasePut = Depends(PhotoPlanBasePut.as_form),
    file: UploadFile = File(None),  # Torna o upload opcional
    db: Session = Depends(get_db)
):
    try:
        if file:
            # Se o usuário enviou uma nova imagem, atualiza a URL
            uploaded_url = upload_file_to_api(file)
            data.urlPhoto = uploaded_url

            # Resetar ponteiro e salvar localmente (opcional)
            file.file.seek(0)
            temp_path = f"/tmp/{file.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return update_photo_plan(db=db, id_user=id_user, type_user=type_user, data=data)

@router.get("/photo/plan", response_model=List[PhotoPlanResponse])
def get_plan_photos(id_user: int, type_user: str, db: Session = Depends(get_db)):
    return get_photo_plan_by_user(db=db, id_user=id_user, type_user=type_user)


@router.delete("/photo/plan")
def delete_plan_photo(id_user: int, type_user: str, db: Session = Depends(get_db)):
    return delete_photo_plan(db=db, id_user=id_user, type_user=type_user)