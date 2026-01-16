# 👥 Funcionalidade: Mostrar Com Quem um Documento Está Compartilhado

## 🎯 Resumo

Esta funcionalidade permite visualizar **com quem** um documento específico está compartilhado, similar à funcionalidade de seguidores. 

Suporta todos os tipos de usuários: **PF**, **Freelancer** e **Colaboradores**.

---

## 📡 Endpoint

### Listar Compartilhamentos de um Documento

**GET** `/api/v1/nodes/{node_id}/compartilhamentos`

---

## 🔧 Implementação

### Request Básico
```javascript
const nodeId = 18; // ID do documento

const response = await fetch(
  `http://127.0.0.1:8000/api/v1/nodes/${nodeId}/compartilhamentos`
);

const data = await response.json();
```

### Response (200 OK)
```json
{
  "node_id": 18,
  "node_name": "documento.pdf",
  "node_type": "file",
  "total_compartilhamentos": 3,
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
    },
    {
      "share_id": 3,
      "compartilhado_com": {
        "id": 5,
        "nome": "Ana Oliveira",
        "email": "ana@exemplo.com",
        "tipo": "freelancer"
      },
      "compartilhado_por": {
        "id": 2,
        "nome": "João Silva",
        "email": "joao@exemplo.com",
        "tipo": "pf"
      },
      "created_at": "2025-11-10T12:00:00"
    }
  ]
}
```

### Campos Retornados

**Informações do Documento:**
- `node_id`: ID do documento
- `node_name`: Nome do arquivo
- `node_type`: Tipo (`file` ou `folder`)
- `total_compartilhamentos`: Total de pessoas com quem está compartilhado

**Para cada compartilhamento:**
- `share_id`: ID único do compartilhamento
- `compartilhado_com`: Dados de quem recebeu o compartilhamento
  - `id`: ID do usuário
  - `nome`: Nome completo
  - `email`: Email
  - `tipo`: `"pf"`, `"freelancer"` ou `"collaborator"`
  - `company_id`: (apenas para colaboradores) ID da empresa
  - `company_type`: (apenas para colaboradores) Tipo da empresa
- `compartilhado_por`: Dados de quem compartilhou
  - Mesma estrutura de `compartilhado_com`
- `created_at`: Data/hora do compartilhamento

---

## 💻 Função JavaScript

```javascript
async function listarCompartilhamentos(nodeId) {
  try {
    const response = await fetch(`/api/v1/nodes/${nodeId}/compartilhamentos`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Documento não encontrado');
      }
      throw new Error('Erro ao buscar compartilhamentos');
    }
    
    const data = await response.json();
    
    console.log(`📄 ${data.node_name}`);
    console.log(`📊 Total: ${data.total_compartilhamentos} pessoa(s)\n`);
    
    data.compartilhamentos.forEach(comp => {
      const usuario = comp.compartilhado_com;
      const compartilhadoPor = comp.compartilhado_por;
      
      console.log(`👤 ${usuario.nome}`);
      console.log(`   📧 ${usuario.email}`);
      console.log(`   🏷️  Tipo: ${usuario.tipo}`);
      
      if (usuario.tipo === 'collaborator') {
        console.log(`   🏢 Colaborador da empresa ${usuario.company_id} (${usuario.company_type})`);
      }
      
      console.log(`   📤 Compartilhado por: ${compartilhadoPor.nome}`);
      console.log(`   📅 Data: ${new Date(comp.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

// Exemplo de uso
const compartilhamentos = await listarCompartilhamentos(18);
```

---

## ⚛️ Componente React - Modal de Compartilhamentos

```jsx
import React, { useState, useEffect } from 'react';
import './ModalCompartilhamentos.css';

function ModalCompartilhamentos({ nodeId, isOpen, onClose }) {
  const [compartilhamentos, setCompartilhamentos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && nodeId) {
      carregarCompartilhamentos();
    }
  }, [isOpen, nodeId]);

  const carregarCompartilhamentos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/nodes/${nodeId}/compartilhamentos`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar compartilhamentos');
      }
      
      const data = await response.json();
      setCompartilhamentos(data);
      
    } catch (error) {
      console.error('Erro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      'pf': { label: 'Pessoa Física', color: '#3b82f6' },
      'freelancer': { label: 'Freelancer', color: '#8b5cf6' },
      'collaborator': { label: 'Colaborador', color: '#10b981' }
    };
    return badges[tipo] || { label: tipo, color: '#6b7280' };
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Compartilhamentos</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          {compartilhamentos && (
            <>
              <div className="documento-info">
                <h3>📄 {compartilhamentos.node_name}</h3>
                <p className="total">
                  Compartilhado com <strong>{compartilhamentos.total_compartilhamentos}</strong> pessoa(s)
                </p>
              </div>
              
              {compartilhamentos.total_compartilhamentos === 0 ? (
                <div className="empty-state">
                  <p>Este documento não está compartilhado com ninguém.</p>
                </div>
              ) : (
                <div className="compartilhamentos-list">
                  {compartilhamentos.compartilhamentos.map(comp => {
                    const badge = getTipoBadge(comp.compartilhado_com.tipo);
                    
                    return (
                      <div key={comp.share_id} className="compartilhamento-item">
                        <div className="usuario-info">
                          <div className="usuario-nome">
                            <strong>{comp.compartilhado_com.nome}</strong>
                            <span 
                              className="badge" 
                              style={{ backgroundColor: badge.color }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          
                          <div className="usuario-email">
                            📧 {comp.compartilhado_com.email}
                          </div>
                          
                          {comp.compartilhado_com.tipo === 'collaborator' && (
                            <div className="usuario-empresa">
                              🏢 Empresa: {comp.compartilhado_com.company_id} 
                              ({comp.compartilhado_com.company_type})
                            </div>
                          )}
                        </div>
                        
                        <div className="meta-info">
                          <div className="compartilhado-por">
                            📤 Compartilhado por: 
                            <strong> {comp.compartilhado_por?.nome || 'N/A'}</strong>
                          </div>
                          
                          <div className="data">
                            📅 {new Date(comp.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCompartilhamentos;
```

---

## 🎨 CSS do Modal

```css
/* ModalCompartilhamentos.css */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 16px;
  background-color: #fee;
  border-left: 4px solid #dc2626;
  border-radius: 6px;
  color: #dc2626;
}

.documento-info {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.documento-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #111827;
}

.total {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.compartilhamentos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.compartilhamento-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.compartilhamento-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.usuario-info {
  margin-bottom: 12px;
}

.usuario-nome {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.usuario-nome strong {
  font-size: 1.05rem;
  color: #111827;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.usuario-email,
.usuario-empresa {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.compartilhado-por,
.data {
  font-size: 0.85rem;
  color: #9ca3af;
}

.compartilhado-por strong {
  color: #6b7280;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}

/* Responsivo */
@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
```

---

## 🔘 Botão para Abrir Modal (Integração na Lista de Arquivos)

```jsx
import React, { useState } from 'react';
import ModalCompartilhamentos from './ModalCompartilhamentos';

function CompartilhamentosButton({ nodeId, nodeName }) {
  const [showModal, setShowModal] = useState(false);
  const [totalCompartilhamentos, setTotalCompartilhamentos] = useState(0);

  // Buscar total ao montar componente (opcional)
  useEffect(() => {
    fetch(`/api/v1/nodes/${nodeId}/compartilhamentos`)
      .then(res => res.json())
      .then(data => setTotalCompartilhamentos(data.total_compartilhamentos))
      .catch(err => console.error('Erro ao buscar total:', err));
  }, [nodeId]);

  return (
    <>
      <button 
        className="btn-compartilhamentos"
        onClick={() => setShowModal(true)}
        title={`Ver compartilhamentos de ${nodeName}`}
      >
        <span className="icon">👥</span>
        {totalCompartilhamentos > 0 && (
          <span className="badge-count">{totalCompartilhamentos}</span>
        )}
      </button>
      
      <ModalCompartilhamentos 
        nodeId={nodeId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

export default CompartilhamentosButton;
```

### CSS do Botão
```css
.btn-compartilhamentos {
  position: relative;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-compartilhamentos:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.btn-compartilhamentos .icon {
  font-size: 1.1rem;
}

.btn-compartilhamentos .badge-count {
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}
```

---

## 📋 Uso Completo na Lista de Arquivos

```jsx
function FileListItem({ file }) {
  return (
    <div className="file-item">
      <div className="file-info">
        <span className="file-icon">📄</span>
        <span className="file-name">{file.name}</span>
      </div>
      
      <div className="file-actions">
        {/* Outros botões (download, editar, etc) */}
        
        {/* Botão de Compartilhamentos */}
        <CompartilhamentosButton 
          nodeId={file.id}
          nodeName={file.name}
        />
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

- [ ] **1. Criar o componente `ModalCompartilhamentos.jsx`**
  - Copiar o código React fornecido
  - Criar o arquivo CSS correspondente

- [ ] **2. Criar o botão `CompartilhamentosButton.jsx`**
  - Integrar na lista de arquivos
  - Adicionar estilos CSS

- [ ] **3. Testar endpoint**
  ```bash
  # Testar com curl
  curl http://127.0.0.1:8000/api/v1/nodes/18/compartilhamentos
  ```

- [ ] **4. Integrar na interface**
  - Adicionar botão em cada arquivo/pasta
  - Testar abertura do modal
  - Verificar carregamento dos dados

- [ ] **5. Tratamento de erros**
  - Documento não encontrado (404)
  - Erro de rede
  - Timeout

- [ ] **6. Melhorias opcionais**
  - Cache dos dados
  - Botão de remover compartilhamento
  - Filtros (por tipo de usuário)
  - Exportar lista

---

## 🚀 Testes

### Teste 1: Documento sem compartilhamentos
```javascript
const data = await listarCompartilhamentos(123);
// Deve retornar: total_compartilhamentos = 0
```

### Teste 2: Documento com múltiplos tipos de usuários
```javascript
const data = await listarCompartilhamentos(18);
// Deve retornar: PF, Freelancer e Colaborador
```

### Teste 3: Documento inexistente
```javascript
const data = await listarCompartilhamentos(99999);
// Deve retornar erro 404
```

---

## 📌 Notas Importantes

1. **Permissões**: Qualquer usuário autenticado pode ver os compartilhamentos de documentos aos quais tem acesso

2. **Tipos de Usuário**: O campo `tipo` pode ser:
   - `"pf"` → Pessoa Física
   - `"freelancer"` → Freelancer
   - `"collaborator"` → Colaborador

3. **Colaboradores**: Incluem os campos extras:
   - `company_id`: ID da empresa
   - `company_type`: Tipo da empresa (`"pf"`, `"pj"` ou `"freelancer"`)

4. **Performance**: O endpoint faz JOIN nas tabelas de usuários, então pode ser lento para documentos com muitos compartilhamentos

5. **Atualização**: O total de compartilhamentos é calculado em tempo real, então sempre reflete o estado atual

---

## 🎯 Resultado Final

Com esta implementação, você terá:

✅ Modal elegante mostrando todos os compartilhamentos  
✅ Suporte para PF, Freelancer e Colaboradores  
✅ Informações detalhadas de quem compartilhou e quando  
✅ Badges coloridos para identificar tipo de usuário  
✅ Interface responsiva e com loading states  
✅ Tratamento de erros  
✅ Botão com contador visual  

**Tudo pronto para implementar no frontend! 🚀**
