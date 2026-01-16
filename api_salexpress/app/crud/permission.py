from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.permission import Permission, PermissionLevel
from app.schemas.permission import PermissionCreate, PermissionCreateLegacy, PermissionUpdate
from app.crud.user_business_link import get_user_info_by_email
from typing import List, Dict, Any

def create_permission(db: Session, data: PermissionCreate, created_by: int = None) -> Permission:
    """
    Cria uma permissão usando emails para identificar usuário e empresa
    """
    # Busca informações do usuário
    user_info = get_user_info_by_email(db, data.user_email)
    
    # Busca informações da empresa/responsável
    business_info = get_user_info_by_email(db, data.business_email)
    
    # Valida o nível de permissão
    if data.permission_level not in PermissionLevel.get_all_levels():
        raise HTTPException(
            status_code=400, 
            detail=f"Nível de permissão inválido. Valores aceitos: {PermissionLevel.get_all_levels()}"
        )
    
    # Verifica se já existe permissão para este usuário nesta empresa
    existing_permission = db.query(Permission).filter(
        Permission.user_id == user_info["user_id"],
        Permission.business_id == business_info["user_id"]
    ).first()
    
    if existing_permission:
        raise HTTPException(
            status_code=400, 
            detail="Já existe uma permissão para este usuário nesta empresa. Use a função de atualização."
        )
    
    # Cria a permissão
    permission_data = {
        "user_id": user_info["user_id"],
        "type_user": user_info["type_user"],
        "business_id": business_info["user_id"],
        "business_type": business_info["type_user"],
        "permission_level": data.permission_level,
        "is_active": True,
        "created_by": created_by
    }
    
    permission = Permission(**permission_data)
    db.add(permission)
    db.commit()
    db.refresh(permission)
    
    print(f"✅ Permissão '{data.permission_level}' criada para usuário {data.user_email} na empresa {data.business_email}")
    
    return permission

def get_user_permissions_by_email(db: Session, email: str) -> Dict[str, Any]:
    """
    Busca todas as permissões de um usuário pelo email
    Usado no login para retornar as permissões do usuário
    """
    # Busca informações do usuário
    user_info = get_user_info_by_email(db, email)
    user_id = user_info["user_id"]
    
    # Busca todas as permissões ativas do usuário
    permissions = db.query(Permission).filter(
        Permission.user_id == user_id,
        Permission.type_user == user_info["type_user"],
        Permission.is_active == True
    ).all()
    
    # Formata as permissões para retorno
    permissions_list = []
    for perm in permissions:
        # Busca informações da empresa
        from app.models.user import UserPF, UserFreelancer, UserPJ
        
        business_data = None
        if perm.business_type == "pf":
            business = db.query(UserPF).filter(UserPF.id == perm.business_id).first()
            if business:
                business_data = {
                    "id": business.id,
                    "nome": business.nome,
                    "email": business.email,
                    "type": "pf"
                }
        elif perm.business_type == "freelancer":
            business = db.query(UserFreelancer).filter(UserFreelancer.id == perm.business_id).first()
            if business:
                business_data = {
                    "id": business.id,
                    "nome": business.nome,
                    "email": business.email,
                    "type": "freelancer"
                }
        elif perm.business_type == "pj":
            business = db.query(UserPJ).filter(UserPJ.id == perm.business_id).first()
            if business:
                business_data = {
                    "id": business.id,
                    "razao_social": business.razao_social,
                    "nome_fantasia": business.nome_fantasia,
                    "cnpj": business.cnpj,
                    "type": "pj"
                }
        
        permissions_list.append({
            "permission_id": perm.id,
            "business_id": perm.business_id,
            "business_type": perm.business_type,
            "business_data": business_data,
            "permission_level": perm.permission_level,
            "permission_description": PermissionLevel.get_permissions_description().get(perm.permission_level),
            "is_active": perm.is_active,
            "created_at": perm.created_at
        })
    
    return {
        "user_id": user_info["user_id"],
        "type_user": user_info["type_user"],
        "user_data": user_info["user_data"],
        "permissions": permissions_list
    }

def list_permissions(db: Session, user_id: int = None, business_id: int = None, permission_level: str = None) -> List[Permission]:
    """Lista permissões com filtros opcionais"""
    query = db.query(Permission)
    
    if user_id is not None:
        query = query.filter(Permission.user_id == user_id)
    if business_id is not None:
        query = query.filter(Permission.business_id == business_id)
    if permission_level is not None:
        query = query.filter(Permission.permission_level == permission_level)
    
    return query.order_by(Permission.created_at.desc()).all()

def update_permission(db: Session, permission_id: int, data: PermissionUpdate) -> Permission:
    """Atualiza uma permissão"""
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permissão não encontrada")
    
    # Valida nível de permissão se fornecido
    if data.permission_level and data.permission_level not in PermissionLevel.get_all_levels():
        raise HTTPException(
            status_code=400,
            detail=f"Nível de permissão inválido. Valores aceitos: {PermissionLevel.get_all_levels()}"
        )
    
    for k, v in data.dict(exclude_unset=True).items():
        setattr(permission, k, v)
    
    db.commit()
    db.refresh(permission)
    return permission

def delete_permission(db: Session, permission_id: int):
    """Remove uma permissão"""
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permissão não encontrada")
    
    db.delete(permission)
    db.commit()
    return {"message": "Permissão removida com sucesso"}

def get_permission_levels():
    """Retorna todos os níveis de permissão disponíveis"""
    return {
        "levels": PermissionLevel.get_all_levels(),
        "descriptions": PermissionLevel.get_permissions_description()
    }
