from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime

class PasswordResetRequest(BaseModel):
    """Schema para solicitar reset de senha"""
    email: EmailStr = Field(..., description="Email do usuário")

class PasswordResetValidate(BaseModel):
    """Schema para validar token de reset"""
    token: str = Field(..., min_length=32, max_length=100, description="Token de reset")

class PasswordResetConfirm(BaseModel):
    """Schema para confirmar nova senha"""
    senha: str = Field(..., min_length=8, max_length=100, description="Nova senha (mínimo 8 caracteres)")
    confirmar_senha: str = Field(..., min_length=8, max_length=100, description="Confirmar nova senha")
    
    @validator('confirmar_senha')
    def validar_senhas_iguais(cls, v, values):
        if 'senha' in values and v != values['senha']:
            raise ValueError('As senhas não coincidem')
        return v

class PasswordResetResponse(BaseModel):
    """Schema de resposta do reset de senha"""
    id: int
    token: str
    email: str
    tipo_usuario: str
    usado: bool
    expira_em: datetime
    created_at: datetime
    link_completo: Optional[str] = None
    
    class Config:
        from_attributes = True

class PasswordResetSuccess(BaseModel):
    """Schema de sucesso ao resetar senha"""
    message: str
    email: str
