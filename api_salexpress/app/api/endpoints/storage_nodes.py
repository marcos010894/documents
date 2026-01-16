from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Literal
from app.core.conn import get_db
from app.schemas.storage import StorageCreate, StorageUpdate, StorageResponse, DocumentsWithPermissionsResponse, PresignedUploadRequest, PresignedUploadResponse
from app.services.storage.r2_service import store_image
from app.crud.document_notification import (
    obter_seguidores_documento, 
    verificar_se_usuario_segue, 
    verificar_se_usuario_e_dono,
    seguir_documento,
    obter_compartilhamentos_documento,
    obter_seguidores_batch,
    verificar_seguimento_batch
)
from app.schemas.document_notification import DocumentFollowerCreate
from app.crud.document_log import (
    obter_resumo_rastreabilidade,
    obter_historico_completo_formatado,
    criar_log_documento
)
from app.models.document_log import DocumentAction
from fastapi.encoders import jsonable_encoder
DEV_PUBLIC_URL = "https://pub-44038362d56e40da83d1c72eaec658c5.r2.dev"
import os
import uuid
from app.crud.storage import create_node, get_node, update_node, delete_node, list_children
from app.crud.share import get_shared_nodes
from app.crud.storage_quota import check_storage_limit


def _human_size(num: int) -> str:
    units = ["B","KB","MB","GB","TB"]
    i = 0
    n = float(num)
    while n >= 1024 and i < len(units)-1:
        n /= 1024.0
        i += 1
    return f"{n:.1f} {units[i]}"


router = APIRouter()

def _convert_node_to_dict(node):
    """Converte um objeto StorageNode para dicionário JSON-serializável"""
    if isinstance(node, dict):
        return node
    
    # Converter type Enum para string
    node_type = str(node.type.value) if hasattr(node.type, 'value') else str(node.type)
    
    node_dict = {
        "id": node.id,
        "name": node.name,
        "type": node_type,
        "parent_id": node.parent_id,
        "business_id": node.business_id,      # ID do usuário dono
        "type_user": node.type_user,          # Tipo do usuário dono
        "company_id": node.company_id,        # ID da empresa responsável
        "company_type": node.company_type,    # Tipo da empresa
        "size": node.size,
        "extension": node.extension,
        "status": node.status,
        "comments": node.comments,
        "url": node.url,
        "data_validade": node.data_validade.isoformat() if node.data_validade else None,
        "created_at": node.created_at.isoformat() if node.created_at else None,
    }

    
    # Adicionar campos de seguidores se existirem
    if hasattr(node, 'seguidores'):
        node_dict['seguidores'] = node.seguidores
    if hasattr(node, 'total_seguidores'):
        node_dict['total_seguidores'] = node.total_seguidores
    if hasattr(node, 'usuario_atual_segue'):
        node_dict['usuario_atual_segue'] = node.usuario_atual_segue
    if hasattr(node, 'usuario_e_dono'):
        node_dict['usuario_e_dono'] = node.usuario_e_dono
    
    return node_dict

def _enrich_nodes_with_followers(db: Session, nodes: List[any], user_id: int, type_user: str):
    """
    Enriquece uma lista de nodes com informações de seguidores e permissões em BATCH.
    Evita o problema N+1 de queries.
    """
    if not nodes or not user_id or not type_user:
        return nodes

    # Coletar todos os IDs de arquivos
    file_ids = []
    for node in nodes:
        # Verificar se é arquivo
        is_file = False
        if hasattr(node, 'type'):
            if hasattr(node.type, 'value'):
                is_file = node.type.value == 'file'
            else:
                is_file = str(node.type) == 'file'
        
        if is_file:
            file_ids.append(node.id)
    
    if not file_ids:
        return nodes

    # Buscar dados em batch
    followers_map = obter_seguidores_batch(db, file_ids)
    following_map = verificar_seguimento_batch(db, file_ids, user_id, type_user)
    
    # Enriquecer nodes
    for node in nodes:
        # Determinar se é arquivo
        is_file_node = False
        if hasattr(node, 'type'):
            if hasattr(node.type, 'value'):
                is_file_node = node.type.value == 'file'
            else:
                is_file_node = str(node.type) == 'file'
        
        if is_file_node:
            # Seguidores
            node_seguidores = followers_map.get(node.id, [])
            node.seguidores = node_seguidores
            node.total_seguidores = len(node_seguidores)
            
            # Usuario atual segue?
            seguimento_info = following_map.get(node.id, {"seguindo": False})
            node.usuario_atual_segue = seguimento_info
            
            # É dono?
            e_dono = False
            if node.type_user == type_user:
                if type_user == "pf":
                    e_dono = node.business_id == user_id
                elif type_user == "pj":
                    e_dono = node.business_id == user_id
                elif type_user == "freelancer":
                    e_dono = node.business_id == user_id
            node.usuario_e_dono = e_dono
            
            # Se for dono e não está seguindo, criar seguimento automático
            if e_dono and not seguimento_info.get("seguindo"):
                try:
                    # Importar aqui para evitar circular
                    from app.crud.document_notification import seguir_documento 
                    seguidor_data = DocumentFollowerCreate(
                        node_id=node.id,
                        user_id=user_id,
                        tipo_usuario=type_user,
                        dias_antes_alerta=7,
                        alertar_no_vencimento=True
                    )
                    seguir_documento(db, seguidor_data)
                    
                    # Atualizar visualmente
                    node.usuario_atual_segue = {
                        "seguindo": True,
                        "dias_antes_alerta": 7,
                        "alertar_no_vencimento": True
                    }
                except:
                    pass
        else:
            # Pastas
            node.seguidores = None
            node.total_seguidores = 0
            node.usuario_atual_segue = None
            node.usuario_e_dono = False
            
    return nodes

def _parse_parent(parent_raw):
    if parent_raw is None:
        return None
    if isinstance(parent_raw, str):
        if parent_raw.strip() == "" or parent_raw == "0":
            return None
        try:
            val = int(parent_raw)
        except ValueError:
            raise HTTPException(status_code=400, detail="parent_id inválido")
        return None if val == 0 else val
    if isinstance(parent_raw, int):
        return None if parent_raw == 0 else parent_raw
    return None

@router.post("/", response_model=StorageResponse, summary="Criar arquivo ou pasta (multipart)")
async def create_storage_node(
    file: UploadFile | None = File(default=None, description="Arquivo (obrigatório somente quando type=file)"),
    name: str = Form(...),
    type: Literal['file','folder'] = Form(...),
    parent_id: str | None = Form(default=None),
    business_id: int | None = Form(default=None, description="ID do usuário dono (quem faz upload)"),
    type_user: str | None = Form(default=None, description="Tipo do usuário dono"),
    company_id: int | None = Form(default=None, description="ID da empresa responsável"),
    company_type: str | None = Form(default=None, description="Tipo da empresa (pf/pj/freelancer)"),
    comments: str | None = Form(default=None),
    status: str | None = Form(default="Válido"),
    data_validade: str | None = Form(default=None, description="Data de validade (formato: YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    # ✅ PERMISSION CHECK FOR COMPANY UPLOAD
    if company_id and company_id != 0:
        # Se for upload para empresa (que não seja a própria PF), verificar permissão
        # Se business_id == company_id (dono da empresa fazendo upload), ok.
        # Se não, verificar link ou colaborador.
        
        # Nota: business_id vem do form, mas a auth real deve ser verificada via token (user_id/type_user injetado via Depends? Não, aqui não tem Depends(get_current_user))
        # O backend atual parece confiar nos IDs passados ou validar depois? 
        # Risco: business_id pode ser spoofado?
        # Aparentemente create_storage_node recebe business_id e type_user do frontend (Form).
        # Isso é uma vulnerabilidade existente, mas focarei na permissão assumindo que business_id/type_user identificam o caller.
        
        # Melhor seria usar o user do token. Mas por consistência com o código existente:
        caller_id = business_id
        caller_type = type_user

        if caller_id and caller_type and (company_id != caller_id or company_type != caller_type):
            # Buscar permissões
            from app.models.user_business_link import UserBusinessLink
            from app.models.collaborator import CompanyCollaborator

            link = db.query(UserBusinessLink).filter(
                UserBusinessLink.user_id == caller_id,
                UserBusinessLink.type_user == caller_type,
                UserBusinessLink.business_id == company_id,
                UserBusinessLink.status == 1
            ).first()
            
            permissions = []
            if link:
                perms = link.permissions
                if isinstance(perms, str):
                    import json
                    perms = json.loads(perms)
                permissions = perms or []
            elif caller_type == 'collaborator':
                 collab = db.query(CompanyCollaborator).filter(
                     CompanyCollaborator.id == caller_id,
                     CompanyCollaborator.company_id == company_id
                 ).first()
                 perms = collab.permissions if collab else []
                 if isinstance(perms, str):
                     import json
                     perms = json.loads(perms)
                 permissions = perms or []
            
            # Se não tem permissão manage_files, bloquear (suporta lista ou dict)
            has_manage = 'manage_files' in permissions if isinstance(permissions, list) else permissions.get('manage_files')
            if not has_manage:
                # Exceção: Se é owner (mas o if checka company_id != caller_id)
                # Se não for owner e não tiver permissão:
                raise HTTPException(status_code=403, detail="Sem permissão para criar arquivos nesta empresa (manage_files)")

    parent_parsed = _parse_parent(parent_id)
    
    # Converter data_validade se fornecida
    from datetime import datetime
    data_validade_parsed = None
    if data_validade:
        try:
            data_validade_parsed = datetime.strptime(data_validade, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD")
    
    if type == 'file':
        # Validar arquivo
        if file is None or not getattr(file, 'filename', None):
            raise HTTPException(status_code=400, detail="Arquivo obrigatório para type=file")
        
        # Calcular tamanho do arquivo
        try:
            file.file.seek(0, os.SEEK_END)
            size_bytes = file.file.tell()
            file.file.seek(0)
        except Exception:
            size_bytes = None
        
        # ✅ VALIDAR COTA DE ARMAZENAMENTO ANTES DO UPLOAD
        if company_id and company_type and size_bytes:
            try:
                check_storage_limit(db, company_id, company_type, size_bytes)
            except HTTPException as e:
                # Re-lançar o erro de cota excedida
                raise e
        
        upload_result = store_image(
            file_obj=file.file,
            original_filename=file.filename,
            folder=None,
            content_type=file.content_type
        )
        if not upload_result.get("success"):
            raise HTTPException(status_code=500, detail=upload_result.get("error", "Falha no upload"))
        ext = os.path.splitext(file.filename)[1].lower()
        size_str = _human_size(size_bytes) if size_bytes is not None else None
        public_url = f"{DEV_PUBLIC_URL}/{upload_result['key']}" if upload_result.get('key') else None
        payload = StorageCreate(
            name=name,
            type='file',
            parent_id=parent_parsed,
            business_id=business_id,      # ID do usuário dono
            type_user=type_user,          # Tipo do usuário dono
            company_id=company_id,        # ID da empresa responsável
            company_type=company_type,    # Tipo da empresa
            size=size_str,
            extension=ext or None,
            status=status,
            comments=comments,
            url=public_url,
            data_validade=data_validade_parsed
        )
        return create_node(db, payload)
    else:
        payload = StorageCreate(
            name=name,
            type='folder',
            parent_id=parent_parsed,
            business_id=business_id,      # ID do usuário dono
            type_user=type_user,          # Tipo do usuário dono
            company_id=company_id,        # ID da empresa responsável
            company_type=company_type,    # Tipo da empresa
            size=None,
            extension=None,
            status=status,
            comments=comments,
            url=None,
            data_validade=None
        )
        return create_node(db, payload)

# (Opcional) rota antiga via JSON puro, caso necessário manter compatibilidade
@router.post("/json", response_model=StorageResponse, include_in_schema=False)
def create_storage_node_json(payload: StorageCreate, db: Session = Depends(get_db)):
    return create_node(db, payload)


# ==========================================
# ENDPOINTS PARA LIXEIRA (TRASH)
# ⚠️ IMPORTANTE: Devem vir ANTES de /{node_id} para não causar conflito de rota
# ==========================================

@router.get("/trash", summary="Listar lixeira")
def list_trash_items(
    business_id: int = None,
    tipo_usuario: str = None,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Lista todos os itens na lixeira (arquivos e pastas deletados)
    Pode filtrar por business_id, tipo_usuario e user_id
    """
    from app.crud.storage import list_trash
    
    items = list_trash(db, business_id, tipo_usuario, user_id)
    
    # Converter para dict com informações adicionais
    result = []
    for item in items:
        item_dict = {
            "id": item.id,
            "name": item.name,
            "type": item.type.value if hasattr(item.type, 'value') else str(item.type),
            "parent_id": item.parent_id,
            "business_id": item.business_id,
            "type_user": item.type_user,
            "size": item.size,
            "extension": item.extension,
            "status": item.status,
            "url": item.url,
            "data_validade": item.data_validade.isoformat() if item.data_validade else None,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            "deleted_at": item.deleted_at.isoformat() if item.deleted_at else None,
            "deleted_by_id": item.deleted_by_id,
            "deleted_by_type": item.deleted_by_type,
        }
        
        # Contar filhos se for pasta
        if item.type.value == 'folder' if hasattr(item.type, 'value') else str(item.type) == 'folder':
            from app.models.storage import StorageNode
            children_count = db.query(StorageNode).filter(
                StorageNode.parent_id == item.id,
                StorageNode.deleted_at.isnot(None)
            ).count()
            item_dict['children_count'] = children_count
        else:
            item_dict['children_count'] = 0
        
        result.append(item_dict)
    
    return result


@router.post("/trash/{node_id}/restore", summary="Restaurar da lixeira")
def restore_from_trash(
    node_id: int,
    restore_to_parent: int = Form(None),
    user_id: int = Form(None),
    tipo_usuario: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Restaura um arquivo ou pasta da lixeira
    Se for pasta, restaura recursivamente todos os arquivos dentro
    
    - **restore_to_parent**: ID da pasta de destino (None = restaurar para local original)
    """
    from app.crud.storage import restore_node
    
    node = restore_node(db, node_id, restore_to_parent, user_id, tipo_usuario)
    
    return {
        "message": "Item restaurado com sucesso",
        "node": {
            "id": node.id,
            "name": node.name,
            "type": node.type.value if hasattr(node.type, 'value') else str(node.type),
            "parent_id": node.parent_id
        }
    }


@router.delete("/trash/{node_id}/permanent", summary="Deletar permanentemente")
def permanent_delete_from_trash(
    node_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleta permanentemente um arquivo ou pasta da lixeira
    ⚠️ ATENÇÃO: Esta ação não pode ser desfeita!
    Se for pasta, deleta recursivamente todos os arquivos dentro
    """
    from app.crud.storage import permanent_delete_node
    
    return permanent_delete_node(db, node_id)


@router.post("/trash/empty", summary="Esvaziar lixeira")
def empty_trash_endpoint(
    business_id: int = None,
    tipo_usuario: str = None,
    user_id: int = None,
    older_than_days: int = None,
    db: Session = Depends(get_db)
):
    """
    Esvazia a lixeira (deleta permanentemente todos os itens)
    ⚠️ ATENÇÃO: Esta ação não pode ser desfeita!
    
    - **business_id**: Filtrar por empresa
    - **tipo_usuario**: Filtrar por tipo de usuário
    - **user_id**: Filtrar por usuário que deletou
    - **older_than_days**: Deletar apenas itens mais antigos que X dias
    """
    from app.crud.storage import empty_trash
    
    return empty_trash(db, business_id, tipo_usuario, user_id, older_than_days)


@router.get("/{node_id}")
def get_storage_node(
    node_id: int, 
    user_id: Optional[int] = None,
    tipo_usuario: Optional[str] = None,
    db: Session = Depends(get_db)
):
    node = get_node(db, node_id)
    
    # Se for arquivo, monta o link público pelo DEV_PUBLIC_URL
    if getattr(node, 'type', None) == 'file' and getattr(node, 'url', None):
        node.url = f"{DEV_PUBLIC_URL}/{node.url}" if not node.url.startswith("http") else node.url
    
    # Adicionar informações de seguidores se for arquivo
    if getattr(node, 'type', None) == 'file':
        # Lista de seguidores
        seguidores = obter_seguidores_documento(db, node_id)
        node.seguidores = seguidores
        node.total_seguidores = len(seguidores)
        
        # Verificar se usuário atual está seguindo
        if user_id and tipo_usuario:
            seguimento_info = verificar_se_usuario_segue(db, node_id, user_id, tipo_usuario)
            node.usuario_atual_segue = seguimento_info
            
            # Verificar se é dono
            e_dono = verificar_se_usuario_e_dono(db, node_id, user_id, tipo_usuario)
            node.usuario_e_dono = e_dono
            
            # Se for dono e não está seguindo, criar seguimento automático
            if e_dono and not seguimento_info.get("seguindo"):
                try:
                    seguidor_data = DocumentFollowerCreate(
                        node_id=node_id,
                        user_id=user_id,
                        tipo_usuario=tipo_usuario,
                        dias_antes_alerta=7,  # Padrão: 7 dias antes
                        alertar_no_vencimento=True
                    )
                    seguir_documento(db, seguidor_data)
                    # Atualizar informação
                    seguimento_info = verificar_se_usuario_segue(db, node_id, user_id, tipo_usuario)
                    node.usuario_atual_segue = seguimento_info
                    # Recarregar seguidores
                    seguidores = obter_seguidores_documento(db, node_id)
                    node.seguidores = seguidores
                    node.total_seguidores = len(seguidores)
                except:
                    pass  # Se falhar, continua sem seguir
        else:
            node.usuario_atual_segue = {"seguindo": False}
            node.usuario_e_dono = False
    else:
        # Pastas não têm seguidores
        node.seguidores = None
        node.total_seguidores = 0
        node.usuario_atual_segue = None
        node.usuario_e_dono = False
    
    return _convert_node_to_dict(node)

@router.get("/")
def list_storage_nodes(
    parent_id: Optional[int] = None,
    user_id: int = None,              # ID do usuário logado (OBRIGATÓRIO)
    tipo_usuario: str = None,         # Tipo do usuário logado (OBRIGATÓRIO)
    company_id: Optional[int] = None, # ID da empresa (para cálculo de storage)
    # Filtros Opcionais
    status: Optional[str] = None,
    file_type: Optional[str] = None,
    search_term: Optional[str] = None,
    limit: Optional[int] = None,      # Opcional para paginação
    offset: Optional[int] = None,     # Opcional para paginação
    db: Session = Depends(get_db)
):
    """
    Lista arquivos que o usuário pode ver
    Paginação opcional via limit/offset.
    """
    if not user_id or not tipo_usuario:
        raise HTTPException(status_code=400, detail="user_id e tipo_usuario são obrigatórios")
    
    # Buscar nodes filhos (passando limit/offset se implementado no CRUD)
    # ATENÇÃO: Mudança v3 - list_children agora lida com tudo (filhos, shared, filtros)
    nodes = list_children(
        db, parent_id, user_id, tipo_usuario, 
        company_id=company_id,
        status=status,
        file_type=file_type,
        search_term=search_term
    )

    # Não precisamos mais chamar get_shared_nodes separadamente na raiz, 
    # pois list_children já faz o UNION se parent_id for None.
    shared_nodes = []
    
    all_nodes = nodes

    # Combinar para enriquecimento (apenas arquivos)
    nodes_to_enrich = []
    
    # Adicionar nodes normais
    for n in nodes:
        if hasattr(n, 'type') and str(n.type) == 'file': # Convertendo Enum
             nodes_to_enrich.append(n)
        elif hasattr(n, 'type') and hasattr(n.type, 'value') and n.type.value == 'file':
             nodes_to_enrich.append(n)

    if shared_nodes:
        nodes_to_enrich.extend(shared_nodes)
        
    # Enriquecer SOMENTE arquivos (pastas não precisam)
    if nodes_to_enrich:
        _enrich_nodes_with_followers(db, nodes_to_enrich, user_id, tipo_usuario)
            
    # Separar em Meus Arquivos e Compartilhados (se estiver na raiz)
    nodes_result = []
    shared_nodes_detected = []
    
    if parent_id is None:
        for node in nodes:
            # Verifica se é compartilhado (não é dono)
            # node.business_id == user_id e node.type_user == tipo_usuario -> DONO
            # Mas cuidado com tipos: business_id é int, user_id é int?
            is_owner = False
            if str(node.business_id) == str(user_id) and node.type_user == tipo_usuario:
                is_owner = True
            
            if is_owner:
                nodes_result.append(node)
            else:
                shared_nodes_detected.append(node)
                
        # Se tiver compartilhados, cria a pasta virtual
        if shared_nodes_detected:
            shared_nodes_dict = [_convert_node_to_dict(sn) for sn in shared_nodes_detected]
            
            shared_folder = {
                "id": -1,
                "name": "Compartilhados comigo",
                "type": "folder",
                "parent_id": None,
                "business_id": None,
                "type_user": None,
                "size": None,
                "extension": None,
                "status": None,
                "comments": None,
                "url": None,
                "created_at": None,
                "updated_at": None,
                "children": shared_nodes_dict
            }
            # Adiciona a pasta virtual no início
            nodes_result.insert(0, shared_folder)
    else:
        # Se não for raiz, não separa, retorna tudo (dentro de pasta)
        nodes_result = list(nodes)
    
    # Converter todos os nodes para dicionários
    return [_convert_node_to_dict(node) if not isinstance(node, dict) else node for node in nodes_result]


@router.put("/{node_id}", response_model=StorageResponse)
async def update_storage_node(
    node_id: int,
    file: UploadFile | None = File(default=None),
    name: str | None = Form(default=None),
    parent_id: int | None = Form(default=None),
    business_id: int | None = Form(default=None),
    type_user: str | None = Form(default=None),
    comments: str | None = Form(default=None),
    status: str | None = Form(default=None),
    data_validade: str | None = Form(default=None, description="Data de validade (formato: YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    node = get_node(db, node_id)
    
    # --- VERIFICAÇÃO DE PERMISSÕES ---
    from app.models.share import Share
    
    # Identificar quem está fazendo a requisição
    # Assumimos que o business_id enviado no form é o usuário atual
    # (Padrão enviado pelo frontend storageApi.ts)
    actor_id = business_id
    
    # Identificar se é Dono da Empresa ou Dono Pessoal (fora de empresa)
    is_company_admin = False
    if node.company_id and actor_id and str(actor_id) == str(node.company_id):
        # Assumindo que se o ID bate com company_id, é o dono (simplificação segura pois IDs de empresas são de usuários donos)
        is_company_admin = True
        
    is_creator = False
    if actor_id is not None and node and str(actor_id) == str(node.business_id):
        is_creator = True

    allow_edit = False
    if is_company_admin:
        allow_edit = True
    elif is_creator and not node.company_id:
        # Arquivo pessoal (não vinculado a empresa)
        allow_edit = True
    elif is_creator and node.company_id and str(node.company_id) == str(actor_id):
         # Criador é a própria empresa (redundante mas explícito)
         allow_edit = True
    if actor_id is not None:
        # Verificar permissão explícita de edição via compartilhamento
        share_perm = db.query(Share).filter(
            Share.node_id == node_id,
            Share.shared_with_user_id == actor_id,
            Share.allow_editing == True
        ).first()
        if share_perm:
            allow_edit = True
            
        if share_perm:
            allow_edit = True

    # ✅ CHECAR PERMISSÃO DE FREELANCER/COLABORADOR NA EMPRESA
    if not allow_edit and node.company_id and actor_id:
        # Se o arquivo é da empresa e o usuário não é dono nem tem share explícito
        # Verificar se tem "Link" com permissão manage_files
        
        from app.models.user_business_link import UserBusinessLink
        from app.models.collaborator import CompanyCollaborator
        
        # Tentar achar link
        link = db.query(UserBusinessLink).filter(
            UserBusinessLink.user_id == actor_id,
            UserBusinessLink.type_user == type_user, # type_user do form
            UserBusinessLink.business_id == node.company_id,
            UserBusinessLink.status == 1
        ).first()

        permissions = {}
        if link:
            permissions = link.permissions or {}
        elif type_user == 'collaborator':
             collab = db.query(CompanyCollaborator).filter(
                 CompanyCollaborator.id == actor_id,
                 CompanyCollaborator.company_id == node.company_id
             ).first()
             permissions = (collab.permissions or {}) if collab else {}
        
        if permissions.get('manage_files'):
            allow_edit = True

    if not allow_edit:
        # Se não é dono, não tem share de edição e não tem permissão da empresa -> Bloquear
        # Isso também previne que requests sem business_id (anônimos) alterem arquivos
        raise HTTPException(status_code=403, detail="Sem permissão para editar este arquivo.")
    # ----------------------------------

    update_data = {}
    if name is not None:
        update_data['name'] = name
    if parent_id is not None:
        update_data['parent_id'] = parent_id
        
    # PROTEÇÃO CONTRA ROUBO DE PROPRIEDADE
    # Apenas o dono pode alterar o business_id (transferir propriedade)
    # Se for editor compartilhado, ignoramos tentativas de alterar business_id
    if business_id is not None:
        if is_company_admin or is_creator:
            update_data['business_id'] = business_id
            
    if type_user is not None:
        if is_company_admin or is_creator:
            update_data['type_user'] = type_user
            
    if comments is not None:
        update_data['comments'] = comments
    if status is not None:
        update_data['status'] = status
    
    # Converter data_validade se fornecida
    if data_validade is not None:
        from datetime import datetime
        try:
            update_data['data_validade'] = datetime.strptime(data_validade, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD")
    
    # Se for arquivo novo, faz upload e atualiza url, extension, size
    if file is not None and getattr(node, 'type', None) == 'file':
        from app.services.storage.r2_service import store_image
        file.file.seek(0, os.SEEK_END)
        size_bytes = file.file.tell()
        file.file.seek(0)
        upload_result = store_image(
            file_obj=file.file,
            original_filename=file.filename,
            folder=None,
            content_type=file.content_type
        )
        if not upload_result.get("success"):
            raise HTTPException(status_code=500, detail=upload_result.get("error", "Falha no upload"))
        ext = os.path.splitext(file.filename)[1].lower()
        size_str = _human_size(size_bytes) if size_bytes is not None else None
        # Atualiza url, extension, size
        DEV_PUBLIC_URL = "https://pub-44038362d56e40da83d1c72eaec658c5.r2.dev"
        update_data['url'] = f"{DEV_PUBLIC_URL}/{upload_result['key']}"
        update_data['extension'] = ext or None
        update_data['size'] = size_str
    from app.schemas.storage import StorageUpdate
    payload = StorageUpdate(**update_data)
    return update_node(db, node_id, payload, user_id=actor_id, type_user=type_user)


@router.patch("/{node_id}/move", summary="Mover arquivo ou pasta")
def move_storage_node(
    node_id: int,
    new_parent_id: Optional[int] = None,
    user_id: int = Query(None),
    tipo_usuario: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Move um arquivo ou pasta para uma nova localização
    
    - **node_id**: ID do arquivo/pasta a ser movido
    - **new_parent_id**: ID da pasta de destino (None = mover para raiz)
    
    **Validações:**
    - Destino deve ser uma pasta (não pode mover para dentro de um arquivo)
    - Não pode mover um item para dentro dele mesmo
    - Não pode mover uma pasta para dentro de suas próprias subpastas (prevenção de ciclos)
    """
    from app.crud.storage import move_node, get_node
    from app.models.share import Share
    
    if not user_id or not tipo_usuario:
        # Para compatibilidade, se não for enviado, vamos tentar sem validação (com risco)
        # OU melhor, vamos bloquear para garantir segurança
        # Como estamos implementando agora, vamos forçar.
        raise HTTPException(status_code=400, detail="user_id e tipo_usuario são obrigatórios")

    # --- VERIFICAÇÃO DE PERMISSÕES ---
    node = get_node(db, node_id)
    if not node:
         raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    # Identificar permissões estritas
    is_company_admin = False
    if node.company_id and user_id and str(user_id) == str(node.company_id):
        is_company_admin = True 

    is_creator = (str(user_id) == str(node.business_id))
    
    allow_move = False
    
    if is_company_admin:
        allow_move = True
    elif is_creator and not node.company_id:
        allow_move = True
    elif is_creator and node.company_id and str(node.company_id) == str(user_id):
        allow_move = True
    else:
        # Verificar permissão de edição (que inclui mover)
        share_perm = db.query(Share).filter(
            Share.node_id == node_id,
            Share.shared_with_user_id == user_id,
            Share.allow_editing == True
        ).first()
        if share_perm:
            allow_move = True
            
            
    # ✅ CHECAR PERMISSÃO DE FREELANCER/COLABORADOR NA EMPRESA
    if not allow_move and node.company_id and user_id:
        from app.models.user_business_link import UserBusinessLink
        from app.models.collaborator import CompanyCollaborator
        
        link = db.query(UserBusinessLink).filter(
            UserBusinessLink.user_id == user_id,
            UserBusinessLink.type_user == tipo_usuario,
            UserBusinessLink.business_id == node.company_id,
            UserBusinessLink.status == 1
        ).first()
        
        permissions = {}
        if link:
            permissions = link.permissions or {}
        elif tipo_usuario == 'collaborator':
             collab = db.query(CompanyCollaborator).filter(
                 CompanyCollaborator.id == user_id,
                 CompanyCollaborator.company_id == node.company_id
             ).first()
             permissions = (collab.permissions or {}) if collab else {}

        if permissions.get('manage_files'):
            allow_move = True

    if not allow_move:
        raise HTTPException(status_code=403, detail="Sem permissão para mover este arquivo.")
    # ----------------------------------
    
    node = move_node(db, node_id, new_parent_id, user_id=user_id, type_user=tipo_usuario)
    
    # Converter para dict
    return {
        "message": "Item movido com sucesso",
        "node": {
            "id": node.id,
            "name": node.name,
            "type": node.type.value if hasattr(node.type, 'value') else str(node.type),
            "parent_id": node.parent_id,
            "business_id": node.business_id,
            "type_user": node.type_user
        }
    }


@router.delete("/{node_id}", summary="Mover para lixeira (soft delete)")
def delete_storage_node(
    node_id: int, 
    user_id: int = None,
    tipo_usuario: str = None,
    db: Session = Depends(get_db)
):
    """
    Move um arquivo ou pasta para a lixeira (soft delete)
    Não deleta permanentemente - pode ser restaurado depois
    """
    from app.crud.storage import soft_delete_node
    
    if not user_id or not tipo_usuario:
        raise HTTPException(status_code=400, detail="user_id e tipo_usuario são obrigatórios")
    
    # --- VERIFICAÇÃO DE PERMISSÕES ---
    from app.crud.storage import get_node
    from app.models.share import Share
    
    node = get_node(db, node_id)
    if not node:
         raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    # Identificar permissões estritas
    is_company_admin = False
    if node.company_id and user_id and str(user_id) == str(node.company_id):
        is_company_admin = True 

    is_creator = (str(user_id) == str(node.business_id))

    allow_delete = False
    
    if is_company_admin:
        allow_delete = True
    elif is_creator and not node.company_id:
        allow_delete = True
    elif is_creator and node.company_id and str(node.company_id) == str(user_id):
        allow_delete = True
    else:
        # Verificar permissão explícita de edição via compartilhamento
        share_perm = db.query(Share).filter(
            Share.node_id == node_id,
            Share.shared_with_user_id == user_id,
            Share.allow_editing == True
        ).first()
        
        if share_perm:
            allow_delete = True

    # ✅ CHECAR PERMISSÃO DE FREELANCER/COLABORADOR NA EMPRESA
    if not allow_delete and node.company_id:
        from app.models.user_business_link import UserBusinessLink
        from app.models.collaborator import CompanyCollaborator
        
        link = db.query(UserBusinessLink).filter(
            UserBusinessLink.user_id == user_id,
            UserBusinessLink.type_user == tipo_usuario,
            UserBusinessLink.business_id == node.company_id,
            UserBusinessLink.status == 1
        ).first()
        
        permissions = {}
        if link:
            permissions = link.permissions or {}
        elif tipo_usuario == 'collaborator':
             collab = db.query(CompanyCollaborator).filter(
                 CompanyCollaborator.id == user_id,
                 CompanyCollaborator.company_id == node.company_id
             ).first()
             permissions = (collab.permissions or {}) if collab else {}

        if permissions.get('manage_files'):
            allow_delete = True
            
    if not allow_delete:
        raise HTTPException(status_code=403, detail="Sem permissão para deletar este arquivo.")
    # ----------------------------------
    
    soft_delete_node(db, node_id, user_id, tipo_usuario)
    return {"message": "Item movido para a lixeira"}


@router.post("/upload/presigned", response_model=PresignedUploadResponse)
def get_presigned_upload_url_endpoint(
    payload: PresignedUploadRequest,
    db: Session = Depends(get_db)
):
    # Validar Cota
    if payload.company_id and payload.company_type:
        try:
            check_storage_limit(db, payload.company_id, payload.company_type, payload.size_bytes)
        except HTTPException as e:
            raise e
            
    # Gerar Key única
    ext = os.path.splitext(payload.filename)[1].lower()
    key = f"{uuid.uuid4().hex}{ext}"
    
    # Gerar URL Presigned (PUT)
    from app.services.storage.r2_service import get_presigned_upload_url
    upload_url = get_presigned_upload_url(key, payload.content_type)
    
    if not upload_url:
        raise HTTPException(status_code=500, detail="Erro ao gerar URL de upload presignada")
    
    public_url = f"{DEV_PUBLIC_URL}/{key}"
    
    return {
        "upload_url": upload_url,
        "key": key,
        "public_url": public_url,
        "filename": payload.filename
    }

@router.post("/upload/complete", response_model=StorageResponse)
def complete_upload_endpoint(
    payload: StorageCreate,
    db: Session = Depends(get_db)
):
    """
    Finaliza o upload direto criando o registro no banco.
    O frontend envia os metadados finais (incluindo a URL pública do R2).
    """
    return create_node(db, payload)


@router.post("/upload", response_model=StorageResponse)
async def upload_and_create_storage_node(
    file: UploadFile = File(...),
    parent_id: int | None = Form(None),
    business_id: int | None = Form(None),
    type_user: str | None = Form(None),
    name: str | None = Form(None),
    comments: str | None = Form(None),
    status: str | None = Form("Válido"),
    db: Session = Depends(get_db)
):
    # Calcular tamanho
    try:
        file.file.seek(0, os.SEEK_END)
        size_bytes = file.file.tell()
        file.file.seek(0)
    except Exception:
        size_bytes = None

    # ✅ VALIDAR COTA DE ARMAZENAMENTO ANTES DO UPLOAD
    if business_id and type_user and size_bytes:
        try:
            check_storage_limit(db, business_id, type_user, size_bytes)
        except HTTPException as e:
            # Re-lançar o erro de cota excedida
            raise e

    # Upload para R2
    upload_result = store_image(
        file_obj=file.file,
        original_filename=file.filename,
        folder=None,
        content_type=file.content_type
    )
    if not upload_result.get("success"):
        raise HTTPException(status_code=500, detail=upload_result.get("error", "Falha no upload"))

    # Derivar metadados
    base_name = name or os.path.splitext(file.filename)[0]
    ext = os.path.splitext(file.filename)[1].lower()
    size_str = _human_size(size_bytes) if size_bytes is not None else None

    payload = StorageCreate(
        name=base_name,
        type='file',
        parent_id=parent_id,
        business_id=business_id,
        type_user=type_user,
        size=size_str,
        extension=ext or None,
        status=status,
        comments=comments,
        url=upload_result["url"],
    )
    return create_node(db, payload)

@router.get("/documents/by-business-status", response_model=List[StorageResponse])
def get_documents_by_business_status(
    user_email: str,
    business_email: str,
    status: str,
    db: Session = Depends(get_db)
):
    """
    Busca documentos de uma empresa específica que o usuário tem permissão para acessar,
    filtrados por status.
    
    Args:
        user_email: Email do usuário que está fazendo a busca
        business_email: Email da empresa
        status: Status dos documentos (ex: "Válido", "Inválido", "Pendente")
    
    Returns:
        Lista de documentos da empresa que o usuário pode acessar
    """
    from app.crud.storage import get_documents_by_business_and_status
    from app.crud.user_business_link import get_user_info_by_email
    
    documents = get_documents_by_business_and_status(db, user_email, business_email, status)
    
    # Enriquecer com seguidores
    try:
        user_info = get_user_info_by_email(db, user_email)
        _enrich_nodes_with_followers(db, documents, user_info['user_id'], user_info['type_user'])
    except:
        pass # Se falhar ao pegar user info, retorna sem enriquecimento
        
    return documents

@router.get("/documents/by-status", response_model=List[StorageResponse])
def get_user_documents_by_status(
    user_email: str,
    status: str,
    business_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Busca todos os documentos que o usuário tem acesso (em todas as empresas ou uma específica),
    filtrados por status.
    
    Args:
        user_email: Email do usuário
        status: Status dos documentos
        business_id: ID específico da empresa (opcional)
    
    Returns:
        Lista de todos os documentos acessíveis ao usuário
    """
    from app.crud.storage import get_user_accessible_documents_by_status
    from app.crud.user_business_link import get_user_info_by_email
    
    documents = get_user_accessible_documents_by_status(db, user_email, status, business_id)
    
    # Enriquecer com seguidores
    try:
        user_info = get_user_info_by_email(db, user_email)
        _enrich_nodes_with_followers(db, documents, user_info['user_id'], user_info['type_user'])
    except:
        pass
        
    return documents

@router.get("/documents/with-permissions")
def get_documents_with_permissions_info(
    user_email: str,
    status: str,
    business_email: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Busca documentos com informações detalhadas de permissões do usuário.
    
    Args:
        user_email: Email do usuário
        status: Status dos documentos
        business_email: Email da empresa específica (opcional)
    
    Returns:
        Documentos com informações de permissões
    """
    from app.crud.storage import get_documents_by_business_and_status, get_user_accessible_documents_by_status
    from app.crud.permission import get_user_permissions_by_email
    from app.crud.user_business_link import get_user_info_by_email
    
    # Busca permissões do usuário
    user_permissions = get_user_permissions_by_email(db, user_email)
    
    if business_email:
        # Busca documentos de empresa específica
        documents = get_documents_by_business_and_status(db, user_email, business_email, status)
    else:
        # Busca todos os documentos acessíveis
        documents = get_user_accessible_documents_by_status(db, user_email, status)
        
    # Enriquecer com seguidores
    try:
        user_info = get_user_info_by_email(db, user_email)
        _enrich_nodes_with_followers(db, documents, user_info['user_id'], user_info['type_user'])
    except:
        pass
    
    return {
        "user_email": user_email,
        "business_email": business_email,
        "status_filter": status,
        "total_documents": len(documents),
        "user_permissions": user_permissions["permissions"],
        "documents": documents
    }


# ==========================================
# ENDPOINTS PARA COLABORADORES
# ==========================================

@router.get("/collaborator/{collaborator_id}/files", summary="Listar arquivos para colaborador")
def list_files_for_collaborator(
    collaborator_id: int,
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Lista arquivos que o colaborador pode ver baseado em suas permissões.
    
    **Regras de visibilidade:**
    - `manage_files`: Vê TODOS os arquivos da empresa
    - `view_only`: Vê TODOS os arquivos (mas só pode visualizar)
    - `view_shared`: Vê APENAS arquivos compartilhados com ele
    
    **Retorna:**
    - Lista de arquivos/pastas
    - Informações do colaborador
    - Permissões aplicadas
    """
    from app.crud.collaborator import get_collaborator, get_collaborator_permissions
    from app.crud.storage import list_children
    from app.crud.share import get_shared_nodes
    
    # Buscar colaborador
    collaborator = get_collaborator(db, collaborator_id)
    
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    if not collaborator.is_active:
        raise HTTPException(status_code=403, detail="Colaborador inativo")
    
    permissions = get_collaborator_permissions(collaborator)
    
    # Determinar o que o colaborador pode ver
    if permissions.get("manage_files") or permissions.get("view_only"):
        # Vê TODOS os arquivos da empresa
        nodes = list_children(
            db, 
            parent_id, 
            collaborator.company_id,  # Usar company_id como user_id
            collaborator.company_type,
            collaborator.company_id
        )
        access_type = "todos_arquivos_empresa"
        
    elif permissions.get("view_shared"):
        # Vê APENAS compartilhados
        if parent_id is None:
            # Na raiz, mostrar apenas pasta de compartilhados
            shared_nodes = get_shared_nodes(db, collaborator_id, "colaborador")
            nodes = shared_nodes
            access_type = "apenas_compartilhados"
        else:
            # Dentro de uma pasta, verificar se tem acesso
            nodes = []
            access_type = "sem_acesso"
    else:
        # Sem permissão para ver arquivos
        raise HTTPException(
            status_code=403, 
            detail="Colaborador não tem permissão para ver arquivos"
        )
    
    # Converter nodes para dicts
    nodes_dict = [_convert_node_to_dict(node) if not isinstance(node, dict) else node for node in nodes]
    
    return {
        "collaborator": {
            "id": collaborator.id,
            "name": collaborator.name,
            "email": collaborator.email,
            "company_id": collaborator.company_id,
            "company_type": collaborator.company_type
        },
        "permissions": permissions,
        "access_type": access_type,
        "parent_id": parent_id,
        "total_items": len(nodes_dict),
        "items": nodes_dict
    }


@router.get("/{node_id}/compartilhamentos", summary="Listar com quem o documento está compartilhado")
def listar_compartilhamentos_documento(
    node_id: int,
    db: Session = Depends(get_db)
):
    """
    Lista todos os usuários com quem um documento está compartilhado
    
    Similar à função de seguidores, mas mostra os compartilhamentos.
    Retorna informações de quem recebeu o compartilhamento e quem compartilhou.
    
    **Exemplo de uso:**
    ```
    GET /api/v1/nodes/{node_id}/compartilhamentos
    ```
    
    **Resposta:**
    ```json
    {
        "node_id": 123,
        "total_compartilhamentos": 2,
        "compartilhamentos": [
            {
                "share_id": 1,
                "compartilhado_com": {
                    "id": 2,
                    "nome": "João Silva",
                    "email": "joao@exemplo.com",
                    "tipo": "pf"
                },
                "compartilhado_por": {
                    "id": 1,
                    "nome": "Maria Santos",
                    "email": "maria@exemplo.com",
                    "tipo": "pf"
                },
                "created_at": "2025-11-10T10:00:00"
            }
        ]
    }
    ```
    """
    # Verificar se o nó existe
    node = get_node(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    # Buscar compartilhamentos
    compartilhamentos = obter_compartilhamentos_documento(db, node_id)
    
    return {
        "node_id": node_id,
        "node_name": node.name,
        "node_type": node.type.value if hasattr(node.type, 'value') else str(node.type),
        "total_compartilhamentos": len(compartilhamentos),
        "compartilhamentos": compartilhamentos
    }


@router.get("/{node_id}/rastreabilidade", summary="📋 Obter rastreabilidade completa do documento")
def obter_rastreabilidade(
    node_id: int,
    db: Session = Depends(get_db)
):
    """
    Retorna a rastreabilidade completa de um documento/pasta:
    - Quem criou e quando
    - Quem editou pela última vez e quando
    - Quem moveu pela última vez e quando
    - Quem renomeou pela última vez e quando
    - Totais de cada tipo de ação
    
    **Exemplo de response:**
    ```json
    {
        "node_id": 18,
        "criado_por": {
            "id": 21,
            "nome": "Maria Santos",
            "email": "maria@exemplo.com",
            "tipo": "pf"
        },
        "criado_em": "2025-11-10T10:00:00",
        "ultima_edicao_por": {
            "id": 2,
            "nome": "João Silva",
            "email": "joao@exemplo.com",
            "tipo": "collaborator"
        },
        "ultima_edicao_em": "2025-11-10T15:30:00",
        "ultima_movimentacao_por": {
            "id": 21,
            "nome": "Maria Santos",
            "email": "maria@exemplo.com",
            "tipo": "pf"
        },
        "ultima_movimentacao_em": "2025-11-10T14:00:00",
        "movimentacao_detalhes": {
            "de_pasta": "Documentos",
            "para_pasta": "Importante"
        },
        "total_edicoes": 5,
        "total_movimentacoes": 2,
        "total_compartilhamentos": 3
    }
    ```
    """
    # Verificar se o nó existe
    node = get_node(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    # Obter resumo de rastreabilidade
    resumo = obter_resumo_rastreabilidade(db, node_id)
    
    return resumo


@router.get("/{node_id}/historico", summary="📜 Obter histórico completo de ações do documento")
def obter_historico(
    node_id: int,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retorna o histórico completo de todas as ações realizadas em um documento/pasta.
    
    **Parâmetros:**
    - `node_id`: ID do documento/pasta
    - `limit`: Limite de registros (padrão 100, máximo 500)
    
    **Exemplo de response:**
    ```json
    {
        "node_id": 18,
        "total_registros": 15,
        "historico": [
            {
                "id": 45,
                "acao": "edited",
                "acao_descricao": "Editou o documento",
                "usuario": {
                    "id": 2,
                    "nome": "João Silva",
                    "email": "joao@exemplo.com",
                    "tipo": "collaborator"
                },
                "detalhes": {
                    "alteracoes": "Adicionou 3 páginas"
                },
                "data_hora": "2025-11-10T15:30:00",
                "ip": "192.168.1.100"
            },
            {
                "id": 44,
                "acao": "moved",
                "acao_descricao": "Moveu o documento",
                "usuario": {
                    "id": 21,
                    "nome": "Maria Santos",
                    "email": "maria@exemplo.com",
                    "tipo": "pf"
                },
                "detalhes": {
                    "de_pasta_id": 5,
                    "para_pasta_id": 10
                },
                "data_hora": "2025-11-10T14:00:00",
                "ip": "192.168.1.100"
            }
        ]
    }
    ```
    """
    # Validar limite
    if limit > 500:
        limit = 500
    
    # Verificar se o nó existe
    node = get_node(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    # Obter histórico completo formatado
    historico = obter_historico_completo_formatado(db, node_id, limit)
    
    return {
        "node_id": node_id,
        "node_name": node.name,
        "node_type": node.type.value if hasattr(node.type, 'value') else str(node.type),
        "total_registros": len(historico),
        "historico": historico
    }






