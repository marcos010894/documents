from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class IndicationBase(BaseModel):
    id: int
    nome_indicador: constr(max_length=200)
    email_indicado: EmailStr
    telefone_indicado: Optional[constr(max_length=20)] = None  # corrigido aqui
    empresa_freelancer_indicada: Optional[constr(max_length=255)] = None  # corrigido aqui
    status: Optional[constr(max_length=10)] = None
    class Config:
        from_attributes = True
