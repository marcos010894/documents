from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.conn import get_db
from app.schemas.collaborator import (
    CollaboratorCreate,
    CollaboratorUpdate,
    CollaboratorResponse,
    CollaboratorLogin,
    CollaboratorLoginResponse,
    CollaboratorListResponse,
    CollaboratorPermissions
)
from app.crud.collaborator import (
    create_collaborator,
    get_collaborator,
    get_collaborator_by_email,
    list_company_collaborators,
    update_collaborator,
    delete_collaborator,
    authenticate_collaborator,
    check_permission,
    get_collaborator_permissions
)

router = APIRouter()

@router.post("/", response_model=CollaboratorResponse, summary="Criar colaborador")
def create_collaborator_endpoint(
    data: CollaboratorCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo colaborador vinculado a uma empresa.
    
    **Campos obrigatórios:**
    - email: Email único para login
    - password: Senha (mínimo 6 caracteres)
    - name: Nome completo
    - company_id: ID da empresa
    - company_type: Tipo da empresa (pf/pj/freelancer)
    - permissions: Objeto com permissões
    
    **Permissões disponíveis:**
    - manage_files: Gerenciar arquivos (ver, compartilhar, deletar, editar)
    - view_metrics: Ver métricas da empresa
    - view_only: Apenas visualizar arquivos
    - manage_collaborators: Gerenciar outros colaboradores
    - view_shared: Ver apenas arquivos compartilhados
    
    **Exemplo de request:**
    ```json
    {
        "email": "colaborador@empresa.com",
        "password": "senha123",
        "name": "João Silva",
        "company_id": 21,
        "company_type": "pf",
        "permissions": {
            "manage_files": true,
            "view_metrics": true,
            "view_only": false,
            "manage_collaborators": false,
            "view_shared": false
        }
    }
    ```
    """
    return create_collaborator(db, data)


@router.post("/login", response_model=CollaboratorLoginResponse, summary="Login do colaborador")
def login_collaborator(
    credentials: CollaboratorLogin,
    db: Session = Depends(get_db)
):
    """
    Realiza login do colaborador.
    
    **Retorna:**
    - Dados do colaborador
    - Token (para futuro uso)
    - Permissões
    
    **Exemplo:**
    ```json
    {
        "email": "colaborador@empresa.com",
        "password": "senha123"
    }
    ```
    """
    collaborator = authenticate_collaborator(db, credentials.email, credentials.password)
    
    if not collaborator:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    # TODO: Gerar JWT token real
    token = f"fake-jwt-token-{collaborator.id}"
    
    return CollaboratorLoginResponse(
        collaborator=collaborator,
        token=token,
        message="Login realizado com sucesso"
    )


@router.get("/company/{company_id}", response_model=CollaboratorListResponse, summary="Listar colaboradores da empresa")
def list_collaborators_endpoint(
    company_id: int,
    company_type: str,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    Lista todos os colaboradores de uma empresa.
    
    **Query params:**
    - company_type: pf, pj ou freelancer
    - include_inactive: Se True, inclui colaboradores desativados (default: False)
    """
    collaborators = list_company_collaborators(db, company_id, company_type, include_inactive)
    
    return CollaboratorListResponse(
        company_id=company_id,
        company_type=company_type,
        total=len(collaborators),
        collaborators=collaborators
    )


@router.get("/{collaborator_id}", response_model=CollaboratorResponse, summary="Buscar colaborador por ID")
def get_collaborator_endpoint(
    collaborator_id: int,
    db: Session = Depends(get_db)
):
    """Busca um colaborador específico por ID"""
    collaborator = get_collaborator(db, collaborator_id)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    return collaborator


@router.get("/email/{email}", response_model=CollaboratorResponse, summary="Buscar colaborador por email")
def get_collaborator_by_email_endpoint(
    email: str,
    db: Session = Depends(get_db)
):
    """Busca um colaborador por email"""
    collaborator = get_collaborator_by_email(db, email)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    return collaborator


@router.put("/{collaborator_id}", response_model=CollaboratorResponse, summary="Atualizar colaborador")
def update_collaborator_endpoint(
    collaborator_id: int,
    data: CollaboratorUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza dados do colaborador.
    
    **Campos opcionais:**
    - name: Novo nome
    - password: Nova senha
    - permissions: Novas permissões
    - is_active: Ativar/desativar colaborador
    
    **Exemplo:**
    ```json
    {
        "name": "João Silva Atualizado",
        "permissions": {
            "manage_files": true,
            "view_metrics": false,
            "view_only": false,
            "manage_collaborators": true,
            "view_shared": false
        }
    }
    ```
    """
    return update_collaborator(db, collaborator_id, data)


@router.delete("/{collaborator_id}", summary="Desativar colaborador")
def delete_collaborator_endpoint(
    collaborator_id: int,
    db: Session = Depends(get_db)
):
    """
    Desativa um colaborador (soft delete).
    O colaborador não será deletado do banco, apenas marcado como inativo.
    """
    return delete_collaborator(db, collaborator_id)


@router.get("/{collaborator_id}/permissions", summary="Ver permissões do colaborador")
def get_permissions_endpoint(
    collaborator_id: int,
    db: Session = Depends(get_db)
):
    """
    Retorna todas as permissões do colaborador.
    
    **Útil para:**
    - Verificar o que o colaborador pode fazer
    - Controlar acesso no frontend
    """
    collaborator = get_collaborator(db, collaborator_id)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    permissions = get_collaborator_permissions(collaborator)
    
    return {
        "collaborator_id": collaborator_id,
        "email": collaborator.email,
        "name": collaborator.name,
        "is_active": collaborator.is_active,
        "permissions": permissions
    }


@router.post("/{collaborator_id}/check-permission", summary="Verificar permissão específica")
def check_permission_endpoint(
    collaborator_id: int,
    permission: str,
    db: Session = Depends(get_db)
):
    """
    Verifica se um colaborador tem uma permissão específica.
    
    **Permissões válidas:**
    - manage_files
    - view_metrics
    - view_only
    - manage_collaborators
    - view_shared
    
    **Exemplo:**
    ```
    POST /collaborators/1/check-permission?permission=manage_files
    ```
    
    **Resposta:**
    ```json
    {
        "collaborator_id": 1,
        "permission": "manage_files",
        "has_permission": true
    }
    ```
    """
    valid_permissions = ["manage_files", "view_metrics", "view_only", "manage_collaborators", "view_shared"]
    
    if permission not in valid_permissions:
        raise HTTPException(
            status_code=400, 
            detail=f"Permissão inválida. Use: {', '.join(valid_permissions)}"
        )
    
    collaborator = get_collaborator(db, collaborator_id)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    has_permission = check_permission(collaborator, permission)
    
    return {
        "collaborator_id": collaborator_id,
        "permission": permission,
        "has_permission": has_permission
    }
