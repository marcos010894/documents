from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Request
from app.crud.document_log import criar_log_documento
from app.models.document_log import DocumentAction


def registrar_log_automatico(
    db: Session,
    node_id: int,
    action: str,
    user_id: int,
    user_type: str,
    user_name: Optional[str] = None,
    user_email: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None
):
    """
    Função auxiliar para registrar logs automaticamente com extração de IP e User-Agent.
    
    Args:
        db: Sessão do banco
        node_id: ID do documento/pasta
        action: Tipo de ação
        user_id: ID do usuário
        user_type: Tipo do usuário
        user_name: Nome do usuário
        user_email: Email do usuário
        details: Detalhes adicionais
        request: Request do FastAPI (para extrair IP e User-Agent)
    """
    ip_address = None
    user_agent = None
    
    if request:
        # Extrair IP (considerar proxy)
        ip_address = request.client.host if request.client else None
        if "x-forwarded-for" in request.headers:
            ip_address = request.headers["x-forwarded-for"].split(",")[0].strip()
        elif "x-real-ip" in request.headers:
            ip_address = request.headers["x-real-ip"]
        
        # Extrair User-Agent
        user_agent = request.headers.get("user-agent")
    
    return criar_log_documento(
        db=db,
        node_id=node_id,
        action=action,
        user_id=user_id,
        user_type=user_type,
        user_name=user_name,
        user_email=user_email,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
