from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from app.models.avaliacao import StatusAvaliacao

class AvaliacaoSalexpressCreate(BaseModel):
    """Schema para criar avaliação da plataforma Salexpress"""
    nota_busca_fornecedor: float = Field(..., ge=0, le=5, description="Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress? (0-5 estrelas)")
    comentario_experiencia: Optional[str] = Field(None, max_length=1000, description="Comentário sobre a experiência na plataforma")
    
    @validator('nota_busca_fornecedor')
    def validar_nota(cls, v):
        if v < 0 or v > 5:
            raise ValueError('A nota deve estar entre 0 e 5 estrelas')
        # Permite apenas incrementos de 0.5 (meia estrela)
        if v % 0.5 != 0:
            raise ValueError('A nota deve ser em incrementos de 0.5 (meia estrela)')
        return v

class AvaliacaoSalexpressResponse(BaseModel):
    """Schema de resposta para avaliação da Salexpress"""
    id: int
    avaliacao_id: int
    nome_avaliador: str
    email_avaliador: Optional[str]
    nota_busca_fornecedor: float
    comentario_experiencia: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AvaliacaoCreate(BaseModel):
    """Schema para criar uma avaliação"""
    nome_avaliador: str = Field(..., min_length=3, max_length=200, description="Nome completo do avaliador")
    email_avaliador: Optional[str] = Field(None, max_length=200, description="Email do avaliador (opcional)")
    numero_avaliador: str = Field(..., min_length=10, max_length=20, description="Telefone do avaliador")
    nota_atendimento: float = Field(..., ge=0, le=5, description="Nota para o atendimento (0-5 estrelas)")
    nota_preco: float = Field(..., ge=0, le=5, description="Nota para o preço (0-5 estrelas)")
    nota_qualidade: float = Field(..., ge=0, le=5, description="Nota para a qualidade (0-5 estrelas)")
    comentario: Optional[str] = Field(None, max_length=1000, description="Comentário opcional")
    
    # Avaliação da Salexpress (opcional)
    avaliacao_Salexpress: Optional[AvaliacaoSalexpressCreate] = Field(None, description="Avaliação da plataforma Salexpress (opcional)")
    
    # Campos preenchidos automaticamente pelo link
    id_avaliado: Optional[int] = None
    tipo_avaliado: Optional[str] = None
    servico_prestado: Optional[str] = None
    
    @validator('nota_atendimento', 'nota_preco', 'nota_qualidade')
    def validar_nota(cls, v):
        if v is None:
            return v
        if v < 0 or v > 5:
            raise ValueError('A nota deve estar entre 0 e 5 estrelas')
        # Permite apenas incrementos de 0.5 (meia estrela)
        if v % 0.5 != 0:
            raise ValueError('A nota deve ser em incrementos de 0.5 (meia estrela)')
        return v

class AvaliacaoResponse(BaseModel):
    id: int
    nome_avaliador: str
    email_avaliador: Optional[str]
    numero_avaliador: str
    id_avaliado: int
    tipo_avaliado: str
    nota_atendimento: float
    nota_preco: float
    nota_qualidade: float
    media_total: float
    servico_prestado: str
    comentario: Optional[str]
    status: str
    created_at: datetime
    
    # Avaliação Salexpress (se existir)
    avaliacao_Salexpress: Optional[AvaliacaoSalexpressResponse] = None
    
    class Config:
        from_attributes = True

class AvaliacaoLinkCreate(BaseModel):
    """Schema para criar um link de avaliação"""
    id_avaliado: int = Field(..., description="ID de quem será avaliado")
    tipo_avaliado: str = Field(..., description="Tipo: pf, pj ou freelancer")
    servico_prestado: str = Field(..., min_length=3, max_length=500, description="Serviço que foi prestado")
    dias_validade: int = Field(default=30, ge=1, le=90, description="Dias de validade do link (1-90)")

class AvaliacaoLinkResponse(BaseModel):
    id: int
    token: str
    link_completo: str
    id_avaliado: int
    tipo_avaliado: str
    servico_prestado: str
    usado: bool
    expira_em: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class AvaliacaoStats(BaseModel):
    """Estatísticas de avaliações"""
    total_avaliacoes: int
    media_atendimento: float
    media_preco: float
    media_qualidade: float
    media_geral: float
    avaliacoes_recentes: list[AvaliacaoResponse]

class AvaliacaoStatusUpdate(BaseModel):
    """Schema para atualizar o status de uma avaliação"""
    status: StatusAvaliacao = Field(..., description="Novo status da avaliação")
