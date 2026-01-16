from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException
from app.models.collaborator import CompanyCollaborator
from app.models.storage import StorageNode
from app.models.share import Share
from sqlalchemy import or_
from app.schemas.collaborator import CollaboratorCreate, CollaboratorUpdate, CollaboratorPermissions
from app.utils.security import hash_password, verify_password
from typing import Optional

def create_collaborator(db: Session, data: CollaboratorCreate) -> CompanyCollaborator:
    """
    Cria um novo colaborador
    """
    # Verificar se email já existe
    existing = db.query(CompanyCollaborator).filter(
        CompanyCollaborator.email == data.email
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar colaborador
    collaborator = CompanyCollaborator(
        company_id=data.company_id,
        company_type=data.company_type,
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        permissions=data.permissions.model_dump(),  # Converter para dict
        is_active=True
    )
    
    db.add(collaborator)
    db.commit()
    db.refresh(collaborator)
    
    return collaborator

def get_collaborator(db: Session, collaborator_id: int) -> Optional[CompanyCollaborator]:
    """Busca colaborador por ID"""
    return db.query(CompanyCollaborator).filter(
        CompanyCollaborator.id == collaborator_id
    ).first()

def get_collaborator_by_email(db: Session, email: str) -> Optional[CompanyCollaborator]:
    """Busca colaborador por email"""
    return db.query(CompanyCollaborator).filter(
        CompanyCollaborator.email == email
    ).first()

def list_company_collaborators(
    db: Session, 
    company_id: int, 
    company_type: str,
    include_inactive: bool = False
) -> list[CompanyCollaborator]:
    """Lista todos os colaboradores de uma empresa"""
    query = db.query(CompanyCollaborator).filter(
        and_(
            CompanyCollaborator.company_id == company_id,
            CompanyCollaborator.company_type == company_type
        )
    )
    
    if not include_inactive:
        query = query.filter(CompanyCollaborator.is_active == True)
    
    return query.order_by(CompanyCollaborator.created_at.desc()).all()

def update_collaborator(
    db: Session, 
    collaborator_id: int, 
    data: CollaboratorUpdate
) -> CompanyCollaborator:
    """Atualiza dados do colaborador"""
    collaborator = get_collaborator(db, collaborator_id)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    # Atualizar campos
    if data.name is not None:
        collaborator.name = data.name
    
    if data.password is not None:
        collaborator.password_hash = hash_password(data.password)
    
    if data.permissions is not None:
        collaborator.permissions = data.permissions.model_dump()
    
    if data.is_active is not None:
        collaborator.is_active = data.is_active
    
    db.commit()
    db.refresh(collaborator)
    
    return collaborator

def delete_collaborator(db: Session, collaborator_id: int) -> dict:
    """
    Deleta PERMANENTEMENTE um colaborador e seus arquivos.
    """
    collaborator = get_collaborator(db, collaborator_id)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    # 1. Deletar arquivos (StorageNodes)
    # Deleta onde o usuário é o dono (business_id = id, type_user = 'collaborator')
    db.query(StorageNode).filter(
        StorageNode.business_id == collaborator_id,
        StorageNode.type_user == 'collaborator'
    ).delete(synchronize_session=False)

    # 2. Deletar Compartilhamentos (Shares)
    # Onde ele recebeu OU onde ele compartilhou
    db.query(Share).filter(
        or_(
            (Share.shared_with_user_id == collaborator_id) & (Share.type_user_receiver == 'collaborator'),
            (Share.shared_by_user_id == collaborator_id) & (Share.type_user_sender == 'collaborator')
        )
    ).delete(synchronize_session=False)
    
    # 3. Deletar o Colaborador
    db.delete(collaborator)
    db.commit()
    
    return {"message": "Colaborador e seus arquivos excluídos permanentemente"}

def authenticate_collaborator(db: Session, email: str, password: str) -> Optional[CompanyCollaborator]:
    """
    Autentica um colaborador
    
    Returns:
        CompanyCollaborator se credenciais válidas, None caso contrário
    """
    collaborator = get_collaborator_by_email(db, email)
    
    if not collaborator:
        return None
    
    if not collaborator.is_active:
        return None
    
    if not verify_password(password, collaborator.password_hash):
        return None
    
    return collaborator

def check_permission(collaborator: CompanyCollaborator, permission: str) -> bool:
    """
    Verifica se colaborador tem uma permissão específica
    
    Args:
        collaborator: Objeto do colaborador
        permission: Nome da permissão (manage_files, view_metrics, etc)
    
    Returns:
        True se tem permissão, False caso contrário
    """
    if not collaborator.is_active:
        return False
    
    return collaborator.permissions.get(permission, False)

def get_collaborator_permissions(collaborator: CompanyCollaborator) -> dict:
    """Retorna todas as permissões do colaborador"""
    return collaborator.permissions
