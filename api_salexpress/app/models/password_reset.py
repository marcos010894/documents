from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.db import Base
from datetime import datetime

class PasswordReset(Base):
    __tablename__ = "password_resets"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Token único para o link de reset
    token: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    
    # Email do usuário que solicitou o reset
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    
    # Tipo de usuário (pf, pj, freelancer)
    tipo_usuario: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # ID do usuário na tabela correspondente
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Status do token
    usado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expira_em: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Metadados
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    usado_em: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(50), nullable=True)
