from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.storage import StorageNode
from app.models.user import UserPJ, UserPF, UserFreelancer
from typing import Dict, Any, Optional
from fastapi import HTTPException

def parse_size_to_bytes(size_str: Optional[str]) -> int:
    """
    Converte string de tamanho (ex: "1.5 MB", "500 KB") para bytes
    
    Args:
        size_str: String no formato "123 MB", "1.5 GB", etc.
        
    Returns:
        Tamanho em bytes
    """
    if not size_str:
        return 0
    
    size_str = size_str.strip().upper()
    
    # Extrair número e unidade
    parts = size_str.split()
    if len(parts) != 2:
        # Tentar formato sem espaço (ex: "1.5MB")
        import re
        match = re.match(r'([\d.]+)\s*([KMGT]?B)', size_str)
        if not match:
            return 0
        number = float(match.group(1))
        unit = match.group(2)
    else:
        number = float(parts[0])
        unit = parts[1]
    
    # Converter para bytes
    multipliers = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 ** 2,
        'GB': 1024 ** 3,
        'TB': 1024 ** 4,
    }
    
    return int(number * multipliers.get(unit, 1))


def bytes_to_human_readable(bytes_size: int) -> str:
    """
    Converte bytes para formato legível (ex: "1.5 GB")
    
    Args:
        bytes_size: Tamanho em bytes
        
    Returns:
        String formatada (ex: "1.5 GB")
    """
    if bytes_size == 0:
        return "0 B"
    
    units = ['B', 'KB', 'MB', 'GB', 'TB']
    unit_index = 0
    size = float(bytes_size)
    
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1
    
    return f"{size:.2f} {units[unit_index]}"


def calculate_company_storage(
    db: Session, 
    business_id: int, 
    business_type: str,
    include_deleted: bool = False
) -> Dict[str, Any]:
    """
    Calcula o armazenamento total usado por uma empresa
    
    Args:
        db: Sessão do banco de dados
        business_id: ID da empresa (company_id na tabela)
        business_type: Tipo da empresa ('pf', 'freelancer', 'pj')
        include_deleted: Se deve incluir arquivos deletados no cálculo
        
    Returns:
        Dict com estatísticas de armazenamento
    """
    # Query base - USAR company_id ao invés de business_id
    query = db.query(StorageNode).filter(
        and_(
            StorageNode.company_id == business_id,  # ✅ Mudou de business_id para company_id
            StorageNode.type == 'file'  # Apenas arquivos, não pastas
        )
    )
    
    # Filtrar deletados se necessário
    if not include_deleted:
        query = query.filter(StorageNode.deleted_at.is_(None))
    
    # Buscar todos os arquivos
    files = query.all()
    
    # Calcular totais
    total_files = len(files)
    total_bytes = sum(parse_size_to_bytes(file.size) for file in files)
    
    # Contar por extensão
    by_extension = {}
    for file in files:
        ext = file.extension or 'sem extensão'
        if ext not in by_extension:
            by_extension[ext] = {'count': 0, 'bytes': 0}
        by_extension[ext]['count'] += 1
        by_extension[ext]['bytes'] += parse_size_to_bytes(file.size)
    
    # Formatar por extensão
    by_extension_formatted = {
        ext: {
            'count': data['count'],
            'size': bytes_to_human_readable(data['bytes']),
            'bytes': data['bytes']
        }
        for ext, data in by_extension.items()
    }
    
    # Buscar informações da empresa
    company_info = get_company_info(db, business_id, business_type)
    
    return {
        'company': company_info,
        'storage': {
            'total_files': total_files,
            'total_size': bytes_to_human_readable(total_bytes),
            'total_bytes': total_bytes,
            'by_extension': by_extension_formatted
        }
    }


def calculate_user_storage_across_companies(
    db: Session,
    user_id: int,
    type_user: str
) -> Dict[str, Any]:
    """
    Calcula o armazenamento do usuário em TODAS as empresas vinculadas
    
    Args:
        db: Sessão do banco de dados
        user_id: ID do usuário
        type_user: Tipo do usuário ('pf', 'freelancer', 'pj')
        
    Returns:
        Dict com storage por empresa e total geral
    """
    from app.crud.user_business_link import get_user_companies
    
    # Buscar empresas do usuário
    companies = get_user_companies(db, user_id, type_user)
    
    storage_by_company = []
    total_bytes_all_companies = 0
    total_files_all_companies = 0
    
    for company in companies:
        storage_data = calculate_company_storage(
            db, 
            company['business_id'], 
            company['business_type']
        )
        
        storage_by_company.append({
            'company_name': company.get('nome_exibicao', 'Sem nome'),
            'business_id': company['business_id'],
            'business_type': company['business_type'],
            'storage': storage_data['storage']
        })
        
        total_bytes_all_companies += storage_data['storage']['total_bytes']
        total_files_all_companies += storage_data['storage']['total_files']
    
    return {
        'user': {
            'user_id': user_id,
            'type_user': type_user,
            'total_companies': len(companies)
        },
        'total_across_companies': {
            'total_files': total_files_all_companies,
            'total_size': bytes_to_human_readable(total_bytes_all_companies),
            'total_bytes': total_bytes_all_companies
        },
        'by_company': storage_by_company
    }


def get_company_info(db: Session, business_id: int, business_type: str) -> Dict[str, Any]:
    """
    Busca informações da empresa
    
    Args:
        db: Sessão do banco de dados
        business_id: ID da empresa
        business_type: Tipo da empresa
        
    Returns:
        Dict com informações da empresa
    """
    if business_type == "pj":
        company = db.query(UserPJ).filter(UserPJ.id == business_id).first()
        if company:
            return {
                'business_id': business_id,
                'business_type': business_type,
                'nome': company.nome_fantasia or company.razao_social,
                'cnpj': company.cnpj,
                'cidade': company.cidade,
                'estado': company.estado
            }
    elif business_type == "freelancer":
        freelancer = db.query(UserFreelancer).filter(UserFreelancer.id == business_id).first()
        if freelancer:
            return {
                'business_id': business_id,
                'business_type': business_type,
                'nome': freelancer.nome,
                'email': freelancer.email,
                'cidade': freelancer.cidade,
                'estado': freelancer.estado
            }
    elif business_type == "pf":
        pf = db.query(UserPF).filter(UserPF.id == business_id).first()
        if pf:
            return {
                'business_id': business_id,
                'business_type': business_type,
                'nome': pf.nome,
                'email': pf.email,
                'cidade': pf.cidade,
                'estado': pf.estado
            }
    
    return {
        'business_id': business_id,
        'business_type': business_type,
        'nome': 'Empresa não encontrada'
    }


def get_storage_limit(db: Session, business_id: int, business_type: str) -> Dict[str, Any]:
    """
    Retorna o limite de armazenamento da empresa baseado no plano
    
    Args:
        db: Sessão do banco de dados
        business_id: ID da empresa
        business_type: Tipo da empresa
        
    Returns:
        Dict com limite e uso atual
    """
    # Calcular uso atual
    storage_data = calculate_company_storage(db, business_id, business_type)
    
    # TODO: Buscar limite do plano da empresa na tabela de assinaturas
    # Por enquanto, usar limite padrão
    limit_bytes = 10 * 1024 ** 3  # 10 GB padrão
    
    used_bytes = storage_data['storage']['total_bytes']
    percentage_used = (used_bytes / limit_bytes) * 100 if limit_bytes > 0 else 0
    available_bytes = max(0, limit_bytes - used_bytes)
    
    return {
        'company': storage_data['company'],
        'limit': {
            'total': bytes_to_human_readable(limit_bytes),
            'total_bytes': limit_bytes
        },
        'used': {
            'total': bytes_to_human_readable(used_bytes),
            'total_bytes': used_bytes,
            'percentage': round(percentage_used, 2)
        },
        'available': {
            'total': bytes_to_human_readable(available_bytes),
            'total_bytes': available_bytes
        },
        'files': storage_data['storage']['total_files']
    }


def check_storage_limit(
    db: Session,
    business_id: int,
    business_type: str,
    file_size_bytes: int
) -> bool:
    """
    Verifica se há espaço disponível para upload de arquivo
    
    Args:
        db: Sessão do banco de dados
        business_id: ID da empresa
        business_type: Tipo da empresa
        file_size_bytes: Tamanho do arquivo a ser enviado (em bytes)
        
    Returns:
        True se há espaço, False caso contrário
        
    Raises:
        HTTPException: Se não houver espaço disponível
    """
    storage_info = get_storage_limit(db, business_id, business_type)
    
    available_bytes = storage_info['available']['total_bytes']
    
    if file_size_bytes > available_bytes:
        raise HTTPException(
            status_code=413,  # Payload Too Large
            detail={
                'error': 'Limite de armazenamento excedido',
                'file_size': bytes_to_human_readable(file_size_bytes),
                'available': storage_info['available']['total'],
                'limit': storage_info['limit']['total'],
                'used': storage_info['used']['total']
            }
        )
    
    return True
