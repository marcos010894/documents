from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.conn import get_db
from app.schemas.user_business_link import (
    UserBusinessLinkCreate, 
    UserBusinessLinkUpdate, 
    UserBusinessLinkResponse, 
    UserInfoByEmailResponse,
    UserCompaniesResponse
)
from app.crud.user_business_link import (
    create_link, 
    get_link, 
    list_links, 
    update_link, 
    delete_link, 
    activate_user, 
    deactivate_user, 
    get_user_info_by_email,
    get_user_companies_by_email,
    get_user_companies_by_email,
    get_user_companies,
    get_user_basic_info
)

router = APIRouter()

@router.post("/", response_model=UserBusinessLinkResponse)
def create_user_business_link(payload: UserBusinessLinkCreate, db: Session = Depends(get_db)):
    """
    Cria um vínculo entre usuário e empresa
    
    O endpoint busca automaticamente o user_id e type_user através do email fornecido.
    Suporta usuários dos tipos: PF, Freelancer e PJ.
    """
    return create_link(db, payload)

@router.get("/{link_id}", response_model=UserBusinessLinkResponse)
def get_user_business_link(link_id: int, db: Session = Depends(get_db)):
    """Consulta um vínculo específico"""
    return get_link(db, link_id)

@router.get("/", response_model=List[UserBusinessLinkResponse])
def list_user_business_links(
    user_id: Optional[int] = None, 
    business_id: Optional[int] = None, 
    status: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    """Lista vínculos com filtros opcionais e enriquece com dados do usuário (se for listagem por empresa)"""
    links = list_links(db, user_id, business_id, status)
    
    # Se estamos listando por empresa (business_id presente), o interessado quer ver OS USUÁRIOS.
    # Precisamos hidratar o nome/email do usuário.
    # Se estamos listando por usuário, talvez queira ver A EMPRESA (mas isso é outro endpoint geralmente).
    
    # Vamos sempre tentar hidratar o "outro lado".
    # Mas o schema UserBusinessLinkResponse tem user_id e business_id.
    # Assumindo que o "user_name" e "user_email" no schema referem-se ao user_id.
    
    results = []
    for link in links:
        # Converte para dict para poder adicionar campos extras não mapeados no ORM
        # ou usa o from_orm do Pydantic se os campos existissem no model (não existem).
        # Melhor criar um objeto compatível.
        
        link_dict = link.__dict__.copy()
        
        # Busca info do usuário
        user_info = get_user_basic_info(db, link.user_id, link.type_user)
        
        link_dict['nome'] = user_info['name']
        link_dict['email'] = user_info['email']
        
        results.append(link_dict)
        
    return results

@router.put("/{link_id}", response_model=UserBusinessLinkResponse)
def update_user_business_link(link_id: int, payload: UserBusinessLinkUpdate, db: Session = Depends(get_db)):
    """Atualiza um vínculo"""
    return update_link(db, link_id, payload)

@router.delete("/{link_id}")
def delete_user_business_link(link_id: int, db: Session = Depends(get_db)):
    """Remove um vínculo"""
    return delete_link(db, link_id)

@router.patch("/{link_id}/activate", response_model=UserBusinessLinkResponse)
def activate_user_link(link_id: int, db: Session = Depends(get_db)):
    """Ativa um usuário (status = 1)"""
    return activate_user(db, link_id)

@router.patch("/{link_id}/deactivate", response_model=UserBusinessLinkResponse)
def deactivate_user_link(link_id: int, db: Session = Depends(get_db)):
    """Desativa um usuário (status = 0)"""
    return deactivate_user(db, link_id)

@router.get("/search/by-email/{email}", response_model=UserInfoByEmailResponse)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    """
    Busca informações do usuário (ID e tipo) através do email
    
    Retorna:
    - user_id: ID do usuário
    - type_user: Tipo do usuário ("pf", "freelancer", "pj")
    - user_data: Dados completos do usuário
    """
    return get_user_info_by_email(db, email)


@router.get("/companies/by-email/{email}")
def get_companies_by_email(email: str, db: Session = Depends(get_db)):
    """
    Retorna todas as empresas vinculadas a um usuário através do email
    
    **Este é o endpoint principal para uso após o login!**
    
    Fluxo:
    1. Usuário faz login
    2. Frontend chama este endpoint com o email do usuário
    3. Backend retorna lista de empresas vinculadas
    4. Frontend exibe seletor de empresas
    5. Usuário escolhe uma empresa
    6. Frontend usa o business_id escolhido em todas as próximas requisições
    
    Retorna:
    - user: Dados do usuário logado
    - companies: Lista de empresas com id e nome
    - total_companies: Total de empresas vinculadas
    """
    return get_user_companies_by_email(db, email)


@router.get("/companies/by-user-id/{user_id}")
def get_companies_by_user_id(
    user_id: int, 
    type_user: str,
    db: Session = Depends(get_db)
):
    """
    Retorna todas as empresas vinculadas a um usuário através do user_id
    
    Parâmetros:
    - user_id: ID do usuário
    - type_user: Tipo do usuário ('pf', 'freelancer', 'pj')
    
    Retorna:
    - Lista de empresas com seus dados completos
    """
    companies = get_user_companies(db, user_id, type_user)
    return {
        "companies": companies,
        "total_companies": len(companies)
    }
