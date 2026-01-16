from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.subscribers import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    SubscriptionWithUser,
    RegisterSubscriptionResponse,
    SubscriberInfo,
    StripeStatus,
)
from app.crud.subscription import (
    create_subscription,
    get_all_subscriptions,
    get_subscription_by_id,
    update_by_user_and_type,
    delete_subscription,
    get_by_user_and_type,
    list_subscribers_info,
    list_subscriptions_with_user,
    stripe_status_by_user,
)
from app.core.conn import get_db
from app.services.payment_service import *
from app.utils.subscriptions import cancel_subscription as stripe_cancel
router = APIRouter()




@router.get("/subscriptions", response_model=list[SubscriptionResponse])
def get_by_user_and_type_route(id_user: int, type_user: str, db: Session = Depends(get_db)):
    return get_by_user_and_type(db, id_user=id_user, type_user=type_user)

@router.post("/subscription/{price_id}/{emailClient}",     response_model=RegisterSubscriptionResponse)
async def register_subscription(data: SubscriptionCreate,price_id: str, emailClient: str, db: Session = Depends(get_db)):
    return create_subscription(db, data, price_id, emailClient)


@router.get("/subscription", response_model=list[SubscriptionResponse])
async def get_subscriptions(db: Session = Depends(get_db)):
    return get_all_subscriptions(db)


@router.get("/subscription/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription_for_id(subscription_id: int, db: Session = Depends(get_db)):
    subscription = get_subscription_by_id(db, subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")
    return subscription


@router.put("/subscriptions")
def update_subscription_by_user(
    id_user: int,
    type_user: str,
    data: SubscriptionUpdate,
    db: Session = Depends(get_db)
):
    updated = update_by_user_and_type(db, id_user, type_user, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")
    return updated

@router.delete("/subscription/{subscription_id}")
async def delete_subscription_data(subscription_id: int, db: Session = Depends(get_db)):
    success = delete_subscription(db, subscription_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")
    return {"ok": True}


@router.get("/subscriptionlink/payamentLink")
async def genratedLinkPayament(
    price_id: str = Query(...),
    email_client: str = Query(...),
    id_user: int = Query(...),
    type_user: str = Query(...),
    plan: str = Query(...)
):
    link_payment = generate_link_sub(
        price_id=price_id,
        email_cliente=email_client,
        id_user=id_user,
        type_user=type_user,
        plan=plan
    )
    return {"redirect": link_payment}


@router.get("/subscribers/info", response_model=list[SubscriberInfo])
def get_subscribers_table(db: Session = Depends(get_db)):
    return list_subscribers_info(db)


@router.get("/subscriptions/details", response_model=list[SubscriptionWithUser])
def get_subscriptions_with_user(db: Session = Depends(get_db)):
    return list_subscriptions_with_user(db)


@router.get("/subscriptions/status", response_model=list[StripeStatus])
def get_stripe_status(id_user: int, type_user: str, db: Session = Depends(get_db)):
    """Retorna o status da assinatura no Stripe para o usuário incluindo
    a próxima data de pagamento e o valor da assinatura."""
    statuses = stripe_status_by_user(db, id_user=id_user, type_user=type_user)
    if not statuses:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")
    return statuses


@router.delete("/subscription/cancel/{subscription_id}")
async def cancel_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """Cancela a assinatura no Stripe e remove o registro da tabela."""
    subscription = get_subscription_by_id(db, subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")

    if subscription.id_stripe:
        canceled = stripe_cancel(subscription.id_stripe)
        if not canceled:
            raise HTTPException(status_code=400, detail="Erro ao cancelar assinatura no Stripe")

    delete_subscription(db, subscription_id)
    return {"ok": True}
