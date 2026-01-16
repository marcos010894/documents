from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base

# Tabela de Pessoa Física (UserPF)
class UserPF(Base):
    __tablename__ = 'user_pf'
    __table_args__ = {'extend_existing': True}

    id: Mapped[int] = Column(Integer, primary_key=True)
    nome: Mapped[str] = Column(String(200), nullable=False)
    cpf: Mapped[str] = Column(String(14), unique=True, nullable=False)
    telefone: Mapped[str] = Column(String(20))
    empresa_trabalha: Mapped[str] = Column(String(255))
    email: Mapped[str] = Column(String(255), unique=True, nullable=False)
    nascimento: Mapped[str] = Column(String(15))
    cidade: Mapped[str] = Column(String(255))
    estado: Mapped[str] = Column(String(255))
    password_user: Mapped[str] = Column(String(255), nullable=False)
    tipo_conta: Mapped[str] = Column(String(255))
    status: Mapped[bool] = Column(Boolean)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

# Tabela de Pessoa Jurídica (UserPJ)
class UserPJ(Base):
    __tablename__ = 'user_pj'
    __table_args__ = {'extend_existing': True}

    id: Mapped[int] = Column(Integer, primary_key=True)
    id_user_pf: Mapped[int] = Column(Integer, ForeignKey('user_pf.id'), nullable=True)
    cnpj: Mapped[str] = Column(String(18), unique=True, nullable=False)
    razao_social: Mapped[str] = Column(String(255), nullable=False)
    nome_fantasia: Mapped[str] = Column(String(255))
    site: Mapped[str] = Column(String(255))
    cnae_primario: Mapped[str] = Column(String(10))
    cnae_secundario: Mapped[str] = Column(String(10))
    cep: Mapped[str] = Column(String(10))
    logradouro: Mapped[str] = Column(String(255))
    numero: Mapped[str] = Column(String(255))
    bairro: Mapped[str] = Column(String(255))
    cidade: Mapped[str] = Column(String(255))
    estado: Mapped[str] = Column(String(255))
    complemento: Mapped[str] = Column(String(255))
    marketplace: Mapped[bool] = Column(Boolean)
    termos_aceitos: Mapped[bool] = Column(Boolean)
    politicas_aceitas: Mapped[bool] = Column(Boolean)
    descricaoServico: Mapped[str] = Column(String(1000))
    termos_aceitos: Mapped[bool] = Column(Boolean)
    politicas_aceitas: Mapped[bool] = Column(Boolean)
    tipo_empresa: Mapped[str] = Column(String(255))
    segmento_empresa: Mapped[str] = Column(String(255))
    atorizacoes:  Mapped[str] = Column(String(1000))
    certificados:  Mapped[str] = Column(String(1000))
    outras_infos: Mapped[str] = Column(String(10000))
    status: Mapped[bool] = Column(Boolean)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
# Tabela de Freelancer (UserFreelancer)
class UserFreelancer(Base):
    __tablename__ = 'user_freelancer'  # Corrigido o nome da tabela
    __table_args__ = {'extend_existing': True}

    id: Mapped[int] = Column(Integer, primary_key=True)
    nome: Mapped[str] = Column(String(200), nullable=False)
    cpf: Mapped[str] = Column(String(14), unique=True, nullable=False)
    telefone: Mapped[str] = Column(String(20))
    empresa_trabalha: Mapped[str] = Column(String(255))
    email: Mapped[str] = Column(String(255), unique=True, nullable=False)
    nascimento: Mapped[str] = Column(String(15))
    logradouro: Mapped[str] = Column(String(255))
    numero: Mapped[str] = Column(String(255))
    bairro: Mapped[str] = Column(String(255))
    cidade: Mapped[str] = Column(String(255))
    estado: Mapped[str] = Column(String(255))
    complemento: Mapped[str] = Column(String(255))
    atorizacoes: Mapped[dict] = Column(JSON)
    certificados: Mapped[dict] = Column(JSON)
    tipo_conta: Mapped[str] = Column(String(255))
    com_oque_trabalha: Mapped[str] = Column(String(255))
    descricaoServico: Mapped[str] = Column(String(1000))
    termos_aceitos: Mapped[bool] = Column(Boolean)
    politicas_aceitas: Mapped[bool] = Column(Boolean)
    site_portifolio: Mapped[str] = Column(String(255))
    linkedin: Mapped[str] = Column(String(255))
    marketplace: Mapped[bool] = Column(Boolean)
    status: Mapped[bool] = Column(Boolean)
    password_user: Mapped[str] = Column(String(255), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# Tabela de Freelancer (UserFreelancer)
class GetUserFreelancer(Base):
    __tablename__ = 'user_freelancer'  # Corrigido o nome da tabela
    __table_args__ = {'extend_existing': True}
    id: Mapped[int] = Column(Integer, primary_key=True)
    nome: Mapped[str] = Column(String(200), nullable=False)
    cpf: Mapped[str] = Column(String(14), unique=True, nullable=False)
    telefone: Mapped[str] = Column(String(20))
    empresa_trabalha: Mapped[str] = Column(String(255))
    email: Mapped[str] = Column(String(255), unique=True, nullable=False)
    nascimento: Mapped[str] = Column(String(15))
    logradouro: Mapped[str] = Column(String(255))
    numero: Mapped[str] = Column(String(255))
    bairro: Mapped[str] = Column(String(255))
    cidade: Mapped[str] = Column(String(255))
    estado: Mapped[str] = Column(String(255))
    complemento: Mapped[str] = Column(String(255))
    atorizacoes: Mapped[dict] = Column(JSON)
    certificados: Mapped[dict] = Column(JSON)
    tipo_conta: Mapped[str] = Column(String(255))
    com_oque_trabalha: Mapped[str] = Column(String(255))
    descricaoServico: Mapped[str] = Column(String(1000))
    termos_aceitos: Mapped[bool] = Column(Boolean)
    politicas_aceitas: Mapped[bool] = Column(Boolean)
    site_portifolio: Mapped[str] = Column(String(255))
    linkedin: Mapped[str] = Column(String(255))
    marketplace: Mapped[bool] = Column(Boolean)
    status: Mapped[bool] = Column(Boolean)
    


class GetUserFreelancermetrics(Base):
    __tablename__ = 'user_freelancer'  # Corrigido o nome da tabela
    __table_args__ = {'extend_existing': True}
    id: Mapped[int] = Column(Integer, primary_key=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    



# Tabela de Pessoa Física (UserPF)
class GetUserPF(Base):
    __tablename__ = 'user_pf'
    __table_args__ = {'extend_existing': True}

    id: Mapped[int] = Column(Integer, primary_key=True)
    nome: Mapped[str] = Column(String(200), nullable=False)
    cpf: Mapped[str] = Column(String(14), unique=True, nullable=False)
    telefone: Mapped[str] = Column(String(20))
    empresa_trabalha: Mapped[str] = Column(String(255))
    email: Mapped[str] = Column(String(255), unique=True, nullable=False)
    nascimento: Mapped[str] = Column(String(15))
    cidade: Mapped[str] = Column(String(255))
    estado: Mapped[str] = Column(String(255))
    tipo_conta: Mapped[str] = Column(String(255))
    status: Mapped[bool] = Column(Boolean)




# Tabela de Pessoa Jurídica (UserPJ)
class GetUserPJ(Base):
    __tablename__ = 'user_pj'
    __table_args__ = {'extend_existing': True}

    id: Mapped[int] = Column(Integer, primary_key=True)
    id_user_pf: Mapped[int] = Column(Integer, ForeignKey('user_pf.id'), nullable=True)
    cnpj: Mapped[str] = Column(String(18), unique=True, nullable=False)
    razao_social: Mapped[str] = Column(String(255), nullable=False)
    nome_fantasia: Mapped[str] = Column(String(255))
    site: Mapped[str] = Column(String(255))
    cnae_primario: Mapped[str] = Column(String(10))
    cnae_secundario: Mapped[str] = Column(String(10))
    cep: Mapped[str] = Column(String(10))
    logradouro: Mapped[str] = Column(String(255))
    numero: Mapped[str] = Column(String(255))
    bairro: Mapped[str] = Column(String(255))
    cidade: Mapped[str] = Column(String(255))
    estado: Mapped[str] = Column(String(255))
    complemento: Mapped[str] = Column(String(255))
    marketplace: Mapped[bool] = Column(Boolean)
    termos_aceitos: Mapped[bool] = Column(Boolean)
    politicas_aceitas: Mapped[bool] = Column(Boolean)
    descricaoServico: Mapped[str] = Column(String(1000))
    termos_aceitos: Mapped[bool] = Column(Boolean)
    politicas_aceitas: Mapped[bool] = Column(Boolean)
    tipo_empresa: Mapped[str] = Column(String(255))
    segmento_empresa: Mapped[str] = Column(String(255))
    atorizacoes:  Mapped[str] = Column(String(1000))
    certificados:  Mapped[str] = Column(String(1000))
    outras_infos: Mapped[str] = Column(String(10000))
    status: Mapped[bool] = Column(Boolean)



# Tabela de Pessoa Jurídica (UserPJ)
class GetUserPJMetrics(Base):
    __tablename__ = 'user_pj'
    __table_args__ = {'extend_existing': True}

    id: Mapped[int] = Column(Integer, primary_key=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
