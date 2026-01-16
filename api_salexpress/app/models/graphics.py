from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped
from app.core.db import Base

class IndicationRegister(Base):
    __tablename__ = 'clicks_graphics'

    id: Mapped[int] = Column(Integer, primary_key=True)
    id_busness: Mapped[str] = Column(String(200), nullable=False)
    created_at: Mapped[DateTime] = Column(DateTime, server_default=func.now())

    city: Mapped[str] = Column(String(100), nullable=True)
    state: Mapped[str] = Column(String(100), nullable=True)
    search_term: Mapped[str] = Column(String(255), nullable=True)
    ip: Mapped[str] = Column(String(45), nullable=True)
    typeUser: Mapped[str] = Column(String(250), nullable=True)

    
class IndicationRegisterContact(Base):
    __tablename__ = 'contacts_graphics'
    id: Mapped[int] = Column(Integer, primary_key=True)
    id_busness: Mapped[str] = Column(String(200), nullable=False)
    nome: Mapped[str] = Column(String(200), nullable=False)
    email: Mapped[str] = Column(String(200), nullable=False)    
    created_at: Mapped[DateTime] = Column(DateTime, server_default=func.now())  # 🔹 Adicionando data/hora automática