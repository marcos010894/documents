from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class CollaboratorPermissions(BaseModel):
    """Permissões do colaborador"""
    manage_files: bool = Field(default=False, description="Ver, compartilhar, deletar, editar arquivos da empresa")
    view_metrics: bool = Field(default=False, description="Ver métricas da empresa")
    view_only: bool = Field(default=False, description="Apenas visualizar arquivos")
    manage_collaborators: bool = Field(default=False, description="Adicionar e editar outros colaboradores")
    view_shared: bool = Field(default=False, description="Ver apenas arquivos compartilhados com ele")

class CollaboratorBase(BaseModel):
    email: EmailStr
    name: str
    company_id: int
    company_type: str = Field(..., pattern="^(pf|pj|freelancer)$")
    permissions: CollaboratorPermissions

class CollaboratorCreate(CollaboratorBase):
    """Schema para criar colaborador"""
    password: str = Field(..., min_length=6, description="Senha (mínimo 6 caracteres)")

class CollaboratorUpdate(BaseModel):
    """Schema para atualizar colaborador"""
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    permissions: Optional[CollaboratorPermissions] = None
    is_active: Optional[bool] = None

class CollaboratorResponse(CollaboratorBase):
    """Schema de resposta do colaborador"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CollaboratorLogin(BaseModel):
    """Schema para login do colaborador"""
    email: EmailStr
    password: str

class CollaboratorLoginResponse(BaseModel):
    """Schema de resposta do login"""
    collaborator: CollaboratorResponse
    token: str  # Para futuro uso com JWT
    message: str = "Login realizado com sucesso"

class CollaboratorListResponse(BaseModel):
    """Schema para lista de colaboradores"""
    company_id: int
    company_type: str
    total: int
    collaborators: list[CollaboratorResponse]
