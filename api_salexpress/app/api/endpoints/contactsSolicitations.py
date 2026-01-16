from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.conn import get_db
from app.schemas.contactsSolicitations import (
    ContactSolicitationCreate,
    ContactSolicitationResponse,
    ContactSolicitationUpdate,
    ContactRequestAll,
    StatusSolicitacao
)
from app.crud.contactsSolicitations import (
    create_contact_solicitation,
    get_all_contact_solicitations,
    get_contact_solicitation_by_id,
    update_contact_solicitation_status,
    get_solicitations_by_user_email,
    update_solicitation_status_by_owner
)
from typing import List
from pydantic import EmailStr

router = APIRouter()


@router.post("/", response_model=ContactSolicitationResponse)
def create_contact(data: ContactSolicitationCreate, db: Session = Depends(get_db)):
    """Cria uma nova solicitação de contato e envia email de notificação"""
    return create_contact_solicitation(db, data)

@router.get("/", response_model=ContactRequestAll)
def list_contacts(db: Session = Depends(get_db), skip=0, limit=0):
    """Lista todas as solicitações de contato (admin)"""
    return get_all_contact_solicitations(db, skip, limit)

@router.get("/my-solicitations/", response_model=ContactRequestAll)
def get_my_solicitations(
    email: EmailStr = Query(..., description="Email do usuário logado"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=0),
    db: Session = Depends(get_db)
):
    """
    Busca todas as solicitações de contato recebidas pelo usuário logado através do email.
    O usuário verá apenas as solicitações destinadas a ele.
    """
    return get_solicitations_by_user_email(db, email, skip, limit)

@router.get("/{contact_id}", response_model=ContactSolicitationResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Busca uma solicitação específica por ID"""
    return get_contact_solicitation_by_id(db, contact_id)

@router.patch("/{contact_id}", response_model=ContactSolicitationResponse)
def update_contact_status(contact_id: int, data: ContactSolicitationUpdate, db: Session = Depends(get_db)):
    """Atualiza o status de uma solicitação (admin)"""
    return update_contact_solicitation_status(db, contact_id, data)

@router.patch("/{contact_id}/status", response_model=ContactSolicitationResponse)
def update_my_solicitation_status(
    contact_id: int,
    data: ContactSolicitationUpdate,
    email: EmailStr = Query(..., description="Email do usuário logado que é dono da solicitação"),
    db: Session = Depends(get_db)
):
    """
    Atualiza o status de uma solicitação de contato.
    Apenas o usuário que recebeu a solicitação pode atualizar o status.
    
    Status permitidos:
    - Pendente: aguardando a resposta do cliente
    - Aguardando avaliação: o contato com o cliente foi realizado
    - Avaliado: o cliente avaliou o serviço
    - Solicitação não feita: o cliente não solicitou o serviço
    """
    return update_solicitation_status_by_owner(db, contact_id, email, data.status)

