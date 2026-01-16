from pydantic import BaseModel
from typing import Optional, Dict
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import date
from typing import List
from typing import Union


class UserPFBase(BaseModel):
    nome: str
    cpf: str
    telefone: Optional[str] = None
    empresa_trabalha: Optional[str] = None
    email: EmailStr
    nascimento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    tipo_conta: Optional[str] = None
    status: bool
    password_user: str
    class Config:
        from_attributes = True


class UserPFCreate(UserPFBase):
    password_user: str
    atorizacoes: Optional[Dict] = None
    certificados: Optional[Dict] = None


class UserPFResponse(UserPFBase):
    id: int
    password_user: Optional[str] = None  # Não incluir a senha na resposta



class UserPJBase(BaseModel):
    cnpj: str
    razao_social: str
    nome_fantasia: Optional[str] = None
    site: Optional[str] = None
    cnae_primario: Optional[str] = None
    cnae_secundario: Optional[str] = None
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    marketplace: bool
    tipo_empresa: Optional[str] = None
    segmento_empresa: Optional[str] = None
    atorizacoes: Optional[str] = None
    certificados: Optional[str] = None
    outras_infos: Optional[str] = None
    id_user_pf: Optional[int] = None
    complemento: Optional[str] = None
    descricaoServico: Optional[str] = None
    termos_aceitos: bool
    politicas_aceitas: bool
    status: bool


    class Config:
        from_attributes = True


class UserPJCreate(UserPJBase):
    id_user_pf: Optional[int] = None
    id_user_freelancer: Optional[int] = None


class UserPJResponse(UserPJBase):
    id: int
    id_user_pf: Optional[int] = None
    id_user_freelancer: Optional[int] = None




class UserFreelancerBase(BaseModel):
    nome: str
    cpf: str
    telefone: Optional[str] = None
    empresa_trabalha: Optional[str] = None
    email: str
    nascimento: Optional[str] = None    
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    complemento: Optional[str] = None
    tipo_conta: Optional[str] = None
    com_oque_trabalha: Optional[str] = None
    descricaoServico: Optional[str] = None
    site_portifolio: Optional[str] = None
    linkedin: Optional[str] = None
    marketplace: bool
    password_user: str
    termos_aceitos: bool
    politicas_aceitas: bool
    status: bool    

    class Config:
        from_attributes = True


class UserFreelancerCreate(UserFreelancerBase):
    password_user: str
    atorizacoes: Optional[Dict] = None
    certificados: Optional[Dict] = None


class UserFreelancerResponse(UserFreelancerBase):
    id: int
from pydantic import BaseModel
from typing import Optional

# Model de resposta do freelancer
class UserFreelancerResponse(BaseModel):
    id: int
    nome: str
    cpf: str
    telefone: Optional[str] = None
    empresa_trabalha: Optional[str] = None
    email: str
    nascimento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    tipo_conta: Optional[str] = None
    com_oque_trabalha: Optional[str] = None
    site_portifolio: Optional[str] = None
    linkedin: Optional[str] = None
    marketplace: bool
    status: bool

    class Config:
        from_attributes = True  # Permite a conversão de objetos SQLAlchemy em modelos Pydantic





class GetUserFreelancerBase(BaseModel):
    nome: str
    cpf: str
    telefone: Optional[str] = None
    empresa_trabalha: Optional[str] = None
    email: str
    nascimento: Optional[str] = None    
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    complemento: Optional[str] = None
    tipo_conta: Optional[str] = None
    com_oque_trabalha: Optional[str] = None
    descricaoServico: Optional[str] = None
    site_portifolio: Optional[str] = None
    linkedin: Optional[str] = None
    marketplace: bool
    termos_aceitos: bool
    politicas_aceitas: bool
    status: bool    
    totalPages: int

    class Config:
        from_attributes = True





# Tabela de Pessoa Física (UserPF)
class GetUserPF(BaseModel):
    nome: str
    cpf: str
    telefone: Optional[str] = None
    empresa_trabalha: Optional[str] = None
    email: EmailStr
    nascimento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    tipo_conta: Optional[str] = None
    status: bool
    class Config:
        from_attributes = True


# Tabela de Pessoa Jurídica (UserPJ)
class GetUserPJ(BaseModel):
    cnpj: str
    razao_social: str
    nome_fantasia: Optional[str] = None
    site: Optional[str] = None
    cnae_primario: Optional[str] = None
    cnae_secundario: Optional[str] = None
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    marketplace: bool
    tipo_empresa: Optional[str] = None
    segmento_empresa: Optional[str] = None
    atorizacoes: Optional[str] = None
    certificados: Optional[str] = None
    outras_infos: Optional[str] = None
    id_user_pf: Optional[int] = None
    complemento: Optional[str] = None
    descricaoServico: Optional[str] = None
    termos_aceitos: bool
    politicas_aceitas: bool
    status: bool
    class Config:
        from_attributes = True


class PermissionsRequest(BaseModel):
    user_id: int
    permissions: list
    user_type: str  # 'pj' ou 'freelancer'