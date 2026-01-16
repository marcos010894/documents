from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Index
from sqlalchemy.sql import func
from app.core.db import Base

class CompanyCollaborator(Base):
    """
    Colaborador vinculado a uma empresa.
    
    Colaboradores são usuários que podem fazer login, mas não são donos da empresa.
    Eles têm permissões específicas definidas pela empresa.
    
    PERMISSÕES DISPONÍVEIS:
    {
        "manage_files": true/false,           # Ver, compartilhar, deletar, editar arquivos
        "view_metrics": true/false,           # Ver métricas da EMPRESA (não dele)
        "view_only": true/false,              # Apenas visualizar arquivos
        "manage_collaborators": true/false,   # Adicionar e editar colaboradores
        "view_shared": true/false             # Apenas ver arquivos compartilhados com ele
    }
    """
    __tablename__ = "company_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    
    # Vínculo com empresa
    company_id = Column(Integer, nullable=False, comment="ID da empresa à qual pertence")
    company_type = Column(String(20), nullable=False, comment="Tipo da empresa (pf/pj/freelancer)")
    
    # Dados de login
    email = Column(String(255), nullable=False, unique=True, index=True, comment="Email para login")
    password_hash = Column(String(255), nullable=False, comment="Senha criptografada")
    
    # Dados pessoais
    name = Column(String(255), nullable=False, comment="Nome completo")
    
    # Permissões (JSON)
    permissions = Column(JSON, nullable=False, comment="Permissões em formato JSON")
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True, comment="Colaborador ativo?")
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_collaborator_company', 'company_id', 'company_type'),
        Index('idx_collaborator_email', 'email'),
    )

    def __repr__(self):
        return f"<CompanyCollaborator(id={self.id}, email={self.email}, company={self.company_id}/{self.company_type})>"
