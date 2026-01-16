from pydantic import BaseModel, Field
from typing import Optional, Literal, List, Dict, Any
from datetime import datetime, date

class StorageBase(BaseModel):
    name: str
    type: Literal['file','folder']
    parent_id: Optional[int] = None
    business_id: Optional[int] = None  # ID do usuário dono
    type_user: Optional[str] = None    # Tipo do usuário dono
    company_id: Optional[int] = None   # ID da empresa responsável
    company_type: Optional[str] = None # Tipo da empresa
    size: Optional[str] = None
    extension: Optional[str] = None
    status: Optional[str] = None
    comments: Optional[str] = None
    url: Optional[str] = None
    data_validade: Optional[date] = None

class StorageCreate(StorageBase):
    pass

class StorageUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    type_user: Optional[str] = None
    size: Optional[str] = None
    extension: Optional[str] = None
    status: Optional[str] = None
    comments: Optional[str] = None
    url: Optional[str] = None
    data_validade: Optional[date] = None

class StorageResponse(StorageBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    # Novos campos para informações de seguidores
    seguidores: Optional[List[Dict[str, Any]]] = Field(default=None, description="Lista de usuários seguindo este documento")
    total_seguidores: Optional[int] = Field(default=0, description="Total de seguidores")
    usuario_atual_segue: Optional[Dict[str, Any]] = Field(default=None, description="Se o usuário atual está seguindo")
    usuario_e_dono: Optional[bool] = Field(default=False, description="Se o usuário atual é dono do documento")
    
    class Config:
        from_attributes = True

class DocumentsWithPermissionsResponse(BaseModel):
    """Resposta para documentos com informações de permissão"""
    user_email: str
    business_email: Optional[str] = None
    status_filter: str
    total_documents: int
    user_permissions: list
    documents: list[StorageResponse]
    
    class Config:
        from_attributes = True

# Schemas para lixeira
class TrashItemResponse(BaseModel):
    """Item na lixeira com informações de exclusão"""
    id: int
    name: str
    type: Literal['file','folder']
    parent_id: Optional[int] = None
    business_id: Optional[int] = None  # ID do usuário dono
    type_user: Optional[str] = None    # Tipo do usuário dono
    company_id: Optional[int] = None   # ID da empresa responsável
    company_type: Optional[str] = None # Tipo da empresa
    size: Optional[str] = None
    extension: Optional[str] = None
    status: Optional[str] = None
    url: Optional[str] = None
    data_validade: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[int] = None
    deleted_by_type: Optional[str] = None
    
    # Contador de filhos (para pastas)
    children_count: Optional[int] = Field(default=0, description="Número de itens dentro da pasta")
    
    class Config:
        from_attributes = True

class RestoreRequest(BaseModel):
    """Request para restaurar item da lixeira"""
    user_id: Optional[int] = Field(default=None, description="ID do usuário que está restaurando")
    type_user: Optional[str] = Field(default=None, description="Tipo do usuário (PF/PJ/freelancer)")
    restore_to_parent: Optional[int] = Field(default=None, description="ID da pasta de destino (None = local original)")

class BulkRestoreRequest(BaseModel):
    """Request para restaurar múltiplos itens"""
    node_ids: List[int] = Field(..., description="Lista de IDs dos nós a restaurar")
    user_id: Optional[int] = Field(default=None, description="ID do usuário que está restaurando")
    type_user: Optional[str] = Field(default=None, description="Tipo do usuário")
    restore_to_parent: Optional[int] = Field(default=None, description="ID da pasta de destino")

class EmptyTrashRequest(BaseModel):
    """Request para esvaziar lixeira"""
    user_id: int = Field(..., description="ID do usuário")
    type_user: str = Field(..., description="Tipo do usuário (PF/PJ/freelancer)")
    older_than_days: Optional[int] = Field(default=None, description="Deletar apenas itens mais antigos que X dias")

class MoveNodeRequest(BaseModel):
    """Request para mover arquivo ou pasta para nova localização"""
    new_parent_id: Optional[int] = Field(
        default=None, 
        description="ID da pasta de destino (None = mover para raiz)"
    )

class PresignedUploadRequest(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    business_id: int
    type_user: str
    company_id: Optional[int] = None
    company_type: Optional[str] = None

class PresignedUploadResponse(BaseModel):
    upload_url: str
    key: str
    public_url: str
    filename: str
