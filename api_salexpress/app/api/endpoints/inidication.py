from fastapi import APIRouter, Depends, HTTPException
from app.schemas.requests import *
from app.core.conn import get_db
from app.crud.indications import *
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from typing import List
from typing import Union



router = APIRouter()

@router.post("/indications/", response_model=IndicationBase)
def register_indication_endpoint(
    indicationInfo: IndicationBase, 
    db: Session = Depends(get_db)
):
    try:
        return register_indication(db=db, indicationInfo=indicationInfo)
    except HTTPException:
        raise  # Re-lança exceções HTTP que já foram tratadas
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )
    

    
@router.get('/indications/', response_model=List[IndicationBase])
def get_indications_all(db: Session = Depends(get_db)):
    response = getAllIndications(db=db)
    return response

@router.put('/update/{id_indication}')
def alterIndications(id_indication: int, status: str, db: Session = Depends(get_db)):
    response = updateItem(db=db, status=status, id_indication=id_indication)
    return response