from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel
from typing import Optional

# Tabela de Pessoa Jurídica (UserPJ)
class Getsuppliers(BaseModel):
    nome: str
    telefone: str
    site: str
    servico: str
    cidade_estado: str
    preferencia_local: str
    Tipo_empresa: str
    experiencia_Salexpress: str
    certificados: Optional[str]
    email: str
