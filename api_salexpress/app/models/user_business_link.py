from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Boolean, JSON
from sqlalchemy.sql import func
from app.core.db import Base
from datetime import datetime

class UserBusinessLink(Base):
    __tablename__ = "user_business_links"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    type_user: Mapped[str] = mapped_column(String(50), nullable=False)
    business_id: Mapped[int] = mapped_column(Integer, nullable=False)
    business_type: Mapped[str] = mapped_column(String(50), nullable=False)
    permissions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # 1 = ativo, 0 = inativo
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
