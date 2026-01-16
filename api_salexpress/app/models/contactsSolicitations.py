from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from sqlalchemy.orm import Mapped
from app.core.db import Base

class ContactSolicitation(Base):
    __tablename__ = 'contacts_solicitations'

    id: Mapped[int] = Column(Integer, primary_key=True)
    created_at: Mapped[DateTime] = Column(DateTime, server_default=func.now())

    nome: Mapped[str] = Column(String(255), nullable=False)
    email: Mapped[str] = Column(String(255), nullable=False)
    telefone: Mapped[str] = Column(String(255), nullable=False)
    termos_aceitos: Mapped[bool] = Column(Boolean, default=True)
    id_busness: Mapped[int] = Column(Integer, nullable=False)
    type_user: Mapped[str] = Column(String(255), nullable=False)
    status: Mapped[str] = Column(String(255), default="Pendente")  # Status padrão: Pendente
