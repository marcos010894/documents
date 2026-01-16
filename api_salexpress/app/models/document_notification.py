from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.db import Base
from datetime import datetime

class DocumentFollower(Base):
    """Tabela de seguidores de documentos"""
    __tablename__ = "document_followers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Documento sendo seguido
    node_id: Mapped[int] = mapped_column(Integer, ForeignKey("storage_nodes.id"), nullable=False, index=True)
    
    # Usuário que está seguindo
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    tipo_usuario: Mapped[str] = mapped_column(String(20), nullable=False)  # 'pf', 'pj', 'freelancer'
    
    # Configurações de notificação
    dias_antes_alerta: Mapped[int] = mapped_column(Integer, nullable=False, default=7)  # Quantos dias antes alertar
    alertar_no_vencimento: Mapped[bool] = mapped_column(Boolean, default=True)  # Alertar no dia do vencimento
    
    # Status
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Metadados
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class DocumentNotification(Base):
    """Tabela de histórico de notificações enviadas"""
    __tablename__ = "document_notifications"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Documento relacionado
    node_id: Mapped[int] = mapped_column(Integer, ForeignKey("storage_nodes.id"), nullable=False, index=True)
    
    # Destinatário
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    tipo_usuario: Mapped[str] = mapped_column(String(20), nullable=False)
    email_destinatario: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Tipo de notificação
    tipo_notificacao: Mapped[str] = mapped_column(String(50), nullable=False)  # 'DIAS_ANTES', 'NO_VENCIMENTO', 'VENCIDO'
    dias_para_vencimento: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Dados do documento no momento da notificação
    documento_nome: Mapped[str] = mapped_column(String(255), nullable=False)
    documento_data_validade: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Status do envio
    enviada: Mapped[bool] = mapped_column(Boolean, default=False)
    erro_envio: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Metadados
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    enviada_em: Mapped[datetime] = mapped_column(DateTime, nullable=True)
