from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, String, DateTime, Index, Boolean
from sqlalchemy.sql import func
from app.core.db import Base

class Share(Base):
    __tablename__ = "shares"
    
    # Índices compostos para queries otimizadas
    __table_args__ = (
        Index('idx_shares_shared_with_type', 'shared_with_user_id', 'type_user_receiver'),
        Index('idx_shares_unique_check', 'node_id', 'shared_with_user_id', 'shared_by_user_id'),
    )
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    node_id: Mapped[int] = mapped_column(Integer, ForeignKey("storage_nodes.id"), nullable=False, index=True)
    shared_with_user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    shared_by_user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    type_user_sender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    type_user_receiver: Mapped[str | None] = mapped_column(String(50), nullable=True)
    allow_editing: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Relacionamento opcional
    node = relationship("StorageNode", backref="shares")
