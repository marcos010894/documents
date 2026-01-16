from sqlalchemy.orm import Session
from app.models.requests import  IndicationRegister
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.schemas.requests import *
def register_indication(db: Session, indicationInfo: IndicationBase):
    try:
        # Cria e salva a indicação
        indication = IndicationRegister(**indicationInfo.dict())
        db.add(indication)
        db.commit()
        db.refresh(indication)
        
        # Retorna o objeto salvo (não um dicionário)
        return indication
    
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,  # 400 é mais adequado para erros de validação
            detail="esse e-mail ja foi indicado" if "email_indicado" in str(e) else "Dados inválidos"
        )


def getAllIndications(db: Session):
    indications = db.query(IndicationRegister).all()

    if indications:
        db.commit()
        return indications

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Nenhuma indicação encontrada."
    )

def updateItem(db: Session, status: str, id_indication: int):
    indications = db.query(IndicationRegister).filter(IndicationRegister.id == id_indication).first()
    if indications:
        indications.status = status
        db.commit()
        return
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Nenhuma indicação encontrada."
    )