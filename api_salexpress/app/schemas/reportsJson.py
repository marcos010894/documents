from pydantic import BaseModel
from typing import List, Optional

class ReportGenerate(BaseModel):
    name: str
    json_data: Optional[dict]
    class Config:
        from_attributes = True  # ✅ Substitui orm_mode
