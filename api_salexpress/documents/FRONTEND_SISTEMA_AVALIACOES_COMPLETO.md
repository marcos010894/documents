# 🎨 Frontend - Sistema de Avaliações Salexpress

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Tela 1: Criação de Link](#tela-1-criação-de-link)
3. [Tela 2: Formulário de Avaliação](#tela-2-formulário-de-avaliação)
4. [Tela 3: Painel de Moderação](#tela-3-painel-de-moderação)
5. [Tela 4: Exibição Pública](#tela-4-exibição-pública)
6. [Tela 5: Dashboard Estatísticas](#tela-5-dashboard-estatísticas)

---

## 🎯 Visão Geral

Sistema completo com **5 telas principais**:

1. **Criação de Link** → Profissional/Empresa gera link temporário
2. **Formulário de Avaliação** → Cliente avalia serviço (via link)
3. **Painel de Moderação** → Admin aprova/rejeita avaliações
4. **Exibição Pública** → Perfil público mostra avaliações aprovadas
5. **Dashboard** → Estatísticas e métricas gerais

---

## 📝 Tela 1: Criação de Link

### 🎯 Objetivo
Permitir que **profissionais/empresas** gerem links temporários para solicitar avaliações de clientes.

### 👤 Quem usa
- Freelancers
- Empresas (PJ)
- Profissionais (PF)

### 🔧 Como funciona

**1. Formulário de Entrada:**
- Campo "Serviço Prestado" (obrigatório)
  - Ex: "Desenvolvimento de website", "Consultoria financeira"
- Dropdown "Validade do Link"
  - Opções: 7, 15, 30, 60 ou 90 dias

**2. Ao clicar "Gerar Link":**
- Faz requisição `POST /api/v1/avaliacoes/criar-link`
- Envia:
  ```json
  {
    "id_avaliado": 123,
    "tipo_avaliado": "pj",
    "servico_prestado": "Desenvolvimento de website",
    "dias_validade": 30
  }
  ```
- Recebe resposta:
  ```json
  {
    "token": "k5lNBCKqM6FUHr7wBUfehUOm2WXzpYUA",
    "link_completo": "https://Salexpress.com/avaliar/k5lNBCKqM6FUHr7wBUfehUOm2WXzpYUA",
    "expira_em": "2025-12-13T10:30:00",
    "servico_prestado": "Desenvolvimento de website"
  }
  ```

**3. Tela de Sucesso:**
- Mostra o link gerado
- Botão "Copiar Link" (clipboard)
- Botão "Compartilhar WhatsApp"
  - Abre WhatsApp com mensagem:
  - "Olá! Por favor, avalie o serviço: https://Salexpress.com/avaliar/k5lNBCKqM6..."
- Botão "Criar Outro Link"

### 📱 UI/UX

```
┌─────────────────────────────────┐
│   📝 Solicitar Avaliação        │
├─────────────────────────────────┤
│                                 │
│ Serviço Prestado *              │
│ [____________________________]  │
│                                 │
│ Validade do Link                │
│ [▼ 30 dias ▼]                   │
│                                 │
│ [ 🔗 Gerar Link ]               │
│                                 │
└─────────────────────────────────┘
```

**Após gerar:**

```
┌─────────────────────────────────┐
│   ✅ Link Criado!               │
├─────────────────────────────────┤
│                                 │
│ Serviço: Desenvolvimento site   │
│ Expira: 13/12/2025              │
│                                 │
│ [https://Salexpress...] [📋]     │
│                                 │
│ [ 📱 WhatsApp ]                 │
│                                 │
│ [ ➕ Criar Outro ]              │
│                                 │
└─────────────────────────────────┘
```

---

## ⭐ Tela 2: Formulário de Avaliação

### 🎯 Objetivo
Cliente recebe o link e avalia o serviço prestado em **3 etapas**.

### 👤 Quem usa
- Clientes que receberam o link
- Acesso público (sem login)

### 🔧 Como funciona

**STEP 1 - Dados Pessoais:**

```
┌─────────────────────────────────┐
│   📝 Avaliação de Serviço       │
├─────────────────────────────────┤
│                                 │
│ ● ○ ○  (Step 1 de 3)            │
│                                 │
│ 👤 Seus Dados                   │
│                                 │
│ Nome *                          │
│ [____________________________]  │
│                                 │
│ Email (opcional)                │
│ [____________________________]  │
│                                 │
│ Telefone *                      │
│ [____________________________]  │
│                                 │
│         [ Próximo → ]           │
│                                 │
└─────────────────────────────────┘
```

- Validação: Nome mínimo 3 caracteres
- Telefone: 10-20 caracteres
- Email: Opcional (mas se preencher, valida formato)
- Botão "Próximo" só habilita se nome e telefone preenchidos

---

**STEP 2 - Avaliação do Serviço:**

```
┌─────────────────────────────────┐
│   📝 Avaliação de Serviço       │
├─────────────────────────────────┤
│                                 │
│ ● ● ○  (Step 2 de 3)            │
│                                 │
│ ⭐ Avalie o Serviço             │
│                                 │
│ Atendimento                     │
│ ★ ★ ★ ★ ★  (4/5)                │
│                                 │
│ Preço                           │
│ ★ ★ ★ ☆ ☆  (3/5)                │
│                                 │
│ Qualidade                       │
│ ★ ★ ★ ★ ★  (5/5)                │
│                                 │
│ Comentário (opcional)           │
│ [___________________________]   │
│ [___________________________]   │
│                                 │
│ [ ← Voltar ] [ Próximo → ]     │
│                                 │
└─────────────────────────────────┘
```

- Estrelas clicáveis (0 a 5, permitido 0.5)
- Sistema visual: estrela cheia (★) / vazia (☆)
- Textarea para comentário (opcional)
- Validação: Pelo menos 1 nota > 0

---

**STEP 3 - Salexpress + Finalização:**

```
┌─────────────────────────────────┐
│   📝 Avaliação de Serviço       │
├─────────────────────────────────┤
│                                 │
│ ● ● ●  (Step 3 de 3)            │
│                                 │
│ ✨ Finalizar                    │
│                                 │
│ ╔═══════════════════════════╗   │
│ ║ 💼 Avaliar Salexpress      ║   │
│ ║ (Opcional)                ║   │
│ ║                           ║   │
│ ║ Nota Salexpress            ║   │
│ ║ ★ ★ ★ ★ ★  (5/5)          ║   │
│ ║                           ║   │
│ ║ Comentário                ║   │
│ ║ [___________________]     ║   │
│ ╚═══════════════════════════╝   │
│                                 │
│ 📊 Resumo                       │
│ Atendimento: 4 ⭐               │
│ Preço: 3 ⭐                     │
│ Qualidade: 5 ⭐                 │
│ Média: 4.00 ⭐                  │
│                                 │
│ [ ← Voltar ] [ 📤 Enviar ]     │
│                                 │
└─────────────────────────────────┘
```

- Box destacado para Salexpress (cor diferente)
- Resumo mostra cálculo da média
- Ao clicar "Enviar":
  - Faz `POST /api/v1/avaliacoes/avaliar/{token}`
  - Envia todos os dados
  - Se sucesso → Tela de confirmação

---

**Tela de Sucesso:**

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│           ✅                    │
│                                 │
│   Avaliação Enviada!            │
│                                 │
│   Obrigado pelo seu feedback!   │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### 📤 Request Final

```json
POST /api/v1/avaliacoes/avaliar/{token}

{
  "nome_avaliador": "Ana Paula Costa",
  "email_avaliador": "ana.costa@email.com",
  "numero_avaliador": "21987654321",
  "nota_atendimento": 4.0,
  "nota_preco": 3.0,
  "nota_qualidade": 5.0,
  "comentario": "Serviço excelente!",
  "nota_Salexpress": 5.0,
  "comentario_Salexpress": "Plataforma muito profissional"
}
```

### 📊 Validações Automáticas
- Média calculada: `(4.0 + 3.0 + 5.0) / 3 = 4.00`
- Status inicial: `AGUARDANDO_APROVACAO`
- IP capturado automaticamente
- Created_at: Timestamp atual

---

## 🛡️ Tela 3: Painel de Moderação

### 🎯 Objetivo
Administradores aprovam ou negam avaliações antes de ficarem públicas.

### 👤 Quem usa
- Administradores da Salexpress
- Moderadores

### 🔧 Como funciona

**Interface:**

```
┌──────────────────────────────────────────────┐
│   🛡️ Painel de Moderação                    │
├──────────────────────────────────────────────┤
│                                              │
│ [ ⏳ Pendentes (5) ] [ ✅ Aprovadas ] [ ❌ Negadas ]
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Ana Paula Costa            4.83 ⭐      │ │
│ │ 📱 21987654321 • 📧 ana.costa@email.com │ │
│ │ 13/11/2025 10:30                        │ │
│ ├─────────────────────────────────────────┤ │
│ │ Serviço: Consultoria empresarial        │ │
│ │                                         │ │
│ │ Atendimento: 5 ⭐  Preço: 5 ⭐           │ │
│ │ Qualidade: 4.5 ⭐                        │ │
│ │                                         │ │
│ │ Comentário:                             │ │
│ │ "Serviço excelente, recomendo muito!"   │ │
│ │                                         │ │
│ │ ╔════════════════════════════════════╗  │ │
│ │ ║ 💼 Salexpress: 5.0 ⭐               ║  │ │
│ │ ║ "Plataforma muito profissional"    ║  │ │
│ │ ╚════════════════════════════════════╝  │ │
│ │                                         │ │
│ │ Status: AGUARDANDO_APROVACAO            │ │
│ │                                         │ │
│ │ [ ✅ Aprovar ]  [ ❌ Negar ]            │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ João Silva                  3.50 ⭐      │ │
│ │ 📱 11999887766                          │ │
│ │ 12/11/2025 15:22                        │ │
│ ├─────────────────────────────────────────┤ │
│ │ Serviço: Manutenção de PC               │ │
│ │ ...                                     │ │
│ └─────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

### 🔄 Ações

**1. Filtros:**
- Clica "⏳ Pendentes" → Busca `GET /api/v1/avaliacoes?status=AGUARDANDO_APROVACAO`
- Clica "✅ Aprovadas" → Busca `GET /api/v1/avaliacoes?status=APROVADO`
- Clica "❌ Negadas" → Busca `GET /api/v1/avaliacoes?status=NEGADO`

**2. Aprovar:**
- Clica "✅ Aprovar" no card
- Faz `PATCH /api/v1/avaliacoes/{id}/status`
- Body: `{ "status": "APROVADO" }`
- Mostra alert "✅ Avaliação aprovada!"
- Recarrega lista

**3. Negar:**
- Clica "❌ Negar" no card
- Faz `PATCH /api/v1/avaliacoes/{id}/status`
- Body: `{ "status": "NEGADO" }`
- Mostra alert "❌ Avaliação negada!"
- Recarrega lista

### 📊 Informações Exibidas

Cada card mostra:
- ✅ Nome do avaliador
- ✅ Telefone e email (se preenchido)
- ✅ Data/hora da avaliação
- ✅ Serviço prestado
- ✅ Notas individuais (atendimento, preço, qualidade)
- ✅ Média total (destaque grande)
- ✅ Comentário (se houver)
- ✅ Avaliação Salexpress (se houver)
- ✅ Status atual
- ✅ Botões de ação (apenas se pendente)

---

## 👥 Tela 4: Exibição Pública (Perfil)

### 🎯 Objetivo
Mostrar avaliações **aprovadas** no perfil público do profissional/empresa.

### 👤 Quem usa
- Visitantes do perfil (sem login)
- Público geral

### 🔧 Como funciona

**Interface:**

```
┌─────────────────────────────────────────────┐
│   ⭐ Avaliações                             │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │              4.5 ⭐                      │ │
│ │         ★★★★☆                           │ │
│ │    Baseado em 23 avaliações             │ │
│ ├─────────────────────────────────────────┤ │
│ │                                         │ │
│ │ Atendimento  [████████░] 4.7            │ │
│ │ Preço        [██████░░░] 4.2            │ │
│ │ Qualidade    [█████████] 4.8            │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Ana Paula Costa        13/11/2025       │ │
│ │ ★★★★★  4.83                            │ │
│ ├─────────────────────────────────────────┤ │
│ │ Consultoria empresarial                 │ │
│ │                                         │ │
│ │ "Serviço excelente, recomendo muito!"   │ │
│ │                                         │ │
│ │ ╔════════════════════════════════════╗  │ │
│ │ ║ 💼 Salexpress: 5.0 ⭐               ║  │ │
│ │ ║ "Plataforma muito profissional"    ║  │ │
│ │ ╚════════════════════════════════════╝  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Carlos Mendes          10/11/2025       │ │
│ │ ★★★★☆  4.00                            │ │
│ ├─────────────────────────────────────────┤ │
│ │ Desenvolvimento de site                 │ │
│ │                                         │ │
│ │ "Muito bom, cumpriu o prazo!"           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### 📥 Requests

**1. Buscar Estatísticas:**
```
GET /api/v1/avaliacoes/stats/{id_avaliado}/{tipo_avaliado}

Response:
{
  "total_avaliacoes": 23,
  "media_geral": 4.5,
  "media_atendimento": 4.7,
  "media_preco": 4.2,
  "media_qualidade": 4.8
}
```

**2. Buscar Avaliações Aprovadas:**
```
GET /api/v1/avaliacoes?id_avaliado=123&tipo_avaliado=pj&status=APROVADO&limit=50

Response: [
  {
    "id": 11,
    "nome_avaliador": "Ana Paula Costa",
    "email_avaliador": "ana.costa@email.com",
    "media_total": 4.83,
    "comentario": "Serviço excelente...",
    "nota_Salexpress": 5.0,
    "comentario_Salexpress": "Plataforma...",
    "created_at": "2025-11-13T10:30:00"
  }
]
```

### 🎨 UI/UX

**Box de Resumo:**
- Média geral em destaque (tamanho grande)
- Número total de avaliações
- Barras de progresso por critério
- Percentual visual (barras preenchidas)

**Cards de Avaliações:**
- Nome + data
- Estrelas visuais
- Nome do serviço (em itálico)
- Comentário (em box com borda)
- Salexpress destacado (se houver)
- Ordenação: Mais recentes primeiro

---

## 📊 Tela 5: Dashboard Estatísticas

### 🎯 Objetivo
Visão geral de todas as avaliações e **NPS da Salexpress**.

### 👤 Quem usa
- Administradores
- Gerentes

### 🔧 Como funciona

**Interface:**

```
┌────────────────────────────────────────────────┐
│   📊 Dashboard de Avaliações                   │
├────────────────────────────────────────────────┤
│                                                │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │  📝   │ │  ⭐   │ │  💼   │ │  📈   │      │
│ │  147  │ │ 4.52  │ │ 4.85  │ │ 82.3  │      │
│ │ Total │ │ Média │ │ Média │ │ NPS   │      │
│ │       │ │ Geral │ │  TTY  │ │ TTY   │      │
│ └───────┘ └───────┘ └───────┘ └───────┘      │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│ 💼 NPS da Salexpress                            │
│                                                │
│ 85 pessoas avaliaram a Salexpress (57.8%)      │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │[████████████████Promotores 68] 80.0%    │  │
│ │[████Neutros 12] 14.1%                   │  │
│ │[██Detratores 5] 5.9%                    │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ 🟢 Promotores (≥4.5): 80.0%                   │
│ 🟡 Neutros (3.5-4.4): 14.1%                   │
│ 🔴 Detratores (<3.5): 5.9%                    │
│                                                │
│ ╔════════════════════════════════════════╗    │
│ ║        NPS: 82.3                       ║    │
│ ║        🎉 Excelente!                   ║    │
│ ╚════════════════════════════════════════╝    │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│ 🕒 Avaliações Recentes                         │
│                                                │
│ Ana Paula Costa       13/11/2025    4.83 ⭐    │
│ Carlos Mendes         12/11/2025    4.00 ⭐    │
│ Juliana Santos        11/11/2025    5.00 ⭐    │
│ Pedro Oliveira        10/11/2025    3.67 ⭐    │
│ Mariana Costa         09/11/2025    4.50 ⭐    │
│                                                │
└────────────────────────────────────────────────┘
```

### 📥 Requests

**1. Buscar Todas Avaliações Aprovadas:**
```
GET /api/v1/avaliacoes?status=APROVADO&limit=1000
```

**2. Cálculos no Frontend:**

```javascript
// Total de avaliações
total = avaliacoes.length

// Média geral
media_geral = avaliacoes.reduce((sum, a) => sum + a.media_total, 0) / total

// Avaliações com Salexpress
comSalexpress = avaliacoes.filter(a => a.nota_Salexpress !== null)

// Média Salexpress
media_Salexpress = comSalexpress.reduce((sum, a) => sum + a.nota_Salexpress, 0) / comSalexpress.length

// NPS da Salexpress
promotores = comSalexpress.filter(a => a.nota_Salexpress >= 4.5).length
neutros = comSalexpress.filter(a => a.nota_Salexpress >= 3.5 && a.nota_Salexpress < 4.5).length
detratores = comSalexpress.filter(a => a.nota_Salexpress < 3.5).length

nps = ((promotores - detratores) / comSalexpress.length) * 100

// Taxa de avaliação Salexpress
taxa = (comSalexpress.length / total) * 100
```

### 📊 Cards de Resumo

**Total de Avaliações:**
- Ícone: 📝
- Valor: 147
- Label: "Total"

**Média Geral:**
- Ícone: ⭐
- Valor: 4.52
- Label: "Média Geral"

**Média Salexpress:**
- Ícone: 💼
- Valor: 4.85
- Label: "Média TTY"

**NPS Salexpress:**
- Ícone: 📈
- Valor: 82.3
- Label: "NPS TTY"

### 📈 Gráfico NPS

**Barra Horizontal Segmentada:**
- Verde (Promotores): 80% da largura
- Amarelo (Neutros): 14.1% da largura
- Vermelho (Detratores): 5.9% da largura

**Interpretação NPS:**
- ≥ 75: 🎉 Excelente!
- ≥ 50: 😊 Muito Bom!
- ≥ 0: 😐 Razoável
- < 0: 😞 Precisa melhorar

### 🕒 Avaliações Recentes

- Lista as 5 mais recentes
- Nome + Data + Média
- Ordenação: DESC por created_at

---

## 🎯 Resumo dos Componentes

| Tela | Quem Usa | Endpoint Principal |
|------|----------|-------------------|
| **1. Criação Link** | Profissional/Empresa | `POST /criar-link` |
| **2. Formulário** | Cliente (via link) | `POST /avaliar/{token}` |
| **3. Moderação** | Admin | `GET /avaliacoes`, `PATCH /{id}/status` |
| **4. Perfil Público** | Visitantes | `GET /avaliacoes?status=APROVADO`, `GET /stats/{id}/{tipo}` |
| **5. Dashboard** | Admin/Gerente | `GET /avaliacoes?status=APROVADO` |

---

## ✅ Fluxo Completo

```
1. Profissional cria link
   ↓
2. Envia link para cliente (WhatsApp/Email)
   ↓
3. Cliente clica no link
   ↓
4. Preenche formulário (3 steps)
   ↓
5. Avaliação entra como "AGUARDANDO_APROVACAO"
   ↓
6. Admin acessa Painel de Moderação
   ↓
7. Admin aprova ou nega
   ↓
8. Se aprovada: Aparece no perfil público
   ↓
9. Estatísticas atualizadas no Dashboard
```

---

## 🎨 Conceitos de UI/UX

### Design System

**Cores:**
- Primária: `#e98344` (laranja Salexpress)
- Sucesso: `#4caf50` (verde)
- Erro: `#e74c3c` (vermelho)
- Neutro: `#95a5a6` (cinza)
- Salexpress: `#667eea` (roxo/azul)

**Componentes:**
- Cards com `border-radius: 12px`
- Sombras suaves: `box-shadow: 0 2px 10px rgba(0,0,0,0.1)`
- Botões com gradientes
- Transições suaves (0.3s)

**Feedback Visual:**
- Loading: "⏳ Carregando..."
- Sucesso: "✅" + mensagem
- Erro: Alert com mensagem clara
- Estados desabilitados: Opacity 0.5

---

## 📱 Responsividade

Todas as telas devem adaptar para:

- **Desktop:** Layout em grid/cards
- **Tablet:** 2 colunas
- **Mobile:** 1 coluna, stack vertical

Formulários sempre ocupam no máximo `600px` de largura e centralizam na tela.

---

## 🔒 Segurança

- Links temporários (expiram)
- Tokens únicos de 32 caracteres
- Validação de token antes de mostrar formulário
- IP capturado automaticamente
- Moderação antes de publicar
- Apenas avaliações "APROVADO" aparecem publicamente

---

## 📋 Campos do Sistema

### Campos Obrigatórios:
- `nome_avaliador` (3-200 caracteres)
- `numero_avaliador` (10-20 caracteres)
- `nota_atendimento` (0-5, múltiplos de 0.5)
- `nota_preco` (0-5, múltiplos de 0.5)
- `nota_qualidade` (0-5, múltiplos de 0.5)

### Campos Opcionais:
- `email_avaliador` (max 200 caracteres)
- `comentario` (texto livre)
- `nota_Salexpress` (0-5, múltiplos de 0.5)
- `comentario_Salexpress` (texto livre)

### Campos Automáticos:
- `media_total` (calculada: (atendimento + preco + qualidade) / 3)
- `status` (padrão: AGUARDANDO_APROVACAO)
- `ip_avaliador` (capturado do request)
- `created_at` (timestamp atual)

---

🎉 **Sistema completo de avaliações - Frontend explicado sem código!**
