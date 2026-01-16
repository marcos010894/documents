from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.share import Share
from app.schemas.share import ShareCreate, ShareCreateLegacy
from app.models.storage import StorageNode
from app.crud.user_business_link import get_user_info_by_email
from typing import List

def get_all_children_recursively(db: Session, parent_id: int) -> List[StorageNode]:
    """
    Busca recursivamente todos os filhos de uma pasta (arquivos e subpastas)
    
    Args:
        db: Sessão do banco de dados
        parent_id: ID da pasta pai
        
    Returns:
        Lista com todos os nós filhos (recursivamente)
    """
    all_children = []
    
    # Busca filhos diretos
    direct_children = db.query(StorageNode).filter(StorageNode.parent_id == parent_id).all()
    
    for child in direct_children:
        all_children.append(child)
        
        # Se o filho é uma pasta, busca recursivamente seus filhos
        if getattr(child, "type", None) == "folder":
            grandchildren = get_all_children_recursively(db, child.id)
            all_children.extend(grandchildren)
    
    return all_children

def create_share_for_node(db: Session, node_id: int, receiver_info: dict, sender_info: dict, allow_editing: bool = False) -> Share:
    """
    Cria um compartilhamento para um nó específico
    
    Args:
        db: Sessão do banco de dados
        node_id: ID do nó a ser compartilhado
        receiver_info: Informações do usuário que receberá o compartilhamento
        sender_info: Informações do usuário que está compartilhando
        allow_editing: Permissão de edição
        
    Returns:
        Objeto Share criado ou None se já existe
    """
    # Verifica se já existe compartilhamento para este nó
    existing_share = db.query(Share).filter(
        Share.node_id == node_id,
        Share.shared_with_user_id == receiver_info["user_id"],
        Share.shared_by_user_id == sender_info["user_id"]
    ).first()
    
    if existing_share:
        # Se já existe, atualiza a permissão de edição
        existing_share.allow_editing = allow_editing
        db.add(existing_share)
        return existing_share
    
    # Cria o compartilhamento
    share_data = {
        "node_id": node_id,
        "shared_with_user_id": receiver_info["user_id"],
        "shared_by_user_id": sender_info["user_id"],
        "type_user_sender": sender_info["type_user"],
        "type_user_receiver": receiver_info["type_user"],
        "allow_editing": allow_editing
    }
    
    share = Share(**share_data)
    db.add(share)
    return share

def create_share(db: Session, data: ShareCreate) -> Share:
    """
    Cria um compartilhamento usando emails para identificar usuários.
    Se for uma pasta, compartilha RECURSIVAMENTE todo o conteúdo (arquivos e subpastas).
    """
    # Busca informações do usuário que vai receber o compartilhamento
    receiver_info = get_user_info_by_email(db, data.shared_with_email)
    
    # Busca informações do usuário que está compartilhando
    sender_info = get_user_info_by_email(db, data.shared_by_email)
    
    # Verifica se o node existe
    node = db.query(StorageNode).filter(StorageNode.id == data.node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Arquivo/pasta não encontrado")
    
    # Lista para armazenar todos os compartilhamentos criados
    created_shares = []
    
    # Compartilha o nó principal (pasta ou arquivo)
    main_share = create_share_for_node(db, data.node_id, receiver_info, sender_info, data.allow_editing)
    created_shares.append(main_share)
    
    # Se for uma pasta, compartilha recursivamente todo o conteúdo
    if getattr(node, "type", None) == "folder":
        print(f"📂 Compartilhando pasta '{node.name}' e todo seu conteúdo...")
        
        # Busca todos os filhos recursivamente
        all_children = get_all_children_recursively(db, data.node_id)
        
        print(f"🔍 Encontrados {len(all_children)} itens para compartilhar recursivamente")
        
        # Compartilha cada filho
        for child in all_children:
            # Filhos herdam a permissão de edição do pai
            child_share = create_share_for_node(db, child.id, receiver_info, sender_info, data.allow_editing)
            if child_share:
                created_shares.append(child_share)
                child_type = "📁" if getattr(child, "type", None) == "folder" else "📄"
                print(f"   {child_type} Compartilhado: {child.name} (ID: {child.id})")
    
    # Commit de todos os compartilhamentos de uma vez
    try:
        db.commit()
        print(f"✅ Total de {len(created_shares)} compartilhamentos criados com sucesso!")
        
        # Refresh do compartilhamento principal para retornar
        if main_share:
            db.refresh(main_share)
        
        return main_share
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar compartilhamentos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar compartilhamentos: {str(e)}")

def create_share_legacy(db: Session, data: ShareCreateLegacy) -> Share:
    """
    Função legada para criar compartilhamento com IDs diretos
    Mantida para compatibilidade
    """
    share = Share(**data.dict())
    db.add(share)
    db.commit()
    db.refresh(share)
    return share

def get_shared_with_user(db: Session, user_id: int) -> List[Share]:
    return db.query(Share).filter(Share.shared_with_user_id == user_id).all()

def get_shared_nodes(db: Session, user_id: int, type_user: str = None) -> List[StorageNode]:
    """
    Busca todos os nós (arquivos e pastas) compartilhados com um usuário
    
    OTIMIZADO: Usa JOIN ao invés de N queries separadas
    """
    # Query otimizada com JOIN - 1 query ao invés de N
    query = db.query(StorageNode).join(
        Share, StorageNode.id == Share.node_id
    ).filter(
        Share.shared_with_user_id == user_id
    )
    
    if type_user:
        query = query.filter(Share.type_user_receiver == type_user)
    
    # distinct() para evitar duplicatas quando há múltiplos compartilhamentos
    nodes = query.distinct().all()
    
    # Ordena por hierarquia: pastas pai primeiro, depois filhos
    nodes.sort(key=lambda node: (node.parent_id or 0, node.name))
    
    print(f"📋 Retornando {len(nodes)} nós únicos compartilhados com usuário {user_id}")
    return nodes

def get_shared_root_nodes(db: Session, user_id: int, type_user: str = None) -> List[StorageNode]:
    """
    Busca apenas os nós raiz compartilhados (pastas/arquivos que foram explicitamente compartilhados)
    
    OTIMIZADO: Usa JOIN ao invés de N queries separadas
    """
    # Query otimizada com JOIN - 1 query ao invés de N
    query = db.query(StorageNode).join(
        Share, StorageNode.id == Share.node_id
    ).filter(
        Share.shared_with_user_id == user_id
    )
    
    if type_user:
        query = query.filter(Share.type_user_receiver == type_user)
    
    all_shared_nodes = query.distinct().all()
    
    # Filtra apenas os nós que são "raiz" (não têm um pai que também foi compartilhado)
    shared_node_ids = {node.id for node in all_shared_nodes}
    
    root_nodes = [
        node for node in all_shared_nodes
        if node.parent_id is None or node.parent_id not in shared_node_ids
    ]
    
    # Ordena por hierarquia
    root_nodes.sort(key=lambda x: (x.parent_id or 0, x.name))
    
    print(f"🌳 Retornando {len(root_nodes)} nós raiz compartilhados com usuário {user_id}")
    return root_nodes

def get_share_permissions_batch(db: Session, node_ids: List[int], user_id: int) -> dict:
    """
    Retorna um dicionário {node_id: allow_editing} para uma lista de nós e um usuário
    """
    if not node_ids:
        return {}
        
    shares = db.query(Share.node_id, Share.allow_editing).filter(
        Share.node_id.in_(node_ids),
        Share.shared_with_user_id == user_id
    ).all()
    
    return {share.node_id: share.allow_editing for share in shares}
