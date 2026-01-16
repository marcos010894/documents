# 📝 Formulário de Avaliação Atualizado

## ✅ O que foi adicionado?

### 1. Campo de E-mail
- **Localização:** STEP 1 (Dados pessoais)
- **Tipo:** Optional
- **Placeholder:** "seu@email.com"
- **Captura:** `email_avaliador` no backend

### 2. Avaliação da Salexpress
- **Localização:** STEP 5 (Nova etapa final)
- **Pergunta:** "Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?"
- **Campos:**
  - Nota de 0 a 5 estrelas (opcional)
  - Comentário sobre a experiência (opcional)
- **Backend:** Salvo em tabela `avaliacoes_Salexpress` (FK)

---

## 🔄 Fluxo Atualizado (5 STEPS)

```
STEP 1: 👤 Seus dados
├─ Nome completo *
├─ E-mail (opcional) ← NOVO
└─ Telefone *

STEP 2: 🤝 Atendimento
└─ Nota 0-5 estrelas *

STEP 3: 💰 Preço
└─ Nota 0-5 estrelas *

STEP 4: ⭐ Qualidade
├─ Nota 0-5 estrelas *
└─ Comentário sobre o serviço (opcional)

STEP 5: 🌐 Plataforma Salexpress ← NOVO
├─ Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?
├─ Nota 0-5 estrelas (opcional)
└─ Comentário sobre a plataforma (opcional)
```

---

## 📤 JSON Enviado

### Exemplo completo (com avaliação Salexpress):
```json
{
  "nome_avaliador": "Ana Paula Costa",
  "email_avaliador": "ana.costa@email.com",
  "numero_avaliador": "(21) 98765-4321",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "comentario": "Serviço excelente, muito profissional!",
  "avaliacao_Salexpress": {
    "nota_busca_fornecedor": 5.0,
    "comentario_experiencia": "Plataforma muito fácil de usar, encontrei o fornecedor rapidamente!"
  }
}
```

### Exemplo sem avaliação Salexpress (pulou a etapa):
```json
{
  "nome_avaliador": "João Silva",
  "email_avaliador": null,
  "numero_avaliador": "(11) 99999-8888",
  "nota_atendimento": 4.0,
  "nota_preco": 3.5,
  "nota_qualidade": 4.5,
  "comentario": "Bom serviço"
}
```

---

## 🎨 Visual do Formulário

### STEP 1 - Atualizado
```
👤 Seus dados

┌─────────────────────────────────┐
│ Nome completo *                 │
│ Digite seu nome                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ E-mail (opcional)               │  ← NOVO
│ seu@email.com                   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Telefone *                      │
│ (00) 00000-0000                 │
└─────────────────────────────────┘

[Próximo →]
```

### STEP 5 - NOVA
```
🌐 Plataforma Salexpress

Como você avalia a experiência de buscar 
um fornecedor pela plataforma Salexpress?

★ ★ ★ ★ ★

┌─────────────────────────────────┐
│ Comentário sobre a plataforma   │
│ (opcional)                      │
│                                 │
│ Conte-nos sobre sua experiência │
│ ao buscar fornecedores na       │
│ Salexpress...                    │
└─────────────────────────────────┘

Esta avaliação é opcional

[← Voltar]  [Enviar Avaliação ✓]
```

---

## 🔧 Lógica JavaScript

### Rating Salexpress (opcional)
```javascript
const ratings = {
    atendimento: 0,
    preco: 0,
    qualidade: 0,
    Salexpress: 0  // ← NOVO
};
```

### Submit Form
```javascript
const formData = {
    nome_avaliador: document.getElementById('nome').value,
    email_avaliador: document.getElementById('email').value || null,  // ← NOVO
    numero_avaliador: document.getElementById('telefone').value,
    nota_atendimento: parseFloat(document.getElementById('nota_atendimento').value),
    nota_preco: parseFloat(document.getElementById('nota_preco').value),
    nota_qualidade: parseFloat(document.getElementById('nota_qualidade').value),
    comentario: document.getElementById('comentario').value || null
};

// Adicionar avaliação da Salexpress se foi preenchida
const notaSalexpress = document.getElementById('nota_Salexpress').value;
if (notaSalexpress && parseFloat(notaSalexpress) > 0) {
    formData.avaliacao_Salexpress = {
        nota_busca_fornecedor: parseFloat(notaSalexpress),
        comentario_experiencia: document.getElementById('comentario_Salexpress').value || null
    };
}
```

---

## 📊 Comportamento

### Email
- ✅ Campo opcional (pode ficar vazio)
- ✅ Validação HTML5 (type="email")
- ✅ Salvo em `avaliacoes.email_avaliador`

### Avaliação Salexpress
- ✅ **Totalmente opcional** - usuário pode pular
- ✅ Só envia para backend se nota > 0
- ✅ Comentário também opcional
- ✅ Se enviado, salva em tabela `avaliacoes_Salexpress`
- ✅ Mantém referência com FK (`avaliacao_id`)

---

## 🎯 Indicadores Visuais

### Indicador de Steps (atualizado)
```
● ○ ○ ○ ○  ← 5 dots agora (antes eram 4)
```

### Labels claros
- STEP 4: "Comentário **sobre o serviço** (opcional)"
- STEP 5: "Comentário **sobre a plataforma** (opcional)"

### Texto informativo
```
Esta avaliação é opcional
```
(aparece abaixo dos campos da Salexpress)

---

## ✅ Validações

### STEP 1
- Nome: obrigatório
- Email: opcional (sem validação de obrigatoriedade)
- Telefone: obrigatório + formatação automática

### STEP 2, 3, 4
- Nota obrigatória (1-5 estrelas)

### STEP 5
- **SEM validação obrigatória**
- Usuário pode deixar em branco ou preencher
- Se preencher nota sem comentário → OK
- Se preencher comentário sem nota → comentário é ignorado

---

## 🚀 Deploy

### Status
- ✅ Código commitado (6354903)
- ✅ Push para GitHub
- ⏳ Aguardando migration do banco
- ⏳ Deploy para Fly.io

### Próximos passos
1. Executar SQL migration (criar tabela `avaliacoes_Salexpress`)
2. Fazer deploy para produção
3. Testar formulário completo
4. Validar salvamento em ambas tabelas

---

## 🎉 Resultado Final

Agora quando alguém acessar o link de avaliação:

1. ✅ Verá campo de email no STEP 1
2. ✅ Terá 5 etapas em vez de 4
3. ✅ Poderá avaliar a plataforma Salexpress (opcional)
4. ✅ Email e avaliação Salexpress serão salvos corretamente
5. ✅ Estrutura separada para análise de NPS da plataforma

**Frontend pronto! Backend pronto! Falta só a migration do banco! 🎯**
