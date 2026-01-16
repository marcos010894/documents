from sqlalchemy import Column, Integer, String, DateTime, func

from sqlalchemy.orm import Mapped

from app.core.db import Base



class EmailsValidade(Base):
    __tablename__ = 'email_validade'
    id: Mapped[int] = Column(Integer, primary_key=True)
    email: Mapped[str] = Column(String(100), nullable=False)
    codeVerify: Mapped[str] = Column(String(7), nullable=False)
    created_at: Mapped[DateTime] = Column(DateTime, server_default=func.now())  # 🔹 Adicionando data/hora automática
