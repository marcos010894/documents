from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.conn import get_db
from app.schemas.share import ShareCreate, ShareCreateLegacy, ShareResponse
from app.models.share import Share
from app.crud.share import create_share, create_share_legacy, get_shared_nodes, get_shared_root_nodes
from app.crud.user_business_link import get_user_info_by_email, get_user_basic_info
from app.schemas.storage import StorageResponse

router = APIRouter()

@router.post("/", response_model=ShareResponse)
def share_node(payload: ShareCreate, db: Session = Depends(get_db)):
    """
    Compartilha um arquivo ou pasta usando emails para identificar usuários
    
    Exemplo de uso:
    {
        "node_id": 123,
        "shared_with_email": "usuario@exemplo.com",
        "shared_by_email": "compartilhador@exemplo.com"
    }
    """
    return create_share(db, payload)

@router.post("/legacy", response_model=ShareResponse)
def share_node_legacy(payload: ShareCreateLegacy, db: Session = Depends(get_db)):
    """
    Endpoint legado para compartilhamento usando IDs diretos
    Mantido para compatibilidade com versões antigas
    """
    return create_share_legacy(db, payload)

@router.get("/shared_with_me/{user_id}")
def shared_with_me(user_id: int, type_user: str = None, db: Session = Depends(get_db)):
    """
    Lista arquivos compartilhados com um usuário específico (usando ID)
    
    OTIMIZADO: Usa queries batch ao invés de N queries individuais
    """
    from app.crud.document_notification import (
        obter_seguidores_batch,
        verificar_seguimento_batch,
        verificar_dono_batch
    )
    
    nodes = get_shared_nodes(db, user_id, type_user)
    
    if not nodes:
        return []
    
    # Separar arquivos de pastas
    file_node_ids = []
    for node in nodes:
        is_file = False
        if hasattr(node, 'type'):
            if hasattr(node.type, 'value'):
                is_file = node.type.value == 'file'
            else:
                is_file = str(node.type) == 'file'
        if is_file:
            file_node_ids.append(node.id)
    
    # OTIMIZAÇÃO: Buscar tudo em batch
    seguidores_batch = {}
    seguimento_batch = {}
    dono_batch = {}
    permissions_batch = {}  # Nova batch para permissions
    
    if type_user and file_node_ids:
        seguidores_batch = obter_seguidores_batch(db, file_node_ids)
        seguimento_batch = verificar_seguimento_batch(db, file_node_ids, user_id, type_user)
        dono_batch = verificar_dono_batch(db, nodes, user_id, type_user)
        
    # Buscar permissões de edição para todos os nós (arquivos e pastas)
    from app.crud.share import get_share_permissions_batch
    permissions_batch = get_share_permissions_batch(db, [n.id for n in nodes], user_id)
    
    # Batch para Informações do remetente (Quem compartilhou)
    sender_info_batch = {}
    shares = db.query(Share).filter(Share.shared_with_user_id == user_id).all()
    
    # Cache para evitar queries repetidas de usuário
    user_cache = {}
    
    for share in shares:
        sender_key = (share.shared_by_user_id, share.type_user_sender)
        
        if sender_key not in user_cache:
            user_info = get_user_basic_info(db, share.shared_by_user_id, share.type_user_sender)
            user_cache[sender_key] = user_info['name']
            
        sender_info_batch[share.node_id] = user_cache[sender_key]
    
    # Montar resultado
    result = []
    for node in nodes:
        is_file = False
        if hasattr(node, 'type'):
            if hasattr(node.type, 'value'):
                is_file = node.type.value == 'file'
            else:
                is_file = str(node.type) == 'file'
        
        node_dict = {
            "id": node.id,
            "name": node.name,
            "type": node.type.value if hasattr(node.type, 'value') else str(node.type),
            "parent_id": node.parent_id,
            "business_id": node.business_id,
            "type_user": node.type_user,
            "size": node.size,
            "extension": node.extension,
            "status": node.status,
            "comments": node.comments,
            "url": node.url,
            "data_validade": node.data_validade.isoformat() if node.data_validade else None,
            "created_at": node.created_at.isoformat() if node.created_at else None,
            "updated_at": node.updated_at.isoformat() if node.updated_at else None,
            "updated_at": node.updated_at.isoformat() if node.updated_at else None,
            "allow_editing": permissions_batch.get(node.id, False), # Adiciona permissão
            "shared_by_name": sender_info_batch.get(node.id, "Desconhecido") # Adiciona quem compartilhou
        }
        
        if is_file and type_user:
            seguidores = seguidores_batch.get(node.id, [])
            node_dict['seguidores'] = seguidores
            node_dict['total_seguidores'] = len(seguidores)
            node_dict['usuario_atual_segue'] = seguimento_batch.get(node.id, {"seguindo": False})
            node_dict['usuario_e_dono'] = dono_batch.get(node.id, False)
        else:
            node_dict['seguidores'] = None
            node_dict['total_seguidores'] = 0
            node_dict['usuario_atual_segue'] = None
            node_dict['usuario_e_dono'] = False
        
        result.append(node_dict)
    
    return result

@router.get("/shared_with_me/by-email/{email}")
def shared_with_me_by_email(email: str, db: Session = Depends(get_db)):
    """
    Lista arquivos compartilhados com um usuário específico (usando email)
    
    OTIMIZADO: Usa queries batch ao invés de N queries individuais
    """
    from app.crud.document_notification import (
        obter_seguidores_batch,
        verificar_seguimento_batch,
        verificar_dono_batch
    )
    
    # Busca informações do usuário pelo email
    user_info = get_user_info_by_email(db, email)
    user_id = user_info["user_id"]
    type_user = user_info["type_user"]
    
    # Retorna os arquivos compartilhados (já otimizado com JOIN)
    nodes = get_shared_nodes(db, user_id, type_user)
    
    if not nodes:
        return []
    
    # Separar arquivos de pastas
    file_nodes = []
    file_node_ids = []
    for node in nodes:
        is_file = False
        if hasattr(node, 'type'):
            if hasattr(node.type, 'value'):
                is_file = node.type.value == 'file'
            else:
                is_file = str(node.type) == 'file'
        if is_file:
            file_nodes.append(node)
            file_node_ids.append(node.id)
    
    # OTIMIZAÇÃO: Buscar tudo em batch (poucas queries ao invés de centenas)
    seguidores_batch = obter_seguidores_batch(db, file_node_ids) if file_node_ids else {}
    seguimento_batch = verificar_seguimento_batch(db, file_node_ids, user_id, type_user) if file_node_ids else {}
    dono_batch = verificar_dono_batch(db, nodes, user_id, type_user)

    # Buscar permissões de edição
    from app.crud.share import get_share_permissions_batch
    permissions_batch = get_share_permissions_batch(db, [n.id for n in nodes], user_id)
    
    # Batch para Informações do remetente (Quem compartilhou)
    sender_info_batch = {}
    shares = db.query(Share).filter(Share.shared_with_user_id == user_id).all()
    
    # Cache para evitar queries repetidas de usuário
    user_cache = {}
    
    for share in shares:
        sender_key = (share.shared_by_user_id, share.type_user_sender)
        
        if sender_key not in user_cache:
            try:
                user_info = get_user_basic_info(db, share.shared_by_user_id, share.type_user_sender)
                user_cache[sender_key] = user_info['name']
            except Exception as e:
                print(f"Error fetching user info: {e}")
                user_cache[sender_key] = "Desconhecido"
            
        sender_info_batch[share.node_id] = user_cache[sender_key]
    
    # Montar resultado
    result = []
    for node in nodes:
        is_file = False
        if hasattr(node, 'type'):
            if hasattr(node.type, 'value'):
                is_file = node.type.value == 'file'
            else:
                is_file = str(node.type) == 'file'
        
        node_dict = {
            "id": node.id,
            "name": node.name,
            "type": node.type.value if hasattr(node.type, 'value') else str(node.type),
            "parent_id": node.parent_id,
            "business_id": node.business_id,
            "type_user": node.type_user,
            "size": node.size,
            "extension": node.extension,
            "status": node.status,
            "comments": node.comments,
            "url": node.url,
            "data_validade": node.data_validade.isoformat() if node.data_validade else None,
            "created_at": node.created_at.isoformat() if node.created_at else None,
            "updated_at": node.updated_at.isoformat() if node.updated_at else None,
            "updated_at": node.updated_at.isoformat() if node.updated_at else None,
            "allow_editing": permissions_batch.get(node.id, False), # Adiciona permissão
            "shared_by_name": sender_info_batch.get(node.id, "Desconhecido") # Adiciona quem compartilhou
        }
        
        if is_file:
            # Usar dados do batch
            seguidores = seguidores_batch.get(node.id, [])
            node_dict['seguidores'] = seguidores
            node_dict['total_seguidores'] = len(seguidores)
            node_dict['usuario_atual_segue'] = seguimento_batch.get(node.id, {"seguindo": False})
            node_dict['usuario_e_dono'] = dono_batch.get(node.id, False)
        else:
            node_dict['seguidores'] = None
            node_dict['total_seguidores'] = 0
            node_dict['usuario_atual_segue'] = None
            node_dict['usuario_e_dono'] = dono_batch.get(node.id, False)
        
        result.append(node_dict)
    
    return result

@router.get("/shared_with_me/by-email/{email}/root-only", response_model=List[StorageResponse])
def shared_with_me_by_email_root_only(email: str, db: Session = Depends(get_db)):
    """
    Lista apenas os arquivos/pastas RAIZ compartilhados com um usuário (usando email)
    
    Retorna apenas os itens que foram explicitamente compartilhados,
    sem mostrar os filhos que foram compartilhados automaticamente.
    Útil para interfaces mais limpas.
    """
    # Busca informações do usuário pelo email
    user_info = get_user_info_by_email(db, email)
    user_id = user_info["user_id"]
    type_user = user_info["type_user"]
    
    # Retorna apenas os nós raiz compartilhados
    nodes = get_shared_root_nodes(db, user_id, type_user)
    return nodes

@router.get("/debug/shares/{node_id}")
def debug_shares_for_node(node_id: int, db: Session = Depends(get_db)):
    """
    Endpoint para debug: mostra todos os compartilhamentos de um nó específico
    """
    from app.models.share import Share
    
    shares = db.query(Share).filter(Share.node_id == node_id).all()
    
    result = []
    for share in shares:
        result.append({
            "share_id": share.id,
            "node_id": share.node_id,
            "shared_with_user_id": share.shared_with_user_id,
            "shared_by_user_id": share.shared_by_user_id,
            "type_user_sender": share.type_user_sender,
            "type_user_receiver": share.type_user_receiver,
            "created_at": share.created_at
        })
    
    return {
        "node_id": node_id,
        "total_shares": len(result),
        "shares": result
    }

@router.get("/debug/folder-structure/{folder_id}")
def debug_folder_structure(folder_id: int, db: Session = Depends(get_db)):
    """
    Endpoint para debug: mostra a estrutura completa de uma pasta recursivamente
    """
    from app.crud.share import get_all_children_recursively
    from app.models.storage import StorageNode
    
    # Verifica se a pasta existe
    folder = db.query(StorageNode).filter(StorageNode.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Pasta não encontrada")
    
    # Busca todos os filhos recursivamente
    children = get_all_children_recursively(db, folder_id)
    
    result = []
    for child in children:
        result.append({
            "id": child.id,
            "name": child.name,
            "type": getattr(child, "type", "unknown"),
            "parent_id": child.parent_id,
            "path": getattr(child, "path", None)
        })
    
    return {
        "folder": {
            "id": folder.id,
            "name": folder.name,
            "type": getattr(folder, "type", "unknown")
        },
        "total_children": len(result),
        "children": result
    }
