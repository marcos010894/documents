from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Literal
from datetime import datetime
from typing import List
from enum import Enum

# Enum para os status permitidos
class StatusSolicitacao(str, Enum):
    PENDENTE = "Pendente"
    AGUARDANDO_AVALIACAO = "Aguardando avaliação"
    AVALIADO = "Avaliado"
    SOLICITACAO_NAO_FEITA = "Solicitação não feita"

class ContactSolicitationBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: str
    id_busness: int
    type_user: str
    termos_aceitos: bool = True

class ContactSolicitationCreate(ContactSolicitationBase):
    pass

class ContactSolicitationUpdate(BaseModel):
    status: StatusSolicitacao
    
    @field_validator('status')
    def validar_status(cls, v):
        status_permitidos = [status.value for status in StatusSolicitacao]
        if v not in status_permitidos:
            raise ValueError(f'Status deve ser um dos seguintes: {", ".join(status_permitidos)}')
        return v

class ContactSolicitationResponse(ContactSolicitationBase):
    id: int
    created_at: datetime
    status: str

    class Config:
        from_attributes = True


class ContactRequestAll(BaseModel):
    data: List[ContactSolicitationResponse]
    total: int
    totalPages: int