from sqlalchemy.orm import Session
from app.models.user import UserPF, UserPJ, UserFreelancer, GetUserFreelancer, GetUserPF, GetUserPJ
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models import UserPF, UserPJ, UserFreelancer
from app.schemas.user import  UserPFBase, UserPJBase, UserFreelancerBase,GetUserFreelancerBase
from fastapi.encoders import jsonable_encoder
from app.utils.security import *
from math import ceil
from app.models import PermissionsPJ, PermissionsFreelas

def create_user_pf(db: Session, user: UserPFBase):
    # Verificando se o CPF ou email já existe
    existing_user = db.query(UserPF).filter(UserPF.cpf == user.cpf).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário com esse CPF."
        )

    existing_email = db.query(UserPF).filter(UserPF.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário com esse email."
        )

    try:
        # Criando o novo usuário
        user_dict = user.dict()
        user_dict["password_user"] = hash_password(user_dict["password_user"])  # <-- hash da senha
        db_user = UserPF(**user_dict)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        # Criar permissão padrão
        permission = PermissionsPJ(id_user=db_user.id, permissions=["MKTFREE"])
        db.add(permission)
        db.commit()

        return {"message": "Usuário PF criado com sucesso", "user_id": db_user.id}

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar o usuário PF: {str(e)}"
        )

def create_user_pj(db: Session, user: UserPJBase):
    # Verificando se o CNPJ ou email já existe
    existing_user = db.query(UserPJ).filter(UserPJ.cnpj == user.cnpj).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma empresa com esse CNPJ."
        )

    existing_email = db.query(UserPJ).filter(UserPJ.cnpj == user.cnpj).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma empresa com esse email."
        )

    try:
        # Criando o novo usuário
        db_user = UserPJ(**user.dict())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return {"message": "Usuário PJ criado com sucesso"}

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar o usuário PJ: {str(e)}"
        )

def create_user_freelancer(db: Session, user: UserFreelancerBase):
    # Verificando se o CPF ou email já existe
    existing_user = db.query(UserFreelancer).filter(UserFreelancer.cpf == user.cpf).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um freelancer com esse CPF."
        )

    existing_email = db.query(UserFreelancer).filter(UserFreelancer.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um freelancer com esse email."
        )

    try:
        # Criando o novo freelancer
        user_dict = user.dict()
        user_dict["password_user"] = hash_password(user_dict["password_user"])  # <-- hash da senha
        db_user = UserFreelancer(**user_dict)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        permission = PermissionsFreelas(id_user=db_user.id, permissions=["MKTFREE"])
        db.add(permission)
        db.commit()
        return {
                "message": "Freelancer criado com sucesso",
                "id_user": db_user.id
            }

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar o freelancer: {str(e)}"
        )
    

    

def getUserFrellancer(db: Session, freelancer_id = 0, searchType = str, skip=0, limit=0):
    if searchType == 'unic':
        existing_user = db.query(GetUserFreelancer).filter(GetUserFreelancer.id == freelancer_id).first()
        if existing_user:
            return existing_user
        raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Id de usuario não encontrado."
            )
    if searchType == 'all':
        total_users = db.query(GetUserFreelancer).count()
        total_pages = ceil(total_users / limit) if limit > 0 else 1

        if limit > 0:
            users = db.query(GetUserFreelancer).offset(skip).limit(limit).all()
        else:
            users = db.query(GetUserFreelancer).all()

        if not users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuários não encontrados."
            )

        return {
            "data": users,
            "total": total_users,
            "totalPages": total_pages
        }
    
    
def getUserPj(db: Session, id_user=0, searchType=str, skip=0, limit=0):
    if searchType == 'unic':
        result = (
            db.query(GetUserPF, GetUserPJ)
            .join(GetUserPJ, GetUserPJ.id_user_pf == GetUserPF.id)
            .filter(GetUserPF.id == id_user)
            .first()
        )
        if result:
            pf, pj = result
            return {
                "pf": jsonable_encoder(pf),
                "pj": jsonable_encoder(pj)
            }

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Id de usuario não encontrado."
        )
    if searchType == 'all':

        total_users = db.query(GetUserPF).count()
        total_pages = ceil(total_users / limit) if limit > 0 else 1

        if limit > 0:
            results = (
                db.query(GetUserPF, GetUserPJ)
                .join(GetUserPJ, GetUserPJ.id_user_pf == GetUserPF.id)
                .offset(skip)
                .limit(limit)
                .all()
            )
        else:
            results = (
                db.query(GetUserPF, GetUserPJ)
                .join(GetUserPJ, GetUserPJ.id_user_pf == GetUserPF.id)
                .all()
            )

        if not results:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuários não encontrados."
            )

        response = []
        for pf, pj in results:
            response.append({
                "pf": jsonable_encoder(pf),
                "pj": jsonable_encoder(pj)
            })

        return {
            "data": response,
            "total": total_users,
            "totalPage": total_pages
        }

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="usuarios não encontrado."
    )


def edit_user_pf(db: Session, user_id: int, user_data: UserPFBase):
    db_user = db.query(UserPF).filter(UserPF.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário PF não encontrado.")

    user_dict = user_data.dict(exclude_unset=True)
    user_dict.pop("password_user", None)  # Remove a senha se estiver presente

    for key, value in user_dict.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return {"message": "Usuário PF atualizado com sucesso", "user_id": db_user.id}

def edit_user_pj(db: Session, user_id: int, user_data: UserPJBase):
    db_user = db.query(UserPJ).filter(UserPJ.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário PJ não encontrado.")

    user_dict = user_data.dict(exclude_unset=True)

    for key, value in user_dict.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    

    return {"message": "Usuário PJ atualizado com sucesso", "user_id": db_user.id}


def edit_user_freelancer(db: Session, user_id: int, user_data: UserFreelancerBase):
    db_user = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Freelancer não encontrado.")

    user_dict = user_data.dict(exclude_unset=True)
    user_dict.pop("password_user", None)  # Remove a senha se estiver presente

    for key, value in user_dict.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return {"message": "Freelancer atualizado com sucesso", "user_id": db_user.id}


def delete_user_freelancer(db: Session, user_id: int):
    db_user = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Freelancer não encontrado.")

    permissions = db.query(PermissionsFreelas).filter(PermissionsFreelas.id_user == user_id).all()
    for perm in permissions:
        db.delete(perm)

    db.delete(db_user)
    db.commit()
    return {"message": "Freelancer deletado com sucesso"}


def delete_user_pj(db: Session, user_id: int):
    db_user = db.query(UserPJ).filter(UserPJ.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário PJ não encontrado.")

    db.delete(db_user)
    db.commit()
    return {"message": "Usuário PJ deletado com sucesso"}


def delete_user_pf(db: Session, user_id: int):
    db_user = db.query(UserPF).filter(UserPF.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário PF não encontrado.")

    pjs = db.query(UserPJ).filter(UserPJ.id_user_pf == user_id).all()
    for pj in pjs:
        db.delete(pj)

    permissions = db.query(PermissionsPJ).filter(PermissionsPJ.id_user == user_id).all()
    for perm in permissions:
        db.delete(perm)

    db.flush()  # Garante que deletes anteriores sejam aplicados antes de deletar o user_pf

    db.delete(db_user)
    db.commit()
    return {"message": "Usuário PF deletado com sucesso"}

def add_permissions_to_user(db: Session, user_id: int, permissions: list, user_type: str):
    """
    Adiciona permissões ao usuário sem remover as antigas.
    user_type: 'pj' ou 'freelancer'
    """
    if user_type == 'pj':
        perm_obj = db.query(PermissionsPJ).filter(PermissionsPJ.id_user == user_id).first()
    elif user_type == 'freelancer':
        perm_obj = db.query(PermissionsFreelas).filter(PermissionsFreelas.id_user == user_id).first()
    else:
        raise HTTPException(status_code=400, detail="Tipo de usuário inválido.")

    if not perm_obj:
        raise HTTPException(status_code=404, detail="Permissões não encontradas para o usuário.")

    # Adiciona novas permissões sem duplicar
    current_perms = set(perm_obj.permissions or [])
    new_perms = set(permissions)
    perm_obj.permissions = list(current_perms.union(new_perms))

    db.commit()
    db.refresh(perm_obj)
    return {"message": "Permissões adicionadas com sucesso", "permissions": perm_obj.permissions}

def remove_permissions_from_user(db: Session, user_id: int, permissions: list, user_type: str):
    """
    Remove permissões específicas do usuário.
    user_type: 'pj' ou 'freelancer'
    """
    if user_type == 'pj':
        perm_obj = db.query(PermissionsPJ).filter(PermissionsPJ.id_user == user_id).first()
    elif user_type == 'freelancer':
        perm_obj = db.query(PermissionsFreelas).filter(PermissionsFreelas.id_user == user_id).first()
    else:
        raise HTTPException(status_code=400, detail="Tipo de usuário inválido.")

    if not perm_obj:
        raise HTTPException(status_code=404, detail="Permissões não encontradas para o usuário.")

    # Remove permissões especificadas
    current_perms = set(perm_obj.permissions or [])
    perms_to_remove = set(permissions)
    perm_obj.permissions = list(current_perms - perms_to_remove)

    db.commit()
    db.refresh(perm_obj)
    return {"message": "Permissões removidas com sucesso", "permissions": perm_obj.permissions}

