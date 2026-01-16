# 📚 Documentação Completa - Sistema de Avaliações Salexpress

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Fluxo Completo](#fluxo-completo)
3. [Endpoints Detalhados](#endpoints-detalhados)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Status de Avaliações](#status-de-avaliações)
6. [Estatísticas](#estatísticas)

---

## 🎯 Visão Geral

Sistema completo de avaliações que permite:
- ✅ Criar links temporários de avaliação
- ✅ Cliente avaliar serviço prestado (Atendimento, Preço, Qualidade)
- ✅ Cliente avaliar Salexpress como intermediadora (OPCIONAL)
- ✅ Listar e filtrar avaliações
- ✅ Moderar avaliações (aprovar/negar)
- ✅ Obter estatísticas

---

## 🔄 Fluxo Completo

```
1. PROFISSIONAL/EMPRESA GERA LINK
   POST /api/v1/avaliacoes/criar-link
   ↓
   Recebe: token único + link válido por X dias

2. ENVIA LINK PARA CLIENTE
   Email/WhatsApp: https://api.Salexpress.com/api/v1/avaliacoes/avaliar/{token}

3. CLIENTE ACESSA LINK
   GET /api/v1/avaliacoes/avaliar/{token}
   ↓
   Sistema valida: token existe? não expirou? não foi usado?

4. CLIENTE PREENCHE AVALIAÇÃO
   POST /api/v1/avaliacoes/avaliar/{token}
   ↓
   Avalia: Atendimento, Preço, Qualidade + Comentário
   OPCIONAL: Avalia Salexpress (nota + comentário)

5. SISTEMA SALVA COM STATUS "AGUARDANDO_APROVACAO"
   Avaliação criada → ID retornado

6. ADMINISTRADOR MODERA
   PATCH /api/v1/avaliacoes/{id}/status
   ↓
   Aprova (APROVADO) ou Nega (NEGADO)

7. AVALIAÇÕES APROVADAS APARECEM PUBLICAMENTE
   GET /api/v1/avaliacoes?id_avaliado=X&status=APROVADO
```

---

## 📡 Endpoints Detalhados

### 1️⃣ Criar Link de Avaliação

**Endpoint:**
```http
POST /api/v1/avaliacoes/criar-link
Content-Type: application/json
```

**Body:**
```json
{
  "id_avaliado": 22,
  "tipo_avaliado": "freelancer",
  "servico_prestado": "Desenvolvimento de website institucional",
  "dias_validade": 30
}
```

**Parâmetros:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_avaliado` | integer | ✅ Sim | ID do profissional/empresa |
| `tipo_avaliado` | string | ✅ Sim | "pf", "pj" ou "freelancer" |
| `servico_prestado` | string | ✅ Sim | Descrição do serviço (3-500 caracteres) |
| `dias_validade` | integer | ❌ Não | Dias de validade (1-90, padrão: 30) |

**Resposta (200 OK):**
```json
{
  "id": 15,
  "token": "a3f8d9c2b5e1f4a7c9d8b2e5f1a4c7d9",
  "link_completo": "https://api.Salexpress.com/api/v1/avaliacoes/avaliar/a3f8d9c2b5e1f4a7c9d8b2e5f1a4c7d9",
  "id_avaliado": 22,
  "tipo_avaliado": "freelancer",
  "servico_prestado": "Desenvolvimento de website institucional",
  "usado": false,
  "expira_em": "2025-12-13T14:30:00",
  "created_at": "2025-11-13T14:30:00"
}
```

**Exemplo cURL:**
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/avaliacoes/criar-link" \
  -H "Content-Type: application/json" \
  -d '{
    "id_avaliado": 22,
    "tipo_avaliado": "freelancer",
    "servico_prestado": "Desenvolvimento de website",
    "dias_validade": 30
  }'
```

---

### 2️⃣ Validar e Renderizar Formulário

**Endpoint:**
```http
GET /api/v1/avaliacoes/avaliar/{token}
```

**Parâmetros:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `token` | string | Token do link gerado |

**Resposta:**
- ✅ Token válido → Retorna formulário HTML
- ❌ Token inválido → Retorna página de erro HTML
- ❌ Token expirado → Retorna página de erro HTML
- ❌ Token já usado → Retorna página de erro HTML

**Exemplo:**
```bash
curl "http://127.0.0.1:8000/api/v1/avaliacoes/avaliar/a3f8d9c2b5e1f4a7c9d8b2e5f1a4c7d9"
```

---

### 3️⃣ Submeter Avaliação (Via Link)

**Endpoint:**
```http
POST /api/v1/avaliacoes/avaliar/{token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome_avaliador": "Maria Santos",
  "email_avaliador": "maria.santos@email.com",
  "numero_avaliador": "11999887766",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "comentario": "Excelente profissional, trabalho impecável!",
  "nota_Salexpress": 4.5,
  "comentario_Salexpress": "A Salexpress facilitou muito o contato e o processo."
}
```

**Parâmetros:**
| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| `nome_avaliador` | string | ✅ Sim | 3-200 caracteres | Nome completo |
| `email_avaliador` | string | ❌ Não | Máx 200 caracteres | Email do avaliador |
| `numero_avaliador` | string | ✅ Sim | 10-20 caracteres | Telefone |
| `nota_atendimento` | float | ✅ Sim | 0-5, incrementos de 0.5 | Avaliação do atendimento |
| `nota_preco` | float | ✅ Sim | 0-5, incrementos de 0.5 | Avaliação do preço |
| `nota_qualidade` | float | ✅ Sim | 0-5, incrementos de 0.5 | Avaliação da qualidade |
| `comentario` | string | ❌ Não | Máx 1000 caracteres | Comentário sobre serviço |
| `nota_Salexpress` | float | ❌ Não | 0-5, incrementos de 0.5 | Avaliação da Salexpress |
| `comentario_Salexpress` | string | ❌ Não | Máx 1000 caracteres | Comentário sobre Salexpress |

**Resposta (200 OK):**
```json
{
  "id": 45,
  "nome_avaliador": "Maria Santos",
  "email_avaliador": "maria.santos@email.com",
  "numero_avaliador": "11999887766",
  "id_avaliado": 22,
  "tipo_avaliado": "freelancer",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "media_total": 4.83,
  "servico_prestado": "Desenvolvimento de website",
  "comentario": "Excelente profissional, trabalho impecável!",
  "nota_Salexpress": 4.5,
  "comentario_Salexpress": "A Salexpress facilitou muito o contato e o processo.",
  "status": "AGUARDANDO_APROVACAO",
  "created_at": "2025-11-13T15:45:00"
}
```

**Notas Importantes:**
- ✅ Sistema calcula `media_total` automaticamente: `(atendimento + preco + qualidade) / 3`
- ✅ Após submissão, link é marcado como `usado = true` (não pode ser reutilizado)
- ✅ Status inicial sempre é `AGUARDANDO_APROVACAO`
- ✅ IP do cliente é capturado automaticamente
- ✅ Campos `email_avaliador`, `nota_Salexpress` e `comentario_Salexpress` são **opcionais**

**Exemplo cURL:**
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/avaliacoes/avaliar/a3f8d9c2b5e1f4a7c9d8b2e5f1a4c7d9" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_avaliador": "Maria Santos",
    "email_avaliador": "maria.santos@email.com",
    "numero_avaliador": "11999887766",
    "nota_atendimento": 5.0,
    "nota_preco": 4.5,
    "nota_qualidade": 5.0,
    "comentario": "Excelente profissional!",
    "nota_Salexpress": 4.5,
    "comentario_Salexpress": "Ótima plataforma!"
  }'
```

---

### 4️⃣ Criar Avaliação Direta (Sem Link)

**Endpoint:**
```http
POST /api/v1/avaliacoes/
Content-Type: application/json
```

**Body:**
```json
{
  "nome_avaliador": "João Silva",
  "numero_avaliador": "11987654321",
  "id_avaliado": 10,
  "tipo_avaliado": "pj",
  "servico_prestado": "Consultoria empresarial",
  "nota_atendimento": 5.0,
  "nota_preco": 4.0,
  "nota_qualidade": 4.5,
  "comentario": "Ótimo serviço prestado",
  "nota_Salexpress": 5.0,
  "comentario_Salexpress": "Excelente intermediação"
}
```

**Diferença do endpoint anterior:**
- ⚠️ Não usa token/link temporário
- ⚠️ Requer `id_avaliado`, `tipo_avaliado` e `servico_prestado` no body
- ✅ Útil para avaliações internas ou migrações

**Resposta:** Igual ao endpoint anterior

---

### 5️⃣ Listar Avaliações

**Endpoint:**
```http
GET /api/v1/avaliacoes?id_avaliado={id}&tipo_avaliado={tipo}&status={status}&skip={skip}&limit={limit}
```

**Parâmetros de Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id_avaliado` | integer | ❌ Não | Filtrar por ID do avaliado |
| `tipo_avaliado` | string | ❌ Não | Filtrar por tipo: "pf", "pj", "freelancer" |
| `status` | string | ❌ Não | Filtrar por status: "APROVADO", "AGUARDANDO_APROVACAO", "NEGADO" |
| `skip` | integer | ❌ Não | Paginação: pular N registros (padrão: 0) |
| `limit` | integer | ❌ Não | Paginação: limitar a N registros (padrão: 10) |

**Resposta (200 OK):**
```json
[
  {
    "id": 45,
    "nome_avaliador": "Maria Santos",
    "numero_avaliador": "11999887766",
    "id_avaliado": 22,
    "tipo_avaliado": "freelancer",
    "nota_atendimento": 5.0,
    "nota_preco": 4.5,
    "nota_qualidade": 5.0,
    "media_total": 4.83,
    "servico_prestado": "Desenvolvimento de website",
    "comentario": "Excelente!",
    "nota_Salexpress": 4.5,
    "comentario_Salexpress": "Ótima plataforma!",
    "status": "APROVADO",
    "created_at": "2025-11-13T15:45:00"
  },
  {
    "id": 44,
    "nome_avaliador": "João Silva",
    "numero_avaliador": "11987654321",
    "id_avaliado": 22,
    "tipo_avaliado": "freelancer",
    "nota_atendimento": 4.5,
    "nota_preco": 4.0,
    "nota_qualidade": 4.5,
    "media_total": 4.33,
    "servico_prestado": "Desenvolvimento de website",
    "comentario": "Bom trabalho",
    "nota_Salexpress": null,
    "comentario_Salexpress": null,
    "status": "APROVADO",
    "created_at": "2025-11-12T10:20:00"
  }
]
```

**Exemplos de Uso:**

```bash
# Todas as avaliações aprovadas do freelancer ID 22
curl "http://127.0.0.1:8000/api/v1/avaliacoes?id_avaliado=22&tipo_avaliado=freelancer&status=APROVADO"

# Avaliações aguardando aprovação (para moderação)
curl "http://127.0.0.1:8000/api/v1/avaliacoes?status=AGUARDANDO_APROVACAO"

# Todas as avaliações de PJ ID 10 (incluindo pendentes e negadas)
curl "http://127.0.0.1:8000/api/v1/avaliacoes?id_avaliado=10&tipo_avaliado=pj"

# Com paginação: pular 10 primeiras, trazer 20
curl "http://127.0.0.1:8000/api/v1/avaliacoes?skip=10&limit=20"

# Apenas avaliações que avaliaram a Salexpress (filtrar no frontend onde nota_Salexpress != null)
curl "http://127.0.0.1:8000/api/v1/avaliacoes" | jq '[.[] | select(.nota_Salexpress != null)]'
```

---

### 6️⃣ Obter Avaliação Específica

**Endpoint:**
```http
GET /api/v1/avaliacoes/{avaliacao_id}
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `avaliacao_id` | integer | ID da avaliação |

**Resposta (200 OK):**
```json
{
  "id": 45,
  "nome_avaliador": "Maria Santos",
  "numero_avaliador": "11999887766",
  "id_avaliado": 22,
  "tipo_avaliado": "freelancer",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "media_total": 4.83,
  "servico_prestado": "Desenvolvimento de website",
  "comentario": "Excelente!",
  "nota_Salexpress": 4.5,
  "comentario_Salexpress": "Ótima plataforma!",
  "status": "APROVADO",
  "created_at": "2025-11-13T15:45:00"
}
```

**Erro (404 Not Found):**
```json
{
  "detail": "Avaliação não encontrada"
}
```

**Exemplo:**
```bash
curl "http://127.0.0.1:8000/api/v1/avaliacoes/45"
```

---

### 7️⃣ Atualizar Status (Moderação)

**Endpoint:**
```http
PATCH /api/v1/avaliacoes/{avaliacao_id}/status
Content-Type: application/json
```

**Body:**
```json
{
  "status": "APROVADO"
}
```

**Parâmetros:**
| Campo | Tipo | Valores Aceitos | Descrição |
|-------|------|-----------------|-----------|
| `status` | string | "APROVADO", "AGUARDANDO_APROVACAO", "NEGADO" | Novo status |

**Resposta (200 OK):**
```json
{
  "id": 45,
  "nome_avaliador": "Maria Santos",
  "numero_avaliador": "11999887766",
  "id_avaliado": 22,
  "tipo_avaliado": "freelancer",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "media_total": 4.83,
  "servico_prestado": "Desenvolvimento de website",
  "comentario": "Excelente!",
  "nota_Salexpress": 4.5,
  "comentario_Salexpress": "Ótima plataforma!",
  "status": "APROVADO",
  "created_at": "2025-11-13T15:45:00"
}
```

**Exemplos:**

```bash
# Aprovar avaliação
curl -X PATCH "http://127.0.0.1:8000/api/v1/avaliacoes/45/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "APROVADO"}'

# Negar avaliação
curl -X PATCH "http://127.0.0.1:8000/api/v1/avaliacoes/45/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "NEGADO"}'

# Voltar para aguardando aprovação
curl -X PATCH "http://127.0.0.1:8000/api/v1/avaliacoes/45/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "AGUARDANDO_APROVACAO"}'
```

---

### 8️⃣ Obter Estatísticas

**Endpoint:**
```http
GET /api/v1/avaliacoes/stats/{id_avaliado}/{tipo_avaliado}
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id_avaliado` | integer | ID do profissional/empresa |
| `tipo_avaliado` | string | "pf", "pj" ou "freelancer" |

**Resposta (200 OK):**
```json
{
  "total_avaliacoes": 15,
  "media_atendimento": 4.7,
  "media_preco": 4.5,
  "media_qualidade": 4.8,
  "media_geral": 4.67,
  "avaliacoes_recentes": [
    {
      "id": 45,
      "nome_avaliador": "Maria Santos",
      "media_total": 4.83,
      "comentario": "Excelente!",
      "nota_Salexpress": 4.5,
      "created_at": "2025-11-13T15:45:00"
    },
    {
      "id": 44,
      "nome_avaliador": "João Silva",
      "media_total": 4.33,
      "comentario": "Bom trabalho",
      "nota_Salexpress": null,
      "created_at": "2025-11-12T10:20:00"
    }
  ]
}
```

**Notas:**
- ✅ Considera **apenas avaliações APROVADAS**
- ✅ Retorna as 5 avaliações mais recentes
- ✅ Se não houver avaliações, retorna zeros

**Exemplo:**
```bash
# Estatísticas do freelancer ID 22
curl "http://127.0.0.1:8000/api/v1/avaliacoes/stats/22/freelancer"

# Estatísticas da empresa (PJ) ID 10
curl "http://127.0.0.1:8000/api/v1/avaliacoes/stats/10/pj"
```

---

## 📊 Status de Avaliações

### Tipos de Status:

| Status | Descrição | Aparece Publicamente? |
|--------|-----------|----------------------|
| **AGUARDANDO_APROVACAO** | Avaliação criada, aguardando moderação | ❌ Não |
| **APROVADO** | Avaliação aprovada pelo moderador | ✅ Sim |
| **NEGADO** | Avaliação rejeitada pelo moderador | ❌ Não |

### Fluxo de Moderação:

```
Cliente submete avaliação
↓
Status: AGUARDANDO_APROVACAO (padrão)
↓
Moderador analisa
↓
┌─────────────────┬─────────────────┐
│   APROVADO      │     NEGADO      │
│  (aparece)      │  (não aparece)  │
└─────────────────┴─────────────────┘
```

### Quando usar cada endpoint:

```javascript
// 1. LISTAR PARA PÚBLICO (apenas aprovadas)
GET /api/v1/avaliacoes?id_avaliado=22&status=APROVADO

// 2. LISTAR PARA MODERAÇÃO (pendentes)
GET /api/v1/avaliacoes?status=AGUARDANDO_APROVACAO

// 3. APROVAR
PATCH /api/v1/avaliacoes/45/status
Body: {"status": "APROVADO"}

// 4. NEGAR
PATCH /api/v1/avaliacoes/45/status
Body: {"status": "NEGADO"}
```

---

## 💡 Exemplos Práticos

### Caso 1: Freelancer solicita avaliação após entregar projeto

```bash
# 1. Freelancer ID 22 cria link de avaliação
curl -X POST "http://127.0.0.1:8000/api/v1/avaliacoes/criar-link" \
  -H "Content-Type: application/json" \
  -d '{
    "id_avaliado": 22,
    "tipo_avaliado": "freelancer",
    "servico_prestado": "Desenvolvimento de landing page",
    "dias_validade": 15
  }'

# Resposta:
{
  "link_completo": "https://api.Salexpress.com/api/v1/avaliacoes/avaliar/abc123..."
}

# 2. Freelancer envia link por WhatsApp/Email para cliente

# 3. Cliente acessa link e preenche avaliação
curl -X POST "http://127.0.0.1:8000/api/v1/avaliacoes/avaliar/abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "nome_avaliador": "Ana Costa",
    "numero_avaliador": "21998765432",
    "nota_atendimento": 5.0,
    "nota_preco": 4.5,
    "nota_qualidade": 5.0,
    "comentario": "Trabalho excepcional, entregou antes do prazo!",
    "nota_Salexpress": 5.0,
    "comentario_Salexpress": "A plataforma facilitou muito o processo de contratação."
  }'

# 4. Sistema salva com status "AGUARDANDO_APROVACAO"

# 5. Moderador aprova
curl -X PATCH "http://127.0.0.1:8000/api/v1/avaliacoes/45/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "APROVADO"}'

# 6. Avaliação aparece no perfil público
curl "http://127.0.0.1:8000/api/v1/avaliacoes?id_avaliado=22&tipo_avaliado=freelancer&status=APROVADO"
```

---

### Caso 2: Empresa quer exibir avaliações no site

```javascript
// Frontend: Buscar avaliações aprovadas da empresa ID 10
fetch('http://127.0.0.1:8000/api/v1/avaliacoes?id_avaliado=10&tipo_avaliado=pj&status=APROVADO&limit=50')
  .then(res => res.json())
  .then(avaliacoes => {
    console.log(`Total de avaliações: ${avaliacoes.length}`);
    
    // Filtrar apenas avaliações com nota Salexpress
    const comSalexpress = avaliacoes.filter(a => a.nota_Salexpress !== null);
    console.log(`Avaliaram Salexpress: ${comSalexpress.length}`);
    
    // Calcular média Salexpress
    if (comSalexpress.length > 0) {
      const mediaSalexpress = comSalexpress.reduce((acc, a) => acc + a.nota_Salexpress, 0) / comSalexpress.length;
      console.log(`Média Salexpress: ${mediaSalexpress.toFixed(2)} ⭐`);
    }
    
    // Exibir avaliações
    avaliacoes.forEach(a => {
      console.log(`${a.nome_avaliador}: ${a.media_total}/5 - "${a.comentario}"`);
      if (a.nota_Salexpress) {
        console.log(`  Salexpress: ${a.nota_Salexpress}/5 - "${a.comentario_Salexpress}"`);
      }
    });
  });
```

---

### Caso 3: Painel de moderação

```javascript
// Buscar avaliações pendentes de moderação
fetch('http://127.0.0.1:8000/api/v1/avaliacoes?status=AGUARDANDO_APROVACAO')
  .then(res => res.json())
  .then(avaliacoes => {
    console.log(`${avaliacoes.length} avaliações aguardando moderação`);
    
    avaliacoes.forEach(a => {
      console.log(`\n📝 Avaliação #${a.id}`);
      console.log(`Avaliador: ${a.nome_avaliador}`);
      console.log(`Avaliado: ${a.tipo_avaliado} ID ${a.id_avaliado}`);
      console.log(`Média: ${a.media_total}/5`);
      console.log(`Comentário: "${a.comentario}"`);
      
      if (a.nota_Salexpress) {
        console.log(`Salexpress: ${a.nota_Salexpress}/5 - "${a.comentario_Salexpress}"`);
      }
      
      // Moderador decide aprovar ou negar
      // aprovarAvaliacao(a.id) ou negarAvaliacao(a.id)
    });
  });

function aprovarAvaliacao(id) {
  fetch(`http://127.0.0.1:8000/api/v1/avaliacoes/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'APROVADO' })
  })
  .then(res => res.json())
  .then(data => console.log(`✅ Avaliação ${id} aprovada!`));
}

function negarAvaliacao(id) {
  fetch(`http://127.0.0.1:8000/api/v1/avaliacoes/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'NEGADO' })
  })
  .then(res => res.json())
  .then(data => console.log(`❌ Avaliação ${id} negada!`));
}
```

---

### Caso 4: Dashboard com estatísticas

```javascript
// Buscar estatísticas do freelancer ID 22
fetch('http://127.0.0.1:8000/api/v1/avaliacoes/stats/22/freelancer')
  .then(res => res.json())
  .then(stats => {
    console.log('📊 Estatísticas:');
    console.log(`Total de avaliações: ${stats.total_avaliacoes}`);
    console.log(`Média Atendimento: ${stats.media_atendimento}/5 ⭐`);
    console.log(`Média Preço: ${stats.media_preco}/5 💰`);
    console.log(`Média Qualidade: ${stats.media_qualidade}/5 ✨`);
    console.log(`Média Geral: ${stats.media_geral}/5 🌟`);
    
    console.log('\n📝 Avaliações Recentes:');
    stats.avaliacoes_recentes.forEach(a => {
      console.log(`- ${a.nome_avaliador}: ${a.media_total}/5`);
      if (a.nota_Salexpress) {
        console.log(`  Salexpress: ${a.nota_Salexpress}/5`);
      }
    });
  });
```

---

### Caso 5: Calcular NPS da Salexpress

```javascript
// Buscar todas as avaliações aprovadas
fetch('http://127.0.0.1:8000/api/v1/avaliacoes?status=APROVADO&limit=1000')
  .then(res => res.json())
  .then(avaliacoes => {
    // Filtrar apenas com nota Salexpress
    const comSalexpress = avaliacoes.filter(a => a.nota_Salexpress !== null);
    
    if (comSalexpress.length === 0) {
      console.log('Nenhuma avaliação da Salexpress ainda');
      return;
    }
    
    // Classificar em promotores, neutros e detratores
    const promotores = comSalexpress.filter(a => a.nota_Salexpress >= 4.5).length;
    const neutros = comSalexpress.filter(a => a.nota_Salexpress >= 3.5 && a.nota_Salexpress < 4.5).length;
    const detratores = comSalexpress.filter(a => a.nota_Salexpress < 3.5).length;
    
    // Calcular NPS
    const nps = ((promotores - detratores) / comSalexpress.length) * 100;
    
    // Calcular média
    const mediaSalexpress = comSalexpress.reduce((acc, a) => acc + a.nota_Salexpress, 0) / comSalexpress.length;
    
    console.log('📊 NPS da Salexpress:');
    console.log(`Total avaliações: ${comSalexpress.length}`);
    console.log(`Promotores (≥4.5): ${promotores} (${((promotores/comSalexpress.length)*100).toFixed(1)}%)`);
    console.log(`Neutros (3.5-4.4): ${neutros} (${((neutros/comSalexpress.length)*100).toFixed(1)}%)`);
    console.log(`Detratores (<3.5): ${detratores} (${((detratores/comSalexpress.length)*100).toFixed(1)}%)`);
    console.log(`NPS: ${nps.toFixed(1)}`);
    console.log(`Média: ${mediaSalexpress.toFixed(2)}/5 ⭐`);
    
    // Taxa de avaliação da Salexpress
    const taxa = (comSalexpress.length / avaliacoes.length) * 100;
    console.log(`Taxa de avaliação da Salexpress: ${taxa.toFixed(1)}%`);
  });
```

---

## 🔐 Validações e Regras

### Validações de Notas:
- ✅ Notas devem ser entre **0 e 5**
- ✅ Incrementos de **0.5** (meia estrela)
- ✅ Exemplos válidos: 0, 0.5, 1.0, 1.5, 2.0, ..., 4.5, 5.0
- ❌ Exemplos inválidos: 3.2, 4.7, 5.5

### Validações de Link:
- ✅ Token deve existir no banco
- ✅ Link não pode estar expirado
- ✅ Link não pode ter sido usado anteriormente
- ✅ Dias de validade: 1 a 90 dias

### Cálculo de Média:
```javascript
media_total = (nota_atendimento + nota_preco + nota_qualidade) / 3
// Arredondado para 2 casas decimais
```

### Campos Opcionais:
- `comentario` (sobre o serviço)
- `nota_Salexpress` (avaliação da Salexpress)
- `comentario_Salexpress` (comentário sobre Salexpress)

---

## 📈 Métricas Recomendadas

### 1. Taxa de Conversão de Links
```sql
SELECT 
  COUNT(*) as total_links_criados,
  SUM(CASE WHEN usado = 1 THEN 1 ELSE 0 END) as links_usados,
  (SUM(CASE WHEN usado = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as taxa_conversao
FROM avaliacoes_links;
```

### 2. Média Salexpress por Período
```sql
SELECT 
  DATE(created_at) as data,
  AVG(nota_Salexpress) as media_Salexpress,
  COUNT(*) as total_avaliacoes
FROM avaliacoes
WHERE nota_Salexpress IS NOT NULL
  AND status = 'APROVADO'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

### 3. Taxa de Avaliação da Salexpress
```sql
SELECT 
  COUNT(*) as total_avaliacoes,
  SUM(CASE WHEN nota_Salexpress IS NOT NULL THEN 1 ELSE 0 END) as avaliaram_Salexpress,
  (SUM(CASE WHEN nota_Salexpress IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*)) * 100 as taxa_avaliacao_Salexpress
FROM avaliacoes
WHERE status = 'APROVADO';
```

### 4. Distribuição de Notas Salexpress
```sql
SELECT 
  CASE 
    WHEN nota_Salexpress >= 4.5 THEN 'Promotor (4.5-5.0)'
    WHEN nota_Salexpress >= 3.5 THEN 'Neutro (3.5-4.4)'
    ELSE 'Detrator (0-3.4)'
  END as categoria,
  COUNT(*) as quantidade,
  (COUNT(*) / (SELECT COUNT(*) FROM avaliacoes WHERE nota_Salexpress IS NOT NULL AND status = 'APROVADO')) * 100 as percentual
FROM avaliacoes
WHERE nota_Salexpress IS NOT NULL
  AND status = 'APROVADO'
GROUP BY categoria;
```

---

## ⚠️ Erros Comuns

### 1. Token Inválido
```json
{
  "detail": "Link de avaliação não encontrado"
}
```
**Solução:** Verificar se o token está correto

### 2. Token Expirado
```json
{
  "detail": "Este link de avaliação expirou"
}
```
**Solução:** Gerar novo link

### 3. Token Já Usado
```json
{
  "detail": "Este link de avaliação já foi utilizado"
}
```
**Solução:** Gerar novo link

### 4. Nota Inválida
```json
{
  "detail": [
    {
      "loc": ["body", "nota_atendimento"],
      "msg": "A nota deve ser em incrementos de 0.5 (meia estrela)",
      "type": "value_error"
    }
  ]
}
```
**Solução:** Usar apenas notas válidas (0, 0.5, 1.0, ..., 5.0)

### 5. Avaliação Não Encontrada
```json
{
  "detail": "Avaliação não encontrada"
}
```
**Solução:** Verificar se o ID da avaliação existe

---

## 🎯 Resumo dos Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/avaliacoes/criar-link` | Criar link temporário |
| GET | `/api/v1/avaliacoes/avaliar/{token}` | Renderizar formulário HTML |
| POST | `/api/v1/avaliacoes/avaliar/{token}` | Submeter avaliação via link |
| POST | `/api/v1/avaliacoes/` | Criar avaliação direta |
| GET | `/api/v1/avaliacoes` | Listar avaliações (com filtros) |
| GET | `/api/v1/avaliacoes/{id}` | Obter avaliação específica |
| PATCH | `/api/v1/avaliacoes/{id}/status` | Atualizar status (moderação) |
| GET | `/api/v1/avaliacoes/stats/{id}/{tipo}` | Obter estatísticas |

---

## ✅ Checklist de Implementação Frontend

- [ ] Criar página para gerar links de avaliação
- [ ] Integrar formulário de avaliação (já tem HTML da API)
- [ ] Criar painel de moderação (listar AGUARDANDO_APROVACAO)
- [ ] Implementar aprovação/negação de avaliações
- [ ] Exibir avaliações aprovadas no perfil público
- [ ] Dashboard com estatísticas
- [ ] Filtros por status, tipo, período
- [ ] Calcular e exibir NPS da Salexpress
- [ ] Notificações quando receber nova avaliação
- [ ] Exportar avaliações (CSV/PDF)

---

✅ **Documentação completa do sistema de avaliações!** 🎉
