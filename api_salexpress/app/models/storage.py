from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Date, ForeignKey, Enum, Text, Index
from sqlalchemy.sql import func
from app.core.db import Base
import enum

class NodeType(str, enum.Enum):
    file = "file"
    folder = "folder"

class StorageNode(Base):
    __tablename__ = "storage_nodes"
    
    # Índices compostos para queries otimizadas
    __table_args__ = (
        Index('idx_storage_nodes_owner_active', 'business_id', 'type_user', 'deleted_at'),
        Index('idx_storage_nodes_parent_deleted', 'parent_id', 'deleted_at'),
    )
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[NodeType] = mapped_column(Enum(NodeType), nullable=False, index=True)
    parent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("storage_nodes.id"), nullable=True, index=True)
    business_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True, comment="ID do usuário dono (quem fez upload)")
    type_user: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True, comment="Tipo do usuário dono (pf/pj/freelancer)")
    company_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True, comment="ID da empresa responsável (para filtrar arquivos)")
    company_type: Mapped[str | None] = mapped_column(String(50), nullable=True, comment="Tipo da empresa (pf/pj/freelancer)")
    size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    extension: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_validade: Mapped[Date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Campos para soft delete (lixeira)
    deleted_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    deleted_by_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    deleted_by_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
