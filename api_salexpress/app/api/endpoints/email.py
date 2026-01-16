from app.schemas.email import SaveEmailForValidade
from fastapi import APIRouter, Depends, HTTPException
from app.crud.email import create_item_code, verify_code_valid
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import secrets
import string
from app.core.conn import get_db
from app.services.email_service import confirmCode

router = APIRouter()

def gerar_codigo_validacao(tamanho=6):
    caracteres = string.ascii_uppercase + string.digits  # Letras maiúsculas e números
    return ''.join(secrets.choice(caracteres) for _ in range(tamanho))

@router.post("/get_code")
def get_code(data: SaveEmailForValidade, db: Session = Depends(get_db)):
    try:
        codigo_validacao = gerar_codigo_validacao()
        code_added = create_item_code(data.email, codigo_validacao, db)
        confirmCode(codigo_validacao, data.email)       
        return JSONResponse(code_added, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify_code")
def verify_code(data: SaveEmailForValidade, db: Session = Depends(get_db)):
    try:
        codigo_validacao = gerar_codigo_validacao()
        code_verify = verify_code_valid(data.email, data.codeVerify, db)
        return JSONResponse(code_verify, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
