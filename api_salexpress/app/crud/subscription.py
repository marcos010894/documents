# crud/subscription.py
from sqlalchemy.orm import Session
from app.models.subscribers import Subscription
from app.models.permissions import PermissionsPJ, PermissionsFreelas
from app.schemas.subscribers import SubscriptionCreate, SubscriptionUpdate
from app.services.payment_service import generate_link_sub
from app.utils.subscriptions import consultar_status_stripe
from datetime import timedelta
from app.models.user import UserPF, UserPJ, UserFreelancer
from datetime import timedelta
from app.models.user import UserPF, UserPJ, UserFreelancer
def create_subscription(db: Session, data: SubscriptionCreate, price_id, email_client):
    # Verifica se já existe uma subscription com os mesmos parâmetros
    existing_subscription = db.query(Subscription).filter_by(
        id_user=data.id_user,
        type_user=data.type_user
    ).first()

    if existing_subscription:
        db.delete(existing_subscription)
        db.commit()

    # Cria nova subscription
    subscription = Subscription(**data.dict())
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    # Gerencia permissões
    if data.type_user != 'Freelancer':
        permission = db.query(PermissionsPJ).filter_by(id_user=data.id_user).first()
        if permission:
            permission.permissions = [data.plan]
        else:
            permission = PermissionsPJ(id_user=data.id_user, permissions=[data.plan])
            db.add(permission)
    else:
        permission = db.query(PermissionsFreelas).filter_by(id_user=data.id_user).first()
        if permission:
            permission.permissions = [data.plan]
        else:
            permission = PermissionsFreelas(id_user=data.id_user, permissions=[data.plan])
            db.add(permission)

    db.commit()

    return {
        "response": subscription,
        "pauamentLink": ''  # Corrigir para 'paymentLink' se for erro de digitação
    }


def get_all_subscriptions(db: Session):
    return db.query(Subscription).all()

def get_subscription_by_id(db: Session, subscription_id: int):
    return db.query(Subscription).filter(Subscription.id == subscription_id).first()

def update_subscription(db: Session, subscription_id: int, data: SubscriptionUpdate):
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(subscription, field, value)
    db.commit()
    db.refresh(subscription)
    return subscription


def update_by_user_and_type(
    db: Session, id_user: int, type_user: str, data: SubscriptionUpdate
):
    subscription = db.query(Subscription).filter(
        Subscription.id_user == id_user,
        Subscription.type_user == type_user
    ).first()

    if not subscription:
        return None

    for field, value in data.dict(exclude_unset=True).items():
        setattr(subscription, field, value)

    db.commit()
    db.refresh(subscription)
    return subscription

def get_by_user_and_type(db: Session, id_user: int, type_user: str):
    return db.query(Subscription).filter(
        Subscription.id_user == id_user,
        Subscription.type_user == type_user
    ).all()


def delete_subscription(db: Session, subscription_id: int):
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not subscription:
        return False
    db.delete(subscription)
    db.commit()
    return True


def list_subscribers_info(db: Session):
    """Retorna informacoes resumidas das assinaturas com nome do usuario."""

    from app.utils.subscriptions import consultar_status_stripe

    subs = db.query(Subscription).all()
    data = []
    for sub in subs:
        # Descobrir nome do assinante baseado no tipo de usuario
        nome = None
        if sub.type_user and sub.type_user.lower() == "freelancer":
            user = db.query(UserFreelancer.nome).filter(UserFreelancer.id == sub.id_user).first()
            if user:
                nome = user[0]
        else:
            # Primeiro tenta pegar nome da pessoa fisica
            pf = db.query(UserPF.nome).filter(UserPF.id == sub.id_user).first()
            if pf:
                nome = pf[0]
            else:
                pj = db.query(UserPJ.nome_fantasia).filter(UserPJ.id_user_pf == sub.id_user).first()
                if pj:
                    nome = pj[0]

        # Calcular proxima data de pagamento
        base = sub.update_data or sub.data_assinatura
        if sub.tipo_pagamento and sub.tipo_pagamento.lower().startswith("anu"):
            proximo_pagamento = base + timedelta(days=365)
        else:
            proximo_pagamento = base + timedelta(days=30)

        status = consultar_status_stripe(sub.id_stripe) if sub.id_stripe else None

        data.append({
            "nome": nome,
            "proximo_pagamento": proximo_pagamento,
            "ativo": sub.ativo,
            "id_stripe": sub.id_stripe,
            "status": status,
        })
    return data


def list_subscriptions_with_user(db: Session):
    """Retorna todas as assinaturas com nome do usuario e data da assinatura."""


    subs = db.query(Subscription).all()
    result = []
    for sub in subs:
        nome = None
        if sub.type_user and sub.type_user.lower() == "freelancer":
            user = db.query(UserFreelancer.nome).filter(UserFreelancer.id == sub.id_user).first()
            if user:
                nome = user[0]
        else:
            pf = db.query(UserPF.nome).filter(UserPF.id == sub.id_user).first()
            if pf:
                nome = pf[0]
            else:
                pj = db.query(UserPJ.nome_fantasia).filter(UserPJ.id_user_pf == sub.id_user).first()
                if pj:
                    nome = pj[0]
        status = consultar_status_stripe(sub.id_stripe) if sub.id_stripe else None
        result.append({
            "id": sub.id,
            "id_user": sub.id_user,
            "type_user": sub.type_user,
            "plan": sub.plan,
            "price": sub.price,
            "tipo_pagamento": sub.tipo_pagamento,
            "ativo": status == 'active' if status else False,
            "id_stripe": sub.id_stripe,
            "data_assinatura": sub.data_assinatura.strftime("%d/%m/%Y"),
            "update_data": sub.update_data.strftime("%d/%m/%Y") if sub.update_data else None,
            "nome": nome,
        })
    return result


def stripe_status_by_user(db: Session, id_user: int, type_user: str):
    """Retorna o status de cada assinatura Stripe para o usuário informado."""
    subs = get_by_user_and_type(db, id_user=id_user, type_user=type_user)
    result = []
    for sub in subs:
        status = consultar_status_stripe(sub.id_stripe) if sub.id_stripe else None

        base = sub.update_data or sub.data_assinatura
        if sub.tipo_pagamento and sub.tipo_pagamento.lower().startswith("anu"):
            proximo_pagamento = base + timedelta(days=365)
        else:
            proximo_pagamento = base + timedelta(days=30)

        valor_formatado = f"R$ {sub.price:,.2f}"
        valor_formatado = (
            valor_formatado
            .replace(",", "v")
            .replace(".", ",")
            .replace("v", ".")
        )
        result.append({
            "id_stripe": sub.id_stripe,
            "status": status,
            "proximo_pagamento": proximo_pagamento.strftime("%d/%m/%Y"),
            "valor": valor_formatado,
        })
    return result
