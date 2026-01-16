from sqlalchemy import Column, ForeignKey, DateTime, Integer, JSON, func, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

class PhotoProfile(Base):
    __tablename__ = 'profile_photo'
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    id_user: Mapped[int] = Column(Integer)
    type_user: Mapped[list[str]] = Column(String(255))
    urlPhoto: Mapped[list[str]] = Column(String(500))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PhotoPlan(Base):
    __tablename__ = 'plan_photo'
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    id_user: Mapped[int] = Column(Integer)
    type_user: Mapped[list[str]] = Column(String(255))
    typePlan: Mapped[list[str]] = Column(String(255))
    urlPhoto: Mapped[list[str]] = Column(String(500))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())