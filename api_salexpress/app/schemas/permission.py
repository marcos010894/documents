from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class PermissionBase(BaseModel):
    user_id: int
    type_user: str
    business_id: int
    business_type: str
    permission_level: str
    is_active: Optional[bool] = True

class PermissionCreate(BaseModel):
    """Schema para criação de permissão usando emails"""
    user_email: EmailStr  # Email do usuário que receberá a permissão
    business_email: EmailStr  # Email da empresa/responsável
    permission_level: str  # "GED-MASTER", "GED-ALL", "GED-EDIT", "GED-VIEW"

class PermissionCreateLegacy(PermissionBase):
    """Schema legado para compatibilidade com IDs diretos"""
    pass

class PermissionUpdate(BaseModel):
    permission_level: Optional[str] = None
    is_active: Optional[bool] = None

class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

class UserPermissionInfo(BaseModel):
    """Informações de permissão do usuário para retorno no login"""
    user_id: int
    type_user: str
    user_data: Dict[str, Any]
    
    # Permissões por empresa
    permissions: list[Dict[str, Any]]  # Lista de permissões do usuário em diferentes empresas
    
    class Config:
        from_attributes = True

class LoginPermissionResponse(BaseModel):
    """Resposta completa do login com permissões"""
    user_info: UserPermissionInfo
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    
    class Config:
        from_attributes = True
