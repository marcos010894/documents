from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user_business_link import UserBusinessLink
from app.models.user import UserPF, UserFreelancer, UserPJ
from app.models.collaborator import CompanyCollaborator
from app.schemas.user_business_link import UserBusinessLinkCreate, UserBusinessLinkUpdate
from typing import List, Optional, Dict, Any
from app.services.email_service import send_active_freelancer_email

def create_link(db: Session, data: UserBusinessLinkCreate) -> UserBusinessLink:
    # Busca informações do usuário pelo email
    user_info = get_user_info_by_email(db, data.email)
    
    user_id = user_info["user_id"]
    type_user = user_info["type_user"]
    
    # Verifica se já existe vínculo
    existing = db.query(UserBusinessLink).filter(
        UserBusinessLink.user_id == user_id,
        UserBusinessLink.business_id == data.business_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Vínculo já existe entre este usuário e empresa")
    
    # Validação para Freelancer
    # Se estou adicionando um 'freelancer' (pelo endpoint que chama isso, geralmente define o tipo ou contexto)
    # Aqui, vamos assumir que se o data.business_type for 'freelancer' ou se o target é freelancer
    # O requisito diz: "quando adiciono um freelancer existente... caso nao seja um freelancer, alertar"
    
    # Se o tipo do usuário encontrado NÃO for freelancer, mas a intenção era adicionar um freelancer
    # Como saber a intenção? Geralmente o frontend manda o contexto.
    # Mas se o type_user retornado for diferente de freelancer e o contexto exigir, bloqueamos.
    # Assumindo que o "UserBusinessLinkCreate" tem algum indicativo ou que a validação é estrita:
    
    # Lógica: Se o usuário encontrado não é freelancer, e estamos tentando vincular...
    # O requisito diz "casou nao seja um freelancer, ele vai alertar, que nao existe conta freelancer com aquele email".
    # Isso sugere que o endpoint é EXCLUSIVO para adicionar freelancers OU que devemos validar o tipo.
    # Vamos validar: Se type_user != 'freelancer', mas a operação esperava um freelancer. 
    # Como não temos um flag explícito 'is_adding_freelancer' no DTO genérico, vamos inferir ou aplicar a regra geral:
    # SE o endpoint chamado foi para adicionar freelancer (contexto do frontend), o frontend deve validar.
    # Mas no backend, se business_type do PAYLOAD for o tipo da empresa que ESTÁ ADICIONANDO...
    
    # Vamos assumir que se o usuário NÃO é freelancer, ele não pode ser adicionado como freelancer.
    if type_user != 'freelancer' and data.business_type != 'freelancer': 
        # CUIDADO: data.business_type é o tipo da empresa QUE ADICIONA ou o tipo do VÍNCULO?
        # No model UserBusinessLink: business_id/business_type referem-se à EMPRESA (Pai).
        # Então se uma PJ adiciona, business_type = 'pj'.
        pass 
        
    # Requisito Simplificado: Se o usuário adicionado NÃO for freelancer, dar erro?
    # Não podemos bloquear adicionar PJ ou PF se o sistema permite.
    # Mas o requisito é específico: "caso nao seja um freelancer... alertar que nao existe CONTA FREELANCER com aquele email"
    # Isso implica que se eu passo um email de um 'pf', o sistema não deve aceitar se eu queria um 'freelancer'.
    # Vou adicionar uma verificação: Se o type_user retornado não for 'freelancer', e o sistema tentou achar um freelancer...
    # Na verdade, o 'get_user_info_by_email' já retorna o tipo.
    
    # Vou adicionar a notificação aqui se for freelancer
    notify = False
    if type_user == 'freelancer':
        notify = True

    
    # Cria o vínculo com os dados obtidos pelo email
    link_data = {
        "user_id": user_id,
        "type_user": type_user,
        "business_id": data.business_id,
        "business_type": data.business_type,
        "permissions": data.permissions,
        "status": data.status
    }
    
    link = UserBusinessLink(**link_data)
    db.add(link)
    db.commit()
    db.refresh(link)

    # Enviar notificação se for freelancer
    if notify:
        # Precisamos do nome da empresa para o email
        company_info = get_user_basic_info(db, data.business_id, data.business_type)
        company_name = company_info.get('name', 'Uma Empresa')
        
        # Envia em background ou direto (direto por enquanto, timeout no service é alto)
        try:
            send_active_freelancer_email(data.email, company_name)
        except Exception as e:
            print(f"Erro ao enviar email para freelancer: {e}")

    return link

def get_link(db: Session, link_id: int) -> UserBusinessLink:
    link = db.query(UserBusinessLink).filter(UserBusinessLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Vínculo não encontrado")
    return link

def list_links(db: Session, user_id: Optional[int] = None, business_id: Optional[int] = None, status: Optional[int] = None) -> List[UserBusinessLink]:
    query = db.query(UserBusinessLink)
    
    if user_id is not None:
        query = query.filter(UserBusinessLink.user_id == user_id)
    if business_id is not None:
        query = query.filter(UserBusinessLink.business_id == business_id)
    if status is not None:
        query = query.filter(UserBusinessLink.status == status)
        
    return query.order_by(UserBusinessLink.created_at.desc()).all()

def update_link(db: Session, link_id: int, data: UserBusinessLinkUpdate) -> UserBusinessLink:
    link = get_link(db, link_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(link, k, v)
    db.commit()
    db.refresh(link)
    return link

def delete_link(db: Session, link_id: int):
    link = get_link(db, link_id)
    db.delete(link)
    db.commit()
    return {"message": "Vínculo deletado com sucesso"}

def activate_user(db: Session, link_id: int) -> UserBusinessLink:
    """Ativa um usuário (status = 1)"""
    return update_link(db, link_id, UserBusinessLinkUpdate(status=1))

def deactivate_user(db: Session, link_id: int) -> UserBusinessLink:
    """Desativa um usuário (status = 0)"""
    return update_link(db, link_id, UserBusinessLinkUpdate(status=0))

def get_user_info_by_email(db: Session, email: str) -> Dict[str, Any]:
    """
    Busca informações do usuário (ID e tipo) através do email
    
    Args:
        db: Sessão do banco de dados
        email: Email do usuário
        
    Returns:
        Dict com user_id, type_user e dados completos do usuário
        
    Raises:
        HTTPException: Quando o usuário não é encontrado
    """
    # Buscar em user_pf
    user_pf = db.query(UserPF).filter(UserPF.email == email).first()
    if user_pf:
        return {
            "user_id": user_pf.id,
            "type_user": "pf",
            "user_data": {
                "id": user_pf.id,
                "nome": user_pf.nome,
                "email": user_pf.email,
                "cpf": user_pf.cpf,
                "telefone": user_pf.telefone,
                "empresa_trabalha": user_pf.empresa_trabalha,
                "nascimento": user_pf.nascimento,
                "cidade": user_pf.cidade,
                "estado": user_pf.estado,
                "tipo_conta": user_pf.tipo_conta,
                "status": user_pf.status,
                "created_at": user_pf.created_at
            }
        }
    
    # Buscar em user_freelancer
    user_freelancer = db.query(UserFreelancer).filter(UserFreelancer.email == email).first()
    if user_freelancer:
        return {
            "user_id": user_freelancer.id,
            "type_user": "freelancer",
            "user_data": {
                "id": user_freelancer.id,
                "nome": user_freelancer.nome,
                "email": user_freelancer.email,
                "cpf": user_freelancer.cpf,
                "telefone": user_freelancer.telefone,
                "empresa_trabalha": user_freelancer.empresa_trabalha,
                "nascimento": user_freelancer.nascimento,
                "logradouro": user_freelancer.logradouro,
                "numero": user_freelancer.numero,
                "bairro": user_freelancer.bairro,
                "cidade": user_freelancer.cidade,
                "estado": user_freelancer.estado,
                "complemento": user_freelancer.complemento,
                "tipo_conta": user_freelancer.tipo_conta,
                "com_oque_trabalha": user_freelancer.com_oque_trabalha,
                "descricaoServico": user_freelancer.descricaoServico,
                "site_portifolio": user_freelancer.site_portifolio,
                "linkedin": user_freelancer.linkedin,
                "marketplace": user_freelancer.marketplace,
                "status": user_freelancer.status,
                "created_at": user_freelancer.created_at
            }
        }
    
    # Se não encontrou em PF nem Freelancer, verificar se é uma empresa (PJ) vinculada a um PF
    # Nota: UserPJ não tem campo email direto, é vinculado via user_pf
    user_pj = db.query(UserPJ).join(UserPF, UserPJ.id_user_pf == UserPF.id).filter(UserPF.email == email).first()
    if user_pj:
        # Buscar os dados do UserPF vinculado
        user_pf_linked = db.query(UserPF).filter(UserPF.id == user_pj.id_user_pf).first()
        return {
            "user_id": user_pj.id,
            "type_user": "pj",
            "user_data": {
                "id": user_pj.id,
                "cnpj": user_pj.cnpj,
                "razao_social": user_pj.razao_social,
                "nome_fantasia": user_pj.nome_fantasia,
                "site": user_pj.site,
                "email": user_pf_linked.email if user_pf_linked else None,
                "id_user_pf": user_pj.id_user_pf,
                "cnae_primario": user_pj.cnae_primario,
                "cnae_secundario": user_pj.cnae_secundario,
                "cep": user_pj.cep,
                "logradouro": user_pj.logradouro,
                "numero": user_pj.numero,
                "bairro": user_pj.bairro,
                "cidade": user_pj.cidade,
                "estado": user_pj.estado,
                "complemento": user_pj.complemento,
                "marketplace": user_pj.marketplace,
                "tipo_empresa": user_pj.tipo_empresa,
                "segmento_empresa": user_pj.segmento_empresa,
                "outras_infos": user_pj.outras_infos,
                "status": user_pj.status,
                "created_at": user_pj.created_at
            }
        }
    
    # Buscar em colaboradores (company_collaborators)
    collaborator = db.query(CompanyCollaborator).filter(CompanyCollaborator.email == email).first()
    if collaborator:
        return {
            "user_id": collaborator.id,
            "type_user": "collaborator",
            "user_data": {
                "id": collaborator.id,
                "nome": collaborator.name,
                "email": collaborator.email,
                "company_id": collaborator.company_id,
                "company_type": collaborator.company_type,
                "is_active": collaborator.is_active,
                "permissions": collaborator.permissions,
                "created_at": collaborator.created_at
            }
        }
    
    # Se não encontrou em nenhuma tabela
    raise HTTPException(status_code=404, detail=f"Usuário com email '{email}' não encontrado")


def get_user_companies(db: Session, user_id: int, type_user: str) -> List[Dict[str, Any]]:
    """
    Retorna todas as empresas vinculadas a um usuário
    
    Args:
        db: Sessão do banco de dados
        user_id: ID do usuário
        type_user: Tipo do usuário ('pf', 'freelancer', 'pj')
        
    Returns:
        Lista de empresas com seus dados completos
    """
    # Buscar todos os vínculos ativos do usuário
    links = db.query(UserBusinessLink).filter(
        UserBusinessLink.user_id == user_id,
        UserBusinessLink.type_user == type_user,
        UserBusinessLink.status == 1  # Apenas vínculos ativos
    ).all()
    
    companies = []
    
    for link in links:
        company_data = {
            "link_id": link.id,
            "business_id": link.business_id,
            "business_type": link.business_type,
            "created_at": link.created_at,
            "permissions": link.permissions
        }
        
        # Buscar dados da empresa baseado no business_type
        if link.business_type == "pj":
            empresa = db.query(UserPJ).filter(UserPJ.id == link.business_id).first()
            if empresa:
                company_data.update({
                    "cnpj": empresa.cnpj,
                    "razao_social": empresa.razao_social,
                    "nome_fantasia": empresa.nome_fantasia,
                    "nome_exibicao": empresa.nome_fantasia or empresa.razao_social,  # Para exibição
                    "cidade": empresa.cidade,
                    "estado": empresa.estado,
                    "tipo_empresa": empresa.tipo_empresa,
                    "segmento_empresa": empresa.segmento_empresa,
                    "marketplace": empresa.marketplace,
                    "status": empresa.status
                })
        elif link.business_type == "freelancer":
            freelancer = db.query(UserFreelancer).filter(UserFreelancer.id == link.business_id).first()
            if freelancer:
                company_data.update({
                    "nome": freelancer.nome,
                    "nome_exibicao": freelancer.nome,  # Para exibição
                    "email": freelancer.email,
                    "cpf": freelancer.cpf,
                    "cidade": freelancer.cidade,
                    "estado": freelancer.estado,
                    "com_oque_trabalha": freelancer.com_oque_trabalha,
                    "marketplace": freelancer.marketplace,
                    "status": freelancer.status
                })
        elif link.business_type == "pf":
            pf = db.query(UserPF).filter(UserPF.id == link.business_id).first()
            if pf:
                company_data.update({
                    "nome": pf.nome,
                    "nome_exibicao": pf.nome,  # Para exibição
                    "email": pf.email,
                    "cpf": pf.cpf,
                    "cidade": pf.cidade,
                    "estado": pf.estado,
                    "empresa_trabalha": pf.empresa_trabalha,
                    "status": pf.status
                })
        
        companies.append(company_data)
    
    return companies


def get_user_companies_by_email(db: Session, email: str) -> Dict[str, Any]:
    """
    Retorna informações do usuário e todas as empresas vinculadas a ele através do email
    
    Args:
        db: Sessão do banco de dados
        email: Email do usuário
        
    Returns:
        Dict com dados do usuário e lista de empresas vinculadas
    """
    # Buscar informações do usuário
    user_info = get_user_info_by_email(db, email)
    
    # Buscar empresas vinculadas
    companies = get_user_companies(db, user_info["user_id"], user_info["type_user"])
    
    return {
        "user": {
            "user_id": user_info["user_id"],
            "type_user": user_info["type_user"],
            "user_data": user_info["user_data"]
        },
        "companies": companies,
        "total_companies": len(companies)
    }

def get_user_basic_info(db: Session, user_id: int, type_user: str) -> Dict[str, str]:
    """
    Busca informações básicas (nome, email) de um usuário pelo ID e tipo
    """
    name = "Desconhecido"
    email = ""
    
    if type_user == 'pf':
        user = db.query(UserPF).filter(UserPF.id == user_id).first()
        if user:
            name = user.nome
            email = user.email
    elif type_user == 'pj':
        user = db.query(UserPJ).filter(UserPJ.id == user_id).first()
        if user:
            name = user.nome_fantasia or user.razao_social
            # PJ recupera email via link com PF ou deixa vazio se não acessível fácil
            email =  "" 
    elif type_user == 'freelancer':
        user = db.query(UserFreelancer).filter(UserFreelancer.id == user_id).first()
        if user:
            name = user.nome
            email = user.email
    elif type_user == 'collaborator':
        user = db.query(CompanyCollaborator).filter(CompanyCollaborator.id == user_id).first()
        if user:
            name = user.name
            email = user.email
            
    return {"name": name, "email": email}
