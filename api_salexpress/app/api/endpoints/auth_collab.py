from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.conn import get_db
from app.schemas.login import LoginInput
from app.models.collaborator import CompanyCollaborator
import hashlib

router = APIRouter()

from app.utils.security import verify_password

@router.post("/collaborator/login")
def collaborator_login(user: LoginInput, db: Session = Depends(get_db)):
    """Login específico para colaboradores - DEVE usar bcrypt igual à criação"""
    
    # Busca colaborador
    collaborator = db.query(CompanyCollaborator).filter(
        CompanyCollaborator.email == user.email
    ).first()
    
    if not collaborator:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos"
        )
    
    # Verifica se está ativo
    if not collaborator.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Colaborador inativo. Entre em contato com o administrador."
        )
    
    # Verifica senha usando BCRYPT (padrão do sistema)
    if not verify_password(user.password, collaborator.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos"
        )
    
    # Remove dados sensíveis
    collaborator_data = {
        "id": collaborator.id,
        "email": collaborator.email,
        "name": collaborator.name,
        "company_id": collaborator.company_id,
        "company_type": collaborator.company_type,
        "is_active": collaborator.is_active,
        "created_at": collaborator.created_at.isoformat() if collaborator.created_at else None,
        "updated_at": collaborator.updated_at.isoformat() if collaborator.updated_at else None
    }
    
    return {
        "message": "Login Colaborador realizado com sucesso",
        "status": "completo",
        "user": collaborator_data,
        "permissions": collaborator.permissions,
        "tipo": "Colaborador",
        "company_id": collaborator.company_id,
        "company_type": collaborator.company_type,
        "is_collaborator": True
    }
