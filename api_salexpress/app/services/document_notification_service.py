from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.document_notification import DocumentFollower, DocumentNotification
from app.models.storage import StorageNode
from app.crud.document_notification import obter_email_usuario
from app.services.email_service import set_email
from datetime import datetime, timedelta, date
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

def verificar_e_notificar_vencimentos(db: Session) -> Dict[str, int]:
    """
    Verifica documentos próximos do vencimento e envia notificações
    Deve ser executado diariamente via cron job
    
    Retorna estatísticas do processamento
    """
    hoje = date.today()
    notificacoes_enviadas = 0
    notificacoes_falhadas = 0
    
    # Buscar todos os seguidores ativos
    seguidores = db.query(DocumentFollower, StorageNode).join(
        StorageNode, DocumentFollower.node_id == StorageNode.id
    ).filter(
        and_(
            DocumentFollower.ativo == True,
            StorageNode.data_validade != None
        )
    ).all()
    
    for seguidor, documento in seguidores:
        try:
            # Calcular dias para vencimento
            dias_para_vencimento = (documento.data_validade - hoje).days
            
            # Verificar se deve notificar
            deve_notificar = False
            tipo_notificacao = None
            
            if dias_para_vencimento < 0:
                # Documento vencido - notificar apenas uma vez
                tipo_notificacao = "VENCIDO"
                deve_notificar = not _ja_foi_notificado(db, seguidor, documento, tipo_notificacao)
                
            elif dias_para_vencimento == 0 and seguidor.alertar_no_vencimento:
                # Vence hoje
                tipo_notificacao = "NO_VENCIMENTO"
                deve_notificar = not _ja_foi_notificado(db, seguidor, documento, tipo_notificacao)
                
            elif dias_para_vencimento == seguidor.dias_antes_alerta:
                # X dias antes do vencimento
                tipo_notificacao = "DIAS_ANTES"
                deve_notificar = not _ja_foi_notificado(db, seguidor, documento, tipo_notificacao)
            
            if deve_notificar:
                # Enviar notificação
                sucesso = _enviar_notificacao_vencimento(
                    db=db,
                    seguidor=seguidor,
                    documento=documento,
                    tipo_notificacao=tipo_notificacao,
                    dias_para_vencimento=dias_para_vencimento
                )
                
                if sucesso:
                    notificacoes_enviadas += 1
                else:
                    notificacoes_falhadas += 1
                    
        except Exception as e:
            logger.error(f"Erro ao processar seguidor {seguidor.id}: {str(e)}")
            notificacoes_falhadas += 1
    
    return {
        "documentos_verificados": len(seguidores),
        "notificacoes_enviadas": notificacoes_enviadas,
        "notificacoes_falhadas": notificacoes_falhadas
    }

def _ja_foi_notificado(db: Session, seguidor: DocumentFollower, documento: StorageNode, tipo_notificacao: str) -> bool:
    """
    Verifica se já foi enviada uma notificação deste tipo para este documento/seguidor
    """
    # Para vencimentos, verificar apenas nas últimas 24h para não spam
    ontem = datetime.now() - timedelta(days=1)
    
    notificacao_existente = db.query(DocumentNotification).filter(
        and_(
            DocumentNotification.node_id == documento.id,
            DocumentNotification.user_id == seguidor.user_id,
            DocumentNotification.tipo_usuario == seguidor.tipo_usuario,
            DocumentNotification.tipo_notificacao == tipo_notificacao,
            DocumentNotification.created_at >= ontem,
            DocumentNotification.enviada == True
        )
    ).first()
    
    return notificacao_existente is not None

def _enviar_notificacao_vencimento(
    db: Session,
    seguidor: DocumentFollower,
    documento: StorageNode,
    tipo_notificacao: str,
    dias_para_vencimento: int
) -> bool:
    """
    Envia email de notificação de vencimento
    """
    # Obter email do usuário
    email = obter_email_usuario(db, seguidor.user_id, seguidor.tipo_usuario)
    
    if not email:
        logger.error(f"Email não encontrado para user_id={seguidor.user_id}, tipo={seguidor.tipo_usuario}")
        return False
    
    # Criar registro de notificação
    notificacao = DocumentNotification(
        node_id=documento.id,
        user_id=seguidor.user_id,
        tipo_usuario=seguidor.tipo_usuario,
        email_destinatario=email,
        tipo_notificacao=tipo_notificacao,
        dias_para_vencimento=dias_para_vencimento,
        documento_nome=documento.name,
        documento_data_validade=datetime.combine(documento.data_validade, datetime.min.time()),
        enviada=False
    )
    
    db.add(notificacao)
    db.commit()
    db.refresh(notificacao)
    
    # Gerar HTML do email
    html_email = _gerar_email_vencimento_html(
        documento_nome=documento.name,
        documento_url=documento.url,
        data_validade=documento.data_validade,
        tipo_notificacao=tipo_notificacao,
        dias_para_vencimento=dias_para_vencimento
    )
    
    # Definir assunto
    if tipo_notificacao == "VENCIDO":
        assunto = f"⚠️ Documento VENCIDO: {documento.name}"
    elif tipo_notificacao == "NO_VENCIMENTO":
        assunto = f"🔔 Documento vence HOJE: {documento.name}"
    else:
        assunto = f"📅 Documento vence em {dias_para_vencimento} dias: {documento.name}"
    
    # Enviar email
    try:
        sucesso = set_email(
            destinatarios=email,
            assunto=assunto,
            mensagem=html_email
        )
        
        if sucesso:
            notificacao.enviada = True
            notificacao.enviada_em = datetime.now()
        else:
            notificacao.erro_envio = "Erro ao enviar email"
        
        db.commit()
        return sucesso
        
    except Exception as e:
        notificacao.erro_envio = str(e)
        db.commit()
        logger.error(f"Erro ao enviar email: {str(e)}")
        return False

def _gerar_email_vencimento_html(
    documento_nome: str,
    documento_url: str,
    data_validade: date,
    tipo_notificacao: str,
    dias_para_vencimento: int
) -> str:
    """
    Gera o HTML do email de notificação de vencimento
    """
    # Definir mensagem e cor baseado no tipo
    if tipo_notificacao == "VENCIDO":
        mensagem_principal = "Este documento está <strong>VENCIDO</strong>!"
        cor_destaque = "#f44336"
        icone = "❌"
    elif tipo_notificacao == "NO_VENCIMENTO":
        mensagem_principal = "Este documento <strong>vence HOJE</strong>!"
        cor_destaque = "#ff9800"
        icone = "⚠️"
    else:
        mensagem_principal = f"Este documento vence em <strong>{dias_para_vencimento} dias</strong>!"
        cor_destaque = "#e98344"
        icone = "📅"
    
    data_formatada = data_validade.strftime("%d/%m/%Y")
    
    return f'''
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação de Vencimento - Salexpress</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
            }}
            .logo {{
                text-align: center;
                margin-bottom: 20px;
            }}
            .logo img {{
                max-width: 150px;
            }}
            .alert-box {{
                background: {cor_destaque};
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
            }}
            .alert-box h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .document-info {{
                background: #f8f8f8;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid {cor_destaque};
            }}
            .document-info p {{
                margin: 10px 0;
                color: #333;
            }}
            .document-info strong {{
                color: {cor_destaque};
            }}
            .button {{
                display: inline-block;
                padding: 12px 30px;
                background: {cor_destaque};
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .button:hover {{
                opacity: 0.9;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #888;
                font-size: 13px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="https://Salexpress.com/aplicativorelatorios/assets/images/logo2%204.png" alt="Salexpress">
            </div>
            
            <div class="alert-box">
                <h1>{icone} Alerta de Vencimento</h1>
            </div>
            
            <p>Olá,</p>
            
            <p>{mensagem_principal}</p>
            
            <div class="document-info">
                <p><strong>Documento:</strong> {documento_nome}</p>
                <p><strong>Data de Validade:</strong> {data_formatada}</p>
                <p><strong>Dias para vencimento:</strong> {dias_para_vencimento if dias_para_vencimento >= 0 else 'VENCIDO'}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{documento_url if documento_url else '#'}" class="button">
                    Ver Documento
                </a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
                <strong>Importante:</strong> Tome as providências necessárias para renovar ou atualizar este documento.
            </p>
            
            <div class="footer">
                <p>Salexpress - Sistema de Gestão Documental</p>
                <p style="font-size: 11px;">
                    Você está recebendo este email porque está seguindo este documento.<br>
                    Para deixar de receber notificações, acesse o sistema e deixe de seguir o documento.
                </p>
            </div>
        </div>
    </body>
    </html>
    '''

def notificar_proprietario_documento(db: Session, node_id: int) -> bool:
    """
    Notifica o proprietário de um documento sobre vencimento
    Mesmo que ele não esteja "seguindo" explicitamente
    """
    documento = db.query(StorageNode).filter(StorageNode.id == node_id).first()
    
    if not documento or not documento.data_validade:
        return False
    
    dias_para_vencimento = (documento.data_validade - date.today()).days
    
    # Determinar tipo de notificação
    if dias_para_vencimento < 0:
        tipo_notificacao = "VENCIDO"
    elif dias_para_vencimento == 0:
        tipo_notificacao = "NO_VENCIMENTO"
    else:
        return False  # Só notifica proprietário quando vence ou está vencido
    
    # Buscar email do proprietário (business)
    # Aqui você pode adicionar lógica para notificar o dono da empresa/documento
    # Por enquanto, vamos apenas registrar
    
    logger.info(f"Documento {documento.name} (ID: {node_id}) - Status: {tipo_notificacao}")
    
    return True
