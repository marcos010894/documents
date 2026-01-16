from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.core.db import Base
from datetime import datetime
import enum

class StatusAvaliacao(str, enum.Enum):
    """Enum para status de avaliação (usado apenas para validação no Pydantic)"""
    AGUARDANDO_APROVACAO = "AGUARDANDO_APROVACAO"
    APROVADO = "APROVADO"
    NEGADO = "NEGADO"

class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Dados do avaliador
    nome_avaliador: Mapped[str] = mapped_column(String(200), nullable=False)
    email_avaliador: Mapped[str] = mapped_column(String(200), nullable=True)
    numero_avaliador: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Dados de quem está sendo avaliado
    id_avaliado: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    tipo_avaliado: Mapped[str] = mapped_column(String(50), nullable=False)  # "pf", "pj", "freelancer"
    
    # Notas (0 a 5 estrelas)
    nota_atendimento: Mapped[float] = mapped_column(Float, nullable=False)
    nota_preco: Mapped[float] = mapped_column(Float, nullable=False)
    nota_qualidade: Mapped[float] = mapped_column(Float, nullable=False)
    media_total: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Informações do serviço
    servico_prestado: Mapped[str] = mapped_column(String(500), nullable=False)
    comentario: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Status de aprovação (armazenado como string)
    status: Mapped[str] = mapped_column(
        String(50),
        default=StatusAvaliacao.AGUARDANDO_APROVACAO.value,
        nullable=False
    )
    
    # Metadados
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ip_avaliador: Mapped[str] = mapped_column(String(50), nullable=True)


class AvaliacaoLink(Base):
    __tablename__ = "avaliacoes_links"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Token único para o link
    token: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    
    # Dados pré-preenchidos
    id_avaliado: Mapped[int] = mapped_column(Integer, nullable=False)
    tipo_avaliado: Mapped[str] = mapped_column(String(50), nullable=False)
    servico_prestado: Mapped[str] = mapped_column(String(500), nullable=False)
    
    # Status do link
    usado: Mapped[bool] = mapped_column(default=False, nullable=False)
    expira_em: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # ID da avaliação criada (quando usado)
    avaliacao_id: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Metadados
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    usado_em: Mapped[datetime] = mapped_column(DateTime, nullable=True)
