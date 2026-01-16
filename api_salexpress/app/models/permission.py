from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.core.db import Base
from datetime import datetime

class Permission(Base):
    __tablename__ = "permissions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Ligação com usuário
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    type_user: Mapped[str] = mapped_column(String(50), nullable=False)  # "pf", "freelancer", "pj"
    
    # Ligação com empresa
    business_id: Mapped[int] = mapped_column(Integer, nullable=False)
    business_type: Mapped[str] = mapped_column(String(50), nullable=False)  # "pf", "pj", etc.
    
    # Permissões disponíveis
    permission_level: Mapped[str] = mapped_column(String(20), nullable=False)  # "GED-MASTER", "GED-ALL", "GED-EDIT", "GED-VIEW"
    
    # Status da permissão
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Metadados
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    created_by: Mapped[int] = mapped_column(Integer, nullable=True)  # ID de quem criou a permissão

class PermissionLevel:
    """Constantes para os níveis de permissão"""
    GED_MASTER = "GED-MASTER"  # Dono da empresa, pode tudo
    GED_ALL = "GED-ALL"        # Pode tudo menos remover usuários
    GED_EDIT = "GED-EDIT"      # Ver e editar arquivos
    GED_VIEW = "GED-VIEW"      # Apenas ver arquivos
    
    @classmethod
    def get_all_levels(cls):
        return [cls.GED_MASTER, cls.GED_ALL, cls.GED_EDIT, cls.GED_VIEW]
    
    @classmethod
    def get_permissions_description(cls):
        return {
            cls.GED_MASTER: "Dono da empresa - Pode fazer tudo",
            cls.GED_ALL: "Administrador - Pode tudo exceto remover usuários",
            cls.GED_EDIT: "Editor - Pode ver e editar arquivos",
            cls.GED_VIEW: "Visualizador - Apenas visualizar arquivos"
        }
