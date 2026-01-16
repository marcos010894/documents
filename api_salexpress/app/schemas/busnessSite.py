from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class BusinessDataBase(BaseModel):
    type_user: str
    id_busness: int
    dados_site: Dict  # Representa um JSON

class BusinessDataCreate(BusinessDataBase):
    pass

class BusinessDataUpdate(BaseModel):
    dados_site: Dict

class BusinessDataResponse(BusinessDataBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True
