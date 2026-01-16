from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import UserPFBase, UserPJBase, GetUserPF, GetUserPJ, PermissionsRequest, UserFreelancerBase, GetUserFreelancerBase
from pydantic import BaseModel
from app.core.conn import get_db
from app.crud.user import *
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse






router = APIRouter()

@router.post("/add-permissions/")
def add_permissions(request: PermissionsRequest, db: Session = Depends(get_db)):
    response = add_permissions_to_user(db=db, user_id=request.user_id, permissions=request.permissions, user_type=request.user_type)
    return JSONResponse(response)

# Remove permissões específicas do usuário
@router.delete("/remove-permissions/")
def remove_permissions(request: PermissionsRequest, db: Session = Depends(get_db)):
    response = remove_permissions_from_user(db=db, user_id=request.user_id, permissions=request.permissions, user_type=request.user_type)
    return JSONResponse(response)





@router.post("/create-users-pf/", response_model=UserPFBase)
def create_user_pf_router(user: UserPFBase, db: Session = Depends(get_db)):
    try:
        response = create_user_pf(db=db, user=user)
        return JSONResponse(response, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/create-users-pj/", response_model=UserPJBase)
def create_user_pj_router(user: UserPJBase, db: Session = Depends(get_db)):
    try:
        response = create_user_pj(db=db, user=user)
        return JSONResponse(response, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-users-freelancer/", response_model=UserFreelancerBase)
def create_user_freelancer_router(user: UserFreelancerBase, db: Session = Depends(get_db)):
    response = create_user_freelancer(db=db, user=user)
    return JSONResponse(response)

@router.get("/freelancers/{freelancer_id}")
def get_freelancer_by_id(freelancer_id: int, db: Session = Depends(get_db)):
    response = getUserFrellancer(db=db, freelancer_id=freelancer_id, searchType='unic', skip=0, limit=0)
    return response


@router.get("/frelancers") #response_model=List[GetUserFreelancerBase]
def get_freelancer_by_all(skip: int = 0, limit: int = 0, db: Session = Depends(get_db)):
    response = getUserFrellancer(db=db, searchType='all', skip=skip, limit=limit)
    return response



@router.get("/pj")
def get_pj_by_all(skip: int = 0, limit: int = 0,db: Session = Depends(get_db)):
    response = getUserPj(db=db,  searchType='all', skip=skip, limit=limit)
    return JSONResponse(response)


@router.get("/pj/{id_user}")
def get_pj_by_unic(id_user: int,db: Session = Depends(get_db)):
    response = getUserPj(db=db, id_user=id_user,  searchType='unic', skip=0, limit=0)
    return JSONResponse(response)



@router.put("/edit-user-pf/{user_id}")
def update_user_pf(user_id: int, user: UserPFBase, db: Session = Depends(get_db)):
    response = edit_user_pf(db=db, user_id=user_id, user_data=user)
    return JSONResponse(response)


@router.put("/edit-user-pj/{user_id}")
def update_user_pj(user_id: int, user: UserPJBase, db: Session = Depends(get_db)):
    response = edit_user_pj(db=db, user_id=user_id, user_data=user)
    return JSONResponse(response)


@router.put("/edit-user-freelancer/{user_id}")
def update_user_freelancer(user_id: int, user: UserFreelancerBase, db: Session = Depends(get_db)):
    response = edit_user_freelancer(db=db, user_id=user_id, user_data=user)
    return JSONResponse(response)


@router.delete("/delete-user-freelancer/{user_id}")
def remove_user_freelancer(user_id: int, db: Session = Depends(get_db)):
    response = delete_user_freelancer(db=db, user_id=user_id)
    return JSONResponse(response)


@router.delete("/delete-user-pj/{user_id}")
def remove_user_pj(user_id: int, db: Session = Depends(get_db)):
    response = delete_user_pj(db=db, user_id=user_id)
    return JSONResponse(response)


@router.delete("/delete-user-pf/{user_id}")
def remove_user_pf(user_id: int, db: Session = Depends(get_db)):
    response = delete_user_pf(db=db, user_id=user_id)
    return JSONResponse(response)
