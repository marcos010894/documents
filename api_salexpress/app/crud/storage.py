from sqlalchemy.orm import Session, aliased
from sqlalchemy import or_, exists
from fastapi import HTTPException
from app.models.storage import StorageNode, NodeType
from app.models.share import Share
from app.schemas.storage import StorageCreate, StorageUpdate
from typing import List, Optional
from app.crud.document_log import criar_log_documento
from app.models.document_log import DocumentAction

from app.models.user_business_link import UserBusinessLink
from app.models.collaborator import CompanyCollaborator

def inherit_parent_shares(db: Session, node_id: int, parent_id: int) -> None:
    """
    Herda todos os compartilhamentos da pasta pai para o novo node.
    Quando um arquivo/pasta é criado dentro de uma pasta compartilhada,
    automaticamente compartilha com os mesmos usuários.
    
    OTIMIZADO: Busca existentes em batch ao invés de N queries
    """
    # Buscar todos os compartilhamentos da pasta pai
    parent_shares = db.query(Share).filter(Share.node_id == parent_id).all()
    
    if not parent_shares:
        return  # Pasta pai não tem compartilhamentos
    
    # print(f"📂 Herdando {len(parent_shares)} compartilhamentos da pasta pai (ID: {parent_id})")
    
    # OTIMIZAÇÃO: Buscar todos os compartilhamentos existentes do node em uma única query
    existing_shares = db.query(Share).filter(Share.node_id == node_id).all()
    existing_set = {(s.shared_with_user_id, s.shared_by_user_id) for s in existing_shares}
    
    # Criar apenas os compartilhamentos que não existem
    new_shares = []
    for parent_share in parent_shares:
        key = (parent_share.shared_with_user_id, parent_share.shared_by_user_id)
        if key not in existing_set:
            new_share = Share(
                node_id=node_id,
                shared_with_user_id=parent_share.shared_with_user_id,
                shared_by_user_id=parent_share.shared_by_user_id,
                type_user_sender=parent_share.type_user_sender,
                type_user_receiver=parent_share.type_user_receiver
            )
            new_shares.append(new_share)
            # print(f"   ✅ Compartilhamento herdado para usuário {parent_share.shared_with_user_id} ({parent_share.type_user_receiver})")
    
    # OTIMIZAÇÃO: Adicionar todos de uma vez
    if new_shares:
        db.add_all(new_shares)
        db.commit()
        # print(f"   📝 {len(new_shares)} compartilhamentos criados em batch")

def create_node(db: Session, data: StorageCreate) -> StorageNode:
    """
    Cria um novo node (arquivo ou pasta).
    Se o node tem um parent_id, herda automaticamente os compartilhamentos da pasta pai.
    """
    node = StorageNode(**data.dict())
    db.add(node)
    db.commit()
    db.refresh(node)
    
    # Se tem pasta pai, herdar compartilhamentos
    if node.parent_id:
        inherit_parent_shares(db, node.id, node.parent_id)
    
    # LOG: Criação
    try:
        criar_log_documento(
            db=db,
            node_id=node.id,
            action=DocumentAction.CREATED,
            user_id=data.business_id,
            user_type=data.type_user,
            user_name=data.business_name if hasattr(data, 'business_name') else None,  # Tentar pegar do payload se existir, ou deixar nulo (será processado na view)
            # Na verdade, create é sempre owner. Vamos tentar buscar o nome.
            # ... (código de busca de nome similar ao move_node)

            details={"name": node.name, "type": node.type.value if hasattr(node.type, 'value') else str(node.type)}
        )
    except Exception as e:
        print(f"Erro ao criar log de criação: {e}")

    return node

def get_node(db: Session, node_id: int) -> StorageNode:
    node = db.query(StorageNode).filter(StorageNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node não encontrado")
    return node

def list_children(
    db: Session, 
    parent_id: Optional[int], 
    user_id: int,
    user_type: str,
    company_id: Optional[int] = None,
    **kwargs
) -> List[StorageNode]:
    """
    Lista arquivos que o usuário pode ver.
    
    OTIMIZADO v2 (Critical Performance fix):
    - Se parent_id for fornecido, verifica acesso à PASTA PAI primeiro.
      Se o usuário tem acesso à pasta pai (dono ou compartilhado), assume acesso aos filhos.
      Isso elimina a necessidade de verificar shares individuais para cada um dos milhares de arquivos.
    - Se parent_id for None (raiz), usa JOIN ao invés de Subquery IN.
    
    FILTROS V3:
    - filtering (status, type, search) applied server-side.
    """
    
    # --- Helper para aplicar filtros comuns ---
    def apply_filters(base_query, status=None, file_type=None, search_term=None):
        if status:
            if status != 'todos':  # Frontend manda 'todos' as vezes
                base_query = base_query.filter(StorageNode.status == status)
        
        if file_type:
            if file_type != 'todos':
                # Converte string para Enum se necessário, ou compara direto se for string no DB
                # O model StorageNode usa Enum ou string? Vamos assumir string ou cast automático do SQLAlchemy
                base_query = base_query.filter(StorageNode.type == file_type)
        
        if search_term:
            term = f"%{search_term}%"
            base_query = base_query.filter(or_(
                StorageNode.name.ilike(term),
                StorageNode.comments.ilike(term)
            ))
        return base_query
    # ------------------------------------------

    # ESTRATÉGIA 1: Listagem de PASTA ESPECÍFICA (Otimizada)
    if parent_id is not None:
        # Verificar se usuário tem acesso à pasta pai
        # 1. É dono da pasta?
        # 2. Pasta foi compartilhada com ele?
        
        # Como verificar 'dono' rapidamente?
        # A pasta pai deve existir e não estar deletada
        parent = db.query(StorageNode).filter(
            StorageNode.id == parent_id,
            StorageNode.deleted_at.is_(None)
        ).first()
        
        if not parent:
            return [] # Pasta não existe ou deletada
            
        has_access = False
        
        # Check 1: Dono
        if parent.business_id == user_id and parent.type_user == user_type:
            has_access = True
        
        # Check 2: Compartilhada (se não for dono)
        if not has_access:
            share_exists = db.query(Share.id).filter(
                Share.node_id == parent_id,
                Share.shared_with_user_id == user_id,
                Share.type_user_receiver == user_type
            ).first()
            if share_exists:
                has_access = True
                
        if has_access:
            # ✅ CAMINHO RÁPIDO: Se tem acesso à pasta, lista tudo nela direto.
            # Assume-se que acesso à pasta confere acesso aos filhos.
            query = db.query(StorageNode).filter(
                StorageNode.parent_id == parent_id,
                StorageNode.deleted_at.is_(None)
            )
            
            # Aplicar filtros
            query = apply_filters(query, kwargs.get('status'), kwargs.get('file_type'), kwargs.get('search_term'))
            
            return query.order_by(StorageNode.type.desc(), StorageNode.name.asc()).all()
    
    # ESTRATÉGIA 2: Listagem RAIZ ou Fallback (Complexa)
    # Se estamos na raiz (parent_id is None) OU (teoricamente) se não tiver acesso à pasta pai mas tiver a filhos soltos (raro em estrutura de pasta, mas possível)
    
    # Identificar se devemos achatar a lista (Search Global)
    # Status e FileType não devem quebrar a hierarquia visual, apenas filtrar o conteúdo atual
    flatten_results = bool(kwargs.get('search_term'))

    query = db.query(StorageNode).filter(StorageNode.deleted_at.is_(None))
    
    if parent_id is None:
        # Se NÃO estiver achatando (buscando), pega apenas a raiz.
        if not flatten_results:
            query = query.filter(StorageNode.parent_id.is_(None))
    else:
        query = query.filter(StorageNode.parent_id == parent_id)

    # JOIN com Share para filtrar visibilidade de forma eficiente
    # Opcional: Se for muito lento, pode-se separar em duas queries (Meus + Compartilhados) e unir no Python.
    # Mas o LEFT OUTER JOIN filtrado costuma ser bom se indexado.
    
    # Filtro: (Dono) OU (Compartilhado)
    # query = query.outerjoin(Share, StorageNode.id == Share.node_id).filter(
    #     or_(
    #         (StorageNode.business_id == user_id) & (StorageNode.type_user == user_type),
    #         (Share.shared_with_user_id == user_id) & (Share.type_user_receiver == user_type)
    #     )
    # )
    # Problema do JOIN: Duplicatas se compartilhado múltiplas vezes (distinct resolveria, mas é lento)
    # E o JOIN pode multiplicar linhas antes do filter.
    
    # Melhor abordagem para RAIZ misturada:
    # Union de (Meus Arquivos) + (Arquivos Compartilhados)
    
    # ESTRATÉGIA PROJETO (Freelancer/Colaborador visualizando empresa)
    is_project_view = False
    
    # Validação de Acesso à Empresa
    if company_id and company_id != user_id:
        # Verifica se tem link ativo
        link = db.query(UserBusinessLink).filter(
            UserBusinessLink.user_id == user_id,
            UserBusinessLink.type_user == user_type,
            UserBusinessLink.business_id == company_id,
            UserBusinessLink.status == 1
        ).first()
        
        # Ou se é colaborador
        collaborator = None
        if not link and user_type == 'collaborator':
             # Se for colaborador, o company_id deve bater com o dele
             collaborator = db.query(CompanyCollaborator).filter(
                 CompanyCollaborator.id == user_id,
                 CompanyCollaborator.company_id == company_id
             ).first()

        if link or collaborator:
            # ✅ VERIFICAR PERMISSÕES
            permissions = link.permissions if link else collaborator.permissions
            if not permissions: permissions = {}

            # Regras de Visibilidade (Similar a list_files_for_collaborator)
            can_view_all = permissions.get('manage_files') or permissions.get('view_only')
            can_view_shared = permissions.get('view_shared')

            if can_view_all:
                is_project_view = True
                # Acesso total aos arquivos da empresa
            elif can_view_shared:
                # Apenas arquivos compartilhados
                # Não ativa is_project_view para q_main (arquivos da empresa), 
                # pois q_main mostraria tudo.
                # Apenas q_shared deve retornar algo.
                is_project_view = False 
                pass 
            else:
                # Sem permissão de visualização
                return [] 

        else:
             # Se enviou company_id mas não tem acesso, ignora (ou poderia dar erro 403)
             # Vamos ignorar e mostrar o padrão (pessoal) por segurança, ou retornar vazio?
             # Para evitar vazamento, melhor não mostrar nada do projeto.
             pass

    # A. Arquivos Principais (Meus ou do Projeto)
    q_main = db.query(StorageNode).filter(
        StorageNode.deleted_at.is_(None)
    )
    
    if is_project_view:
        # Se é visão de projeto, filtra pela empresa
        q_main = q_main.filter(StorageNode.company_id == company_id)
        # NUNCA filtrar por business_id == user_id aqui, pois queremos ver arquivos da empresa e de outros
    else:
        # Visão padrão (Pessoal)
        # Deve mostrar apenas arquivos "Pessoais" (onde company_id é o próprio usuário ou nulo)
        # E que o usuário é dono.
        
        q_main = q_main.filter(
            StorageNode.business_id == user_id,
            StorageNode.type_user == user_type
        )
        
        # SEGREGAÇÃO: Se estou no ambiente pessoal, não quero ver arquivos de projetos de empresas
        # Se company_id foi passado como None ou igual ao user_id (Lógica de "Own Environment")
        # Vamos assumir que "Personal View" significa não ver coisas de outros company_ids
        
        # Se company_id for None ou igual ao user_id, filtramos para garantir que
        # não apareçam arquivos de "company_id" de terceiros.
        
        # Nota: Arquivos legados podem ter company_id=None ou company_id=user_id.
        is_personal_context = False
        if company_id is None or company_id == user_id:
             is_personal_context = True
             
        if is_personal_context:
             q_main = q_main.filter(
                 or_(
                     StorageNode.company_id == user_id,
                     StorageNode.company_id.is_(None)
                 )
             )

    if parent_id is None:
        if not flatten_results:
             q_main = q_main.filter(StorageNode.parent_id.is_(None))
    else:
        q_main = q_main.filter(StorageNode.parent_id == parent_id)
        
    # Aplicar filtros
    q_main = apply_filters(q_main, kwargs.get('status'), kwargs.get('file_type'), kwargs.get('search_term'))
        
    
    # B. Arquivos Compartilhados (Sempre mostrar, independente de view?)
    # Se estou vendo PROJETO, quero ver compartilhados COMIGO naquele projeto?
    # Ou arquivos compartilhados NO GERAL?
    # Vamos manter a lógica padrão: Mostra o que foi compartilhado COM O USUÁRIO LOGADO.
    
    q_shared = db.query(StorageNode).join(
        Share, StorageNode.id == Share.node_id
    ).filter(
        StorageNode.deleted_at.is_(None),
        Share.shared_with_user_id == user_id,
        Share.type_user_receiver == user_type
    )
    
    if is_project_view:
        # Se estou no projeto, talvez queira ver APENAS compartilhados que pertencem a esse projeto?
        # Isso faria sentido para separar contextos.
        q_shared = q_shared.filter(StorageNode.company_id == company_id)
    
    if parent_id is not None:
         q_shared = q_shared.filter(StorageNode.parent_id == parent_id)
    elif not flatten_results:
        parent_shared_subquery = db.query(Share.node_id).filter(
            Share.shared_with_user_id == user_id,
            Share.type_user_receiver == user_type
        )
        q_shared = q_shared.filter(
            StorageNode.parent_id.notin_(parent_shared_subquery)
        )
        
    q_shared = apply_filters(q_shared, kwargs.get('status'), kwargs.get('file_type'), kwargs.get('search_term'))
    
    # Unir e Executar
    final_query = q_main.union(q_shared)
    return final_query.order_by(StorageNode.type.desc(), StorageNode.name.asc()).all()


def update_node(db: Session, node_id: int, data: StorageUpdate, user_id: int = None, type_user: str = None) -> StorageNode:
    node = get_node(db, node_id)
    
    # 1. Capturar estado anterior para log detalhado
    old_values = {
        "name": node.name,
        "url": node.url,
        "size": node.size,
        "updated_at": str(node.updated_at) if node.updated_at else None,
        "data_validade": str(node.data_validade) if node.data_validade else None,
        "status": node.status,
        "comments": node.comments,
        "parent_id": node.parent_id
    }
    
    # 2. Atualizar campos
    update_dict = data.dict(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(node, k, v)
    
    db.commit()
    db.refresh(node)
    
    # 3. LOG: Detecção Inteligente de Mudanças
    if user_id and type_user:
        try:
            action = DocumentAction.EDITED
            details = {}
            
            # A) Versão do Arquivo (Upload de novo arquivo)
            if "url" in update_dict and update_dict["url"] != old_values["url"]:
                action = DocumentAction.VERSION_UPLOADED
                # Salvar metadados da versão anterior para permitir download/restore
                details["old_version"] = {
                    "url": old_values["url"],
                    "size": old_values["size"],
                    "updated_at": old_values["updated_at"],
                    "name": old_values["name"] # Nome caso tenha mudado também
                }
            
            # B) Renomeação
            elif "name" in update_dict and update_dict["name"] != old_values["name"]:
                # Se mudou nome E parente, é MOVE. Mas temos função move_node separada.
                # Aqui consideramos rename.
                action = DocumentAction.RENAMED
                details = {"old_name": old_values["name"], "new_name": node.name}
                
            # C) Mudança de Metadados (Data, Status, Comentários)
            else:
                changes = []
                
                # Helper para formatar data
                def fmt_date(d): return str(d) if d else None
                
                # Validade
                new_validade = fmt_date(node.data_validade)
                old_validade = old_values["data_validade"]
                if "data_validade" in update_dict and new_validade != old_validade:
                    changes.append({
                        "field": "data_validade",
                        "label": "Data de Validade",
                        "old": old_validade, 
                        "new": new_validade
                    })
                
                # Status
                if "status" in update_dict and update_dict["status"] != old_values["status"]:
                    changes.append({
                        "field": "status", 
                        "label": "Status",
                        "old": old_values["status"], 
                        "new": node.status
                    })
                    
                # Comentários
                if "comments" in update_dict and update_dict["comments"] != old_values["comments"]:
                    changes.append({
                        "field": "comments",
                        "label": "Comentários", 
                        "old": old_values["comments"], 
                        "new": node.comments
                    })
                
                if changes:
                    details["changes"] = changes
                
            
            # Buscar nome do usuário se não passado
            from app.models.user import UserPF, UserPJ, UserFreelancer
            from app.models.collaborator import CompanyCollaborator
            
            final_user_name = None
            if type_user == 'pf':
                u = db.query(UserPF).filter(UserPF.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'pj':
                u = db.query(UserPJ).filter(UserPJ.id == user_id).first()
                if u: final_user_name = u.razao_social
            elif type_user == 'freelancer':
                u = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'collaborator':
                u = db.query(CompanyCollaborator).filter(CompanyCollaborator.id == user_id).first()
                if u: final_user_name = u.name

            # Só cria log se houve alguma mudança relevante ou se é edit genérico
            # No caso, update_node sempre altera algo se veio no dict.
            criar_log_documento(
                db=db,
                node_id=node.id,
                action=action,
                user_id=user_id,
                user_type=type_user,
                user_name=final_user_name,
                details=details
            )
        except Exception as e:
            print(f"Erro ao criar log de update: {e}")

    return node

def move_node(db: Session, node_id: int, new_parent_id: Optional[int], user_id: int = None, type_user: str = None) -> StorageNode:
    """
    Move um node (arquivo ou pasta) para uma nova localização
    
    Args:
        node_id: ID do node a ser movido
        new_parent_id: ID da pasta de destino (None = mover para raiz)
    
    Returns:
        Node atualizado
    
    Raises:
        HTTPException: Se o node não existir, se tentar mover para si mesmo,
                      se o destino não for uma pasta, ou se criar ciclo
    """
    # Validar que o node existe
    node = get_node(db, node_id)
    
    # Validar que não está tentando mover para si mesmo
    if node_id == new_parent_id:
        raise HTTPException(status_code=400, detail="Não é possível mover um item para dentro dele mesmo")
    
    # Se new_parent_id não for None, validar que o destino existe e é uma pasta
    if new_parent_id is not None:
        parent_node = get_node(db, new_parent_id)
        if parent_node.type != NodeType.folder:
            raise HTTPException(status_code=400, detail="O destino deve ser uma pasta")
        
        # Validar que não está criando um ciclo (mover pasta para dentro de si mesma)
        if node.type == NodeType.folder:
            if _is_descendant(db, node_id, new_parent_id):
                raise HTTPException(
                    status_code=400, 
                    detail="Não é possível mover uma pasta para dentro dela mesma ou de suas subpastas"
                )
    
    # Mover o node
    old_parent_id = node.parent_id
    node.parent_id = new_parent_id
    db.commit()
    db.refresh(node)
    
    # LOG: Movimentação
    if user_id and type_user:
        try:
            # Buscar nomes das pastas para detalhar
            old_folder_name = "Raiz"
            if old_parent_id:
                old_p = db.query(StorageNode).filter(StorageNode.id == old_parent_id).first()
                if old_p: old_folder_name = old_p.name
                
            new_folder_name = "Raiz"
            if new_parent_id:
                new_p = db.query(StorageNode).filter(StorageNode.id == new_parent_id).first()
                if new_p: new_folder_name = new_p.name

            # Buscar nome do usuário se não passado
            # Importar os models de usuário necessários para buscar nome
            from app.models.user import UserPF, UserPJ, UserFreelancer
            from app.models.collaborator import CompanyCollaborator
            
            final_user_name = None
            if type_user == 'pf':
                u = db.query(UserPF).filter(UserPF.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'pj':
                u = db.query(UserPJ).filter(UserPJ.id == user_id).first()
                if u: final_user_name = u.razao_social
            elif type_user == 'freelancer':
                u = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'collaborator':
                u = db.query(CompanyCollaborator).filter(CompanyCollaborator.id == user_id).first()
                if u: final_user_name = u.name

            criar_log_documento(
                db=db,
                node_id=node.id,
                action=DocumentAction.MOVED,
                user_id=user_id,
                user_type=type_user,
                user_name=final_user_name,
                details={
                    "from_parent_id": old_parent_id,
                    "to_parent_id": new_parent_id,
                    "from_folder": old_folder_name,
                    "to_folder": new_folder_name
                }
            )
        except Exception as e:
            print(f"Erro ao criar log de movimentação: {e}")
            
    return node

def _is_descendant(db: Session, ancestor_id: int, potential_descendant_id: int) -> bool:
    """
    Verifica se potential_descendant_id é descendente de ancestor_id
    Usado para prevenir ciclos ao mover pastas
    """
    current = db.query(StorageNode).filter(StorageNode.id == potential_descendant_id).first()
    
    while current and current.parent_id is not None:
        if current.parent_id == ancestor_id:
            return True
        current = db.query(StorageNode).filter(StorageNode.id == current.parent_id).first()
    
    return False

def delete_node(db: Session, node_id: int):
    node = get_node(db, node_id)
    # Se for pasta, deletar recursivamente filhos
    if node.type == NodeType.folder:
        _delete_children(db, node.id)
    db.delete(node)
    db.commit()
    return {"message": "Node deletado"}

def _delete_children(db: Session, parent_id: int):
    children = db.query(StorageNode).filter(StorageNode.parent_id == parent_id).all()
    for c in children:
        if c.type == NodeType.folder:
            _delete_children(db, c.id)
        db.delete(c)

def get_documents_by_business_and_status(
    db: Session, 
    user_email: str, 
    business_email: str, 
    status: str
) -> List[StorageNode]:
    """
    Busca documentos de uma empresa específica baseado nas permissões do usuário e status
    
    Args:
        db: Sessão do banco de dados
        user_email: Email do usuário que está fazendo a busca
        business_email: Email da empresa
        status: Status dos documentos a serem buscados
        
    Returns:
        Lista de documentos que o usuário tem permissão para ver
    """
    from app.crud.user_business_link import get_user_info_by_email
    from app.crud.permission import get_user_permissions_by_email
    from app.models.share import Share
    
    # Busca informações do usuário e da empresa
    user_info = get_user_info_by_email(db, user_email)
    business_info = get_user_info_by_email(db, business_email)
    
    user_id = user_info["user_id"]
    business_id = business_info["user_id"]
    
    # Verifica se o usuário tem permissões na empresa
    user_permissions = get_user_permissions_by_email(db, user_email)
    has_permission = False
    
    for perm in user_permissions["permissions"]:
        if perm["business_id"] == business_id and perm["is_active"]:
            has_permission = True
            break
    
    if not has_permission:
        raise HTTPException(
            status_code=403, 
            detail="Usuário não tem permissão para acessar documentos desta empresa"
        )
    
    # Busca documentos da empresa com o status especificado
    documents = []
    
    # 1. Busca todos os arquivos da empresa com o status
    business_files = db.query(StorageNode).filter(
        StorageNode.business_id == business_id,
        StorageNode.type == NodeType.file,
        StorageNode.status == status,
        StorageNode.deleted_at.is_(None)  # Não mostrar deletados
    ).all()
    
    # 2. Busca arquivos compartilhados com o usuário (da empresa específica)
    shared_nodes = db.query(StorageNode).join(
        Share, StorageNode.id == Share.node_id
    ).filter(
        Share.shared_with_user_id == user_id,
        StorageNode.business_id == business_id,
        StorageNode.type == NodeType.file,
        StorageNode.status == status,
        StorageNode.deleted_at.is_(None)  # Não mostrar deletados
    ).all()
    
    # Combina os resultados (remove duplicatas)
    all_documents = business_files + shared_nodes
    unique_documents = []
    seen_ids = set()
    
    for doc in all_documents:
        if doc.id not in seen_ids:
            unique_documents.append(doc)
            seen_ids.add(doc.id)
    
    return unique_documents

def get_user_accessible_documents_by_status(
    db: Session,
    user_email: str,
    status: str,
    business_id: Optional[int] = None
) -> List[StorageNode]:
    """
    Busca todos os documentos que o usuário tem acesso, filtrado por status
    
    Args:
        db: Sessão do banco de dados
        user_email: Email do usuário
        status: Status dos documentos
        business_id: ID específico da empresa (opcional)
        
    Returns:
        Lista de todos os documentos acessíveis ao usuário
    """
    from app.crud.user_business_link import get_user_info_by_email
    from app.crud.permission import get_user_permissions_by_email
    from app.models.share import Share
    
    # Busca informações do usuário
    user_info = get_user_info_by_email(db, user_email)
    user_id = user_info["user_id"]
    
    # Busca permissões do usuário
    user_permissions = get_user_permissions_by_email(db, user_email)
    
    documents = []
    
    # Para cada empresa que o usuário tem permissão
    for perm in user_permissions["permissions"]:
        if not perm["is_active"]:
            continue
            
        # Se business_id foi especificado, filtra apenas essa empresa
        if business_id and perm["business_id"] != business_id:
            continue
        
        # Busca documentos da empresa com o status
        business_docs = db.query(StorageNode).filter(
            StorageNode.business_id == perm["business_id"],
            StorageNode.type == NodeType.file,
            StorageNode.status == status,
            StorageNode.deleted_at.is_(None)  # Não mostrar deletados
        ).all()
        
        documents.extend(business_docs)
    
    # Também busca documentos compartilhados diretamente com o usuário
    shared_docs = db.query(StorageNode).join(
        Share, StorageNode.id == Share.node_id
    ).filter(
        Share.shared_with_user_id == user_id,
        StorageNode.type == NodeType.file,
        StorageNode.status == status,
        StorageNode.deleted_at.is_(None)  # Não mostrar deletados
    )
    
    # Se business_id especificado, filtra compartilhados também
    if business_id:
        shared_docs = shared_docs.filter(StorageNode.business_id == business_id)
    
    shared_docs = shared_docs.all()
    documents.extend(shared_docs)
    
    # Remove duplicatas
    unique_documents = []
    seen_ids = set()
    
    for doc in documents:
        if doc.id not in seen_ids:
            unique_documents.append(doc)
            seen_ids.add(doc.id)
    
    return unique_documents


# ==========================================
# FUNÇÕES PARA LIXEIRA (TRASH)
# ==========================================

def soft_delete_node(db: Session, node_id: int, user_id: int, type_user: str):
    """
    Move um node (arquivo ou pasta) para a lixeira (soft delete)
    Se for pasta, move recursivamente todos os filhos
    """
    from datetime import datetime
    
    node = get_node(db, node_id)
    
    # Marcar como deletado
    node.deleted_at = datetime.now()
    node.deleted_by_id = user_id
    node.deleted_by_type = type_user
    
    # Se for pasta, deletar recursivamente filhos
    if node.type == NodeType.folder:
        _soft_delete_children(db, node.id, user_id, type_user)
    
    db.commit()
    db.refresh(node)
    
    # LOG: Deleção (Lixeira)
    try:
            # Buscar nome do usuário
            from app.models.user import UserPF, UserPJ, UserFreelancer
            from app.models.collaborator import CompanyCollaborator
            
            final_user_name = None
            if type_user == 'pf':
                u = db.query(UserPF).filter(UserPF.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'pj':
                u = db.query(UserPJ).filter(UserPJ.id == user_id).first()
                if u: final_user_name = u.razao_social
            elif type_user == 'freelancer':
                u = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'collaborator':
                u = db.query(CompanyCollaborator).filter(CompanyCollaborator.id == user_id).first()
                if u: final_user_name = u.name

            criar_log_documento(
                db=db,
                node_id=node.id,
                action=DocumentAction.DELETED,
                user_id=user_id,
                user_type=type_user,
                user_name=final_user_name
            )
    except Exception as e:
        print(f"Erro ao criar log de delete: {e}")
        
    return node


def _soft_delete_children(db: Session, parent_id: int, user_id: int, type_user: str):
    """Marca recursivamente todos os filhos como deletados"""
    from datetime import datetime
    
    children = db.query(StorageNode).filter(
        StorageNode.parent_id == parent_id,
        StorageNode.deleted_at.is_(None)  # Apenas não deletados
    ).all()
    
    for child in children:
        child.deleted_at = datetime.now()
        child.deleted_by_id = user_id
        child.deleted_by_type = type_user
        
        if child.type == NodeType.folder:
            _soft_delete_children(db, child.id, user_id, type_user)
    
    db.commit()


def list_trash(
    db: Session, 
    business_id: Optional[int] = None, 
    type_user: Optional[str] = None,
    user_id: Optional[int] = None
) -> List[StorageNode]:
    """
    Lista todos os itens na lixeira
    Retorna apenas os itens raiz (parent_id do item deletado, não filhos)
    """
    query = db.query(StorageNode).filter(StorageNode.deleted_at.isnot(None))
    
    if business_id is not None:
        query = query.filter(StorageNode.business_id == business_id)
    if type_user is not None:
        query = query.filter(StorageNode.type_user == type_user)
    if user_id is not None:
        query = query.filter(StorageNode.deleted_by_id == user_id)
    
    # Ordenar por data de exclusão (mais recente primeiro)
    return query.order_by(StorageNode.deleted_at.desc()).all()


def restore_node(db: Session, node_id: int, restore_to_parent: Optional[int] = None, user_id: int = None, type_user: str = None):
    """
    Restaura um node da lixeira para seu local original (ou novo local)
    Se for pasta, restaura recursivamente todos os filhos
    """
    node = db.query(StorageNode).filter(
        StorageNode.id == node_id,
        StorageNode.deleted_at.isnot(None)
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Item não encontrado na lixeira")
    
    # Restaurar
    node.deleted_at = None
    node.deleted_by_id = None
    node.deleted_by_type = None
    
    # Se especificou novo parent, mover para lá
    if restore_to_parent is not None:
        node.parent_id = restore_to_parent
    
    # Se for pasta, restaurar recursivamente filhos
    if node.type == NodeType.folder:
        _restore_children(db, node.id)
    
    db.commit()
    db.refresh(node)
    
    # LOG: Restauração
    if user_id and type_user:
        try:
            # Buscar nome do usuário
            from app.models.user import UserPF, UserPJ, UserFreelancer
            final_user_name = None
            if type_user == 'pf':
                u = db.query(UserPF).filter(UserPF.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'pj':
                u = db.query(UserPJ).filter(UserPJ.id == user_id).first()
                if u: final_user_name = u.razao_social
            elif type_user == 'freelancer':
                u = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
                if u: final_user_name = u.nome
            elif type_user == 'collaborator':
                # Collaborator geralmente é um UserPF vinculado
                u = db.query(UserPF).filter(UserPF.id == user_id).first()
                if u: final_user_name = u.nome

            criar_log_documento(
                db=db,
                node_id=node.id,
                action=DocumentAction.RESTORED,
                user_id=user_id,
                user_type=type_user,
                user_name=final_user_name
            )
        except Exception as e:
            print(f"Erro ao criar log de restauração: {e}")

    return node


def _restore_children(db: Session, parent_id: int):
    """Restaura recursivamente todos os filhos de uma pasta"""
    children = db.query(StorageNode).filter(
        StorageNode.parent_id == parent_id,
        StorageNode.deleted_at.isnot(None)
    ).all()
    
    for child in children:
        child.deleted_at = None
        child.deleted_by_id = None
        child.deleted_by_type = None
        
        if child.type == NodeType.folder:
            _restore_children(db, child.id)
    
    db.commit()


def permanent_delete_node(db: Session, node_id: int):
    """
    Deleta permanentemente um node da lixeira
    Se for pasta, deleta recursivamente todos os filhos
    """
    node = db.query(StorageNode).filter(
        StorageNode.id == node_id,
        StorageNode.deleted_at.isnot(None)
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Item não encontrado na lixeira")
    
    # Se for pasta, deletar recursivamente filhos primeiro
    if node.type == NodeType.folder:
        _permanent_delete_children(db, node.id)
    
    # Limpar dependências (Cascade manual)
    _cleanup_node_dependencies(db, node.id)

    db.delete(node)
    db.commit()
    return {"message": "Node deletado permanentemente"}


def _cleanup_node_dependencies(db: Session, node_id: int):
    """Remove dependências (Shares, Followers) antes de deletar o node"""
    # Importar models aqui para evitar ciclo
    from app.models.share import Share
    from app.models.document_notification import DocumentFollower
    
    # Deletar compartilhamentos
    db.query(Share).filter(Share.node_id == node_id).delete()
    
    # Deletar seguidores
    db.query(DocumentFollower).filter(DocumentFollower.node_id == node_id).delete()


def _permanent_delete_children(db: Session, parent_id: int):
    """Deleta permanentemente todos os filhos de uma pasta"""
    children = db.query(StorageNode).filter(StorageNode.parent_id == parent_id).all()
    
    for child in children:
        if child.type == NodeType.folder:
            _permanent_delete_children(db, child.id)
        
        # Limpar dependências de cada filho
        _cleanup_node_dependencies(db, child.id)
        db.delete(child)
    
    # Nota: O commit final é feito pelo chamador (permanent_delete_node)
    # Mas se for chamado recursivamente, tudo bem.



def empty_trash(
    db: Session,
    business_id: Optional[int] = None,
    type_user: Optional[str] = None,
    user_id: Optional[int] = None,
    older_than_days: Optional[int] = None
):
    """
    Esvazia a lixeira (delete permanente de todos os itens)
    Pode filtrar por business_id, type_user, user_id
    Se older_than_days especificado, deleta apenas itens mais antigos
    """
    from datetime import datetime, timedelta
    
    query = db.query(StorageNode).filter(StorageNode.deleted_at.isnot(None))
    
    if business_id is not None:
        query = query.filter(StorageNode.business_id == business_id)
    if type_user is not None:
        query = query.filter(StorageNode.type_user == type_user)
    if user_id is not None:
        query = query.filter(StorageNode.deleted_by_id == user_id)
    if older_than_days is not None:
        cutoff_date = datetime.now() - timedelta(days=older_than_days)
        query = query.filter(StorageNode.deleted_at < cutoff_date)
    
    items = query.all()
    deleted_count = 0
    
    for item in items:
        if item.type == NodeType.folder:
            _permanent_delete_children(db, item.id)
        db.delete(item)
        deleted_count += 1
    
    db.commit()
    return {"message": f"{deleted_count} itens deletados permanentemente"}
