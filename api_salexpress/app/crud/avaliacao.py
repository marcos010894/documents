from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.models.avaliacao import Avaliacao, AvaliacaoLink, StatusAvaliacao
from app.models.avaliacao_Salexpress import AvaliacaoSalexpress
from app.schemas.avaliacao import AvaliacaoCreate, AvaliacaoLinkCreate
from typing import List, Dict, Any
from datetime import datetime, timedelta
import secrets
import string

def gerar_token_unico() -> str:
    """Gera um token único para o link de avaliação"""
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(32))

def criar_link_avaliacao(db: Session, data: AvaliacaoLinkCreate, base_url: str = "https://api.Salexpress.com") -> Dict[str, Any]:
    """
    Cria um link temporário de avaliação
    """
    # Gerar token único
    token = gerar_token_unico()
    
    # Verificar se o token já existe (muito improvável, mas por segurança)
    while db.query(AvaliacaoLink).filter(AvaliacaoLink.token == token).first():
        token = gerar_token_unico()
    
    # Calcular data de expiração
    expira_em = datetime.now() + timedelta(days=data.dias_validade)
    
    # Criar link
    link = AvaliacaoLink(
        token=token,
        id_avaliado=data.id_avaliado,
        tipo_avaliado=data.tipo_avaliado,
        servico_prestado=data.servico_prestado,
        expira_em=expira_em,
        usado=False
    )
    
    db.add(link)
    db.commit()
    db.refresh(link)
    
    # Gerar URL completo
    link_completo = f"{base_url}/api/v1/avaliacoes/avaliar/{token}"
    
    return {
        "id": link.id,
        "token": token,
        "link_completo": link_completo,
        "id_avaliado": link.id_avaliado,
        "tipo_avaliado": link.tipo_avaliado,
        "servico_prestado": link.servico_prestado,
        "usado": link.usado,
        "expira_em": link.expira_em,
        "created_at": link.created_at
    }

def validar_link_avaliacao(db: Session, token: str) -> AvaliacaoLink:
    """
    Valida um link de avaliação
    """
    link = db.query(AvaliacaoLink).filter(AvaliacaoLink.token == token).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link de avaliação não encontrado")
    
    if link.usado:
        raise HTTPException(status_code=400, detail="Este link de avaliação já foi utilizado")
    
    if link.expira_em < datetime.now():
        raise HTTPException(status_code=400, detail="Este link de avaliação expirou")
    
    return link

def criar_avaliacao(db: Session, data: AvaliacaoCreate, token: str = None, ip_address: str = None) -> Avaliacao:
    """
    Cria uma nova avaliação
    """
    # Se tem token, validar e usar os dados do link
    if token:
        link = validar_link_avaliacao(db, token)
        data.id_avaliado = link.id_avaliado
        data.tipo_avaliado = link.tipo_avaliado
        data.servico_prestado = link.servico_prestado
    
    # Calcular média total
    media_total = (data.nota_atendimento + data.nota_preco + data.nota_qualidade) / 3
    
    # Criar avaliação do serviço
    avaliacao = Avaliacao(
        nome_avaliador=data.nome_avaliador,
        email_avaliador=data.email_avaliador,
        numero_avaliador=data.numero_avaliador,
        id_avaliado=data.id_avaliado,
        tipo_avaliado=data.tipo_avaliado,
        nota_atendimento=data.nota_atendimento,
        nota_preco=data.nota_preco,
        nota_qualidade=data.nota_qualidade,
        media_total=round(media_total, 2),
        servico_prestado=data.servico_prestado,
        comentario=data.comentario,
        ip_avaliador=ip_address
    )
    
    db.add(avaliacao)
    db.flush()  # Para obter o ID da avaliação
    
    # Se tiver avaliação da Salexpress, criar registro separado
    if data.avaliacao_Salexpress:
        avaliacao_Salexpress = AvaliacaoSalexpress(
            avaliacao_id=avaliacao.id,
            nome_avaliador=data.nome_avaliador,
            email_avaliador=data.email_avaliador,
            nota_busca_fornecedor=data.avaliacao_Salexpress.nota_busca_fornecedor,
            comentario_experiencia=data.avaliacao_Salexpress.comentario_experiencia,
            ip_avaliador=ip_address
        )
        db.add(avaliacao_Salexpress)
    
    # Se usou link, marcar como usado
    if token:
        link.usado = True
        link.usado_em = datetime.now()
        link.avaliacao_id = avaliacao.id
    
    db.commit()
    db.refresh(avaliacao)
    
    return avaliacao

def listar_avaliacoes(
    db: Session, 
    id_avaliado: int = None, 
    tipo_avaliado: str = None,
    status: StatusAvaliacao = None,
    skip: int = 0, 
    limit: int = 10
) -> List[Avaliacao]:
    """
    Lista avaliações com filtros opcionais
    """
    query = db.query(Avaliacao)
    
    if id_avaliado:
        query = query.filter(Avaliacao.id_avaliado == id_avaliado)
    
    if tipo_avaliado:
        query = query.filter(Avaliacao.tipo_avaliado == tipo_avaliado)
    
    if status:
        query = query.filter(Avaliacao.status == status)
    
    return query.order_by(Avaliacao.created_at.desc()).offset(skip).limit(limit).all()

def obter_estatisticas_avaliacoes(db: Session, id_avaliado: int, tipo_avaliado: str) -> Dict[str, Any]:
    """
    Obtém estatísticas de avaliações de um usuário/empresa
    Considera apenas avaliações APROVADAS
    """
    avaliacoes = db.query(Avaliacao).filter(
        Avaliacao.id_avaliado == id_avaliado,
        Avaliacao.tipo_avaliado == tipo_avaliado,
        Avaliacao.status == StatusAvaliacao.APROVADO
    ).all()
    
    if not avaliacoes:
        return {
            "total_avaliacoes": 0,
            "media_atendimento": 0,
            "media_preco": 0,
            "media_qualidade": 0,
            "media_geral": 0,
            "avaliacoes_recentes": []
        }
    
    total = len(avaliacoes)
    media_atendimento = sum(a.nota_atendimento for a in avaliacoes) / total
    media_preco = sum(a.nota_preco for a in avaliacoes) / total
    media_qualidade = sum(a.nota_qualidade for a in avaliacoes) / total
    media_geral = sum(a.media_total for a in avaliacoes) / total
    
    # Pegar as 5 mais recentes
    avaliacoes_recentes = sorted(avaliacoes, key=lambda x: x.created_at, reverse=True)[:5]
    
    return {
        "total_avaliacoes": total,
        "media_atendimento": round(media_atendimento, 2),
        "media_preco": round(media_preco, 2),
        "media_qualidade": round(media_qualidade, 2),
        "media_geral": round(media_geral, 2),
        "avaliacoes_recentes": avaliacoes_recentes
    }

def obter_avaliacao(db: Session, avaliacao_id: int) -> Avaliacao:
    """
    Obtém uma avaliação específica
    """
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    return avaliacao

def atualizar_status_avaliacao(db: Session, avaliacao_id: int, novo_status: StatusAvaliacao) -> Avaliacao:
    """
    Atualiza o status de uma avaliação (APROVADO, AGUARDANDO_APROVACAO, NEGADO)
    """
    avaliacao = obter_avaliacao(db, avaliacao_id)
    
    avaliacao.status = novo_status
    db.commit()
    db.refresh(avaliacao)
    
    return avaliacao

def listar_avaliacoes_Salexpress(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    apenas_aprovadas: bool = False
) -> Dict[str, Any]:
    """
    Lista todas as avaliações da plataforma Salexpress
    Retorna avaliações sobre a experiência de usar a plataforma
    
    Args:
        skip: Paginação - pular N registros
        limit: Paginação - limitar a N registros (0 = sem limite)
        apenas_aprovadas: Se True, retorna apenas avaliações com status APROVADO
    """
    from sqlalchemy import desc
    
    # Buscar todas as avaliações da Salexpress com dados da avaliação principal
    query = db.query(AvaliacaoSalexpress).join(
        Avaliacao,
        AvaliacaoSalexpress.avaliacao_id == Avaliacao.id
    )
    
    # Filtrar apenas aprovadas se solicitado
    if apenas_aprovadas:
        query = query.filter(Avaliacao.status == StatusAvaliacao.APROVADO)
    
    query = query.order_by(desc(AvaliacaoSalexpress.created_at))
    
    # Contar total
    total = query.count()
    
    # Aplicar paginação
    avaliacoes_Salexpress = query.offset(skip).limit(limit).all() if limit > 0 else query.all()
    
    # Calcular estatísticas
    if avaliacoes_Salexpress:
        notas = [av.nota_busca_fornecedor for av in avaliacoes_Salexpress]
        media_geral = sum(notas) / len(notas)
        
        # Calcular NPS (Net Promoter Score)
        # Promotores (9-10): Nota 4.5-5
        # Neutros (7-8): Nota 3.5-4.5
        # Detratores (0-6): Nota 0-3.5
        promotores = len([n for n in notas if n >= 4.5])
        detratores = len([n for n in notas if n <= 3.5])
        nps = ((promotores - detratores) / len(notas)) * 100 if notas else 0
    else:
        media_geral = 0
        nps = 0
    
    # Preparar resultado com informações da avaliação principal
    resultado = []
    for av_Salexpress in avaliacoes_Salexpress:
        avaliacao_principal = db.query(Avaliacao).filter(
            Avaliacao.id == av_Salexpress.avaliacao_id
        ).first()
        
        resultado.append({
            "id": av_Salexpress.id,
            "avaliacao_id": av_Salexpress.avaliacao_id,
            "nome_avaliador": av_Salexpress.nome_avaliador,
            "email_avaliador": av_Salexpress.email_avaliador,
            "nota_busca_fornecedor": av_Salexpress.nota_busca_fornecedor,
            "comentario_experiencia": av_Salexpress.comentario_experiencia,
            "created_at": av_Salexpress.created_at,
            "ip_avaliador": av_Salexpress.ip_avaliador,
            # Dados da avaliação principal
            "servico_avaliado": avaliacao_principal.servico_prestado if avaliacao_principal else None,
            "media_servico": avaliacao_principal.media_total if avaliacao_principal else None
        })
    
    return {
        "data": resultado,
        "total": total,
        "estatisticas": {
            "total_avaliacoes": total,
            "media_geral": round(media_geral, 2),
            "nps": round(nps, 2),
            "percentual_positivas": round((len([n for n in notas if n >= 4.0]) / len(notas)) * 100, 2) if notas else 0
        }
    }

def obter_estatisticas_Salexpress(db: Session, apenas_aprovadas: bool = False) -> Dict[str, Any]:
    """
    Obtém estatísticas gerais das avaliações da Salexpress
    
    Args:
        apenas_aprovadas: Se True, considera apenas avaliações com status APROVADO
    """
    query = db.query(AvaliacaoSalexpress).join(
        Avaliacao,
        AvaliacaoSalexpress.avaliacao_id == Avaliacao.id
    )
    
    # Filtrar apenas aprovadas se solicitado
    if apenas_aprovadas:
        query = query.filter(Avaliacao.status == StatusAvaliacao.APROVADO)
    
    avaliacoes = query.all()
    
    if not avaliacoes:
        return {
            "total_avaliacoes": 0,
            "media_geral": 0,
            "nps": 0,
            "distribuicao_notas": {
                "5_estrelas": 0,
                "4_estrelas": 0,
                "3_estrelas": 0,
                "2_estrelas": 0,
                "1_estrela": 0
            },
            "percentual_positivas": 0,
            "percentual_negativas": 0
        }
    
    notas = [av.nota_busca_fornecedor for av in avaliacoes]
    media_geral = sum(notas) / len(notas)
    
    # Calcular NPS
    promotores = len([n for n in notas if n >= 4.5])
    detratores = len([n for n in notas if n <= 3.5])
    nps = ((promotores - detratores) / len(notas)) * 100
    
    # Distribuição de notas
    distribuicao = {
        "5_estrelas": len([n for n in notas if n >= 4.5]),
        "4_estrelas": len([n for n in notas if 3.5 <= n < 4.5]),
        "3_estrelas": len([n for n in notas if 2.5 <= n < 3.5]),
        "2_estrelas": len([n for n in notas if 1.5 <= n < 2.5]),
        "1_estrela": len([n for n in notas if n < 1.5])
    }
    
    # Percentuais
    positivas = len([n for n in notas if n >= 4.0])
    negativas = len([n for n in notas if n < 3.0])
    
    return {
        "total_avaliacoes": len(avaliacoes),
        "media_geral": round(media_geral, 2),
        "nps": round(nps, 2),
        "distribuicao_notas": distribuicao,
        "percentual_positivas": round((positivas / len(notas)) * 100, 2),
        "percentual_negativas": round((negativas / len(notas)) * 100, 2),
        "total_com_comentario": len([av for av in avaliacoes if av.comentario_experiencia])
    }
