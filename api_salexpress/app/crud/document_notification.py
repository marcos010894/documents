from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException
from app.models.document_notification import DocumentFollower, DocumentNotification
from app.models.storage import StorageNode
from app.models.user import UserPF, UserPJ, UserFreelancer
from app.models.collaborator import CompanyCollaborator
from app.models.share import Share
from app.schemas.document_notification import DocumentFollowerCreate, DocumentFollowerUpdate
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

def seguir_documento(db: Session, data: DocumentFollowerCreate) -> DocumentFollower:
    """
    Faz um usuário seguir um documento
    """
    # Verificar se o documento existe
    documento = db.query(StorageNode).filter(StorageNode.id == data.node_id).first()
    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    if documento.type != "file":
        raise HTTPException(status_code=400, detail="Só é possível seguir arquivos, não pastas")
    
    # Verificar se já está seguindo
    seguidor_existente = db.query(DocumentFollower).filter(
        and_(
            DocumentFollower.node_id == data.node_id,
            DocumentFollower.user_id == data.user_id,
            DocumentFollower.tipo_usuario == data.tipo_usuario
        )
    ).first()
    
    if seguidor_existente:
        # Reativar se estava desativado
        if not seguidor_existente.ativo:
            seguidor_existente.ativo = True
            seguidor_existente.dias_antes_alerta = data.dias_antes_alerta
            seguidor_existente.alertar_no_vencimento = data.alertar_no_vencimento
            db.commit()
            db.refresh(seguidor_existente)
            return seguidor_existente
        raise HTTPException(status_code=400, detail="Você já está seguindo este documento")
    
    # Criar novo seguidor
    seguidor = DocumentFollower(
        node_id=data.node_id,
        user_id=data.user_id,
        tipo_usuario=data.tipo_usuario,
        dias_antes_alerta=data.dias_antes_alerta,
        alertar_no_vencimento=data.alertar_no_vencimento,
        ativo=True
    )
    
    db.add(seguidor)
    db.commit()
    db.refresh(seguidor)
    
    return seguidor

def deixar_de_seguir_documento(db: Session, node_id: int, user_id: int, tipo_usuario: str) -> Dict[str, str]:
    """
    Remove o seguimento de um documento
    """
    seguidor = db.query(DocumentFollower).filter(
        and_(
            DocumentFollower.node_id == node_id,
            DocumentFollower.user_id == user_id,
            DocumentFollower.tipo_usuario == tipo_usuario,
            DocumentFollower.ativo == True
        )
    ).first()
    
    if not seguidor:
        raise HTTPException(status_code=404, detail="Você não está seguindo este documento")
    
    # Desativar ao invés de deletar (manter histórico)
    seguidor.ativo = False
    db.commit()
    
    return {"message": "Você deixou de seguir este documento"}

def atualizar_configuracoes_seguimento(
    db: Session, 
    node_id: int, 
    user_id: int, 
    tipo_usuario: str, 
    data: DocumentFollowerUpdate
) -> DocumentFollower:
    """
    Atualiza as configurações de notificação de um seguimento
    """
    seguidor = db.query(DocumentFollower).filter(
        and_(
            DocumentFollower.node_id == node_id,
            DocumentFollower.user_id == user_id,
            DocumentFollower.tipo_usuario == tipo_usuario,
            DocumentFollower.ativo == True
        )
    ).first()
    
    if not seguidor:
        raise HTTPException(status_code=404, detail="Você não está seguindo este documento")
    
    # Atualizar campos fornecidos
    if data.dias_antes_alerta is not None:
        seguidor.dias_antes_alerta = data.dias_antes_alerta
    if data.alertar_no_vencimento is not None:
        seguidor.alertar_no_vencimento = data.alertar_no_vencimento
    if data.ativo is not None:
        seguidor.ativo = data.ativo
    
    db.commit()
    db.refresh(seguidor)
    
    return seguidor

def listar_documentos_seguidos(db: Session, user_id: int, tipo_usuario: str) -> List[Dict[str, Any]]:
    """
    Lista todos os documentos que o usuário está seguindo
    """
    seguidores = db.query(DocumentFollower, StorageNode).join(
        StorageNode, DocumentFollower.node_id == StorageNode.id
    ).filter(
        and_(
            DocumentFollower.user_id == user_id,
            DocumentFollower.tipo_usuario == tipo_usuario,
            DocumentFollower.ativo == True
        )
    ).all()
    
    resultado = []
    for seguidor, documento in seguidores:
        # Calcular dias para vencimento
        dias_para_vencimento = None
        status_vencimento = "SEM_VALIDADE"
        
        if documento.data_validade:
            dias_para_vencimento = (documento.data_validade - datetime.now().date()).days
            if dias_para_vencimento < 0:
                status_vencimento = "VENCIDO"
            elif dias_para_vencimento == 0:
                status_vencimento = "VENCE_HOJE"
            elif dias_para_vencimento <= seguidor.dias_antes_alerta:
                status_vencimento = "PROXIMO_VENCIMENTO"
            else:
                status_vencimento = "VIGENTE"
        
        resultado.append({
            "seguidor_id": seguidor.id,
            "documento_id": documento.id,
            "documento_nome": documento.name,
            "documento_url": documento.url,
            "data_validade": documento.data_validade,
            "dias_para_vencimento": dias_para_vencimento,
            "status_vencimento": status_vencimento,
            "dias_antes_alerta": seguidor.dias_antes_alerta,
            "alertar_no_vencimento": seguidor.alertar_no_vencimento,
            "seguindo_desde": seguidor.created_at
        })
    
    return resultado

def listar_notificacoes_usuario(db: Session, user_id: int, tipo_usuario: str, limit: int = 50) -> List[DocumentNotification]:
    """
    Lista as notificações de um usuário
    """
    return db.query(DocumentNotification).filter(
        and_(
            DocumentNotification.user_id == user_id,
            DocumentNotification.tipo_usuario == tipo_usuario
        )
    ).order_by(DocumentNotification.created_at.desc()).limit(limit).all()

def obter_email_usuario(db: Session, user_id: int, tipo_usuario: str) -> str:
    """
    Obtém o email do usuário pelo ID e tipo
    """
    if tipo_usuario == "pf":
        user = db.query(UserPF).filter(UserPF.id == user_id).first()
        return user.email if user else None
    elif tipo_usuario == "pj":
        user = db.query(UserPJ).filter(UserPJ.id == user_id).first()
        if user and user.id_user_pf:
            user_pf = db.query(UserPF).filter(UserPF.id == user.id_user_pf).first()
            return user_pf.email if user_pf else None
        return None
    elif tipo_usuario == "freelancer":
        user = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
        return user.email if user else None
    return None


# ==========================================
# FUNÇÕES BATCH OTIMIZADAS
# ==========================================

def obter_seguidores_batch(db: Session, node_ids: List[int]) -> Dict[int, List[Dict[str, Any]]]:
    """
    Busca seguidores para múltiplos documentos de uma vez.
    OTIMIZADO: Usa queries específicas (tuples) ao invés de carregar objetos ORM inteiros.
    """
    if not node_ids:
        return {}
    
    # 1. Buscar seguidores (dados crus)
    # Retorna tuplas: (node_id, user_id, tipo_usuario, id, dias, alertar, created_at)
    q_followers = db.query(
        DocumentFollower.node_id,
        DocumentFollower.user_id,
        DocumentFollower.tipo_usuario,
        DocumentFollower.id,
        DocumentFollower.dias_antes_alerta,
        DocumentFollower.alertar_no_vencimento,
        DocumentFollower.created_at
    ).filter(
        DocumentFollower.node_id.in_(node_ids),
        DocumentFollower.ativo == True
    )
    followers_data = q_followers.all()
    
    if not followers_data:
        return {}

    # Coletar IDs de usuários
    user_ids_pf = set()
    user_ids_pj = set()
    user_ids_freelancer = set()
    
    for f in followers_data:
        # f[2] é tipo_usuario, f[1] é user_id
        t = f.tipo_usuario
        uid = f.user_id
        if t == "pf": user_ids_pf.add(uid)
        elif t == "pj": user_ids_pj.add(uid)
        elif t == "freelancer": user_ids_freelancer.add(uid)

    # 2. Buscar dados de usuários em batch (Apenas ID, Nome/Razao, Email/ID_PF)
    
    # PF
    users_pf_map = {}
    if user_ids_pf:
        res = db.query(UserPF.id, UserPF.nome, UserPF.email)\
                .filter(UserPF.id.in_(user_ids_pf)).all()
        for r in res:
            users_pf_map[r.id] = {"id": r.id, "nome": r.nome, "email": r.email, "tipo": "pf"}

    # Freelancer
    users_free_map = {}
    if user_ids_freelancer:
        res = db.query(UserFreelancer.id, UserFreelancer.nome, UserFreelancer.email)\
                .filter(UserFreelancer.id.in_(user_ids_freelancer)).all()
        for r in res:
            users_free_map[r.id] = {"id": r.id, "nome": r.nome, "email": r.email, "tipo": "freelancer"}
            
    # PJ (precisa buscar email do PF vinculado se necessário, mas para listagem rápida talvez não precise?)
    # Vamos manter a busca do email para não quebrar contrato
    users_pj_map = {}
    if user_ids_pj:
        # Buscar PJ: id, razao_social, id_user_pf
        res_pj = db.query(UserPJ.id, UserPJ.razao_social, UserPJ.id_user_pf)\
                   .filter(UserPJ.id.in_(user_ids_pj)).all()
        
        pj_ids_pf = set()
        temp_pj_list = []
        for r in res_pj:
            temp_pj_list.append(r)
            if r.id_user_pf:
                pj_ids_pf.add(r.id_user_pf)
        
        # Buscar emails dos PFs vinculados
        pf_emails_map = {}
        if pj_ids_pf:
            res_emails = db.query(UserPF.id, UserPF.email).filter(UserPF.id.in_(pj_ids_pf)).all()
            for re in res_emails:
                pf_emails_map[re.id] = re.email
        
        # Montar mapa PJ
        for r in temp_pj_list:
            email = pf_emails_map.get(r.id_user_pf) if r.id_user_pf else None
            users_pj_map[r.id] = {"id": r.id, "nome": r.razao_social, "email": email, "tipo": "pj"}

    # 3. Montar Resultado
    seguidores_por_node = {nid: [] for nid in node_ids}
    
    for f in followers_data:
        # Desempacotar tupla
        nid, uid, ttype, fid, dias, alertar, created = f
        
        user_info = None
        if ttype == "pf":
            user_info = users_pf_map.get(uid)
        elif ttype == "pj":
            user_info = users_pj_map.get(uid)
        elif ttype == "freelancer":
            user_info = users_free_map.get(uid)
            
        if user_info:
            seguidores_por_node[nid].append({
                "seguidor_id": fid,
                "usuario": user_info,
                "dias_antes_alerta": dias,
                "alertar_no_vencimento": alertar,
                "created_at": created
            })
            
    return seguidores_por_node


def verificar_seguimento_batch(db: Session, node_ids: List[int], user_id: int, tipo_usuario: str) -> Dict[int, Dict[str, Any]]:
    """
    Verifica se usuário segue múltiplos documentos de uma vez.
    OTIMIZADO: Usa core query para retornar apenas colunas necessárias.
    """
    if not node_ids:
        return {}
    
    tipo_usuario_normalized = tipo_usuario.lower() if tipo_usuario else None
    
    # Query otimizada: busca apenas campos necessários
    q = db.query(
        DocumentFollower.node_id,
        DocumentFollower.id,
        DocumentFollower.dias_antes_alerta,
        DocumentFollower.alertar_no_vencimento,
        DocumentFollower.created_at
    ).filter(
        and_(
            DocumentFollower.node_id.in_(node_ids),
            DocumentFollower.user_id == user_id,
            or_(
                DocumentFollower.tipo_usuario == tipo_usuario,
                DocumentFollower.tipo_usuario == tipo_usuario_normalized
            ),
            DocumentFollower.ativo == True
        )
    )
    
    rows = q.all()
    
    # Mapear node_id -> dados
    seguindo_map = {}
    for r in rows:
        # r = (node_id, id, dias, alertar, created_at)
        seguindo_map[r.node_id] = {
            "seguindo": True,
            "seguidor_id": r.id,
            "dias_antes_alerta": r.dias_antes_alerta,
            "alertar_no_vencimento": r.alertar_no_vencimento,
            "created_at": r.created_at
        }
    
    resultado = {}
    for node_id in node_ids:
        if node_id in seguindo_map:
            resultado[node_id] = seguindo_map[node_id]
        else:
            resultado[node_id] = {"seguindo": False}
    
    return resultado



def verificar_dono_batch(db: Session, nodes: List, user_id: int, tipo_usuario: str) -> Dict[int, bool]:
    """
    Verifica se usuário é dono de múltiplos documentos.
    OTIMIZADO: Não precisa de query extra, usa os nodes já carregados.
    """
    resultado = {}
    for node in nodes:
        is_dono = False
        if node.type_user == tipo_usuario and node.business_id == user_id:
            is_dono = True
        resultado[node.id] = is_dono
    return resultado


def obter_seguidores_documento(db: Session, node_id: int) -> List[Dict[str, Any]]:
    """
    Retorna todos os seguidores ativos de um documento com informações do usuário
    """
    seguidores = db.query(DocumentFollower).filter(
        and_(
            DocumentFollower.node_id == node_id,
            DocumentFollower.ativo == True
        )
    ).all()
    
    resultado = []
    for seguidor in seguidores:
        # Buscar informações do usuário
        user_info = None
        email = obter_email_usuario(db, seguidor.user_id, seguidor.tipo_usuario)
        
        if seguidor.tipo_usuario == "pf":
            user = db.query(UserPF).filter(UserPF.id == seguidor.user_id).first()
            if user:
                user_info = {
                    "id": user.id,
                    "nome": user.nome,
                    "email": user.email,
                    "tipo": "pf"
                }
        elif seguidor.tipo_usuario == "pj":
            user = db.query(UserPJ).filter(UserPJ.id == seguidor.user_id).first()
            if user:
                # Buscar email do UserPF vinculado
                email_pj = None
                if user.id_user_pf:
                    user_pf = db.query(UserPF).filter(UserPF.id == user.id_user_pf).first()
                    email_pj = user_pf.email if user_pf else None
                user_info = {
                    "id": user.id,
                    "nome": user.razao_social,
                    "email": email_pj,
                    "tipo": "pj"
                }
        elif seguidor.tipo_usuario == "freelancer":
            user = db.query(UserFreelancer).filter(UserFreelancer.id == seguidor.user_id).first()
            if user:
                user_info = {
                    "id": user.id,
                    "nome": user.nome,
                    "email": user.email,
                    "tipo": "freelancer"
                }
        
        if user_info:
            resultado.append({
                "seguidor_id": seguidor.id,
                "usuario": user_info,
                "dias_antes_alerta": seguidor.dias_antes_alerta,
                "alertar_no_vencimento": seguidor.alertar_no_vencimento,
                "created_at": seguidor.created_at
            })
    
    return resultado

def verificar_se_usuario_segue(db: Session, node_id: int, user_id: int, tipo_usuario: str) -> Dict[str, Any]:
    """
    Verifica se um usuário está seguindo um documento
    Retorna informações do seguimento se sim, None se não
    """
    # Normalizar tipo_usuario para minúsculas
    tipo_usuario_normalized = tipo_usuario.lower() if tipo_usuario else None
    
    # print(f"🔍 Verificando seguimento: node_id={node_id}, user_id={user_id}, tipo_usuario={tipo_usuario} (normalizado: {tipo_usuario_normalized})")
    
    # Buscar com OR para aceitar ambos os casos (com e sem capitalização)
    seguidor = db.query(DocumentFollower).filter(
        and_(
            DocumentFollower.node_id == node_id,
            DocumentFollower.user_id == user_id,
            or_(
                DocumentFollower.tipo_usuario == tipo_usuario,
                DocumentFollower.tipo_usuario == tipo_usuario_normalized,
                DocumentFollower.tipo_usuario == tipo_usuario.capitalize() if tipo_usuario else None
            ),
            DocumentFollower.ativo == True
        )
    ).first()
    
    # print(f"   Resultado: {'SEGUINDO' if seguidor else 'NÃO SEGUINDO'}")
    # if seguidor:
    #    print(f"   Tipo salvo no BD: {seguidor.tipo_usuario}")
    
    if seguidor:
        return {
            "seguindo": True,
            "seguidor_id": seguidor.id,
            "dias_antes_alerta": seguidor.dias_antes_alerta,
            "alertar_no_vencimento": seguidor.alertar_no_vencimento,
            "created_at": seguidor.created_at
        }
    
    return {
        "seguindo": False
    }

def verificar_se_usuario_e_dono(db: Session, node_id: int, user_id: int, tipo_usuario: str) -> bool:
    """
    Verifica se o usuário é dono do documento
    """
    documento = db.query(StorageNode).filter(StorageNode.id == node_id).first()
    if not documento:
        return False
    
    # Verificar se é dono baseado no business_id e type_user
    if documento.type_user == tipo_usuario:
        if tipo_usuario == "pf":
            # Para PF, comparar user_id com business_id (que seria o id do usuário)
            return documento.business_id == user_id
        elif tipo_usuario == "pj":
            # Para PJ, verificar se o usuário pertence à empresa
            return documento.business_id == user_id
        elif tipo_usuario == "freelancer":
            # Para freelancer, comparar user_id com business_id
            return documento.business_id == user_id
    
    return False


def seguir_documento_por_email(
    db: Session, 
    node_id: int, 
    email: str,
    dias_antes_alerta: int = 7,
    alertar_no_vencimento: bool = True
) -> DocumentFollower:
    """
    Faz um usuário seguir um documento automaticamente usando apenas o email
    Busca o usuário em todas as tabelas (PF, PJ, Freelancer) pelo email
    """
    # Verificar se o documento existe
    documento = db.query(StorageNode).filter(StorageNode.id == node_id).first()
    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    if documento.type.value != "file":
        raise HTTPException(status_code=400, detail="Só é possível seguir arquivos, não pastas")
    
    # Buscar usuário por email em todas as tabelas
    user_id = None
    tipo_usuario = None
    
    # Buscar em UserPF
    user_pf = db.query(UserPF).filter(UserPF.email == email).first()
    if user_pf:
        user_id = user_pf.id
        tipo_usuario = "pf"
    
    # Se não encontrou em PF, buscar em UserFreelancer
    if not user_id:
        user_freelancer = db.query(UserFreelancer).filter(UserFreelancer.email == email).first()
        if user_freelancer:
            user_id = user_freelancer.id
            tipo_usuario = "freelancer"
    
    # Se não encontrou, retornar erro
    if not user_id:
        raise HTTPException(
            status_code=404, 
            detail=f"Nenhum usuário encontrado com o email {email}"
        )
    
    # Verificar se já está seguindo
    seguidor_existente = db.query(DocumentFollower).filter(
        and_(
            DocumentFollower.node_id == node_id,
            DocumentFollower.user_id == user_id,
            DocumentFollower.tipo_usuario == tipo_usuario
        )
    ).first()
    
    if seguidor_existente:
        # Reativar se estava desativado
        if not seguidor_existente.ativo:
            seguidor_existente.ativo = True
            seguidor_existente.dias_antes_alerta = dias_antes_alerta
            seguidor_existente.alertar_no_vencimento = alertar_no_vencimento
            db.commit()
            db.refresh(seguidor_existente)
            return seguidor_existente
        else:
            # Já está seguindo e ativo
            return seguidor_existente
    
    # Criar novo seguidor
    seguidor = DocumentFollower(
        node_id=node_id,
        user_id=user_id,
        tipo_usuario=tipo_usuario,
        dias_antes_alerta=dias_antes_alerta,
        alertar_no_vencimento=alertar_no_vencimento,
        ativo=True
    )
    
    db.add(seguidor)
    db.commit()
    db.refresh(seguidor)
    
    return seguidor


def obter_compartilhamentos_documento(db: Session, node_id: int) -> List[Dict[str, Any]]:
    """
    Retorna todos os usuários com quem um documento está compartilhado
    Similar à função de seguidores, mas para compartilhamentos
    """
    compartilhamentos = db.query(Share).filter(Share.node_id == node_id).all()
    
    resultado = []
    for share in compartilhamentos:
        # Buscar informações do usuário que RECEBEU o compartilhamento
        user_info = None
        tipo_usuario = share.type_user_receiver
        
        if tipo_usuario == "pf":
            user = db.query(UserPF).filter(UserPF.id == share.shared_with_user_id).first()
            if user:
                user_info = {
                    "id": user.id,
                    "nome": user.nome,
                    "email": user.email,
                    "tipo": "pf"
                }
        elif tipo_usuario == "pj":
            user = db.query(UserPJ).filter(UserPJ.id == share.shared_with_user_id).first()
            if user:
                # Buscar email do UserPF vinculado
                email_pj = None
                if user.id_user_pf:
                    user_pf = db.query(UserPF).filter(UserPF.id == user.id_user_pf).first()
                    email_pj = user_pf.email if user_pf else None
                user_info = {
                    "id": user.id,
                    "nome": user.razao_social,
                    "email": email_pj,
                    "tipo": "pj"
                }
        elif tipo_usuario == "freelancer":
            user = db.query(UserFreelancer).filter(UserFreelancer.id == share.shared_with_user_id).first()
            if user:
                user_info = {
                    "id": user.id,
                    "nome": user.nome,
                    "email": user.email,
                    "tipo": "freelancer"
                }
        elif tipo_usuario == "collaborator":
            user = db.query(CompanyCollaborator).filter(CompanyCollaborator.id == share.shared_with_user_id).first()
            if user:
                user_info = {
                    "id": user.id,
                    "nome": user.name,
                    "email": user.email,
                    "tipo": "collaborator",
                    "company_id": user.company_id,
                    "company_type": user.company_type
                }
        
        # Buscar informações do usuário que COMPARTILHOU
        shared_by_info = None
        tipo_usuario_sender = share.type_user_sender
        
        if tipo_usuario_sender == "pf":
            sender = db.query(UserPF).filter(UserPF.id == share.shared_by_user_id).first()
            if sender:
                shared_by_info = {
                    "id": sender.id,
                    "nome": sender.nome,
                    "email": sender.email,
                    "tipo": "pf"
                }
        elif tipo_usuario_sender == "pj":
            sender = db.query(UserPJ).filter(UserPJ.id == share.shared_by_user_id).first()
            if sender:
                # Buscar email do UserPF vinculado
                email_sender = None
                if sender.id_user_pf:
                    user_pf_sender = db.query(UserPF).filter(UserPF.id == sender.id_user_pf).first()
                    email_sender = user_pf_sender.email if user_pf_sender else None
                shared_by_info = {
                    "id": sender.id,
                    "nome": sender.razao_social,
                    "email": email_sender,
                    "tipo": "pj"
                }
        elif tipo_usuario_sender == "freelancer":
            sender = db.query(UserFreelancer).filter(UserFreelancer.id == share.shared_by_user_id).first()
            if sender:
                shared_by_info = {
                    "id": sender.id,
                    "nome": sender.nome,
                    "email": sender.email,
                    "tipo": "freelancer"
                }
        elif tipo_usuario_sender == "collaborator":
            sender = db.query(CompanyCollaborator).filter(CompanyCollaborator.id == share.shared_by_user_id).first()
            if sender:
                shared_by_info = {
                    "id": sender.id,
                    "nome": sender.name,
                    "email": sender.email,
                    "tipo": "collaborator",
                    "company_id": sender.company_id,
                    "company_type": sender.company_type
                }
        
        if user_info:
            resultado.append({
                "share_id": share.id,
                "compartilhado_com": user_info,
                "compartilhado_por": shared_by_info,
                "created_at": share.created_at
            })
    
    return resultado
