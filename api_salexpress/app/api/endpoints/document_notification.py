from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.conn import get_db
from app.schemas.document_notification import (
    DocumentFollowerCreate,
    DocumentFollowerUpdate,
    DocumentFollowerResponse,
    DocumentNotificationResponse,
    NotificationStatsResponse,
    DocumentFollowerByEmailRequest
)
from app.crud.document_notification import (
    seguir_documento,
    deixar_de_seguir_documento,
    atualizar_configuracoes_seguimento,
    listar_documentos_seguidos,
    listar_notificacoes_usuario,
    seguir_documento_por_email
)
from app.services.document_notification_service import verificar_e_notificar_vencimentos

router = APIRouter()

@router.post("/seguir", response_model=DocumentFollowerResponse)
def seguir_documento_endpoint(
    payload: DocumentFollowerCreate,
    db: Session = Depends(get_db)
):
    """
    Seguir um documento para receber notificações de vencimento
    
    Exemplo:
    ```json
    {
        "node_id": 17,
        "user_id": 22,
        "tipo_usuario": "freelancer",
        "dias_antes_alerta": 7,
        "alertar_no_vencimento": true
    }
    ```
    
    - **dias_antes_alerta**: Quantos dias antes do vencimento você quer ser alertado (0-90)
    - **alertar_no_vencimento**: Se deve receber alerta no dia do vencimento
    """
    return seguir_documento(db, payload)

@router.post("/{node_id}/seguir-por-email", response_model=DocumentFollowerResponse)
def seguir_documento_por_email_endpoint(
    node_id: int,
    payload: DocumentFollowerByEmailRequest,
    db: Session = Depends(get_db)
):
    """
    Fazer um usuário seguir um documento automaticamente usando apenas o email
    
    Busca automaticamente o usuário pelo email nas tabelas de PF e Freelancer.
    Se o usuário já estiver seguindo, retorna os dados existentes.
    
    Exemplo:
    ```json
    {
        "email": "usuario@exemplo.com",
        "dias_antes_alerta": 7,
        "alertar_no_vencimento": true
    }
    ```
    
    Parâmetros:
    - **node_id**: ID do documento a ser seguido
    - **email**: Email do usuário que vai seguir o documento
    - **dias_antes_alerta**: Quantos dias antes do vencimento alertar (0-90, padrão: 7)
    - **alertar_no_vencimento**: Se deve alertar no dia do vencimento (padrão: true)
    """
    return seguir_documento_por_email(
        db=db,
        node_id=node_id,
        email=payload.email,
        dias_antes_alerta=payload.dias_antes_alerta,
        alertar_no_vencimento=payload.alertar_no_vencimento
    )

@router.delete("/deixar-de-seguir/{node_id}")
def deixar_de_seguir_endpoint(
    node_id: int,
    user_id: int,
    tipo_usuario: str,
    db: Session = Depends(get_db)
):
    """
    Deixar de seguir um documento
    
    Parâmetros:
    - **node_id**: ID do documento
    - **user_id**: ID do usuário  
    - **tipo_usuario**: Tipo do usuário (pf, pj, freelancer)
    """
    return deixar_de_seguir_documento(db, node_id, user_id, tipo_usuario)

@router.put("/configurar/{node_id}", response_model=DocumentFollowerResponse)
def atualizar_configuracoes_endpoint(
    node_id: int,
    user_id: int,
    tipo_usuario: str,
    payload: DocumentFollowerUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualizar configurações de notificação de um documento seguido
    
    Exemplo:
    ```json
    {
        "dias_antes_alerta": 15,
        "alertar_no_vencimento": true
    }
    ```
    """
    return atualizar_configuracoes_seguimento(db, node_id, user_id, tipo_usuario, payload)

@router.get("/meus-documentos")
def listar_meus_documentos_seguidos(
    user_id: int,
    tipo_usuario: str,
    db: Session = Depends(get_db)
):
    """
    Listar todos os documentos que você está seguindo
    
    Retorna informações sobre:
    - Documento
    - Data de validade
    - Dias para vencimento
    - Status (VENCIDO, VENCE_HOJE, PROXIMO_VENCIMENTO, VIGENTE)
    - Configurações de alerta
    """
    return listar_documentos_seguidos(db, user_id, tipo_usuario)

@router.get("/notificacoes", response_model=List[DocumentNotificationResponse])
def listar_minhas_notificacoes(
    user_id: int,
    tipo_usuario: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Listar histórico de notificações recebidas
    
    Parâmetros:
    - **user_id**: ID do usuário
    - **tipo_usuario**: Tipo do usuário (pf, pj, freelancer)
    - **limit**: Quantidade máxima de notificações (padrão: 50)
    """
    return listar_notificacoes_usuario(db, user_id, tipo_usuario, limit)

@router.post("/verificar-vencimentos")
def verificar_vencimentos_endpoint(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Verifica todos os documentos e envia notificações de vencimento
    
    **Este endpoint deve ser chamado diariamente via cron job**
    
    Verifica:
    - Documentos vencidos
    - Documentos que vencem hoje
    - Documentos que vencem em X dias (conforme configuração de cada seguidor)
    
    Envia emails automaticamente para todos os seguidores configurados
    """
    # Executar em background para não travar a requisição
    background_tasks.add_task(verificar_e_notificar_vencimentos, db)
    
    return {
        "message": "Verificação de vencimentos iniciada em background",
        "status": "processing"
    }

@router.get("/estatisticas")
def obter_estatisticas_notificacoes(
    user_id: int,
    tipo_usuario: str,
    db: Session = Depends(get_db)
):
    """
    Obtém estatísticas de documentos seguidos e notificações
    
    Retorna:
    - Total de documentos seguidos
    - Documentos próximos do vencimento
    - Documentos vencidos
    - Notificações pendentes
    - Últimas notificações recebidas
    """
    from datetime import datetime, timedelta
    from app.models.document_notification import DocumentFollower, DocumentNotification
    from app.models.storage import StorageNode
    from sqlalchemy import and_
    
    # Total de documentos seguidos
    total_seguidos = db.query(DocumentFollower).filter(
        and_(
            DocumentFollower.user_id == user_id,
            DocumentFollower.tipo_usuario == tipo_usuario,
            DocumentFollower.ativo == True
        )
    ).count()
    
    # Buscar documentos seguidos com validade
    hoje = datetime.now().date()
    documentos_seguidos = db.query(DocumentFollower, StorageNode).join(
        StorageNode, DocumentFollower.node_id == StorageNode.id
    ).filter(
        and_(
            DocumentFollower.user_id == user_id,
            DocumentFollower.tipo_usuario == tipo_usuario,
            DocumentFollower.ativo == True,
            StorageNode.data_validade != None
        )
    ).all()
    
    proximos_vencimento = 0
    vencidos = 0
    
    for seguidor, doc in documentos_seguidos:
        dias = (doc.data_validade - hoje).days
        if dias < 0:
            vencidos += 1
        elif dias <= seguidor.dias_antes_alerta:
            proximos_vencimento += 1
    
    # Últimas notificações
    ultimas_notificacoes = listar_notificacoes_usuario(db, user_id, tipo_usuario, limit=10)
    
    # Notificações pendentes (não enviadas)
    pendentes = db.query(DocumentNotification).filter(
        and_(
            DocumentNotification.user_id == user_id,
            DocumentNotification.tipo_usuario == tipo_usuario,
            DocumentNotification.enviada == False
        )
    ).count()
    
    return {
        "total_documentos_seguidos": total_seguidos,
        "documentos_proximos_vencimento": proximos_vencimento,
        "documentos_vencidos": vencidos,
        "notificacoes_pendentes": pendentes,
        "ultimas_notificacoes": ultimas_notificacoes
    }
