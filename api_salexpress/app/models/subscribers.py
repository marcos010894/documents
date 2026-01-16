from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base
from datetime import datetime


class Subscription(Base):
    __tablename__ = 'subscriptions'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_user: Mapped[int] = mapped_column(Integer, nullable=False)
    type_user: Mapped[str] = mapped_column(String(50), nullable=False)  # 🆕
    plan: Mapped[str] = mapped_column(String(50), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    tipo_pagamento: Mapped[str] = mapped_column(String(20), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=False)
    id_stripe: Mapped[str] = mapped_column(String(100), unique=True, nullable=True)
    data_assinatura: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    update_data = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)