from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.conn import get_db
from app.schemas.permission import (
    PermissionCreate, 
    PermissionCreateLegacy, 
    PermissionUpdate, 
    PermissionResponse,
    UserPermissionInfo
)
from app.crud.permission import (
    create_permission,
    get_user_permissions_by_email,
    list_permissions,
    update_permission,
    delete_permission,
    get_permission_levels
)

router = APIRouter()

@router.post("/", response_model=PermissionResponse)
def create_user_permission(payload: PermissionCreate, db: Session = Depends(get_db)):
    """
    Cria uma permissão para usuário em uma empresa usando emails
    
    Exemplo:
    {
        "user_email": "funcionario@exemplo.com",
        "business_email": "empresa@exemplo.com",
        "permission_level": "GED-EDIT"
    }
    """
    return create_permission(db, payload)

@router.get("/levels")
def get_available_permission_levels():
    """
    Retorna todos os níveis de permissão disponíveis
    """
    return get_permission_levels()

@router.get("/user/{email}", response_model=UserPermissionInfo)
def get_user_permissions(email: str, db: Session = Depends(get_db)):
    """
    Busca todas as permissões de um usuário pelo email
    
    Este endpoint é usado no login para retornar as permissões do usuário
    """
    return get_user_permissions_by_email(db, email)

@router.get("/", response_model=List[PermissionResponse])
def list_user_permissions(
    user_id: int = None,
    business_id: int = None,
    permission_level: str = None,
    db: Session = Depends(get_db)
):
    """Lista permissões com filtros opcionais"""
    return list_permissions(db, user_id, business_id, permission_level)

@router.put("/{permission_id}", response_model=PermissionResponse)
def update_user_permission(
    permission_id: int, 
    payload: PermissionUpdate, 
    db: Session = Depends(get_db)
):
    """Atualiza uma permissão específica"""
    return update_permission(db, permission_id, payload)

@router.delete("/{permission_id}")
def delete_user_permission(permission_id: int, db: Session = Depends(get_db)):
    """Remove uma permissão"""
    return delete_permission(db, permission_id)

@router.get("/business/{business_email}")
def get_business_permissions(business_email: str, db: Session = Depends(get_db)):
    """
    Lista todos os usuários e suas permissões em uma empresa específica
    """
    from app.crud.user_business_link import get_user_info_by_email
    from app.models.permission import Permission
    
    # Busca informações da empresa
    business_info = get_user_info_by_email(db, business_email)
    business_id = business_info["user_id"]
    
    # Busca todas as permissões da empresa
    permissions = db.query(Permission).filter(
        Permission.business_id == business_id,
        Permission.is_active == True
    ).all()
    
    # Formatar resposta com informações dos usuários
    users_permissions = []
    for perm in permissions:
        # Buscar dados do usuário
        from app.models.user import UserPF, UserFreelancer, UserPJ
        
        user_data = None
        if perm.type_user == "pf":
            user = db.query(UserPF).filter(UserPF.id == perm.user_id).first()
            if user:
                user_data = {"id": user.id, "nome": user.nome, "email": user.email}
        elif perm.type_user == "freelancer":
            user = db.query(UserFreelancer).filter(UserFreelancer.id == perm.user_id).first()
            if user:
                user_data = {"id": user.id, "nome": user.nome, "email": user.email}
        elif perm.type_user == "pj":
            user = db.query(UserPJ).filter(UserPJ.id == perm.user_id).first()
            if user:
                user_data = {"id": user.id, "razao_social": user.razao_social, "cnpj": user.cnpj}
        
        users_permissions.append({
            "permission_id": perm.id,
            "user_id": perm.user_id,
            "type_user": perm.type_user,
            "user_data": user_data,
            "permission_level": perm.permission_level,
            "is_active": perm.is_active,
            "created_at": perm.created_at
        })
    
    return {
        "business_id": business_id,
        "business_data": business_info["user_data"],
        "total_users": len(users_permissions),
        "users_permissions": users_permissions
    }
