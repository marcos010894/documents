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


@router.post("/images/link")
def uploadImge(  # Certifique-se que os campos de PhotoPlanBase usam Form()
    file: UploadFile = File(...)
):
    try:
        # Upload do arquivo
        uploaded_url = upload_file_to_api(file)
        return {"link": uploaded_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))