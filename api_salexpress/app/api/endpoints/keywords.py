from fastapi import APIRouter, Depends, HTTPException
from app.schemas.suppliers import *
from app.core.conn import get_db
from app.crud.metrics import *
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from typing import List
from app.crud.user import *
router = APIRouter()

@router.get("/", response_model=List[str])
def get_pj_by_all(db: Session = Depends(get_db)):
    response = []
    pj = getUserPj(db=db,  searchType='all')
    frelancers = getUserFrellancer(db=db,  searchType='all')
    for item in frelancers['data']:
        response.append(
            item.descricaoServico
        )
    for item in pj['data']:
         response.append(
            item['pj']['descricaoServico']
        )

    return response


