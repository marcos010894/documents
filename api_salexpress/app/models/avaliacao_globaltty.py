from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.db import Base
from datetime import datetime

class AvaliacaoSalexpress(Base):
    """
    Avaliações sobre a experiência de usar a plataforma Salexpress
    """
    __tablename__ = "avaliacoes_Salexpress"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Relacionamento com a avaliação principal
    avaliacao_id: Mapped[int] = mapped_column(Integer, ForeignKey("avaliacoes.id"), nullable=False, index=True)
    
    # Dados do avaliador (copiados da avaliação principal)
    nome_avaliador: Mapped[str] = mapped_column(String(200), nullable=False)
    email_avaliador: Mapped[str] = mapped_column(String(200), nullable=True)
    
    # Avaliação da plataforma Salexpress
    nota_busca_fornecedor: Mapped[float] = mapped_column(Float, nullable=False, comment="Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?")
    comentario_experiencia: Mapped[str] = mapped_column(Text, nullable=True, comment="Comentário sobre a experiência na plataforma")
    
    # Metadados
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ip_avaliador: Mapped[str] = mapped_column(String(45), nullable=True)
    
    def __repr__(self):
        return f"<AvaliacaoSalexpress(id={self.id}, avaliacao_id={self.avaliacao_id}, nota={self.nota_busca_fornecedor})>"
