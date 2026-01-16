import stripe
import os

stripe.api_key = os.getenv("STRIPE_API_KEY")  # Usar variável de ambiente


def criar_cliente(email, nome):
    cliente = stripe.Customer.create(
        email=email,
        name=nome
    )
    return cliente.id



def generate_link_sub(price_id: str, email_cliente: str):
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        mode='subscription',
        line_items=[{
            'price': price_id,
            'quantity': 1,
        }],
        customer_email=email_cliente,
        success_url='https://seusite.com/sucesso?session_id={CHECKOUT_SESSION_ID}',
        cancel_url='https://seusite.com/cancelado',
    )

    return {
        "checkout_url": session.url,
        "session_id": session.id  # ✅ Use esse ID para acompanhar via webhook ou API
    }


def criar_link_assinatura(price_id: str, email_cliente: str, id_plan: str):
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        mode='subscription',
        line_items=[{
            'price': price_id,
            'quantity': 1,
        }],
        customer_email=email_cliente,
        success_url='https://seusite.com/sucesso?session_id={CHECKOUT_SESSION_ID}?id_plan_creatad={id_plan}',
        cancel_url='https://seusite.com/cancelado',
    )

    return {
        "checkout_url": session.url,
        "session_id": session.id  # ✅ Use esse ID para acompanhar via webhook ou API
    }


def observerAssNatura(session_id: str):
    # 1. Recupera a sessão de checkout
    session = stripe.checkout.Session.retrieve(session_id)
    
    # 2. Extrai o ID da assinatura
    subscription_id = session.get("subscription")
    
    if not subscription_id:
        raise ValueError("subscription_id não encontrado na sessão.")

    # 3. Agora sim, recupera a assinatura
    assinatura = stripe.Subscription.retrieve(subscription_id)

    print(f"Status da assinatura: {assinatura.status}")
    return assinatura