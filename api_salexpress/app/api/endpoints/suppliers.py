from fastapi import APIRouter, Depends, HTTPException
from app.schemas.suppliers import *
from app.core.conn import get_db
from app.crud.user import *
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from typing import List
from app.models.permissions import PermissionsPJ, PermissionsFreelas
from app.models.photosAndDocuments import *

router = APIRouter()

@router.get("/suppliers", response_model=List[Getsuppliers])
def get_pj_by_all(db: Session = Depends(get_db)):
    response = []

    # ===== FREELANCERS - OTIMIZADO =====
    frelancers = getUserFrellancer(db=db, searchType='all')
    freelancer_list = frelancers['data']
    
    freelancer_ids = [f.id for f in freelancer_list]
    all_permissions_freelas = db.query(PermissionsFreelas).filter(
        PermissionsFreelas.id_user.in_(freelancer_ids)
    ).all() if freelancer_ids else []
    
    all_photos_freelas = db.query(PhotoPlan).filter(
        PhotoPlan.id_user.in_(freelancer_ids),
        PhotoPlan.type_user == 'freelancer'
    ).all() if freelancer_ids else []
    
    permissions_map = {}
    for perm in all_permissions_freelas:
        if perm.id_user not in permissions_map:
            permissions_map[perm.id_user] = []
        permissions_map[perm.id_user].append(perm.permissions)
    
    photos_map = {}
    for photo in all_photos_freelas:
        if photo.id_user not in photos_map:
            photos_map[photo.id_user] = photo.urlPhoto
    
    for item in freelancer_list:
        permission_list = permissions_map.get(item.id, [])
        
        plan = None
        if permission_list:
            if permission_list[0][0] == 'marketplace_all':
                plan = 'MKTFREE'
            else:
                plan = permission_list[0][0]

        data = {
            "nome": item.nome,
            "id": item.id,
            "telefone": item.telefone,
            "site": item.site_portifolio or item.linkedin,
            "servico": item.descricaoServico,
            "cidade_estado": f"{item.cidade}, {item.estado}",
            "preferencia_local": "Qualquer lugar do brasil",
            "Tipo_empresa": "Autônomo",
            "experiencia_Salexpress": "Sim",
            "email": item.email,
            "certificados": [],
            "plan": plan
        }

        if item.id in photos_map:
            data["planPhoto"] = photos_map[item.id]

        response.append(data)

    # ===== EMPRESAS PJ - OTIMIZADO =====
    pj_users = getUserPj(db=db, searchType='all')
    pj_list = pj_users['data']
    
    pj_ids = [item['pf']['id'] for item in pj_list]
    all_permissions_pj = db.query(PermissionsPJ).filter(
        PermissionsPJ.id_user.in_(pj_ids)
    ).all() if pj_ids else []
    
    all_photos_pj = db.query(PhotoPlan).filter(
        PhotoPlan.id_user.in_(pj_ids),
        PhotoPlan.type_user != 'freelancer'
    ).all() if pj_ids else []
    
    permissions_pj_map = {}
    for perm in all_permissions_pj:
        if perm.id_user not in permissions_pj_map:
            permissions_pj_map[perm.id_user] = []
        permissions_pj_map[perm.id_user].append(perm.permissions)
    
    photos_pj_map = {}
    for photo in all_photos_pj:
        if photo.id_user not in photos_pj_map:
            photos_pj_map[photo.id_user] = photo.urlPhoto
    
    for item in pj_list:
        id_user = item['pf']['id']
        permission_list = permissions_pj_map.get(id_user, [])

        plan = None
        if permission_list:
            if permission_list[0][0] == 'marketplace_all':
                plan = 'MKTFREE'
            else:
                plan = permission_list[0][0]

        data = {
            "nome": item['pj']['nome_fantasia'],
            "id": id_user,
            "telefone": item['pf']['telefone'],
            "site": item['pj']['site'],
            "servico": item['pj']['descricaoServico'],
            "cidade_estado": f"{item['pj']['cidade']}, {item['pj']['estado']}",
            "preferencia_local": "Qualquer lugar do brasil",
            "Tipo_empresa": "Empresa",
            "experiencia_Salexpress": "Sim",
            "email": item['pf']['email'],
            "certificados": [],
            "plan": plan
        }

        if id_user in photos_pj_map:
            data["planPhoto"] = photos_pj_map[id_user]

        response.append(data)

    return JSONResponse(content=response)
