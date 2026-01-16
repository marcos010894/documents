from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class UserBusinessLinkBase(BaseModel):
    user_id: int
    type_user: str
    business_id: int
    business_type: str
    permissions: Optional[Dict[str, Any]] = None
    status: Optional[int] = 1  # 1 = ativo, 0 = inativo

class UserBusinessLinkCreate(BaseModel):
    email: str  # Email do usuário para buscar automaticamente
    business_id: int
    business_type: str
    permissions: Optional[Dict[str, Any]] = None
    status: Optional[int] = 1  # 1 = ativo, 0 = inativo

class UserBusinessLinkUpdate(BaseModel):
    status: Optional[int] = None
    business_type: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None

class UserBusinessLinkResponse(UserBusinessLinkBase):
    id: int
    created_at: datetime
    updated_at: datetime
    nome: Optional[str] = None
    email: Optional[str] = None
    class Config:
        from_attributes = True

class UserInfoByEmailResponse(BaseModel):
    """Schema para resposta da busca de usuário por email"""
    user_id: int
    type_user: str  # "pf", "freelancer", ou "pj"
    user_data: Dict[str, Any]  # Dados completos do usuário
    
    class Config:
        from_attributes = True


class CompanyInfo(BaseModel):
    """Schema para informações de uma empresa"""
    link_id: int
    business_id: int
    business_type: str
    nome_exibicao: str  # Nome para exibir no frontend
    created_at: datetime
    
    # Campos opcionais dependendo do tipo
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    nome: Optional[str] = None
    email: Optional[str] = None
    cpf: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    tipo_empresa: Optional[str] = None
    segmento_empresa: Optional[str] = None
    com_oque_trabalha: Optional[str] = None
    marketplace: Optional[bool] = None
    status: Optional[bool] = None
    permissions: Optional[Dict[str, Any]] = None


class UserCompaniesResponse(BaseModel):
    """Schema para resposta de listagem de empresas do usuário"""
    user: Dict[str, Any]  # Dados do usuário
    companies: list[CompanyInfo]  # Lista de empresas
    total_companies: int  # Total de empresas vinculadas
    
    class Config:
        from_attributes = True
