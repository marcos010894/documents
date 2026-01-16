from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from sqlalchemy.orm import Mapped
from app.core.db import Base

class BusinessData(Base):
    __tablename__ = 'business_data'

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    type_user: Mapped[str] = Column(String(255), nullable=False)
    id_busness: Mapped[int] = Column(Integer, nullable=False)
    dados_site: Mapped[dict] = Column(JSON, nullable=False)
    updated_at: Mapped[DateTime] = Column(DateTime, server_default=func.now(), onupdate=func.now())
