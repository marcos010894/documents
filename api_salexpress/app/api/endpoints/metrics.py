from fastapi import APIRouter, Depends, HTTPException
from app.schemas.suppliers import *
from app.core.conn import get_db
from app.crud.metrics import *
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from typing import List
from sqlalchemy import extract, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.conn import get_db
from app.models.graphics import IndicationRegister
from datetime import datetime, date, timedelta

router = APIRouter()

# 📌 Schema para POST
class IndicationCreate(BaseModel):
    id_busness: str
    city: Optional[str] = None
    state: Optional[str] = None
    search_term: Optional[str] = None
    ip: Optional[str] = None
    typeUser: Optional[str] = None
# 📌 Schema para GET (resposta)
class IndicationGrouped(BaseModel):
    period: str
    count: int
router = APIRouter()

@router.get("/all", response_model=List[Getsuppliers])
def get_pj_by_all(db: Session = Depends(get_db)):
    frelancers = getAllMetricsFreelancers(db=db,  searchType='all')
    pj = getAllMetricsPj(db=db,  searchType='all')
    reponse = {"freela": frelancers, "pj": pj}
    return JSONResponse(reponse)




# 🔹 POST para registrar clique
@router.post("/click", status_code=201)
def create_indication_click(data: IndicationCreate, db: Session = Depends(get_db)):
    new_click = IndicationRegister(
        id_busness=data.id_busness,
        city=data.city,
        state=data.state,
        search_term=data.search_term,
        ip=data.ip,
        typeUser=data.typeUser
    )
    db.add(new_click)
    db.commit()
    db.refresh(new_click)
    return {
        "id": new_click.id,
        "created_at": new_click.created_at,
        "city": new_click.city,
        "state": new_click.state,
        "search_term": new_click.search_term,
        "ip": new_click.ip
    }



@router.get("/graphics/summary/{id_busness}/{typeUser}")
def get_indication_summary(id_busness: str, typeUser: str, db: Session = Depends(get_db)):
    today = date.today()

    # Dia
    count_day = db.query(func.count(IndicationRegister.id))\
        .filter(func.date(IndicationRegister.created_at) == today)\
        .filter(IndicationRegister.id_busness == id_busness)\
        .filter(IndicationRegister.typeUser == typeUser)\
        .scalar()

    # Semana (segunda até hoje)
    start_of_week = today - timedelta(days=today.weekday())
    count_week = db.query(func.count(IndicationRegister.id))\
        .filter(IndicationRegister.created_at >= start_of_week)\
        .filter(IndicationRegister.id_busness == id_busness)\
        .filter(IndicationRegister.typeUser == typeUser)\
        .scalar()

    # Mês
    start_of_month = today.replace(day=1)
    count_month = db.query(func.count(IndicationRegister.id))\
        .filter(IndicationRegister.created_at >= start_of_month)\
        .filter(IndicationRegister.id_busness == id_busness)\
        .filter(IndicationRegister.typeUser == typeUser)\
        .scalar()

    # Ano
    start_of_year = today.replace(month=1, day=1)
    count_year = db.query(func.count(IndicationRegister.id))\
        .filter(IndicationRegister.created_at >= start_of_year)\
        .filter(IndicationRegister.id_busness == id_busness)\
        .filter(IndicationRegister.typeUser == typeUser)\
        .scalar()

    return JSONResponse({
        "hoje": count_day,
        "semana": count_week,
        "mes": count_month,
        "ano": count_year
    })

# 🔹 GET para obter dados brutos filtrados por empresa
@router.get("/clicks/{id_busness}/{typeUser}", response_model=list[dict])
def get_business_clicks(
    id_busness: str,
    typeUser: str,
    start_date: str = None, 
    end_date: str = None,
    db: Session = Depends(get_db)
):
    # Query base filtrada pelo ID da empresa
    query = db.query(IndicationRegister).filter(
        IndicationRegister.id_busness == id_busness
    ).filter(IndicationRegister.typeUser == typeUser)
    
    # Aplicar filtros de data se fornecidos
    if start_date and end_date:
        query = query.filter(
            IndicationRegister.created_at >= start_date,
            IndicationRegister.created_at <= end_date
        )
    
    # Ordenar por data de criação (do mais recente para o mais antigo)
    query = query.order_by(IndicationRegister.created_at.desc())
    
    # Buscar todos os registros
    clicks = query.all()
    
    # Formatar resposta
    return [
        {
            "date": click.created_at.isoformat(),
            "term": click.search_term,
            "city": click.city,
            "state": click.state,
            "accesses": 1  # Cada registro representa 1 acesso
        }
        for click in clicks
    ]


# 📊 MÉTRICAS DE ARMAZENAMENTO E STATUS - REIMPLEMENTADO
from app.crud import metrics as crud_metrics
from fastapi import Query

@router.get("/storage/empresa/{company_id}")
def get_company_storage_metrics(
    company_id: int,
    tipo_usuario: str = Query(..., description="Tipo de usuário: 'pf' ou 'pj'"),
    db: Session = Depends(get_db)
):
    """
    Retorna métricas de armazenamento e status da empresa.
    Retorna erro em formato JSON se houver problema.
    """
    metrics = crud_metrics.get_company_metrics(db, company_id, tipo_usuario)
    return metrics


@router.get("/storage/usuario/{user_id}")
def get_user_storage_metrics(
    user_id: int,
    tipo_usuario: str = Query(..., description="Tipo de usuário: 'pf' ou 'pj'"),
    db: Session = Depends(get_db)
):
    """
    Retorna métricas de armazenamento e status do usuário.
    Retorna erro em formato JSON se houver problema.
    """
    metrics = crud_metrics.get_user_metrics(db, user_id, tipo_usuario)
    return metrics


@router.get("/storage/colaborador/{collaborator_id}")
def get_collaborator_storage_metrics(
    collaborator_id: int,
    db: Session = Depends(get_db)
):
    """
    Retorna métricas de armazenamento da EMPRESA do colaborador.
    
    **IMPORTANTE:** Colaborador vê métricas da empresa, não dele próprio!
    
    Verifica:
    1. Se colaborador existe e está ativo
    2. Se tem permissão 'view_metrics'
    3. Retorna métricas da empresa vinculada
    """
    from app.crud.collaborator import get_collaborator, check_permission
    
    # Buscar colaborador
    collaborator = get_collaborator(db, collaborator_id)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    if not collaborator.is_active:
        raise HTTPException(status_code=403, detail="Colaborador inativo")
    
    # Verificar permissão
    if not check_permission(collaborator, "view_metrics"):
        raise HTTPException(
            status_code=403, 
            detail="Colaborador não tem permissão para ver métricas"
        )
    
    # Retornar métricas DA EMPRESA (não do colaborador)
    metrics = crud_metrics.get_company_metrics(
        db, 
        collaborator.company_id, 
        collaborator.company_type
    )
    
    # Adicionar informação de que é colaborador visualizando
    metrics["visualizado_por"] = {
        "tipo": "colaborador",
        "id": collaborator_id,
        "email": collaborator.email,
        "nome": collaborator.name
    }
    
    return metrics