from sqlalchemy.orm import Session
from app.models.user import UserPF, UserPJ, UserFreelancer, GetUserFreelancermetrics, GetUserPJMetrics
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models import UserPF, UserPJ, UserFreelancer
from app.schemas.user import  UserPFBase, UserPJBase, UserFreelancerBase,GetUserFreelancerBase
from fastapi.encoders import jsonable_encoder
from app.utils.security import *
from math import ceil
from datetime import datetime
from sqlalchemy import extract

    

def getAllMetricsFreelancers(db: Session, freelancer_id = 0, searchType = str, skip=0, limit=0):

    total_usersAno = db.query(GetUserFreelancermetrics).count()
    agora = datetime.now()
    mes_atual = agora.month
    ano_atual = agora.year

    total_usersMes = (
        db.query(GetUserFreelancermetrics)
        .filter(
            extract('month', GetUserFreelancermetrics.created_at) == mes_atual,
            extract('year', GetUserFreelancermetrics.created_at) == ano_atual
        )
        .count()
    )
    return {"mes": total_usersMes, "ano": total_usersAno}
    


def getAllMetricsPj(db: Session, freelancer_id = 0, searchType = str, skip=0, limit=0):

    total_usersAno = db.query(GetUserPJMetrics).count()
    agora = datetime.now()
    mes_atual = agora.month
    ano_atual = agora.year

    total_usersMes = (
        db.query(GetUserPJMetrics)
        .filter(
            extract('month', GetUserFreelancermetrics.created_at) == mes_atual,
            extract('year', GetUserFreelancermetrics.created_at) == ano_atual
        )
        .count()
    )
    return {"mes": total_usersMes, "ano": total_usersAno}


# 📊 MÉTRICAS DE ARMAZENAMENTO E STATUS - REIMPLEMENTADO
from sqlalchemy import text
import random

def _get_random_color():
    """Gera uma cor hexadecimal aleatória"""
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

def _get_status_color(status_name: str, used_colors: set):
    """Retorna uma cor para o status (predefinida ou aleatória)"""
    st_lower = status_name.lower()
    
    # Cores predefinidas para status comuns
    predefined = {
        'vencido': "#ff0000",
        'vencidos': "#ff0000",
        'atrasado': "#ff0000",
        'pendente': "#ffa500",
        'pendentes': "#ffa500",
        'aguardando': "#ffa500",
        'aprovado': "#00ff00",
        'aprovados': "#00ff00",
        'concluido': "#00ff00",
        'concluído': "#00ff00",
        'em análise': "#0000ff",
        'em andamento': "#0000ff",
        'analise': "#0000ff",
        'andamento': "#0000ff",
        'sem status': "#cccccc",
        'cancelado': "#ff00ff",
        'rejeitado': "#8b0000"
    }
    
    # Verificar se tem cor predefinida
    for key, color in predefined.items():
        if key in st_lower:
            return color
    
    # Gerar cor aleatória única
    color = _get_random_color()
    while color in used_colors:
        color = _get_random_color()
    used_colors.add(color)
    return color


def _parse_size(size_str: str) -> int:
    """Converte string de tamanho (ex: '1.5 MB') para bytes"""
    if not size_str:
        return 0
    
    # Se for apenas dígitos, converte direto
    if size_str.isdigit():
        return int(size_str)
        
    try:
        parts = size_str.split(' ')
        if len(parts) < 2:
            # Tenta converter o que der
             return int(float(size_str))
             
        value = float(parts[0])
        unit = parts[1].upper()
        
        multipliers = {
            'B': 1,
            'KB': 1024,
            'MB': 1024**2,
            'GB': 1024**3,
            'TB': 1024**4,
            'PB': 1024**5
        }
        
        return int(value * multipliers.get(unit, 1))
    except Exception:
        return 0

def get_company_metrics(db: Session, company_id: int, tipo_usuario: str):
    """Retorna métricas da empresa"""
    try:
        # 1. ARMAZENAMENTO - buscar tamanhos
        sizes_result = db.execute(text(
            "SELECT size FROM storage_nodes WHERE company_id = :cid AND type = 'file'"
        ), {"cid": company_id}).fetchall()
        
        total_bytes = sum(_parse_size(row[0]) for row in sizes_result if row[0])
        total_mb = round(total_bytes / (1024 * 1024), 2)
        total_gb = round(total_bytes / (1024 * 1024 * 1024), 2)
        
        # 2. CONTAGENS
        files_count = db.execute(text(
            "SELECT COUNT(*) FROM storage_nodes WHERE company_id = :cid AND type = 'file'"
        ), {"cid": company_id}).scalar() or 0
        
        folders_count = db.execute(text(
            "SELECT COUNT(*) FROM storage_nodes WHERE company_id = :cid AND type = 'folder'"
        ), {"cid": company_id}).scalar() or 0
        
        # 3. STATUS - Pegar TODOS os arquivos e contar status
        all_files = db.execute(text(
            "SELECT status FROM storage_nodes WHERE company_id = :cid AND type = 'file'"
        ), {"cid": company_id}).fetchall()
        
        # Contar manualmente status iguais
        status_dict = {}
        for row in all_files:
            st = row[0] if row[0] and row[0].strip() else "Sem Status"
            status_dict[st] = status_dict.get(st, 0) + 1
        
        # Montar array de status
        status_counts = []
        used_colors = set()
        
        for st_name, total in sorted(status_dict.items(), key=lambda x: x[1], reverse=True):
            color = _get_status_color(st_name, used_colors)
            
            status_counts.append({
                "status_name": st_name,
                "status_color": color,
                "total": total
            })
        
        return {
            "armazenamento": {
                "total_bytes": total_bytes,
                "total_mb": total_mb,
                "total_gb": total_gb
            },
            "totais": {
                "arquivos": files_count,
                "pastas": folders_count,
                "total": files_count + folders_count
            },
            "status": status_counts
        }
    except Exception as e:
        return {
            "error": str(e),
            "armazenamento": {"total_bytes": 0, "total_mb": 0, "total_gb": 0},
            "totais": {"arquivos": 0, "pastas": 0, "total": 0},
            "status": []
        }


def get_user_metrics(db: Session, user_id: int, tipo_usuario: str):
    """Retorna métricas do usuário"""
    try:
        # 1. ARMAZENAMENTO
        sizes_result = db.execute(text(
            "SELECT size FROM storage_nodes WHERE business_id = :uid AND type_user = :tu AND type = 'file'"
        ), {"uid": user_id, "tu": tipo_usuario}).fetchall()
        
        total_bytes = sum(_parse_size(row[0]) for row in sizes_result if row[0])
        total_mb = round(total_bytes / (1024 * 1024), 2)
        total_gb = round(total_bytes / (1024 * 1024 * 1024), 2)
        
        # 2. CONTAGENS
        files_count = db.execute(text(
            "SELECT COUNT(*) FROM storage_nodes WHERE business_id = :uid AND type_user = :tu AND type = 'file'"
        ), {"uid": user_id, "tu": tipo_usuario}).scalar() or 0
        
        folders_count = db.execute(text(
            "SELECT COUNT(*) FROM storage_nodes WHERE business_id = :uid AND type_user = :tu AND type = 'folder'"
        ), {"uid": user_id, "tu": tipo_usuario}).scalar() or 0
        
        # 3. STATUS - Pegar TODOS os arquivos e contar status
        all_files = db.execute(text(
            "SELECT status FROM storage_nodes WHERE business_id = :uid AND type_user = :tu AND type = 'file'"
        ), {"uid": user_id, "tu": tipo_usuario}).fetchall()
        
        # Contar manualmente status iguais
        status_dict = {}
        for row in all_files:
            st = row[0] if row[0] and row[0].strip() else "Sem Status"
            status_dict[st] = status_dict.get(st, 0) + 1
        
        # Montar array de status
        status_counts = []
        used_colors = set()
        
        for st_name, total in sorted(status_dict.items(), key=lambda x: x[1], reverse=True):
            color = _get_status_color(st_name, used_colors)
            
            status_counts.append({
                "status_name": st_name,
                "status_color": color,
                "total": total
            })
        
        return {
            "armazenamento": {
                "total_bytes": total_bytes,
                "total_mb": total_mb,
                "total_gb": total_gb
            },
            "totais": {
                "arquivos": files_count,
                "pastas": folders_count,
                "total": files_count + folders_count
            },
            "status": status_counts
        }
    except Exception as e:
        return {
            "error": str(e),
            "armazenamento": {"total_bytes": 0, "total_mb": 0, "total_gb": 0},
            "totais": {"arquivos": 0, "pastas": 0, "total": 0},
            "status": []
        }
