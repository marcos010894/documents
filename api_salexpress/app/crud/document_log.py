from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.document_log import DocumentLog, DocumentAction


def criar_log_documento(
    db: Session,
    node_id: int,
    action: str,
    user_id: int,
    user_type: str,
    user_name: Optional[str] = None,
    user_email: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> DocumentLog:
    """
    Cria um registro de log para uma ação em documento/pasta.
    
    Args:
        db: Sessão do banco
        node_id: ID do documento/pasta
        action: Tipo de ação (usar DocumentAction)
        user_id: ID do usuário
        user_type: Tipo do usuário (pf, freelancer, collaborator, etc)
        user_name: Nome do usuário (opcional, para cache)
        user_email: Email do usuário (opcional, para cache)
        details: Detalhes adicionais da ação em JSON
        ip_address: IP do usuário
        user_agent: User agent do navegador
    
    Returns:
        DocumentLog criado
    """
    log = DocumentLog(
        node_id=node_id,
        action=action,
        user_id=user_id,
        user_type=user_type,
        user_name=user_name,
        user_email=user_email,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(log)
    db.commit()
    db.refresh(log)
    
    return log


def obter_historico_documento(
    db: Session,
    node_id: int,
    limit: Optional[int] = 100,
    action_filter: Optional[str] = None
) -> List[DocumentLog]:
    """
    Obtém o histórico completo de ações de um documento/pasta.
    
    Args:
        db: Sessão do banco
        node_id: ID do documento/pasta
        limit: Limite de registros (padrão 100)
        action_filter: Filtrar por tipo de ação específica
    
    Returns:
        Lista de logs ordenados por data (mais recente primeiro)
    """
    query = db.query(DocumentLog).filter(DocumentLog.node_id == node_id)
    
    if action_filter:
        query = query.filter(DocumentLog.action == action_filter)
    
    return query.order_by(DocumentLog.created_at.desc()).limit(limit).all()


def obter_logs_usuario(
    db: Session,
    user_id: int,
    user_type: str,
    limit: Optional[int] = 50
) -> List[DocumentLog]:
    """
    Obtém todos os logs de ações de um usuário específico.
    
    Args:
        db: Sessão do banco
        user_id: ID do usuário
        user_type: Tipo do usuário
        limit: Limite de registros
    
    Returns:
        Lista de logs do usuário
    """
    return db.query(DocumentLog).filter(
        DocumentLog.user_id == user_id,
        DocumentLog.user_type == user_type
    ).order_by(DocumentLog.created_at.desc()).limit(limit).all()


def obter_ultimas_acoes(
    db: Session,
    node_id: int,
    actions: List[str]
) -> Dict[str, Optional[DocumentLog]]:
    """
    Obtém a última ocorrência de cada tipo de ação específica.
    
    Args:
        db: Sessão do banco
        node_id: ID do documento/pasta
        actions: Lista de ações para buscar (ex: ['created', 'moved', 'edited'])
    
    Returns:
        Dicionário com a última ocorrência de cada ação
        Ex: {'created': DocumentLog, 'moved': DocumentLog, 'edited': None}
    """
    resultado = {}
    
    for action in actions:
        log = db.query(DocumentLog).filter(
            DocumentLog.node_id == node_id,
            DocumentLog.action == action
        ).order_by(DocumentLog.created_at.desc()).first()
        
        resultado[action] = log
    
    return resultado


def obter_resumo_rastreabilidade(
    db: Session,
    node_id: int
) -> Dict[str, Any]:
    """
    Obtém um resumo completo da rastreabilidade de um documento.
    Inclui: quem criou, última edição, última movimentação, etc.
    
    Args:
        db: Sessão do banco
        node_id: ID do documento/pasta
    
    Returns:
        Dicionário com resumo completo
    """
    # Buscar últimas ações importantes
    acoes_importantes = [
        DocumentAction.CREATED,
        DocumentAction.EDITED,
        DocumentAction.MOVED,
        DocumentAction.RENAMED,
        DocumentAction.SHARED
    ]
    
    ultimas_acoes = obter_ultimas_acoes(db, node_id, acoes_importantes)
    
    # Contar total de cada tipo de ação
    contagem_acoes = {}
    for action in acoes_importantes:
        count = db.query(DocumentLog).filter(
            DocumentLog.node_id == node_id,
            DocumentLog.action == action
        ).count()
        contagem_acoes[action] = count
    
    # Montar resumo
    resumo = {
        "node_id": node_id,
        "criado_por": None,
        "criado_em": None,
        "ultima_edicao_por": None,
        "ultima_edicao_em": None,
        "ultima_movimentacao_por": None,
        "ultima_movimentacao_em": None,
        "ultima_renomeacao_por": None,
        "ultima_renomeacao_em": None,
        "ultimo_compartilhamento_por": None,
        "ultimo_compartilhamento_em": None,
        "total_edicoes": contagem_acoes.get(DocumentAction.EDITED, 0),
        "total_movimentacoes": contagem_acoes.get(DocumentAction.MOVED, 0),
        "total_compartilhamentos": contagem_acoes.get(DocumentAction.SHARED, 0),
    }
    
    # Preencher dados de criação
    if ultimas_acoes.get(DocumentAction.CREATED):
        log_created = ultimas_acoes[DocumentAction.CREATED]
        resumo["criado_por"] = {
            "id": log_created.user_id,
            "nome": log_created.user_name,
            "email": log_created.user_email,
            "tipo": log_created.user_type
        }
        resumo["criado_em"] = log_created.created_at.isoformat()
    
    # Preencher dados de última edição
    if ultimas_acoes.get(DocumentAction.EDITED):
        log_edited = ultimas_acoes[DocumentAction.EDITED]
        resumo["ultima_edicao_por"] = {
            "id": log_edited.user_id,
            "nome": log_edited.user_name,
            "email": log_edited.user_email,
            "tipo": log_edited.user_type
        }
        resumo["ultima_edicao_em"] = log_edited.created_at.isoformat()
    
    # Preencher dados de última movimentação
    if ultimas_acoes.get(DocumentAction.MOVED):
        log_moved = ultimas_acoes[DocumentAction.MOVED]
        resumo["ultima_movimentacao_por"] = {
            "id": log_moved.user_id,
            "nome": log_moved.user_name,
            "email": log_moved.user_email,
            "tipo": log_moved.user_type
        }
        resumo["ultima_movimentacao_em"] = log_moved.created_at.isoformat()
        resumo["movimentacao_detalhes"] = log_moved.details
    
    # Preencher dados de última renomeação
    if ultimas_acoes.get(DocumentAction.RENAMED):
        log_renamed = ultimas_acoes[DocumentAction.RENAMED]
        resumo["ultima_renomeacao_por"] = {
            "id": log_renamed.user_id,
            "nome": log_renamed.user_name,
            "email": log_renamed.user_email,
            "tipo": log_renamed.user_type
        }
        resumo["ultima_renomeacao_em"] = log_renamed.created_at.isoformat()
        resumo["renomeacao_detalhes"] = log_renamed.details
    
    # Preencher dados de último compartilhamento
    if ultimas_acoes.get(DocumentAction.SHARED):
        log_shared = ultimas_acoes[DocumentAction.SHARED]
        resumo["ultimo_compartilhamento_por"] = {
            "id": log_shared.user_id,
            "nome": log_shared.user_name,
            "email": log_shared.user_email,
            "tipo": log_shared.user_type
        }
        resumo["ultimo_compartilhamento_em"] = log_shared.created_at.isoformat()
    
    return resumo


def obter_historico_completo_formatado(
    db: Session,
    node_id: int,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Obtém o histórico completo formatado para exibição no frontend.
    
    Args:
        db: Sessão do banco
        node_id: ID do documento/pasta
        limit: Limite de registros
    
    Returns:
        Lista de logs formatados
    """
    logs = obter_historico_documento(db, node_id, limit)
    
    # Mapear ações para mensagens legíveis em português
    acoes_pt = {
        DocumentAction.CREATED: "Criou o documento",
        DocumentAction.MOVED: "Moveu o documento",
        DocumentAction.EDITED: "Editou o documento",
        DocumentAction.RENAMED: "Renomeou o documento",
        DocumentAction.DELETED: "Moveu para lixeira",
        DocumentAction.RESTORED: "Restaurou da lixeira",
        DocumentAction.PERMANENTLY_DELETED: "Deletou permanentemente",
        DocumentAction.SHARED: "Compartilhou o documento",
        DocumentAction.UNSHARED: "Removeu compartilhamento",
        DocumentAction.DOWNLOADED: "Baixou o documento",
        DocumentAction.UPLOADED: "Enviou novo arquivo",
        DocumentAction.PERMISSION_CHANGED: "Alterou permissões",
        DocumentAction.FOLLOWED: "Começou a seguir",
        DocumentAction.UNFOLLOWED: "Parou de seguir"
    }
    
    historico_formatado = []
    
    for log in logs:
        item = {
            "id": log.id,
            "acao": log.action,
            "acao_descricao": acoes_pt.get(log.action, log.action),
            "usuario": {
                "id": log.user_id,
                "nome": log.user_name,
                "email": log.user_email,
                "tipo": log.user_type
            },
            "detalhes": log.details,
            "data_hora": log.created_at.isoformat(),
            "ip": log.ip_address
        }
        historico_formatado.append(item)
    
    return historico_formatado
