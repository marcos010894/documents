from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date

# Schema de entrada para UserPF
class ChatBot(BaseModel):
    mensage: str
    numbePhone: str
    history: Optional[list[dict]] = None
