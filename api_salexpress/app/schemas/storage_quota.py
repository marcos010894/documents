from pydantic import BaseModel
from typing import Dict, Any, List

class StorageByExtension(BaseModel):
    """Armazenamento por tipo de arquivo"""
    count: int
    size: str
    bytes: int


class StorageStats(BaseModel):
    """Estatísticas de armazenamento"""
    total_files: int
    total_size: str
    total_bytes: int
    by_extension: Dict[str, StorageByExtension]


class CompanyStorageResponse(BaseModel):
    """Resposta de armazenamento de uma empresa"""
    company: Dict[str, Any]
    storage: Dict[str, Any]


class UserStorageAcrossCompaniesResponse(BaseModel):
    """Resposta de armazenamento do usuário em todas as empresas"""
    user: Dict[str, Any]
    total_across_companies: Dict[str, Any]
    by_company: List[Dict[str, Any]]


class StorageLimitResponse(BaseModel):
    """Resposta de limite de armazenamento"""
    company: Dict[str, Any]
    limit: Dict[str, Any]
    used: Dict[str, Any]
    available: Dict[str, Any]
    files: int
