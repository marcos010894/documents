from pydantic import BaseModel
from typing import Optional

class StatusBase(BaseModel):
    id_business: int
    type_user: str
    name: str
    color: str

class StatusCreate(StatusBase):
    pass

class StatusUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class StatusResponse(StatusBase):
    id: int
    class Config:
        from_attributes = True
