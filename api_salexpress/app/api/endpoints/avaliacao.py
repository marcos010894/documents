from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.conn import get_db
from app.schemas.avaliacao import (
    AvaliacaoCreate,
    AvaliacaoResponse,
    AvaliacaoLinkCreate,
    AvaliacaoLinkResponse,
    AvaliacaoStats,
    AvaliacaoStatusUpdate,
    AvaliacaoSalexpressResponse
)
from app.crud.avaliacao import (
    criar_link_avaliacao,
    validar_link_avaliacao,
    criar_avaliacao,
    listar_avaliacoes,
    obter_estatisticas_avaliacoes,
    obter_avaliacao,
    atualizar_status_avaliacao,
    listar_avaliacoes_Salexpress,
    obter_estatisticas_Salexpress
)

router = APIRouter()

@router.post("/criar-link", response_model=AvaliacaoLinkResponse)
def criar_link_avaliacao_endpoint(
    payload: AvaliacaoLinkCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Cria um link temporário para avaliação
    
    Exemplo:
    ```json
    {
        "id_avaliado": 22,
        "tipo_avaliado": "freelancer",
        "servico_prestado": "Desenvolvimento de website institucional",
        "dias_validade": 30
    }
    ```
    """
    base_url = str(request.base_url).rstrip('/')
    return criar_link_avaliacao(db, payload, base_url)

@router.get("/avaliar/{token}", response_class=HTMLResponse)
def renderizar_formulario_avaliacao(token: str, db: Session = Depends(get_db)):
    """
    Renderiza o formulário de avaliação HTML
    """
    # Validar link
    try:
        link = validar_link_avaliacao(db, token)
    except HTTPException as e:
        return f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Link Inválido - Salexpress</title>
            <style>
                {get_css_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-message">
                    <h1>❌ Link Inválido</h1>
                    <p>{e.detail}</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    # Renderizar formulário
    return get_html_form(token, link.servico_prestado)

@router.post("/avaliar/{token}", response_model=AvaliacaoResponse)
def submeter_avaliacao(
    token: str,
    payload: AvaliacaoCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Submete uma avaliação via link temporário
    """
    # Obter IP do cliente
    ip_address = request.client.host if request.client else None
    
    return criar_avaliacao(db, payload, token, ip_address)

@router.post("/", response_model=AvaliacaoResponse)
def criar_avaliacao_direta(
    payload: AvaliacaoCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Cria uma avaliação diretamente (sem link temporário)
    Requer todos os campos preenchidos
    """
    if not payload.id_avaliado or not payload.tipo_avaliado or not payload.servico_prestado:
        raise HTTPException(
            status_code=400,
            detail="Para criar avaliação direta, é necessário informar id_avaliado, tipo_avaliado e servico_prestado"
        )
    
    ip_address = request.client.host if request.client else None
    return criar_avaliacao(db, payload, None, ip_address)

@router.get("/", response_model=List[AvaliacaoResponse])
def listar_avaliacoes_endpoint(
    id_avaliado: int = None,
    tipo_avaliado: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Lista avaliações com filtros opcionais
    
    Parâmetros:
    - id_avaliado: Filtra por ID do avaliado
    - tipo_avaliado: Filtra por tipo (pf, pj, freelancer)
    - status: Filtra por status (APROVADO, AGUARDANDO_APROVACAO, NEGADO)
    """
    return listar_avaliacoes(db, id_avaliado, tipo_avaliado, status, skip, limit)

@router.get("/stats/{id_avaliado}/{tipo_avaliado}", response_model=AvaliacaoStats)
def obter_estatisticas(
    id_avaliado: int,
    tipo_avaliado: str,
    db: Session = Depends(get_db)
):
    """
    Obtém estatísticas de avaliações de um usuário/empresa
    """
    return obter_estatisticas_avaliacoes(db, id_avaliado, tipo_avaliado)

@router.get("/{avaliacao_id}", response_model=AvaliacaoResponse)
def obter_avaliacao_endpoint(avaliacao_id: int, db: Session = Depends(get_db)):
    """
    Obtém uma avaliação específica
    """
    return obter_avaliacao(db, avaliacao_id)

@router.patch("/{avaliacao_id}/status", response_model=AvaliacaoResponse)
def atualizar_status_endpoint(
    avaliacao_id: int, 
    payload: AvaliacaoStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza o status de uma avaliação
    
    Status disponíveis:
    - APROVADO: A avaliação foi aprovada e aparecerá publicamente
    - AGUARDANDO_APROVACAO: A avaliação está aguardando moderação (padrão)
    - NEGADO: A avaliação foi negada e não aparecerá publicamente
    
    Exemplo:
    ```json
    {
        "status": "APROVADO"
    }
    ```
    """
    return atualizar_status_avaliacao(db, avaliacao_id, payload.status)


@router.get("/Salexpress/avaliacoes", response_model=Dict[str, Any])
def listar_avaliacoes_Salexpress_endpoint(
    skip: int = 0,
    limit: int = 100,
    apenas_aprovadas: bool = False,
    db: Session = Depends(get_db)
):
    """
    Lista todas as avaliações da plataforma Salexpress
    
    Retorna avaliações sobre a experiência dos clientes ao usar a plataforma Salexpress
    para buscar fornecedores. Inclui estatísticas gerais.
    
    Parâmetros:
    - skip: Paginação - pular N registros (padrão: 0)
    - limit: Paginação - limitar a N registros (padrão: 100, 0 = sem limite)
    - apenas_aprovadas: Se True, retorna apenas avaliações com status APROVADO (padrão: False)
    
    Resposta inclui:
    - data: Lista de avaliações com informações do avaliador e serviço relacionado
    - total: Total de avaliações da Salexpress
    - estatisticas: Média geral, NPS, percentual de avaliações positivas
    
    Exemplo:
    ```
    GET /api/v1/avaliacoes/Salexpress/avaliacoes?skip=0&limit=100
    GET /api/v1/avaliacoes/Salexpress/avaliacoes?apenas_aprovadas=true
    ```
    """
    return listar_avaliacoes_Salexpress(db, skip, limit, apenas_aprovadas)
    return listar_avaliacoes_Salexpress(db, skip, limit)


@router.get("/Salexpress/estatisticas", response_model=Dict[str, Any])
def obter_estatisticas_Salexpress_endpoint(
    apenas_aprovadas: bool = False,
    db: Session = Depends(get_db)
):
    """
    Obtém estatísticas gerais das avaliações da Salexpress
    
    Query Parameters:
    - apenas_aprovadas: Se True, considera apenas avaliações aprovadas (default: False)
    
    Retorna:
    - total_avaliacoes: Total de avaliações da plataforma
    - media_geral: Média das notas (0-5)
    - nps: Net Promoter Score (-100 a 100)
    - distribuicao_notas: Quantidade de avaliações por faixa
    - percentual_positivas: % de avaliações >= 4.0
    - percentual_negativas: % de avaliações < 3.0
    - total_com_comentario: Quantidade de avaliações com comentário
    """
    return obter_estatisticas_Salexpress(db, apenas_aprovadas)


def get_css_styles() -> str:
    """Retorna os estilos CSS para o formulário"""
    return """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #e98344 0%, #d4671f 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .servico-badge {
            background: #f0f0f0;
            padding: 10px 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        
        .servico-badge strong {
            color: #e98344;
        }
        
        .form-step {
            display: none;
        }
        
        .form-step.active {
            display: block;
            animation: fadeIn 0.5s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .step-indicator {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
            gap: 10px;
        }
        
        .step-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ddd;
            transition: all 0.3s;
        }
        
        .step-dot.active {
            background: #e98344;
            transform: scale(1.3);
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        input, textarea {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        input:focus, textarea:focus {
            outline: none;
            border-color: #e98344;
        }
        
        .rating-container {
            text-align: center;
        }
        
        .stars {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
            font-size: 40px;
        }
        
        .star {
            cursor: pointer;
            color: #ddd;
            transition: all 0.2s;
        }
        
        .star:hover, .star.active {
            color: #ffd700;
            transform: scale(1.2);
        }
        
        .buttons {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        button {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #e98344;
            color: white;
        }
        
        .btn-primary:hover {
            background: #d4671f;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(233, 131, 68, 0.4);
        }
        
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
        }
        
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        .success-message, .error-message {
            text-align: center;
            padding: 40px;
        }
        
        .success-message h1 {
            color: #4CAF50;
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .error-message h1 {
            color: #f44336;
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .hidden {
            display: none;
        }
    """

def get_html_form(token: str, servico_prestado: str) -> str:
    """Retorna o formulário HTML completo"""
    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Avaliação - Salexpress</title>
        <style>
            {get_css_styles()}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✨ Avalie nosso serviço</h1>
                <p>Sua opinião é muito importante para nós!</p>
            </div>
            
            <div class="servico-badge">
                <p><strong>Serviço:</strong> {servico_prestado}</p>
            </div>
            
            <div class="step-indicator">
                <div class="step-dot active" id="dot-1"></div>
                <div class="step-dot" id="dot-2"></div>
                <div class="step-dot" id="dot-3"></div>
                <div class="step-dot" id="dot-4"></div>
                <div class="step-dot" id="dot-5"></div>
            </div>
            
            <form id="avaliacaoForm">
                <!-- Etapa 1: Dados do avaliador -->
                <div class="form-step active" id="step-1">
                    <h2 style="margin-bottom: 20px; color: #333;">👤 Seus dados</h2>
                    <div class="form-group">
                        <label for="nome">Nome completo *</label>
                        <input type="text" id="nome" name="nome" required placeholder="Digite seu nome">
                    </div>
                    <div class="form-group">
                        <label for="email">E-mail (opcional)</label>
                        <input type="email" id="email" name="email" placeholder="seu@email.com">
                    </div>
                    <div class="form-group">
                        <label for="telefone">Telefone *</label>
                        <input type="tel" id="telefone" name="telefone" required placeholder="(00) 00000-0000">
                    </div>
                    <div class="buttons">
                        <button type="button" class="btn-primary" onclick="nextStep(2)">Próximo →</button>
                    </div>
                </div>
                
                <!-- Etapa 2: Avaliação do atendimento -->
                <div class="form-step" id="step-2">
                    <div class="rating-container">
                        <h2 style="margin-bottom: 10px; color: #333;">🤝 Atendimento</h2>
                        <p style="color: #666; margin-bottom: 20px;">Como foi o atendimento?</p>
                        <div class="stars" id="stars-atendimento">
                            <span class="star" data-value="1" onclick="setRating('atendimento', 1)">★</span>
                            <span class="star" data-value="2" onclick="setRating('atendimento', 2)">★</span>
                            <span class="star" data-value="3" onclick="setRating('atendimento', 3)">★</span>
                            <span class="star" data-value="4" onclick="setRating('atendimento', 4)">★</span>
                            <span class="star" data-value="5" onclick="setRating('atendimento', 5)">★</span>
                        </div>
                        <input type="hidden" id="nota_atendimento" name="nota_atendimento" required>
                    </div>
                    <div class="buttons">
                        <button type="button" class="btn-secondary" onclick="previousStep(1)">← Voltar</button>
                        <button type="button" class="btn-primary" onclick="nextStep(3)">Próximo →</button>
                    </div>
                </div>
                
                <!-- Etapa 3: Avaliação do preço -->
                <div class="form-step" id="step-3">
                    <div class="rating-container">
                        <h2 style="margin-bottom: 10px; color: #333;">💰 Preço</h2>
                        <p style="color: #666; margin-bottom: 20px;">O preço foi justo?</p>
                        <div class="stars" id="stars-preco">
                            <span class="star" data-value="1" onclick="setRating('preco', 1)">★</span>
                            <span class="star" data-value="2" onclick="setRating('preco', 2)">★</span>
                            <span class="star" data-value="3" onclick="setRating('preco', 3)">★</span>
                            <span class="star" data-value="4" onclick="setRating('preco', 4)">★</span>
                            <span class="star" data-value="5" onclick="setRating('preco', 5)">★</span>
                        </div>
                        <input type="hidden" id="nota_preco" name="nota_preco" required>
                    </div>
                    <div class="buttons">
                        <button type="button" class="btn-secondary" onclick="previousStep(2)">← Voltar</button>
                        <button type="button" class="btn-primary" onclick="nextStep(4)">Próximo →</button>
                    </div>
                </div>
                
                <!-- Etapa 4: Avaliação da qualidade e comentário -->
                <div class="form-step" id="step-4">
                    <div class="rating-container">
                        <h2 style="margin-bottom: 10px; color: #333;">⭐ Qualidade</h2>
                        <p style="color: #666; margin-bottom: 20px;">Como foi a qualidade do serviço?</p>
                        <div class="stars" id="stars-qualidade">
                            <span class="star" data-value="1" onclick="setRating('qualidade', 1)">★</span>
                            <span class="star" data-value="2" onclick="setRating('qualidade', 2)">★</span>
                            <span class="star" data-value="3" onclick="setRating('qualidade', 3)">★</span>
                            <span class="star" data-value="4" onclick="setRating('qualidade', 4)">★</span>
                            <span class="star" data-value="5" onclick="setRating('qualidade', 5)">★</span>
                        </div>
                        <input type="hidden" id="nota_qualidade" name="nota_qualidade" required>
                    </div>
                    <div class="form-group" style="margin-top: 30px;">
                        <label for="comentario">Comentário sobre o serviço (opcional)</label>
                        <textarea id="comentario" name="comentario" rows="4" placeholder="Deixe um comentário sobre sua experiência com o serviço..."></textarea>
                    </div>
                    <div class="buttons">
                        <button type="button" class="btn-secondary" onclick="previousStep(3)">← Voltar</button>
                        <button type="button" class="btn-primary" onclick="nextStep(5)">Próximo →</button>
                    </div>
                </div>
                
                <!-- Etapa 5: Avaliação da Salexpress (opcional) -->
                <div class="form-step" id="step-5">
                    <div class="rating-container">
                        <h2 style="margin-bottom: 10px; color: #333;">🌐 Plataforma Salexpress</h2>
                        <p style="color: #666; margin-bottom: 20px;">Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?</p>
                        <div class="stars" id="stars-Salexpress">
                            <span class="star" data-value="1" onclick="setRating('Salexpress', 1)">★</span>
                            <span class="star" data-value="2" onclick="setRating('Salexpress', 2)">★</span>
                            <span class="star" data-value="3" onclick="setRating('Salexpress', 3)">★</span>
                            <span class="star" data-value="4" onclick="setRating('Salexpress', 4)">★</span>
                            <span class="star" data-value="5" onclick="setRating('Salexpress', 5)">★</span>
                        </div>
                        <input type="hidden" id="nota_Salexpress" name="nota_Salexpress">
                    </div>
                    <div class="form-group" style="margin-top: 30px;">
                        <label for="comentario_Salexpress">Comentário sobre a plataforma (opcional)</label>
                        <textarea id="comentario_Salexpress" name="comentario_Salexpress" rows="4" placeholder="Conte-nos sobre sua experiência ao buscar fornecedores na Salexpress..."></textarea>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 15px;">Esta avaliação é opcional</p>
                    <div class="buttons">
                        <button type="button" class="btn-secondary" onclick="previousStep(4)">← Voltar</button>
                        <button type="submit" class="btn-primary">Enviar Avaliação ✓</button>
                    </div>
                </div>
            </form>
            
            <div id="successMessage" class="success-message hidden">
                <h1>✅</h1>
                <h2>Avaliação enviada com sucesso!</h2>
                <p style="color: #666; margin-top: 10px;">Muito obrigado pelo seu feedback!</p>
            </div>
            
            <div id="errorMessage" class="error-message hidden">
                <h1>❌</h1>
                <h2>Erro ao enviar avaliação</h2>
                <p id="errorText" style="color: #666; margin-top: 10px;"></p>
                <button class="btn-primary" style="margin-top: 20px;" onclick="location.reload()">Tentar novamente</button>
            </div>
        </div>
        
        <script>
            let currentStep = 1;
            const ratings = {{
                atendimento: 0,
                preco: 0,
                qualidade: 0,
                Salexpress: 0
            }};
            
            function nextStep(step) {{
                // Validar etapa atual
                if (currentStep === 1) {{
                    const nome = document.getElementById('nome').value;
                    const telefone = document.getElementById('telefone').value;
                    if (!nome || !telefone) {{
                        alert('Por favor, preencha todos os campos');
                        return;
                    }}
                }} else if (currentStep === 2 && ratings.atendimento === 0) {{
                    alert('Por favor, selecione uma nota para o atendimento');
                    return;
                }} else if (currentStep === 3 && ratings.preco === 0) {{
                    alert('Por favor, selecione uma nota para o preço');
                    return;
                }}
                
                // Mudar para próxima etapa
                document.getElementById(`step-${{currentStep}}`).classList.remove('active');
                document.getElementById(`dot-${{currentStep}}`).classList.remove('active');
                currentStep = step;
                document.getElementById(`step-${{step}}`).classList.add('active');
                document.getElementById(`dot-${{step}}`).classList.add('active');
            }}
            
            function previousStep(step) {{
                document.getElementById(`step-${{currentStep}}`).classList.remove('active');
                document.getElementById(`dot-${{currentStep}}`).classList.remove('active');
                currentStep = step;
                document.getElementById(`step-${{step}}`).classList.add('active');
                document.getElementById(`dot-${{step}}`).classList.add('active');
            }}
            
            function setRating(category, value) {{
                ratings[category] = value;
                document.getElementById(`nota_${{category}}`).value = value;
                
                // Atualizar visualização das estrelas
                const stars = document.querySelectorAll(`#stars-${{category}} .star`);
                stars.forEach((star, index) => {{
                    if (index < value) {{
                        star.classList.add('active');
                    }} else {{
                        star.classList.remove('active');
                    }}
                }});
            }}
            
            document.getElementById('avaliacaoForm').addEventListener('submit', async (e) => {{
                e.preventDefault();
                
                if (ratings.qualidade === 0) {{
                    alert('Por favor, selecione uma nota para a qualidade');
                    return;
                }}
                
                const formData = {{
                    nome_avaliador: document.getElementById('nome').value,
                    email_avaliador: document.getElementById('email').value || null,
                    numero_avaliador: document.getElementById('telefone').value,
                    nota_atendimento: parseFloat(document.getElementById('nota_atendimento').value),
                    nota_preco: parseFloat(document.getElementById('nota_preco').value),
                    nota_qualidade: parseFloat(document.getElementById('nota_qualidade').value),
                    comentario: document.getElementById('comentario').value || null
                }};
                
                // Adicionar avaliação da Salexpress se foi preenchida
                const notaSalexpress = document.getElementById('nota_Salexpress').value;
                if (notaSalexpress && parseFloat(notaSalexpress) > 0) {{
                    formData.avaliacao_Salexpress = {{
                        nota_busca_fornecedor: parseFloat(notaSalexpress),
                        comentario_experiencia: document.getElementById('comentario_Salexpress').value || null
                    }};
                }}
                
                try {{
                    const response = await fetch('/api/v1/avaliacoes/avaliar/{token}', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json'
                        }},
                        body: JSON.stringify(formData)
                    }});
                    
                    if (response.ok) {{
                        document.getElementById('avaliacaoForm').classList.add('hidden');
                        document.querySelector('.step-indicator').classList.add('hidden');
                        document.querySelector('.servico-badge').classList.add('hidden');
                        document.querySelector('.header').classList.add('hidden');
                        document.getElementById('successMessage').classList.remove('hidden');
                    }} else {{
                        const error = await response.json();
                        document.getElementById('errorText').textContent = error.detail || 'Erro desconhecido';
                        document.getElementById('avaliacaoForm').classList.add('hidden');
                        document.getElementById('errorMessage').classList.remove('hidden');
                    }}
                }} catch (error) {{
                    document.getElementById('errorText').textContent = 'Erro de conexão';
                    document.getElementById('avaliacaoForm').classList.add('hidden');
                    document.getElementById('errorMessage').classList.remove('hidden');
                }}
            }});
            
            // Formatar telefone
            document.getElementById('telefone').addEventListener('input', function(e) {{
                let value = e.target.value.replace(/\\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                
                if (value.length >= 11) {{
                    value = value.replace(/(\\d{{2}})(\\d{{5}})(\\d{{4}})/, '($1) $2-$3');
                }} else if (value.length >= 7) {{
                    value = value.replace(/(\\d{{2}})(\\d{{4}})(\\d{{0,4}})/, '($1) $2-$3');
                }} else if (value.length >= 3) {{
                    value = value.replace(/(\\d{{2}})(\\d{{0,5}})/, '($1) $2');
                }} else if (value.length > 0) {{
                    value = value.replace(/(\\d{{0,2}})/, '($1');
                }}
                
                e.target.value = value;
            }});
        </script>
    </body>
    </html>
    """
