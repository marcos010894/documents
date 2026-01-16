from pydantic import BaseModel



class EmailValidate(BaseModel):
    email: str
    codeVerify: str

class SaveEmailForValidade(BaseModel):
    email: str
    codeVerify: str