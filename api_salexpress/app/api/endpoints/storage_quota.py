from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.conn import get_db
from app.crud.storage_quota import (
    calculate_company_storage,
    calculate_user_storage_across_companies,
    get_storage_limit,
    check_storage_limit
)
from app.schemas.storage_quota import (
    CompanyStorageResponse,
    UserStorageAcrossCompaniesResponse,
    StorageLimitResponse
)

router = APIRouter()

@router.get("/company/{business_id}")
def get_company_storage_stats(
    business_id: int,
    business_type: str,
    include_deleted: bool = False,
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas de armazenamento de uma empresa
    
    Parâmetros:
    - **business_id**: ID da empresa
    - **business_type**: Tipo da empresa ('pf', 'freelancer', 'pj')
    - **include_deleted**: Se deve incluir arquivos deletados (padrão: false)
    
    Retorna:
    - Informações da empresa
    - Total de arquivos
    - Tamanho total usado
    - Breakdown por tipo de arquivo (extensão)
    
    Exemplo:
    ```
    GET /api/v1/storage-quota/company/10?business_type=pj
    ```
    """
    return calculate_company_storage(db, business_id, business_type, include_deleted)


@router.get("/user/{user_id}")
def get_user_storage_stats(
    user_id: int,
    type_user: str,
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas de armazenamento do usuário em TODAS as empresas vinculadas
    
    Parâmetros:
    - **user_id**: ID do usuário
    - **type_user**: Tipo do usuário ('pf', 'freelancer', 'pj')
    
    Retorna:
    - Total geral em todas as empresas
    - Breakdown por empresa
    - Total de arquivos
    
    Exemplo:
    ```
    GET /api/v1/storage-quota/user/22?type_user=freelancer
    ```
    """
    return calculate_user_storage_across_companies(db, user_id, type_user)


@router.get("/limit/{business_id}")
def get_company_storage_limit(
    business_id: int,
    business_type: str,
    db: Session = Depends(get_db)
):
    """
    Retorna o limite de armazenamento da empresa e quanto já foi usado
    
    Parâmetros:
    - **business_id**: ID da empresa
    - **business_type**: Tipo da empresa ('pf', 'freelancer', 'pj')
    
    Retorna:
    - Limite total do plano
    - Quanto já foi usado
    - Quanto está disponível
    - Porcentagem usada
    - Quantidade de arquivos
    
    Exemplo:
    ```
    GET /api/v1/storage-quota/limit/10?business_type=pj
    ```
    
    Resposta:
    ```json
    {
      "company": { "nome": "Empresa XYZ", ... },
      "limit": { "total": "10.00 GB", "total_bytes": 10737418240 },
      "used": { "total": "2.50 GB", "total_bytes": 2684354560, "percentage": 25.0 },
      "available": { "total": "7.50 GB", "total_bytes": 8053063680 },
      "files": 150
    }
    ```
    """
    return get_storage_limit(db, business_id, business_type)


@router.post("/check/{business_id}")
def check_upload_limit(
    business_id: int,
    business_type: str,
    file_size_bytes: int,
    db: Session = Depends(get_db)
):
    """
    Verifica se há espaço disponível para upload de um arquivo
    
    Use este endpoint ANTES de fazer upload para validar se há espaço
    
    Parâmetros:
    - **business_id**: ID da empresa
    - **business_type**: Tipo da empresa
    - **file_size_bytes**: Tamanho do arquivo em bytes
    
    Retorna:
    - 200 OK se há espaço disponível
    - 413 Payload Too Large se não há espaço
    
    Exemplo:
    ```
    POST /api/v1/storage-quota/check/10?business_type=pj&file_size_bytes=52428800
    ```
    
    Erro (413):
    ```json
    {
      "detail": {
        "error": "Limite de armazenamento excedido",
        "file_size": "50.00 MB",
        "available": "30.00 MB",
        "limit": "10.00 GB",
        "used": "9.97 GB"
      }
    }
    ```
    """
    check_storage_limit(db, business_id, business_type, file_size_bytes)
    return {
        "message": "Espaço disponível",
        "file_size_bytes": file_size_bytes,
        "can_upload": True
    }
