from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubscriptionBase(BaseModel):
    id_user: int
    type_user: str  # 🆕
    plan: str
    price: float
    tipo_pagamento: str
    ativo: bool
    id_stripe: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    plan: Optional[str]
    price: Optional[float]
    tipo_pagamento: Optional[str]
    ativo: Optional[bool]
    id_stripe: Optional[str]
    type_user: Optional[str]  # 🆕

class SubscriptionResponse(SubscriptionBase):
    id: int
    data_assinatura: datetime
    update_data: Optional[datetime]

    class Config:
        from_attributes = True
# Modelo completo de resposta da rota
class RegisterSubscriptionResponse(BaseModel):
    response: SubscriptionResponse
    pauamentLink: str

# Informações simplificadas do assinante para listagens
class SubscriberInfo(BaseModel):
    nome: str | None
    proximo_pagamento: datetime
    ativo: bool
    id_stripe: str | None
    status: str | None

# Novo schema incluindo nome do usuario nas informacoes da assinatura
class SubscriptionWithUser(BaseModel):
    id: int
    id_user: int
    type_user: str
    plan: str
    price: float
    tipo_pagamento: str
    ativo: bool
    id_stripe: Optional[str] = None
    data_assinatura: str
    update_data: Optional[str]
    nome: str | None

    class Config:
        from_attributes = True

# Representa o status de uma assinatura no Stripe
class StripeStatus(BaseModel):
    id_stripe: str | None
    status: str | None
    proximo_pagamento: datetime
    valor: str
