from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.password_reset import PasswordReset
from app.models.user import UserPF, UserPJ, UserFreelancer
from app.schemas.password_reset import PasswordResetRequest
from typing import Dict, Any, Tuple, Optional
from datetime import datetime, timedelta
import secrets
import string
from passlib.context import CryptContext

# Contexto para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def gerar_token_reset() -> str:
    """Gera um token único para reset de senha"""
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(32))

def buscar_usuario_por_email(db: Session, email: str) -> Tuple[Optional[Any], Optional[str], Optional[int]]:
    """
    Busca um usuário por email em todas as tabelas (pf, pj, freelancer)
    Retorna: (usuario, tipo_usuario, user_id) ou (None, None, None)
    """
    # Buscar em UserPF
    user_pf = db.query(UserPF).filter(UserPF.email == email).first()
    if user_pf:
        return (user_pf, "pf", user_pf.id)
    
    # Buscar em UserPJ (email está no UserPF vinculado)
    user_pj = db.query(UserPJ).join(UserPF, UserPJ.id_user_pf == UserPF.id).filter(UserPF.email == email).first()
    if user_pj:
        return (user_pj, "pj", user_pj.id)
    
    # Buscar em UserFreelancer
    user_freelancer = db.query(UserFreelancer).filter(UserFreelancer.email == email).first()
    if user_freelancer:
        return (user_freelancer, "freelancer", user_freelancer.id)
    
    return (None, None, None)

def criar_token_reset(db: Session, data: PasswordResetRequest, base_url: str = "https://api.Salexpress.com") -> Dict[str, Any]:
    """
    Cria um token de reset de senha e retorna os dados para enviar o email
    """
    # Buscar usuário por email
    usuario, tipo_usuario, user_id = buscar_usuario_por_email(db, data.email)
    
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado com este email"
        )
    
    # Verificar se já existe um token ativo (não usado e não expirado)
    token_existente = db.query(PasswordReset).filter(
        PasswordReset.email == data.email,
        PasswordReset.usado == False,
        PasswordReset.expira_em > datetime.now()
    ).first()
    
    if token_existente:
        # Retornar o token existente
        link_completo = f"{base_url}/api/v1/auth/redefinir-senha/{token_existente.token}"
        return {
            "id": token_existente.id,
            "token": token_existente.token,
            "email": token_existente.email,
            "tipo_usuario": token_existente.tipo_usuario,
            "user_id": token_existente.user_id,
            "usado": token_existente.usado,
            "expira_em": token_existente.expira_em,
            "created_at": token_existente.created_at,
            "link_completo": link_completo
        }
    
    # Gerar novo token
    token = gerar_token_reset()
    
    # Verificar se o token já existe (muito improvável)
    while db.query(PasswordReset).filter(PasswordReset.token == token).first():
        token = gerar_token_reset()
    
    # Calcular data de expiração (1 hora)
    expira_em = datetime.now() + timedelta(hours=1)
    
    # Criar registro de reset
    reset = PasswordReset(
        token=token,
        email=data.email,
        tipo_usuario=tipo_usuario,
        user_id=user_id,
        expira_em=expira_em,
        usado=False
    )
    
    db.add(reset)
    db.commit()
    db.refresh(reset)
    
    # Gerar URL completo
    link_completo = f"{base_url}/api/v1/auth/redefinir-senha/{token}"
    
    return {
        "id": reset.id,
        "token": token,
        "email": reset.email,
        "tipo_usuario": reset.tipo_usuario,
        "user_id": reset.user_id,
        "usado": reset.usado,
        "expira_em": reset.expira_em,
        "created_at": reset.created_at,
        "link_completo": link_completo
    }

def validar_token_reset(db: Session, token: str) -> PasswordReset:
    """
    Valida um token de reset de senha
    """
    reset = db.query(PasswordReset).filter(PasswordReset.token == token).first()
    
    if not reset:
        raise HTTPException(status_code=404, detail="Token de reset não encontrado")
    
    if reset.usado:
        raise HTTPException(status_code=400, detail="Este token já foi utilizado")
    
    if reset.expira_em < datetime.now():
        raise HTTPException(status_code=400, detail="Este token expirou. Solicite um novo reset de senha")
    
    return reset

def redefinir_senha(db: Session, token: str, nova_senha: str, ip_address: str = None) -> Dict[str, Any]:
    """
    Redefine a senha do usuário
    """
    # Validar token
    reset = validar_token_reset(db, token)
    
    # Hash da nova senha
    senha_hash = pwd_context.hash(nova_senha)
    
    # Atualizar senha na tabela correspondente
    if reset.tipo_usuario == "pf":
        usuario = db.query(UserPF).filter(UserPF.id == reset.user_id).first()
        if usuario:
            usuario.password_user = senha_hash
    elif reset.tipo_usuario == "pj":
        usuario = db.query(UserPJ).filter(UserPJ.id == reset.user_id).first()
        if usuario:
            usuario.password_empresa = senha_hash
    elif reset.tipo_usuario == "freelancer":
        usuario = db.query(UserFreelancer).filter(UserFreelancer.id == reset.user_id).first()
        if usuario:
            usuario.password_user = senha_hash
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Marcar token como usado
    reset.usado = True
    reset.usado_em = datetime.now()
    reset.ip_address = ip_address
    
    db.commit()
    
    return {
        "message": "Senha redefinida com sucesso",
        "email": reset.email
    }
