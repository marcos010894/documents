from sqlalchemy.orm import Session
from app.models.contactsSolicitations import ContactSolicitation
from app.models.user import UserPF, UserPJ, UserFreelancer
from math import ceil

from app.schemas.contactsSolicitations import (
    ContactSolicitationCreate,
    ContactSolicitationUpdate,
)
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from app.services.email_service import set_email
import logging

logger = logging.getLogger(__name__)

def obter_email_por_id_e_tipo(db: Session, id_busness: int, type_user: str) -> str:
    """
    Obtém o email do usuário pelo ID e tipo (pf, pj, freelancer)
    """
    try:
        if type_user.lower() == "pf":
            user = db.query(UserPF).filter(UserPF.id == id_busness).first()
            return user.email if user else None
        elif type_user.lower() == "pj":
            user = db.query(UserPJ).filter(UserPJ.id == id_busness).first()
            # UserPJ tem o email no UserPF relacionado
            if user and user.id_user_pf:
                user_pf = db.query(UserPF).filter(UserPF.id == user.id_user_pf).first()
                return user_pf.email if user_pf else None
            return None
        elif type_user.lower() == "freelancer":
            user = db.query(UserFreelancer).filter(UserFreelancer.id == id_busness).first()
            return user.email if user else None
        else:
            logger.warning(f"Tipo de usuário desconhecido: {type_user}")
            return None
    except Exception as e:
        logger.error(f"Erro ao obter email: {e}")
        return None

def enviar_email_notificacao_contato(destinatario_email: str, nome_solicitante: str, 
                                     email_solicitante: str, telefone_solicitante: str,
                                     tipo_usuario_solicitante: str):
    """
    Envia email de notificação para o dono do negócio quando alguém solicita contato
    """
    html = f'''
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Solicitação de Contato - Salexpress</title>
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
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }}
            .logo {{
                max-width: 150px;
                margin-bottom: 20px;
                display: block;
                margin-left: auto;
                margin-right: auto;
            }}
            h1 {{
                color: #ff7300;
                text-align: center;
            }}
            .info-box {{
                background-color: #f9f9f9;
                border-left: 4px solid #ff7300;
                padding: 15px;
                margin: 20px 0;
            }}
            .info-box p {{
                margin: 8px 0;
                color: #333;
            }}
            .info-box strong {{
                color: #ff7300;
            }}
            p {{
                color: #333;
                font-size: 16px;
                line-height: 1.5;
            }}
            .footer {{
                margin-top: 20px;
                font-size: 14px;
                color: #888;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://Salexpress.com/aplicativorelatorios/assets/images/logo2%204.png" alt="Salexpress" class="logo">
            <h1>Nova Solicitação de Contato!</h1>
            <p>Olá!</p>
            <p>Você recebeu uma nova solicitação de contato através da plataforma <strong>Salexpress</strong>.</p>
            
            <div class="info-box">
                <p><strong>📝 Nome:</strong> {nome_solicitante}</p>
                <p><strong>📧 E-mail:</strong> {email_solicitante}</p>
                <p><strong>📱 Telefone:</strong> {telefone_solicitante}</p>
                <p><strong>👤 Tipo de Usuário:</strong> {tipo_usuario_solicitante}</p>
            </div>
            
            <p>Entre em contato com essa pessoa o mais breve possível para não perder essa oportunidade!</p>
            <p>Para mais informações, acesse sua conta na plataforma Salexpress.</p>
            
            <p class="footer">© 2025 Salexpress. Todos os direitos reservados.</p>
        </div>
    </body>
    </html>
    '''
    
    try:
        set_email(
            destinatarios=[destinatario_email],
            assunto="Nova Solicitação de Contato - Salexpress",
            mensagem=html
        )
        logger.info(f"Email de notificação enviado para {destinatario_email}")
        return True
    except Exception as e:
        logger.error(f"Erro ao enviar email de notificação: {e}")
        return False

def create_contact_solicitation(db: Session, data: ContactSolicitationCreate):
    try:
        # Criar a solicitação de contato
        new_contact = ContactSolicitation(**data.dict())
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        
        # Obter o email do dono do negócio
        email_destinatario = obter_email_por_id_e_tipo(db, data.id_busness, data.type_user)
        
        if email_destinatario:
            # Enviar notificação por email
            enviar_email_notificacao_contato(
                destinatario_email=email_destinatario,
                nome_solicitante=data.nome,
                email_solicitante=data.email,
                telefone_solicitante=data.telefone,
                tipo_usuario_solicitante=data.type_user
            )
        else:
            logger.warning(f"Email não encontrado para id_busness={data.id_busness}, type_user={data.type_user}")
        
        return new_contact
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="E-mail já registrado")


def get_all_contact_solicitations(db: Session, skip: int, limit: int):
    skip = int(skip)
    limit = int(limit)

    totalrequests = db.query(ContactSolicitation).count()
    total_pages = ceil(totalrequests / limit) if limit > 0 else 1

    if limit > 0:
        requests = db.query(ContactSolicitation).offset(skip).limit(limit).all()
    else:
        requests = db.query(ContactSolicitation).all()

    return {
        "data": requests,
        "total": totalrequests,
        "totalPages": total_pages
    }

def get_contact_solicitation_by_id(db: Session, contact_id: int):
    contact = db.query(ContactSolicitation).filter(ContactSolicitation.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")
    return contact

def update_contact_solicitation_status(db: Session, contact_id: int, update_data: ContactSolicitationUpdate):
    contact = get_contact_solicitation_by_id(db, contact_id)
    contact.status = update_data.status
    db.commit()
    db.refresh(contact)
    return contact

def get_solicitations_by_user_email(db: Session, email: str, skip: int = 0, limit: int = 0):
    """
    Busca todas as solicitações de contato recebidas por um usuário através do email
    O email é usado para identificar o usuário nos três tipos (PF, PJ, Freelancer)
    """
    try:
        # Buscar o usuário pelo email nos três tipos
        user_pf = db.query(UserPF).filter(UserPF.email == email).first()
        user_pj_by_pf = None
        user_freelancer = db.query(UserFreelancer).filter(UserFreelancer.email == email).first()
        
        # Se encontrou UserPF, verificar se tem UserPJ associado
        if user_pf:
            user_pj_by_pf = db.query(UserPJ).filter(UserPJ.id_user_pf == user_pf.id).first()
        
        # Coletar todos os IDs e tipos possíveis
        user_filters = []
        
        if user_pf:
            user_filters.append({
                "id_busness": user_pf.id,
                "type_user": "pf"
            })
        
        if user_pj_by_pf:
            user_filters.append({
                "id_busness": user_pj_by_pf.id,
                "type_user": "pj"
            })
        
        if user_freelancer:
            user_filters.append({
                "id_busness": user_freelancer.id,
                "type_user": "freelancer"
            })
        
        if not user_filters:
            return {
                "data": [],
                "total": 0,
                "totalPages": 0
            }
        
        # Construir query para buscar solicitações
        from sqlalchemy import or_, and_
        
        conditions = []
        for user_filter in user_filters:
            conditions.append(
                and_(
                    ContactSolicitation.id_busness == user_filter["id_busness"],
                    ContactSolicitation.type_user.ilike(f"%{user_filter['type_user']}%")
                )
            )
        
        # Contar total
        totalrequests = db.query(ContactSolicitation).filter(or_(*conditions)).count()
        total_pages = ceil(totalrequests / limit) if limit > 0 else 1
        
        # Buscar com paginação
        query = db.query(ContactSolicitation).filter(or_(*conditions)).order_by(ContactSolicitation.created_at.desc())
        
        if limit > 0:
            requests = query.offset(skip).limit(limit).all()
        else:
            requests = query.all()
        
        return {
            "data": requests,
            "total": totalrequests,
            "totalPages": total_pages
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar solicitações por email: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao buscar solicitações: {str(e)}"
        )

def update_solicitation_status_by_owner(db: Session, contact_id: int, email_owner: str, new_status: str):
    """
    Atualiza o status de uma solicitação, mas apenas se o email pertencer ao dono do negócio
    """
    # Buscar a solicitação
    contact = get_contact_solicitation_by_id(db, contact_id)
    
    # Verificar se o email do usuário logado corresponde ao dono do negócio
    email_dono = obter_email_por_id_e_tipo(db, contact.id_busness, contact.type_user)
    
    if not email_dono or email_dono.lower() != email_owner.lower():
        raise HTTPException(
            status_code=403, 
            detail="Você não tem permissão para editar esta solicitação"
        )
    
    # Atualizar o status
    contact.status = new_status
    db.commit()
    db.refresh(contact)
    
    logger.info(f"Status da solicitação {contact_id} atualizado para '{new_status}' por {email_owner}")
    
    return contact
