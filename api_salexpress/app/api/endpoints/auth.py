from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.conn import get_db
from app.schemas.login import LoginInput
from app.models.user import UserPF, UserFreelancer, UserPJ
from app.models.permissions import PermissionsFreelas, PermissionsPJ
from app.models.collaborator import CompanyCollaborator
from app.utils.security import verify_password
import hashlib

router = APIRouter()

def verify_sha256_password(password: str, stored_hash: str) -> bool:
    """Verifica senha SHA256 (formato: salt$hash)"""
    try:
        salt, hashed = stored_hash.split('$')
        password_with_salt = f"{password}{salt}"
        computed = hashlib.sha256(password_with_salt.encode('utf-8')).hexdigest()
        return computed == hashed
    except:
        return False

@router.post("/login")
def login(user: LoginInput, db: Session = Depends(get_db)):
    # Tenta encontrar o usuário PF
    user_pf = db.query(UserPF).filter(UserPF.email == user.email).first()
    
    if user_pf and verify_password(user.password, user_pf.password_user):
        # Verifica se o usuário PF tem empresa (PJ) registrada
        user_pj = db.query(UserPJ).filter(UserPJ.id_user_pf == user_pf.id).first()
        
        # Busca permissões para o PF
        permissions = db.query(PermissionsPJ).filter(PermissionsPJ.id_user == user_pf.id).all()
        permission_list = [p.permissions for p in permissions]

        # Remove a senha antes de retornar
        user_data = user_pf.__dict__.copy()
        user_data.pop("password_user", None)
        user_data.pop("_sa_instance_state", None)  # Remove estado interno do SQLAlchemy

        # Se não tem empresa registrada
        if not user_pj:
            return {
                "message": "Login PF realizado com sucesso",
                "status": "completar_cadastro",
                "user": user_data,
                "empresa": None,
                "permissions": permission_list,
                "tipo": "PF",
                "action_required": "Cadastro de empresa pendente. Por favor, complete o cadastro da empresa."
            }
        
        # Se tem empresa registrada
        empresa_data = user_pj.__dict__.copy()
        empresa_data.pop("_sa_instance_state", None)  # Remove estado interno do SQLAlchemy

        return {
            "message": "Login PF realizado com sucesso",
            "status": "completo",
            "user": user_data,
            "empresa": empresa_data,
            "permissions": permission_list,
            "tipo": "PF"
        }
    # Tenta freelancer
    user_freelancer = db.query(UserFreelancer).filter(UserFreelancer.email == user.email).first()
    if user_freelancer and verify_password(user.password, user_freelancer.password_user):
        # Busca permissões para o Freelancer
        permissions = db.query(PermissionsFreelas).filter(PermissionsFreelas.id_user == user_freelancer.id).all()
        permission_list = [p.permissions for p in permissions]

        # Remove a senha antes de retornar
        user_data = user_freelancer.__dict__.copy()
        user_data.pop("password_user", None)
        user_data.pop("_sa_instance_state", None)  # Remove estado interno do SQLAlchemy

        return {
            "message": "Login Freelancer realizado com sucesso",
            "status": "completo",
            "user": user_data,
            "permissions": permission_list,
            "tipo": "Freelancer"
        }
    
    # Tenta colaborador (usando BCRYPT)
    collaborator = db.query(CompanyCollaborator).filter(CompanyCollaborator.email == user.email).first()
    if collaborator:
        # Verifica se está ativo
        if not collaborator.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Colaborador inativo. Entre em contato com o administrador."
            )
        
        # Verifica senha usando BCRYPT (padrão do sistema)
        if verify_password(user.password, collaborator.password_hash):
            # Remove dados sensíveis
            collaborator_data = {
                "id": collaborator.id,
                "email": collaborator.email,
                "name": collaborator.name,
                "nome": collaborator.name,  # Alias para compatibilidade com frontend
                "company_id": collaborator.company_id,
                "company_type": collaborator.company_type,
                "is_active": collaborator.is_active,
                "created_at": collaborator.created_at.isoformat() if collaborator.created_at else None,
                "updated_at": collaborator.updated_at.isoformat() if collaborator.updated_at else None
            }
            
            return {
                "message": "Login Colaborador realizado com sucesso",
                "status": "completo",
                "user": collaborator_data,
                "permissions": collaborator.permissions,
                "tipo": "Colaborador",
                "company_id": collaborator.company_id,
                "company_type": collaborator.company_type,
                "is_collaborator": True
            }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email ou senha inválidos"
    )