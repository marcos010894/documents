# 🌐 Como Puxar Avaliações da Salexpress

## 📋 Visão Geral

Agora você pode buscar **apenas as avaliações sobre a plataforma Salexpress**, separadas das avaliações de serviços dos fornecedores. Essas são as avaliações que os clientes fazem sobre a experiência de usar a plataforma para encontrar fornecedores.

---

## 🆕 Novos Endpoints

### 1️⃣ **Listar Avaliações da Salexpress**

**GET** `/api/v1/avaliacoes/Salexpress/avaliacoes`

Busca todas as avaliações sobre a plataforma Salexpress com estatísticas.

#### Parâmetros (Query):
| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `skip` | integer | Não | 0 | Paginação - pular N registros |
| `limit` | integer | Não | 100 | Paginação - limitar a N registros (0 = sem limite) |

#### Exemplo de Requisição:
```bash
# Buscar todas as avaliações da Salexpress
GET https://api-Salexpress3.fly.dev/api/v1/avaliacoes/Salexpress/avaliacoes

# Com paginação
GET https://api-Salexpress3.fly.dev/api/v1/avaliacoes/Salexpress/avaliacoes?skip=0&limit=50
```

#### Exemplo de Resposta:
```json
{
  "data": [
    {
      "id": 1,
      "avaliacao_id": 45,
      "nome_avaliador": "Maria Santos",
      "email_avaliador": "maria@example.com",
      "nota_busca_fornecedor": 5.0,
      "comentario_experiencia": "Plataforma muito fácil de usar, encontrei o fornecedor perfeito rapidamente!",
      "created_at": "2025-11-25T10:30:00",
      "ip_avaliador": "192.168.1.1",
      "servico_avaliado": "Desenvolvimento de website",
      "media_servico": 4.8
    },
    {
      "id": 2,
      "avaliacao_id": 48,
      "nome_avaliador": "João Silva",
      "email_avaliador": "joao@example.com",
      "nota_busca_fornecedor": 4.5,
      "comentario_experiencia": "Ótima experiência, processo muito transparente.",
      "created_at": "2025-11-24T15:20:00",
      "ip_avaliador": "192.168.1.2",
      "servico_avaliado": "Design gráfico",
      "media_servico": 4.5
    }
  ],
  "total": 2,
  "estatisticas": {
    "total_avaliacoes": 2,
    "media_geral": 4.75,
    "nps": 100.0,
    "percentual_positivas": 100.0
  }
}
```

---

### 2️⃣ **Estatísticas das Avaliações da Salexpress**

**GET** `/api/v1/avaliacoes/Salexpress/estatisticas`

Obtém estatísticas completas das avaliações da plataforma.

#### Exemplo de Requisição:
```bash
GET https://api-Salexpress3.fly.dev/api/v1/avaliacoes/Salexpress/estatisticas
```

#### Exemplo de Resposta:
```json
{
  "total_avaliacoes": 150,
  "media_geral": 4.6,
  "nps": 85.5,
  "distribuicao_notas": {
    "5_estrelas": 100,
    "4_estrelas": 35,
    "3_estrelas": 10,
    "2_estrelas": 3,
    "1_estrela": 2
  },
  "percentual_positivas": 90.0,
  "percentual_negativas": 3.33,
  "total_com_comentario": 120
}
```

---

## 💻 Exemplos de Uso

### JavaScript / Frontend

```javascript
// Classe para gerenciar avaliações da Salexpress
class AvaliacoesSalexpressAPI {
  constructor() {
    this.baseUrl = 'https://api-Salexpress3.fly.dev/api/v1/avaliacoes/Salexpress';
  }
  
  // Buscar todas as avaliações da Salexpress
  async buscarAvaliacoes(skip = 0, limit = 100) {
    const response = await fetch(
      `${this.baseUrl}/avaliacoes?skip=${skip}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar avaliações');
    }
    
    return await response.json();
  }
  
  // Buscar estatísticas
  async buscarEstatisticas() {
    const response = await fetch(`${this.baseUrl}/estatisticas`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }
    
    return await response.json();
  }
}

// Uso prático
const api = new AvaliacoesSalexpressAPI();

// Carregar avaliações ao abrir a página
async function carregarAvaliacoesSalexpress() {
  try {
    const resultado = await api.buscarAvaliacoes(0, 50);
    
    console.log('Total de avaliações:', resultado.total);
    console.log('Média geral:', resultado.estatisticas.media_geral);
    console.log('NPS:', resultado.estatisticas.nps);
    
    // Exibir cada avaliação
    resultado.data.forEach(avaliacao => {
      console.log(`${avaliacao.nome_avaliador} - ${avaliacao.nota_busca_fornecedor}⭐`);
      console.log(`Comentário: ${avaliacao.comentario_experiencia}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Carregar estatísticas
async function carregarEstatisticas() {
  try {
    const stats = await api.buscarEstatisticas();
    
    console.log('📊 Estatísticas da Salexpress:');
    console.log(`Total de avaliações: ${stats.total_avaliacoes}`);
    console.log(`Média geral: ${stats.media_geral}⭐`);
    console.log(`NPS: ${stats.nps}`);
    console.log(`Avaliações positivas: ${stats.percentual_positivas}%`);
    console.log(`\nDistribuição:`);
    console.log(`5⭐: ${stats.distribuicao_notas['5_estrelas']}`);
    console.log(`4⭐: ${stats.distribuicao_notas['4_estrelas']}`);
    console.log(`3⭐: ${stats.distribuicao_notas['3_estrelas']}`);
    console.log(`2⭐: ${stats.distribuicao_notas['2_estrelas']}`);
    console.log(`1⭐: ${stats.distribuicao_notas['1_estrela']}`);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar
carregarAvaliacoesSalexpress();
carregarEstatisticas();
```

---

### Python

```python
import requests

class AvaliacoesSalexpressAPI:
    def __init__(self):
        self.base_url = "https://api-Salexpress3.fly.dev/api/v1/avaliacoes/Salexpress"
    
    def buscar_avaliacoes(self, skip=0, limit=100):
        """Busca avaliações da Salexpress"""
        response = requests.get(
            f"{self.base_url}/avaliacoes",
            params={"skip": skip, "limit": limit}
        )
        response.raise_for_status()
        return response.json()
    
    def buscar_estatisticas(self):
        """Busca estatísticas das avaliações"""
        response = requests.get(f"{self.base_url}/estatisticas")
        response.raise_for_status()
        return response.json()

# Uso
api = AvaliacoesSalexpressAPI()

# Buscar avaliações
resultado = api.buscar_avaliacoes(skip=0, limit=50)
print(f"Total de avaliações: {resultado['total']}")
print(f"Média geral: {resultado['estatisticas']['media_geral']}⭐")

for avaliacao in resultado['data']:
    print(f"\n{avaliacao['nome_avaliador']} - {avaliacao['nota_busca_fornecedor']}⭐")
    if avaliacao['comentario_experiencia']:
        print(f"Comentário: {avaliacao['comentario_experiencia']}")

# Buscar estatísticas
stats = api.buscar_estatisticas()
print(f"\n📊 Estatísticas:")
print(f"Total: {stats['total_avaliacoes']}")
print(f"Média: {stats['media_geral']}⭐")
print(f"NPS: {stats['nps']}")
print(f"Positivas: {stats['percentual_positivas']}%")
```

---

## 📊 O Que Cada Campo Significa

### Dados da Avaliação:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único da avaliação da Salexpress |
| `avaliacao_id` | integer | ID da avaliação do serviço relacionada |
| `nome_avaliador` | string | Nome de quem avaliou |
| `email_avaliador` | string | Email do avaliador (pode ser null) |
| `nota_busca_fornecedor` | float | Nota de 0-5 sobre a experiência na plataforma |
| `comentario_experiencia` | string | Comentário sobre a plataforma (pode ser null) |
| `created_at` | datetime | Data e hora da avaliação |
| `ip_avaliador` | string | IP de quem avaliou |
| `servico_avaliado` | string | Qual serviço o cliente contratou |
| `media_servico` | float | Nota que o cliente deu para o serviço |

### Estatísticas:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `total_avaliacoes` | integer | Total de avaliações da plataforma |
| `media_geral` | float | Média das notas (0-5) |
| `nps` | float | Net Promoter Score (-100 a 100) |
| `percentual_positivas` | float | % de avaliações >= 4.0 |
| `percentual_negativas` | float | % de avaliações < 3.0 |
| `distribuicao_notas` | object | Quantidade por faixa de nota |
| `total_com_comentario` | integer | Quantas têm comentário |

---

## 🎯 Exemplos de Uso Prático

### 1. Dashboard de Avaliações da Plataforma

```javascript
async function renderizarDashboard() {
  const api = new AvaliacoesSalexpressAPI();
  const stats = await api.buscarEstatisticas();
  
  // Exibir métricas principais
  document.getElementById('total-avaliacoes').textContent = stats.total_avaliacoes;
  document.getElementById('media-geral').textContent = stats.media_geral.toFixed(2);
  document.getElementById('nps').textContent = stats.nps.toFixed(0);
  
  // Gráfico de distribuição
  renderizarGrafico(stats.distribuicao_notas);
  
  // Listar últimas avaliações
  const avaliacoes = await api.buscarAvaliacoes(0, 10);
  renderizarListaAvaliacoes(avaliacoes.data);
}
```

### 2. Filtrar Apenas Avaliações Positivas

```javascript
async function buscarAvaliacoesPositivas() {
  const api = new AvaliacoesSalexpressAPI();
  const resultado = await api.buscarAvaliacoes(0, 0); // 0 = sem limite
  
  // Filtrar >= 4 estrelas
  const positivas = resultado.data.filter(av => av.nota_busca_fornecedor >= 4.0);
  
  console.log(`${positivas.length} avaliações positivas`);
  return positivas;
}
```

### 3. Exibir Últimas 5 Avaliações com Comentários

```javascript
async function ultimasAvaliacoesComComentarios() {
  const api = new AvaliacoesSalexpressAPI();
  const resultado = await api.buscarAvaliacoes(0, 100);
  
  // Filtrar apenas com comentários
  const comComentarios = resultado.data
    .filter(av => av.comentario_experiencia)
    .slice(0, 5);
  
  comComentarios.forEach(av => {
    console.log(`${av.nome_avaliador}: "${av.comentario_experiencia}"`);
  });
}
```

### 4. Calcular Média Mensal

```javascript
async function mediaMensal() {
  const api = new AvaliacoesSalexpressAPI();
  const resultado = await api.buscarAvaliacoes(0, 0);
  
  // Agrupar por mês
  const porMes = {};
  resultado.data.forEach(av => {
    const mes = new Date(av.created_at).toLocaleString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    if (!porMes[mes]) {
      porMes[mes] = { total: 0, soma: 0 };
    }
    
    porMes[mes].total++;
    porMes[mes].soma += av.nota_busca_fornecedor;
  });
  
  // Calcular médias
  Object.keys(porMes).forEach(mes => {
    const media = porMes[mes].soma / porMes[mes].total;
    console.log(`${mes}: ${media.toFixed(2)}⭐ (${porMes[mes].total} avaliações)`);
  });
}
```

---

## 🔍 Diferenças Entre os Endpoints

### Avaliações de Serviços (Fornecedores)
**GET** `/api/v1/avaliacoes`
- Avaliações que os clientes fazem sobre os **serviços prestados** pelos fornecedores
- Campos: `nota_atendimento`, `nota_preco`, `nota_qualidade`

### Avaliações da Salexpress (Plataforma)
**GET** `/api/v1/avaliacoes/Salexpress/avaliacoes`
- Avaliações que os clientes fazem sobre a **experiência de usar a plataforma**
- Campo: `nota_busca_fornecedor`
- São opcionais (nem todo cliente avalia a plataforma)

---

## 📝 Notas Importantes

1. **Apenas avaliações aprovadas** são retornadas (status = APROVADO)
2. **Nem todas as avaliações de serviço têm avaliação da plataforma** (é opcional)
3. As avaliações estão **ordenadas por data** (mais recentes primeiro)
4. O **NPS** é calculado automaticamente:
   - Promotores (4.5-5 estrelas)
   - Neutros (3.5-4.5 estrelas)  
   - Detratores (0-3.5 estrelas)

---

## 🎨 Sugestões de Implementação

### Dashboard Simples
```html
<div class="stats-container">
  <div class="stat-card">
    <h3>Total de Avaliações</h3>
    <p id="total-avaliacoes">-</p>
  </div>
  
  <div class="stat-card">
    <h3>Média Geral</h3>
    <p id="media-geral">-</p>
  </div>
  
  <div class="stat-card">
    <h3>NPS</h3>
    <p id="nps">-</p>
  </div>
</div>

<div class="avaliacoes-list" id="avaliacoes-list">
  <!-- Avaliações serão inseridas aqui -->
</div>

<script>
async function init() {
  const api = new AvaliacoesSalexpressAPI();
  
  // Carregar estatísticas
  const stats = await api.buscarEstatisticas();
  document.getElementById('total-avaliacoes').textContent = stats.total_avaliacoes;
  document.getElementById('media-geral').textContent = stats.media_geral.toFixed(2) + '⭐';
  document.getElementById('nps').textContent = stats.nps.toFixed(0);
  
  // Carregar avaliações
  const resultado = await api.buscarAvaliacoes(0, 20);
  const list = document.getElementById('avaliacoes-list');
  
  resultado.data.forEach(av => {
    const item = document.createElement('div');
    item.className = 'avaliacao-item';
    item.innerHTML = `
      <h4>${av.nome_avaliador}</h4>
      <p>Nota: ${av.nota_busca_fornecedor}⭐</p>
      ${av.comentario_experiencia ? `<p>${av.comentario_experiencia}</p>` : ''}
      <small>Serviço: ${av.servico_avaliado}</small>
    `;
    list.appendChild(item);
  });
}

init();
</script>
```

---

## 📞 Resumo dos Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/avaliacoes/Salexpress/avaliacoes` | Listar avaliações da plataforma |
| GET | `/api/v1/avaliacoes/Salexpress/estatisticas` | Estatísticas completas |

---

**Pronto! Agora você pode puxar e exibir as avaliações da Salexpress separadamente! 🚀**
