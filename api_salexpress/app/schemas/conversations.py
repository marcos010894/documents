from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date

# Schema de entrada para UserPF
class conversations(BaseModel):
    conversation: Optional[dict] = None