from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped
from app.core.db import Base


class IndicationRegister(Base):
    __tablename__ = 'indication_busness'

    id: Mapped[int] = Column(Integer, primary_key=True)
    nome_indicador: Mapped[str] = Column(String(200), nullable=False)
    email_indicado: Mapped[str] = Column(String(100), unique=True, nullable=False)
    telefone_indicado: Mapped[str] = Column(String(20))
    empresa_freelancer_indicada: Mapped[str] = Column(String(255))
    status: Mapped[str] = Column(String(10))  # ex: "feito", "aguardando"
    created_at: Mapped[DateTime] = Column(DateTime, server_default=func.now())  # 🔹 Adicionando data/hora automática