from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi import Form

class PhotoProfileBase(BaseModel):
    id_user: int
    type_user: str
    urlPhoto: str

class PhotoProfileResponse(PhotoProfileBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PhotoPlanBase(BaseModel):
    id_user: int
    type_user: str
    typePlan: str
    urlPhoto: str

class PhotoPlanResponse(PhotoPlanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

        
class PhotoPlanBasePut(BaseModel):
    id_user: int
    type_user: str
    typePlan: str
    urlPhoto: str

    @classmethod
    def as_form(
        cls,
        id_user: int = Form(...),
        type_user: str = Form(...),
        typePlan: str = Form(...),
        urlPhoto: str = Form(...)
    ) -> "PhotoPlanBasePut":
        return cls(
            id_user=id_user,
            type_user=type_user,
            typePlan=typePlan,
            urlPhoto=urlPhoto
        )