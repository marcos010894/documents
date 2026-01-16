from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime

class DocumentFollowerCreate(BaseModel):
    """Schema para seguir um documento"""
    node_id: int = Field(..., description="ID do documento a ser seguido")
    user_id: int = Field(..., description="ID do usuário")
    tipo_usuario: Literal['pf', 'pj', 'freelancer', 'collaborator'] = Field(..., description="Tipo do usuário (pf, pj, freelancer ou collaborator)")
    dias_antes_alerta: int = Field(default=7, ge=0, le=90, description="Dias antes do vencimento para alertar (0-90)")
    alertar_no_vencimento: bool = Field(default=True, description="Alertar no dia do vencimento")

class DocumentFollowerByEmailRequest(BaseModel):
    """Schema para seguir um documento usando apenas o email"""
    email: EmailStr = Field(..., description="Email do usuário que vai seguir o documento")
    dias_antes_alerta: int = Field(default=7, ge=0, le=90, description="Dias antes do vencimento para alertar (0-90)")
    alertar_no_vencimento: bool = Field(default=True, description="Alertar no dia do vencimento")

class DocumentFollowerUpdate(BaseModel):
    """Schema para atualizar configurações de seguimento"""
    dias_antes_alerta: Optional[int] = Field(None, ge=0, le=90, description="Dias antes do vencimento para alertar")
    alertar_no_vencimento: Optional[bool] = Field(None, description="Alertar no dia do vencimento")
    ativo: Optional[bool] = Field(None, description="Ativar/desativar seguimento")

class DocumentFollowerResponse(BaseModel):
    """Schema de resposta de seguidor"""
    id: int
    node_id: int
    user_id: int
    tipo_usuario: str
    dias_antes_alerta: int
    alertar_no_vencimento: bool
    ativo: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DocumentNotificationResponse(BaseModel):
    """Schema de resposta de notificação"""
    id: int
    node_id: int
    user_id: int
    tipo_usuario: str
    email_destinatario: str
    tipo_notificacao: str
    dias_para_vencimento: Optional[int]
    documento_nome: str
    documento_data_validade: datetime
    enviada: bool
    erro_envio: Optional[str]
    created_at: datetime
    enviada_em: Optional[datetime]
    
    class Config:
        from_attributes = True

class NotificationStatsResponse(BaseModel):
    """Estatísticas de notificações"""
    total_documentos_seguidos: int
    documentos_proximos_vencimento: int
    documentos_vencidos: int
    notificacoes_pendentes: int
    ultimas_notificacoes: list[DocumentNotificationResponse]
