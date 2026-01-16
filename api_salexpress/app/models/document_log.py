from sqlalchemy import Column, Integer, String, DateTime, JSON, Index
from sqlalchemy.sql import func
from app.core.db import Base


class DocumentLog(Base):
    """
    Modelo para rastreabilidade de ações em documentos/pastas.
    
    Registra todas as ações: criação, movimentação, edição, renomeação,
    deleção, compartilhamento, etc.
    """
    __tablename__ = "document_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(Integer, nullable=False, index=True, comment="ID do documento/pasta")
    action = Column(String(50), nullable=False, index=True, comment="Ação realizada")
    
    # Informações do usuário
    user_id = Column(Integer, nullable=False, index=True, comment="ID do usuário")
    user_type = Column(String(20), nullable=False, comment="Tipo: pf, pj, freelancer, collaborator")
    user_name = Column(String(255), nullable=True, comment="Nome do usuário (cache)")
    user_email = Column(String(255), nullable=True, comment="Email do usuário (cache)")
    
    # Detalhes da ação
    details = Column(JSON, nullable=True, comment="Detalhes da ação em JSON")
    
    # Informações técnicas
    ip_address = Column(String(45), nullable=True, comment="IP do usuário")
    user_agent = Column(String(500), nullable=True, comment="User agent")
    
    created_at = Column(DateTime, nullable=False, server_default=func.now(), index=True)

    # Índices compostos para queries mais rápidas
    __table_args__ = (
        Index('idx_node_action', 'node_id', 'action'),
        Index('idx_node_created', 'node_id', 'created_at'),
        {'mysql_charset': 'utf8mb4', 'mysql_collate': 'utf8mb4_unicode_ci'}
    )

    def __repr__(self):
        return f"<DocumentLog(id={self.id}, node_id={self.node_id}, action='{self.action}', user='{self.user_name}')>"


# Tipos de ações disponíveis
class DocumentAction:
    """Constantes para tipos de ações"""
    CREATED = "created"           # Documento/pasta criado
    MOVED = "moved"               # Documento/pasta movido
    EDITED = "edited"             # Conteúdo editado
    RENAMED = "renamed"           # Nome alterado
    DELETED = "deleted"           # Movido para lixeira
    RESTORED = "restored"         # Restaurado da lixeira
    PERMANENTLY_DELETED = "permanently_deleted"  # Deletado permanentemente
    SHARED = "shared"             # Compartilhado com alguém
    UNSHARED = "unshared"         # Compartilhamento removido
    DOWNLOADED = "downloaded"     # Arquivo baixado
    UPLOADED = "uploaded"         # Novo arquivo enviado
    PERMISSION_CHANGED = "permission_changed"  # Permissões alteradas
    FOLLOWED = "followed"         # Usuário começou a seguir
    UNFOLLOWED = "unfollowed"     # Usuário parou de seguir
    VERSION_UPLOADED = "version_uploaded" # Nova versão do arquivo enviada
