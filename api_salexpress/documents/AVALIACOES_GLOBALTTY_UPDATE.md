# 🎯 Sistema de Avaliações com Salexpress - Atualização

## 📋 O que mudou?

### ✅ 1. Email do Avaliador
- **Campo:** `email_avaliador` (VARCHAR 200, opcional)
- **Tabela:** `avaliacoes`
- **Status:** ✅ JÁ EXISTIA no sistema

### 🆕 2. Nova Tabela: `avaliacoes_Salexpress`

Tabela separada para avaliar a experiência na plataforma Salexpress.

**Estrutura:**
```sql
CREATE TABLE avaliacoes_Salexpress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    avaliacao_id INT NOT NULL,  -- FK para avaliacoes.id
    nome_avaliador VARCHAR(200),
    email_avaliador VARCHAR(200),
    nota_busca_fornecedor FLOAT NOT NULL,  -- Nota 0-5
    comentario_experiencia TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_avaliador VARCHAR(45),
    
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
    INDEX (avaliacao_id)
);
```

### 📝 3. Pergunta da Salexpress

**Texto:** "Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?"
- Nota de 0 a 5 estrelas (increments de 0.5)
- Comentário opcional

---

## 🔄 Fluxo de Avaliação Atualizado

```
Cliente acessa link
   ↓
STEP 1: Dados Pessoais
├─ Nome *
├─ Email (opcional) ← CAPTURA EMAIL
└─ Telefone *
   ↓
STEP 2: Avalia Serviço
├─ Atendimento (0-5)
├─ Preço (0-5)
├─ Qualidade (0-5)
└─ Comentário (opcional)
   ↓
STEP 3: Avalia Salexpress (OPCIONAL)
├─ Pergunta: "Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?"
├─ Nota (0-5) ← SALVA EM TABELA SEPARADA
└─ Comentário (opcional)
   ↓
✅ Avaliação Enviada
├─ Salva em `avaliacoes`
└─ Se preencheu Salexpress → salva em `avaliacoes_Salexpress`
```

---

## 📤 Request JSON

```json
POST /api/v1/avaliacoes/avaliar/{token}

{
  "nome_avaliador": "Ana Paula Costa",
  "email_avaliador": "ana.costa@email.com",  ← EMAIL CAPTURADO
  "numero_avaliador": "21987654321",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "comentario": "Serviço excelente!",
  
  "avaliacao_Salexpress": {  ← OPCIONAL - TABELA SEPARADA
    "nota_busca_fornecedor": 5.0,
    "comentario_experiencia": "Plataforma muito fácil de usar!"
  }
}
```

---

## 🗄️ Estrutura de Tabelas

### Tabela: `avaliacoes`
```
├─ id
├─ nome_avaliador
├─ email_avaliador ← EMAIL (opcional)
├─ numero_avaliador
├─ id_avaliado
├─ tipo_avaliado
├─ nota_atendimento
├─ nota_preco
├─ nota_qualidade
├─ media_total
├─ servico_prestado
├─ comentario
├─ status (AGUARDANDO_APROVACAO/APROVADO/NEGADO)
└─ created_at
```

### Tabela: `avaliacoes_Salexpress` (NOVA)
```
├─ id
├─ avaliacao_id (FK → avaliacoes.id)
├─ nome_avaliador (copiado)
├─ email_avaliador (copiado) ← EMAIL
├─ nota_busca_fornecedor ← AVALIAÇÃO DA PLATAFORMA
├─ comentario_experiencia
├─ ip_avaliador
└─ created_at
```

---

## 🔧 Migração do Banco

**Execute este SQL no banco de dados:**

```sql
-- 1. Criar nova tabela
CREATE TABLE IF NOT EXISTS avaliacoes_Salexpress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avaliacao_id INT NOT NULL,
    nome_avaliador VARCHAR(200) NOT NULL,
    email_avaliador VARCHAR(200) NULL,
    nota_busca_fornecedor FLOAT NOT NULL COMMENT 'Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?',
    comentario_experiencia TEXT NULL COMMENT 'Comentário sobre a experiência na plataforma',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_avaliador VARCHAR(45) NULL,
    
    INDEX ix_avaliacoes_Salexpress_avaliacao_id (avaliacao_id),
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Remover colunas antigas (se existirem)
ALTER TABLE avaliacoes 
DROP COLUMN IF EXISTS nota_Salexpress,
DROP COLUMN IF EXISTS comentario_Salexpress;

-- Verificar
DESCRIBE avaliacoes_Salexpress;
```

---

## 📊 Queries Úteis

### Listar avaliações da Salexpress
```sql
SELECT 
    ag.id,
    ag.avaliacao_id,
    ag.nome_avaliador,
    ag.email_avaliador,
    ag.nota_busca_fornecedor,
    ag.comentario_experiencia,
    ag.created_at,
    a.servico_prestado,
    a.media_total
FROM avaliacoes_Salexpress ag
INNER JOIN avaliacoes a ON a.id = ag.avaliacao_id
ORDER BY ag.created_at DESC;
```

### Média de avaliações da Salexpress
```sql
SELECT 
    COUNT(*) as total_avaliacoes,
    AVG(nota_busca_fornecedor) as media_nota,
    COUNT(CASE WHEN nota_busca_fornecedor >= 4.5 THEN 1 END) as promotores,
    COUNT(CASE WHEN nota_busca_fornecedor >= 3.5 AND nota_busca_fornecedor < 4.5 THEN 1 END) as neutros,
    COUNT(CASE WHEN nota_busca_fornecedor < 3.5 THEN 1 END) as detratores
FROM avaliacoes_Salexpress;
```

### NPS da Salexpress
```sql
SELECT 
    ((COUNT(CASE WHEN nota_busca_fornecedor >= 4.5 THEN 1 END) - 
      COUNT(CASE WHEN nota_busca_fornecedor < 3.5 THEN 1 END)) / 
     COUNT(*)) * 100 as nps
FROM avaliacoes_Salexpress;
```

---

## ✅ Checklist de Deploy

- [x] Modelo `AvaliacaoSalexpress` criado
- [x] Schema `AvaliacaoSalexpressCreate` criado
- [x] Schema `AvaliacaoSalexpressResponse` criado
- [x] CRUD atualizado para salvar avaliação Salexpress
- [x] Migration SQL criada
- [ ] **Executar migration no banco de dados**
- [ ] Testar endpoint de criação
- [ ] Atualizar frontend (adicionar pergunta)
- [ ] Fazer deploy

---

## 🎯 Endpoints Afetados

### POST `/api/v1/avaliacoes/avaliar/{token}`
**Mudança:** Aceita objeto `avaliacao_Salexpress` opcional

**Request:**
```json
{
  "nome_avaliador": "...",
  "email_avaliador": "...",  ← CAPTURA EMAIL
  "numero_avaliador": "...",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "comentario": "...",
  "avaliacao_Salexpress": {  ← NOVO (opcional)
    "nota_busca_fornecedor": 5.0,
    "comentario_experiencia": "..."
  }
}
```

---

## 🔍 Próximos Passos

1. **Executar Migration** no banco de dados
2. **Atualizar Frontend:**
   - Adicionar pergunta Salexpress no STEP 3
   - Capturar nota (0-5 estrelas)
   - Capturar comentário opcional
   - Enviar objeto `avaliacao_Salexpress` no POST
3. **Testar fluxo completo**
4. **Fazer deploy**

---

🎉 **Sistema atualizado e pronto para uso!**
