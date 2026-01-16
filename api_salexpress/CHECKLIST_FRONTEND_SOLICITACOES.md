# ✅ Como Funciona - Solicitações de Contato no Frontend

## 🎯 Objetivo
Explicar como implementar a funcionalidade para visualizar e gerenciar solicitações de contato recebidas.

---

## 📋 Funcionalidades Principais

### 1️⃣ Buscar Solicitações do Usuário Logado

**Endpoint:** `GET /my-solicitations/?email={email}`

```javascript
async function carregarSolicitacoes() {
  const email = localStorage.getItem('userEmail'); // Email do usuário logado
  
  const response = await fetch(
    `https://api-Salexpress3.fly.dev/api/v1/contactsSolicitations/my-solicitations/?email=${email}&skip=0&limit=20`
  );
  
  const data = await response.json();
  // Retorna: { data: [...], total: 15, totalPages: 2 }
  
  return data;
}
```

**O que retorna:**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@example.com",
      "telefone": "27999999999",
      "id_busness": 44,
      "type_user": "Freelancer",
      "status": "Pendente",
      "created_at": "2025-11-25T10:00:00"
    }
  ],
  "total": 15,
  "totalPages": 2
}
```

---

### 2️⃣ Atualizar Status da Solicitação

**Endpoint:** `PATCH /{contact_id}/status?email={email}`

```javascript
async function atualizarStatus(contactId, novoStatus) {
  const email = localStorage.getItem('userEmail');
  
  const response = await fetch(
    `https://api-Salexpress3.fly.dev/api/v1/contactsSolicitations/${contactId}/status?email=${email}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  return response.json();
}
```

**Status permitidos:**
- `"Pendente"` - Aguardando a resposta do cliente
- `"Aguardando avaliação"` - O contato com o cliente foi realizado
- `"Avaliado"` - O cliente avaliou o serviço
- `"Solicitação não feita"` - O cliente não solicitou o serviço

---

## � Tratamento de Erros

```javascript
try {
  await atualizarStatus(123, "Aguardando avaliação");
  alert('Status atualizado com sucesso!');
} catch (error) {
  if (error.message.includes('permissão')) {
    alert('Você não tem permissão para editar esta solicitação');
  } else if (error.message.includes('Status')) {
    alert('Status inválido. Use um dos 4 status permitidos.');
  } else {
    alert('Erro: ' + error.message);
  }
}
```

**Erros possíveis:**
- **403 Forbidden:** Email não corresponde ao dono da solicitação
- **404 Not Found:** Solicitação não existe
- **422 Unprocessable Entity:** Status inválido

---

## 🚀 Exemplo Completo de Implementação

---

## 🚀 Exemplo Completo de Implementação

```javascript
// Classe para gerenciar as solicitações
class SolicitacoesManager {
  constructor() {
    this.baseUrl = 'https://api-Salexpress3.fly.dev/api/v1/contactsSolicitations';
    this.email = localStorage.getItem('userEmail');
  }
  
  // Buscar solicitações do usuário
  async buscarMinhasSolicitacoes(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const url = `${this.baseUrl}/my-solicitations/?email=${this.email}&skip=${skip}&limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao carregar solicitações');
    }
    
    return await response.json();
  }
  
  // Atualizar status de uma solicitação
  async atualizarStatus(contactId, novoStatus) {
    const url = `${this.baseUrl}/${contactId}/status?email=${this.email}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return await response.json();
  }
}

// Uso prático
const manager = new SolicitacoesManager();

// Carregar solicitações ao abrir a página
async function init() {
  try {
    const data = await manager.buscarMinhasSolicitacoes(1, 20);
    
    console.log('Total de solicitações:', data.total);
    console.log('Solicitações:', data.data);
    
    // Exibir na interface
    data.data.forEach(solicitacao => {
      console.log(`${solicitacao.nome} - ${solicitacao.status}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Atualizar status quando usuário escolher
async function handleAtualizarStatus(contactId, novoStatus) {
  try {
    const resultado = await manager.atualizarStatus(contactId, novoStatus);
    
    alert('Status atualizado com sucesso!');
    console.log('Atualizado:', resultado);
    
    // Recarregar lista
    await init();
    
  } catch (error) {
    alert('Erro: ' + error.message);
  }
}

// Inicializar ao carregar página
init();
```

---

## 🔄 Fluxo de Funcionamento

### Ao Abrir a Página:
1. Sistema busca o email salvo no `localStorage`
2. Faz requisição para `/my-solicitations/?email={email}`
3. API retorna todas as solicitações do usuário
4. Frontend exibe a lista

### Ao Atualizar Status:
1. Usuário seleciona novo status no dropdown/select
2. Usuário clica em "Atualizar"
3. Sistema faz requisição `PATCH /{id}/status?email={email}`
4. API valida se o email pertence ao dono
5. Se sim, atualiza e retorna sucesso
6. Se não, retorna erro 403
7. Frontend mostra mensagem de sucesso/erro
8. Frontend recarrega a lista atualizada

---

## 📝 Dados Importantes

### Informações que você tem de cada solicitação:
```javascript
{
  id: 1,                              // ID único da solicitação
  nome: "João Silva",                 // Nome do solicitante
  email: "joao@example.com",          // Email do solicitante
  telefone: "27999999999",            // Telefone do solicitante
  id_busness: 44,                     // ID do seu negócio
  type_user: "Freelancer",            // Tipo do seu usuário
  status: "Pendente",                 // Status atual
  created_at: "2025-11-25T10:00:00",  // Data da solicitação
  termos_aceitos: true                // Termos aceitos
}
```

### O que você pode fazer:
- ✅ Ver todas as solicitações recebidas
- ✅ Atualizar o status de cada uma
- ✅ Ordenar/filtrar por status
- ✅ Paginar resultados

### O que você NÃO pode fazer:
- ❌ Ver solicitações de outros usuários
- ❌ Editar solicitações de outros usuários
- ❌ Usar status diferentes dos 4 permitidos
- ❌ Excluir solicitações

---

## 💡 Dicas Importantes

### 1. Email do Usuário Logado
```javascript
// Salvar no login
localStorage.setItem('userEmail', email);

// Usar nas requisições
const email = localStorage.getItem('userEmail');
```

### 2. Status São Case-Sensitive
```javascript
// ✅ CORRETO
"Pendente"
"Aguardando avaliação"
"Avaliado"
"Solicitação não feita"

// ❌ ERRADO
"pendente"
"PENDENTE"
"aguardando avaliacao"
"Avaliacao"
```

### 3. Paginação
```javascript
// Página 1 (primeiros 10)
skip=0, limit=10

// Página 2 (próximos 10)
skip=10, limit=10

// Página 3 (próximos 10)
skip=20, limit=10

// Fórmula: skip = (page - 1) * limit
```

### 4. Tratamento de Erro por Código HTTP
```javascript
const response = await fetch(url, options);

if (response.status === 403) {
  alert('Você não tem permissão');
} else if (response.status === 404) {
  alert('Solicitação não encontrada');
} else if (response.status === 422) {
  alert('Status inválido');
} else if (!response.ok) {
  alert('Erro desconhecido');
}
```

---

## 🎯 Resumo Rápido

**Para buscar suas solicitações:**
```javascript
GET /my-solicitations/?email={seu_email}
```

**Para atualizar status:**
```javascript
PATCH /{id}/status?email={seu_email}
Body: { "status": "Aguardando avaliação" }
```

**Status permitidos:**
1. Pendente
2. Aguardando avaliação
3. Avaliado
4. Solicitação não feita

**Validação automática:**
- ✅ Só o dono pode editar
- ✅ Só aceita os 4 status
- ✅ Email é obrigatório

---

## 📚 Mais Informações

Para documentação completa, consulte:
- **README_SOLICITACOES_CONTATO.md** - Documentação detalhada
- **RESUMO_SOLICITACOES_CONTATO.md** - Guia rápido
- **exemplo_contact_solicitations.py** - Exemplos em Python

---

**Isso é tudo que você precisa saber para implementar! 🚀**
