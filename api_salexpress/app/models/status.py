from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String
from app.core.db import Base

class Status(Base):
    __tablename__ = "statuses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_business: Mapped[int] = mapped_column(Integer, nullable=False)
    type_user: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False)
