from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.conn import get_db
from app.services.storage.r2_service import store_image, remove_image

router = APIRouter()

class DeleteImageRequest(BaseModel):
    key: str

@router.post("/upload")
async def upload_image_endpoint(
    file: UploadFile = File(...),
    folder: str | None = Form(default=None),
    db: Session = Depends(get_db)
):
    if file.content_type and not file.content_type.startswith(("image/", "application/")):
        raise HTTPException(status_code=400, detail="Tipo de arquivo inválido.")
    result = store_image(
        file_obj=file.file,
        original_filename=file.filename,
        folder=folder,
        content_type=file.content_type
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Erro no upload"))
    return result

@router.delete("/delete")
async def delete_image_endpoint(payload: DeleteImageRequest, db: Session = Depends(get_db)):
    result = remove_image(payload.key)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Erro ao deletar"))
    return result
