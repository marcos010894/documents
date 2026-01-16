# 📋 Documentação Frontend - Sistema de Compartilhamentos e Colaboradores

## 🎯 Resumo das Funcionalidades

Este documento contém todas as informações necessárias para implementar no frontend:

1. **Login de Colaboradores** (unificado com PF e Freelancer)
2. **Listagem de Compartilhamentos por Email** (suporta colaboradores)
3. **Visualização de com quem um documento está compartilhado**

---

## 🔐 1. LOGIN DE COLABORADORES

### Endpoint: Login Unificado (Recomendado)

**POST** `/api/v1/auth/login`

Detecta automaticamente se é PF, Freelancer ou Colaborador.

#### Request
```javascript
const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: "baladecoco3562@gmail.com",
    password: "Mito010894@@"
  })
});

const data = await response.json();
```

#### Response - Colaborador (200 OK)
```json
{
  "message": "Login Colaborador realizado com sucesso",
  "status": "completo",
  "user": {
    "id": 2,
    "email": "baladecoco3562@gmail.com",
    "name": "marcos dev",
    "company_id": 21,
    "company_type": "pf",
    "is_active": true,
    "created_at": "2025-11-10T01:13:06",
    "updated_at": "2025-11-10T06:50:29"
  },
  "permissions": {
    "manage_files": true,
    "view_metrics": true,
    "view_only": false,
    "manage_collaborators": false,
    "view_shared": false
  },
  "tipo": "Colaborador",
  "company_id": 21,
  "company_type": "pf",
  "is_collaborator": true
}
```

#### Response - Erro (401 Unauthorized)
```json
{
  "detail": "Email ou senha inválidos"
}
```

#### Response - Colaborador Inativo (403 Forbidden)
```json
{
  "detail": "Colaborador inativo. Entre em contato com o administrador."
}
```

### Endpoint: Login Específico para Colaboradores

**POST** `/api/v1/auth/collaborator/login`

Usa a mesma estrutura de request/response do endpoint unificado.

---

## 👤 2. IDENTIFICAR TIPO DE USUÁRIO NO FRONTEND

```javascript
// Após o login
const loginResponse = await fetch('/api/v1/auth/login', {...});
const data = await loginResponse.json();

// Identificar tipo de usuário
if (data.tipo === "Colaborador" && data.is_collaborator === true) {
  // É um colaborador
  console.log("Colaborador da empresa:", data.company_id);
  console.log("Tipo da empresa:", data.company_type); // "pf", "pj" ou "freelancer"
  
  // Verificar permissões
  if (data.permissions.manage_files) {
    console.log("Pode gerenciar arquivos");
  }
  if (data.permissions.view_metrics) {
    console.log("Pode ver métricas da empresa");
  }
  if (data.permissions.manage_collaborators) {
    console.log("Pode gerenciar outros colaboradores");
  }
  
  // Salvar no localStorage ou state management
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('permissions', JSON.stringify(data.permissions));
  localStorage.setItem('userType', 'collaborator');
  localStorage.setItem('companyId', data.company_id);
  localStorage.setItem('companyType', data.company_type);
  
} else if (data.tipo === "PF") {
  // É Pessoa Física
  console.log("Usuário PF");
  
} else if (data.tipo === "Freelancer") {
  // É Freelancer
  console.log("Usuário Freelancer");
}
```

---

## 📂 3. COMPARTILHAMENTOS POR EMAIL (Suporta Colaboradores)

### Endpoint: Listar Arquivos Compartilhados com um Email

**GET** `/api/v1/shares/shared_with_me/by-email/{email}`

Agora suporta emails de **PF**, **Freelancer** E **Colaboradores**!

#### Request
```javascript
const email = "baladecoco3562@gmail.com"; // Pode ser colaborador, PF ou freelancer
const encodedEmail = encodeURIComponent(email);

const response = await fetch(
  `http://127.0.0.1:8000/api/v1/shares/shared_with_me/by-email/${encodedEmail}`
);

const data = await response.json();
```

#### Response (200 OK)
```json
[
  {
    "id": 18,
    "name": "documento.pdf",
    "type": "file",
    "parent_id": 10,
    "business_id": 21,
    "type_user": "pf",
    "size": 1024000,
    "extension": "pdf",
    "status": null,
    "comments": null,
    "url": "https://...",
    "data_validade": "2025-12-31T23:59:59",
    "created_at": "2025-11-01T10:00:00",
    "updated_at": "2025-11-10T15:30:00",
    "seguidores": [
      {
        "seguidor_id": 1,
        "usuario": {
          "id": 21,
          "nome": "João Silva",
          "email": "joao@exemplo.com",
          "tipo": "pf"
        },
        "dias_antes_alerta": 7,
        "alertar_no_vencimento": true,
        "created_at": "2025-11-01T10:00:00"
      }
    ],
    "total_seguidores": 1,
    "usuario_atual_segue": {
      "seguidor_id": 2,
      "dias_antes_alerta": 3,
      "alertar_no_vencimento": true,
      "created_at": "2025-11-05T14:20:00"
    },
    "usuario_e_dono": false
  }
]
```

#### Exemplo de Uso no Frontend
```javascript
async function carregarArquivosCompartilhados(email) {
  try {
    const encodedEmail = encodeURIComponent(email);
    const response = await fetch(
      `/api/v1/shares/shared_with_me/by-email/${encodedEmail}`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar arquivos compartilhados');
    }
    
    const arquivos = await response.json();
    
    // Exibir arquivos na interface
    arquivos.forEach(arquivo => {
      console.log(`📄 ${arquivo.name}`);
      console.log(`   Tipo: ${arquivo.type}`);
      console.log(`   Tamanho: ${formatBytes(arquivo.size)}`);
      console.log(`   Seguidores: ${arquivo.total_seguidores}`);
      
      if (arquivo.usuario_atual_segue) {
        console.log(`   ✅ Você está seguindo este documento`);
      }
      
      if (arquivo.usuario_e_dono) {
        console.log(`   👑 Você é o dono deste documento`);
      }
    });
    
    return arquivos;
    
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
}

// Usar após o login
const userEmail = loginData.user.email;
const arquivosCompartilhados = await carregarArquivosCompartilhados(userEmail);
```

---

## 👥 4. LISTAR COM QUEM UM DOCUMENTO ESTÁ COMPARTILHADO

### Endpoint: Ver Compartilhamentos de um Documento

**GET** `/api/v1/nodes/{node_id}/compartilhamentos`

Mostra **com quem** um documento específico está compartilhado (similar aos seguidores).

#### Request
```javascript
const nodeId = 18; // ID do documento

const response = await fetch(
  `http://127.0.0.1:8000/api/v1/nodes/${nodeId}/compartilhamentos`
);

const data = await response.json();
```

#### Response (200 OK)
```json
{
  "node_id": 18,
  "node_name": "documento.pdf",
  "node_type": "file",
  "total_compartilhamentos": 2,
  "compartilhamentos": [
    {
      "share_id": 1,
      "compartilhado_com": {
        "id": 2,
        "nome": "João Silva",
        "email": "joao@exemplo.com",
        "tipo": "pf"
      },
      "compartilhado_por": {
        "id": 21,
        "nome": "Maria Santos",
        "email": "maria@exemplo.com",
        "tipo": "pf"
      },
      "created_at": "2025-11-10T10:00:00"
    },
    {
      "share_id": 2,
      "compartilhado_com": {
        "id": 3,
        "nome": "Pedro Costa",
        "email": "pedro@exemplo.com",
        "tipo": "collaborator",
        "company_id": 21,
        "company_type": "pf"
      },
      "compartilhado_por": {
        "id": 21,
        "nome": "Maria Santos",
        "email": "maria@exemplo.com",
        "tipo": "pf"
      },
      "created_at": "2025-11-10T11:30:00"
    }
  ]
}
```

#### Exemplo de Uso no Frontend
```javascript
async function listarCompartilhamentos(nodeId) {
  try {
    const response = await fetch(`/api/v1/nodes/${nodeId}/compartilhamentos`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar compartilhamentos');
    }
    
    const data = await response.json();
    
    console.log(`📄 ${data.node_name}`);
    console.log(`Compartilhado com ${data.total_compartilhamentos} pessoa(s):\n`);
    
    data.compartilhamentos.forEach(comp => {
      const usuario = comp.compartilhado_com;
      const compartilhadoPor = comp.compartilhado_por;
      
      console.log(`👤 ${usuario.nome} (${usuario.email})`);
      console.log(`   Tipo: ${usuario.tipo}`);
      
      if (usuario.tipo === 'collaborator') {
        console.log(`   📋 Colaborador da empresa ${usuario.company_id}`);
      }
      
      console.log(`   📤 Compartilhado por: ${compartilhadoPor.nome}`);
      console.log(`   📅 Data: ${new Date(comp.created_at).toLocaleString()}`);
      console.log('');
    });
    
    return data;
    
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// Exemplo de uso
const compartilhamentos = await listarCompartilhamentos(18);
```

#### Componente React - Modal de Compartilhamentos
```jsx
import React, { useState, useEffect } from 'react';

function ModalCompartilhamentos({ nodeId, isOpen, onClose }) {
  const [compartilhamentos, setCompartilhamentos] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && nodeId) {
      carregarCompartilhamentos();
    }
  }, [isOpen, nodeId]);

  const carregarCompartilhamentos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/nodes/${nodeId}/compartilhamentos`);
      const data = await response.json();
      setCompartilhamentos(data);
    } catch (error) {
      console.error('Erro ao carregar compartilhamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Compartilhamentos</h2>
        
        {loading && <p>Carregando...</p>}
        
        {compartilhamentos && (
          <>
            <h3>{compartilhamentos.node_name}</h3>
            <p>
              Compartilhado com {compartilhamentos.total_compartilhamentos} pessoa(s)
            </p>
            
            <div className="compartilhamentos-list">
              {compartilhamentos.compartilhamentos.map(comp => (
                <div key={comp.share_id} className="compartilhamento-item">
                  <div className="usuario-info">
                    <strong>{comp.compartilhado_com.nome}</strong>
                    <span className="email">{comp.compartilhado_com.email}</span>
                    
                    {comp.compartilhado_com.tipo === 'collaborator' && (
                      <span className="badge">Colaborador</span>
                    )}
                    {comp.compartilhado_com.tipo === 'pf' && (
                      <span className="badge">Pessoa Física</span>
                    )}
                    {comp.compartilhado_com.tipo === 'freelancer' && (
                      <span className="badge">Freelancer</span>
                    )}
                  </div>
                  
                  <div className="meta-info">
                    <small>
                      Compartilhado por: {comp.compartilhado_por?.nome || 'N/A'}
                    </small>
                    <small>
                      Data: {new Date(comp.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

export default ModalCompartilhamentos;
```

---

## 🎨 5. COMPONENTE DE ÍCONE - Compartilhamentos

Similar ao ícone de seguidores, adicione um ícone para mostrar compartilhamentos:

```jsx
function CompartilhamentosButton({ nodeId }) {
  const [showModal, setShowModal] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Buscar total de compartilhamentos
    fetch(`/api/v1/nodes/${nodeId}/compartilhamentos`)
      .then(res => res.json())
      .then(data => setTotal(data.total_compartilhamentos))
      .catch(err => console.error(err));
  }, [nodeId]);

  return (
    <>
      <button 
        className="btn-icon"
        onClick={() => setShowModal(true)}
        title="Ver compartilhamentos"
      >
        👥 {total > 0 && <span className="badge">{total}</span>}
      </button>
      
      <ModalCompartilhamentos 
        nodeId={nodeId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
```

---

## 🔄 6. FLUXO COMPLETO NO FRONTEND

### Ao Fazer Login
```javascript
// 1. Fazer login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const userData = await loginResponse.json();

// 2. Identificar tipo de usuário
const isCollaborator = userData.is_collaborator === true;
const userType = userData.tipo; // "PF", "Freelancer" ou "Colaborador"

// 3. Salvar dados no estado/localStorage
localStorage.setItem('user', JSON.stringify(userData.user));
localStorage.setItem('permissions', JSON.stringify(userData.permissions));
localStorage.setItem('isCollaborator', isCollaborator);
localStorage.setItem('companyId', userData.company_id);

// 4. Carregar arquivos compartilhados com o usuário
const arquivosCompartilhados = await fetch(
  `/api/v1/shares/shared_with_me/by-email/${encodeURIComponent(userData.user.email)}`
).then(res => res.json());

// 5. Exibir na interface
renderizarArquivos(arquivosCompartilhados);
```

### Ao Visualizar um Arquivo
```javascript
function visualizarArquivo(nodeId) {
  // 1. Buscar detalhes do arquivo
  const arquivo = await fetch(`/api/v1/nodes/${nodeId}`).then(res => res.json());
  
  // 2. Buscar seguidores
  // (já implementado - usa a função obter_seguidores_documento)
  
  // 3. Buscar compartilhamentos (NOVO!)
  const compartilhamentos = await fetch(
    `/api/v1/nodes/${nodeId}/compartilhamentos`
  ).then(res => res.json());
  
  // 4. Exibir na interface
  mostrarDetalhesArquivo(arquivo);
  mostrarSeguidores(arquivo.seguidores);
  mostrarCompartilhamentos(compartilhamentos); // NOVO!
}
```

---

## 📊 7. VERIFICAR PERMISSÕES DE COLABORADOR

```javascript
function verificarPermissao(permissao) {
  const permissions = JSON.parse(localStorage.getItem('permissions') || '{}');
  return permissions[permissao] === true;
}

// Exemplos de uso
if (verificarPermissao('manage_files')) {
  // Mostrar botão de deletar arquivo
  mostrarBotaoDeletar();
}

if (verificarPermissao('view_metrics')) {
  // Mostrar métricas da empresa
  carregarMetricas();
}

if (verificarPermissao('manage_collaborators')) {
  // Mostrar área de gerenciar colaboradores
  mostrarGerenciarColaboradores();
}

if (verificarPermissao('view_only')) {
  // Desabilitar ações de edição
  desabilitarEdicao();
}

if (verificarPermissao('view_shared')) {
  // Mostrar apenas arquivos compartilhados
  filtrarApenasCompartilhados();
}
```

---

## 🚨 8. TRATAMENTO DE ERROS

```javascript
async function fazerRequisicao(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    // Erro 401: Não autorizado
    if (response.status === 401) {
      alert('Sessão expirada. Faça login novamente.');
      window.location.href = '/login';
      return null;
    }
    
    // Erro 403: Colaborador inativo
    if (response.status === 403) {
      const error = await response.json();
      alert(error.detail);
      window.location.href = '/login';
      return null;
    }
    
    // Erro 404: Não encontrado
    if (response.status === 404) {
      const error = await response.json();
      alert(`Erro: ${error.detail}`);
      return null;
    }
    
    // Sucesso
    return await response.json();
    
  } catch (error) {
    console.error('Erro na requisição:', error);
    alert('Erro de conexão. Tente novamente.');
    return null;
  }
}

// Uso
const dados = await fazerRequisicao('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## 📝 9. RESUMO DOS ENDPOINTS

| Endpoint | Método | Descrição | Suporta Colaborador |
|----------|--------|-----------|---------------------|
| `/api/v1/auth/login` | POST | Login unificado | ✅ Sim |
| `/api/v1/auth/collaborator/login` | POST | Login específico colaborador | ✅ Sim |
| `/api/v1/shares/shared_with_me/by-email/{email}` | GET | Arquivos compartilhados com email | ✅ Sim |
| `/api/v1/nodes/{node_id}/compartilhamentos` | GET | Ver com quem arquivo está compartilhado | ✅ Sim |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Login de Colaboradores
- [ ] Implementar tela de login (usa o mesmo form de PF/Freelancer)
- [ ] Salvar `is_collaborator: true` no state após login
- [ ] Salvar `permissions` no localStorage/state
- [ ] Salvar `company_id` e `company_type` no localStorage/state
- [ ] Criar função `verificarPermissao(permissao)`
- [ ] Adaptar interface baseado em permissões

### Compartilhamentos por Email
- [ ] Atualizar chamada da API para suportar colaboradores
- [ ] Testar com email de colaborador
- [ ] Exibir badge "Colaborador" quando aplicável

### Ver Compartilhamentos de um Documento
- [ ] Criar componente `ModalCompartilhamentos`
- [ ] Adicionar botão 👥 ao lado dos arquivos
- [ ] Mostrar lista de pessoas com quem está compartilhado
- [ ] Exibir badge de tipo de usuário (PF, Freelancer, Colaborador)
- [ ] Mostrar quem compartilhou (compartilhado_por)
- [ ] Formatação de data/hora

### Permissões de Colaborador
- [ ] Esconder botões de ação se `view_only: true`
- [ ] Mostrar métricas apenas se `view_metrics: true`
- [ ] Permitir deletar/editar apenas se `manage_files: true`
- [ ] Área de gerenciar colaboradores se `manage_collaborators: true`
- [ ] Filtrar apenas compartilhados se `view_shared: true`

---

## 🎯 PRIORIDADES DE IMPLEMENTAÇÃO

### Alta Prioridade
1. ✅ Login de colaboradores (já funciona!)
2. ✅ Identificar tipo de usuário após login
3. ✅ Verificar permissões básicas

### Média Prioridade
1. Implementar modal de compartilhamentos
2. Adaptar interface baseado em permissões
3. Mostrar badge de colaborador nos compartilhamentos

### Baixa Prioridade
1. Animações e transições
2. Relatórios de uso por colaborador
3. Notificações push

---

## 📞 CONTATO E SUPORTE

Em caso de dúvidas ou problemas na implementação, consulte:
- `README_LOGIN_COLABORADOR.md` - Detalhes técnicos do login
- `README_COLABORADORES.md` - Sistema completo de colaboradores
- Logs do servidor em caso de erros

---

**Data:** 10 de Novembro de 2025  
**Status:** ✅ Pronto para implementação no frontend