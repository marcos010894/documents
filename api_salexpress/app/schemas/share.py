from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ShareBase(BaseModel):
    node_id: int
    shared_with_user_id: int
    shared_by_user_id: int
    type_user_sender: str | None = None
    type_user_receiver: str | None = None
    allow_editing: bool = False

class ShareCreate(BaseModel):
    """Schema para criação de compartilhamento usando emails"""
    node_id: int
    shared_with_email: EmailStr  # Email do usuário que receberá o compartilhamento
    shared_by_email: EmailStr    # Email do usuário que está compartilhando
    allow_editing: bool = False  # Permissão de edição

class ShareCreateLegacy(ShareBase):
    """Schema legado para compatibilidade com IDs diretos"""
    pass

class ShareResponse(ShareBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
