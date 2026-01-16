# 📋 Sistema de Rastreabilidade de Documentos

## 🎯 Objetivo

Sistema completo de auditoria e rastreabilidade para documentos/pastas. Registra **TODAS** as ações realizadas: criação, edição, movimentação, renomeação, compartilhamento, etc.

---

## 📡 Endpoints Disponíveis

### 1. Rastreabilidade Resumida (Recomendado)

**GET** `/api/v1/nodes/{node_id}/rastreabilidade`

Retorna um **resumo** com as informações mais importantes:
- Quem criou e quando
- Última edição (quem e quando)
- Última movimentação (quem e quando)
- Última renomeação (quem e quando)
- Totais de cada tipo de ação

#### Request
```javascript
const nodeId = 18;

const response = await fetch(
  `http://127.0.0.1:8000/api/v1/nodes/${nodeId}/rastreabilidade`
);

const data = await response.json();
```

#### Response (200 OK)
```json
{
  "node_id": 18,
  "criado_por": {
    "id": 21,
    "nome": "Maria Santos",
    "email": "maria@exemplo.com",
    "tipo": "pf"
  },
  "criado_em": "2025-11-10T10:00:00",
  "ultima_edicao_por": {
    "id": 2,
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "tipo": "collaborator"
  },
  "ultima_edicao_em": "2025-11-10T15:30:00",
  "ultima_movimentacao_por": {
    "id": 21,
    "nome": "Maria Santos",
    "email": "maria@exemplo.com",
    "tipo": "pf"
  },
  "ultima_movimentacao_em": "2025-11-10T14:00:00",
  "movimentacao_detalhes": {
    "de_pasta_id": 5,
    "de_pasta_nome": "Documentos",
    "para_pasta_id": 10,
    "para_pasta_nome": "Importante"
  },
  "ultima_renomeacao_por": {
    "id": 21,
    "nome": "Maria Santos",
    "email": "maria@exemplo.com",
    "tipo": "pf"
  },
  "ultima_renomeacao_em": "2025-11-09T10:00:00",
  "renomeacao_detalhes": {
    "nome_antigo": "documento.pdf",
    "nome_novo": "relatorio_2025.pdf"
  },
  "ultimo_compartilhamento_por": {
    "id": 21,
    "nome": "Maria Santos",
    "email": "maria@exemplo.com",
    "tipo": "pf"
  },
  "ultimo_compartilhamento_em": "2025-11-10T11:00:00",
  "total_edicoes": 5,
  "total_movimentacoes": 2,
  "total_compartilhamentos": 3
}
```

---

### 2. Histórico Completo

**GET** `/api/v1/nodes/{node_id}/historico?limit=100`

Retorna o **histórico completo** de todas as ações, ordenado por data (mais recente primeiro).

#### Request
```javascript
const nodeId = 18;
const limit = 100; // Opcional, padrão 100, máximo 500

const response = await fetch(
  `http://127.0.0.1:8000/api/v1/nodes/${nodeId}/historico?limit=${limit}`
);

const data = await response.json();
```

#### Response (200 OK)
```json
{
  "node_id": 18,
  "node_name": "relatorio_2025.pdf",
  "node_type": "file",
  "total_registros": 15,
  "historico": [
    {
      "id": 45,
      "acao": "edited",
      "acao_descricao": "Editou o documento",
      "usuario": {
        "id": 2,
        "nome": "João Silva",
        "email": "joao@exemplo.com",
        "tipo": "collaborator"
      },
      "detalhes": {
        "alteracoes": "Adicionou 3 páginas",
        "tamanho_anterior": 102400,
        "tamanho_novo": 153600
      },
      "data_hora": "2025-11-10T15:30:00",
      "ip": "192.168.1.100"
    },
    {
      "id": 44,
      "acao": "moved",
      "acao_descricao": "Moveu o documento",
      "usuario": {
        "id": 21,
        "nome": "Maria Santos",
        "email": "maria@exemplo.com",
        "tipo": "pf"
      },
      "detalhes": {
        "de_pasta_id": 5,
        "de_pasta_nome": "Documentos",
        "para_pasta_id": 10,
        "para_pasta_nome": "Importante"
      },
      "data_hora": "2025-11-10T14:00:00",
      "ip": "192.168.1.100"
    },
    {
      "id": 43,
      "acao": "shared",
      "acao_descricao": "Compartilhou o documento",
      "usuario": {
        "id": 21,
        "nome": "Maria Santos",
        "email": "maria@exemplo.com",
        "tipo": "pf"
      },
      "detalhes": {
        "compartilhado_com_id": 2,
        "compartilhado_com_nome": "João Silva",
        "compartilhado_com_email": "joao@exemplo.com"
      },
      "data_hora": "2025-11-10T11:00:00",
      "ip": "192.168.1.100"
    },
    {
      "id": 42,
      "acao": "renamed",
      "acao_descricao": "Renomeou o documento",
      "usuario": {
        "id": 21,
        "nome": "Maria Santos",
        "email": "maria@exemplo.com",
        "tipo": "pf"
      },
      "detalhes": {
        "nome_antigo": "documento.pdf",
        "nome_novo": "relatorio_2025.pdf"
      },
      "data_hora": "2025-11-09T10:00:00",
      "ip": "192.168.1.100"
    },
    {
      "id": 41,
      "acao": "created",
      "acao_descricao": "Criou o documento",
      "usuario": {
        "id": 21,
        "nome": "Maria Santos",
        "email": "maria@exemplo.com",
        "tipo": "pf"
      },
      "detalhes": {
        "tamanho": 102400,
        "extensao": "pdf"
      },
      "data_hora": "2025-11-08T10:00:00",
      "ip": "192.168.1.50"
    }
  ]
}
```

---

## 🔑 Tipos de Ações Registradas

| Ação | Código | Descrição |
|------|--------|-----------|
| ✅ Criado | `created` | Documento/pasta foi criado |
| 📦 Movido | `moved` | Documento/pasta foi movido para outra pasta |
| ✏️ Editado | `edited` | Conteúdo do documento foi alterado |
| 📝 Renomeado | `renamed` | Nome do documento foi alterado |
| 🗑️ Deletado | `deleted` | Movido para lixeira |
| ♻️ Restaurado | `restored` | Restaurado da lixeira |
| ❌ Deletado Permanente | `permanently_deleted` | Removido permanentemente |
| 👥 Compartilhado | `shared` | Compartilhado com alguém |
| 🚫 Descompartilhado | `unshared` | Compartilhamento removido |
| ⬇️ Baixado | `downloaded` | Arquivo foi baixado |
| ⬆️ Enviado | `uploaded` | Novo arquivo enviado (substituição) |
| 🔐 Permissão Alterada | `permission_changed` | Permissões foram modificadas |
| 👁️ Seguindo | `followed` | Usuário começou a seguir |
| 👋 Parou de Seguir | `unfollowed` | Usuário parou de seguir |

---

## 💻 Função JavaScript - Rastreabilidade Resumida

```javascript
async function obterRastreabilidade(nodeId) {
  try {
    const response = await fetch(`/api/v1/nodes/${nodeId}/rastreabilidade`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar rastreabilidade');
    }
    
    const data = await response.json();
    
    console.log(`📄 Documento ID: ${data.node_id}`);
    console.log('\n📋 RASTREABILIDADE:\n');
    
    // Criação
    if (data.criado_por) {
      console.log(`✅ Criado por: ${data.criado_por.nome} (${data.criado_por.email})`);
      console.log(`   Data: ${new Date(data.criado_em).toLocaleString('pt-BR')}\n`);
    }
    
    // Última edição
    if (data.ultima_edicao_por) {
      console.log(`✏️ Última edição por: ${data.ultima_edicao_por.nome}`);
      console.log(`   Data: ${new Date(data.ultima_edicao_em).toLocaleString('pt-BR')}`);
      console.log(`   Total de edições: ${data.total_edicoes}\n`);
    }
    
    // Última movimentação
    if (data.ultima_movimentacao_por) {
      console.log(`📦 Última movimentação por: ${data.ultima_movimentacao_por.nome}`);
      console.log(`   Data: ${new Date(data.ultima_movimentacao_em).toLocaleString('pt-BR')}`);
      if (data.movimentacao_detalhes) {
        console.log(`   De: ${data.movimentacao_detalhes.de_pasta_nome || 'Raiz'}`);
        console.log(`   Para: ${data.movimentacao_detalhes.para_pasta_nome || 'Raiz'}`);
      }
      console.log(`   Total de movimentações: ${data.total_movimentacoes}\n`);
    }
    
    // Compartilhamentos
    if (data.ultimo_compartilhamento_por) {
      console.log(`👥 Último compartilhamento por: ${data.ultimo_compartilhamento_por.nome}`);
      console.log(`   Data: ${new Date(data.ultimo_compartilhamento_em).toLocaleString('pt-BR')}`);
      console.log(`   Total de compartilhamentos: ${data.total_compartilhamentos}\n`);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

// Uso
const rastreabilidade = await obterRastreabilidade(18);
```

---

## 💻 Função JavaScript - Histórico Completo

```javascript
async function obterHistorico(nodeId, limit = 100) {
  try {
    const response = await fetch(
      `/api/v1/nodes/${nodeId}/historico?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar histórico');
    }
    
    const data = await response.json();
    
    console.log(`📄 ${data.node_name}`);
    console.log(`📊 Total de ações: ${data.total_registros}\n`);
    
    data.historico.forEach((item, index) => {
      console.log(`${index + 1}. ${item.acao_descricao}`);
      console.log(`   👤 ${item.usuario.nome} (${item.usuario.email})`);
      console.log(`   📅 ${new Date(item.data_hora).toLocaleString('pt-BR')}`);
      
      if (item.detalhes && Object.keys(item.detalhes).length > 0) {
        console.log(`   📝 Detalhes:`, item.detalhes);
      }
      
      console.log('');
    });
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

// Uso
const historico = await obterHistorico(18, 50);
```

---

## ⚛️ Componente React - Card de Rastreabilidade

```jsx
import React, { useState, useEffect } from 'react';
import './RastreabilidadeCard.css';

function RastreabilidadeCard({ nodeId }) {
  const [rastreabilidade, setRastreabilidade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarRastreabilidade();
  }, [nodeId]);

  const carregarRastreabilidade = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/nodes/${nodeId}/rastreabilidade`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar rastreabilidade');
      }
      
      const data = await response.json();
      setRastreabilidade(data);
      
    } catch (error) {
      console.error('Erro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A';
    return new Date(dataISO).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="rastreabilidade-card loading">
        <div className="spinner"></div>
        <p>Carregando rastreabilidade...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rastreabilidade-card error">
        ❌ {error}
      </div>
    );
  }

  if (!rastreabilidade) return null;

  return (
    <div className="rastreabilidade-card">
      <h3>📋 Rastreabilidade do Documento</h3>
      
      {/* Criação */}
      {rastreabilidade.criado_por && (
        <div className="info-section">
          <div className="icon">✅</div>
          <div className="content">
            <strong>Criado por:</strong>
            <p>{rastreabilidade.criado_por.nome}</p>
            <small>{formatarData(rastreabilidade.criado_em)}</small>
          </div>
        </div>
      )}
      
      {/* Última Edição */}
      {rastreabilidade.ultima_edicao_por && (
        <div className="info-section">
          <div className="icon">✏️</div>
          <div className="content">
            <strong>Última edição por:</strong>
            <p>{rastreabilidade.ultima_edicao_por.nome}</p>
            <small>{formatarData(rastreabilidade.ultima_edicao_em)}</small>
            <span className="badge">{rastreabilidade.total_edicoes} edições</span>
          </div>
        </div>
      )}
      
      {/* Última Movimentação */}
      {rastreabilidade.ultima_movimentacao_por && (
        <div className="info-section">
          <div className="icon">📦</div>
          <div className="content">
            <strong>Última movimentação por:</strong>
            <p>{rastreabilidade.ultima_movimentacao_por.nome}</p>
            <small>{formatarData(rastreabilidade.ultima_movimentacao_em)}</small>
            {rastreabilidade.movimentacao_detalhes && (
              <small className="detalhes">
                De: {rastreabilidade.movimentacao_detalhes.de_pasta_nome || 'Raiz'} → 
                Para: {rastreabilidade.movimentacao_detalhes.para_pasta_nome || 'Raiz'}
              </small>
            )}
            <span className="badge">{rastreabilidade.total_movimentacoes} movimentações</span>
          </div>
        </div>
      )}
      
      {/* Compartilhamentos */}
      {rastreabilidade.ultimo_compartilhamento_por && (
        <div className="info-section">
          <div className="icon">👥</div>
          <div className="content">
            <strong>Último compartilhamento por:</strong>
            <p>{rastreabilidade.ultimo_compartilhamento_por.nome}</p>
            <small>{formatarData(rastreabilidade.ultimo_compartilhamento_em)}</small>
            <span className="badge">{rastreabilidade.total_compartilhamentos} compartilhamentos</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RastreabilidadeCard;
```

---

## ⚛️ Componente React - Modal de Histórico Completo

```jsx
import React, { useState, useEffect } from 'react';
import './HistoricoModal.css';

function HistoricoModal({ nodeId, isOpen, onClose }) {
  const [historico, setHistorico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && nodeId) {
      carregarHistorico();
    }
  }, [isOpen, nodeId]);

  const carregarHistorico = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/nodes/${nodeId}/historico?limit=100`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }
      
      const data = await response.json();
      setHistorico(data);
      
    } catch (error) {
      console.error('Erro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconeAcao = (acao) => {
    const icones = {
      'created': '✅',
      'moved': '📦',
      'edited': '✏️',
      'renamed': '📝',
      'deleted': '🗑️',
      'restored': '♻️',
      'permanently_deleted': '❌',
      'shared': '👥',
      'unshared': '🚫',
      'downloaded': '⬇️',
      'uploaded': '⬆️',
      'permission_changed': '🔐',
      'followed': '👁️',
      'unfollowed': '👋'
    };
    return icones[acao] || '📄';
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content historico-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📜 Histórico Completo</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando histórico...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          {historico && (
            <>
              <div className="documento-info">
                <h3>📄 {historico.node_name}</h3>
                <p>Total de ações: <strong>{historico.total_registros}</strong></p>
              </div>
              
              <div className="historico-timeline">
                {historico.historico.map((item, index) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="icone">{getIconeAcao(item.acao)}</span>
                    </div>
                    
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <strong>{item.acao_descricao}</strong>
                        <span className="data">{formatarData(item.data_hora)}</span>
                      </div>
                      
                      <div className="timeline-usuario">
                        👤 {item.usuario.nome}
                        <span className="email">({item.usuario.email})</span>
                        <span className={`badge tipo-${item.usuario.tipo}`}>
                          {item.usuario.tipo}
                        </span>
                      </div>
                      
                      {item.detalhes && Object.keys(item.detalhes).length > 0 && (
                        <div className="timeline-detalhes">
                          <summary>📝 Detalhes</summary>
                          <pre>{JSON.stringify(item.detalhes, null, 2)}</pre>
                        </div>
                      )}
                      
                      {item.ip && (
                        <div className="timeline-ip">
                          🌐 IP: {item.ip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

export default HistoricoModal;
```

---

## 🎨 CSS - RastreabilidadeCard

```css
.rastreabilidade-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.rastreabilidade-card h3 {
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  color: #111827;
}

.rastreabilidade-card.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.rastreabilidade-card.error {
  background: #fee;
  border-left: 4px solid #dc2626;
  color: #dc2626;
}

.info-section {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 6px;
  background: #f9fafb;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.info-section:hover {
  background: #f3f4f6;
}

.info-section .icon {
  font-size: 1.5rem;
  min-width: 30px;
}

.info-section .content {
  flex: 1;
}

.info-section strong {
  display: block;
  color: #374151;
  margin-bottom: 4px;
}

.info-section p {
  margin: 0;
  color: #111827;
  font-size: 0.95rem;
}

.info-section small {
  display: block;
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 4px;
}

.info-section small.detalhes {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.info-section .badge {
  display: inline-block;
  background: #3b82f6;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-top: 8px;
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
```

---

## 🎨 CSS - HistoricoModal

```css
.historico-modal {
  max-width: 800px !important;
}

.historico-timeline {
  position: relative;
  padding-left: 40px;
}

.timeline-item {
  position: relative;
  padding-bottom: 30px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -25px;
  top: 30px;
  bottom: -10px;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-marker {
  position: absolute;
  left: -40px;
  top: 0;
  width: 30px;
  height: 30px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-marker .icone {
  font-size: 0.9rem;
}

.timeline-content {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header strong {
  color: #111827;
  font-size: 1rem;
}

.timeline-header .data {
  color: #6b7280;
  font-size: 0.85rem;
}

.timeline-usuario {
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.timeline-usuario .email {
  color: #6b7280;
  margin-left: 4px;
}

.timeline-usuario .badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-left: 8px;
  color: white;
}

.badge.tipo-pf {
  background: #3b82f6;
}

.badge.tipo-collaborator {
  background: #10b981;
}

.badge.tipo-freelancer {
  background: #8b5cf6;
}

.timeline-detalhes {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.timeline-detalhes summary {
  cursor: pointer;
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.timeline-detalhes pre {
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  color: #374151;
}

.timeline-ip {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #9ca3af;
}
```

---

## ✅ Checklist de Implementação

- [ ] **1. Criar tabela no banco** (já feita via migration)
- [ ] **2. Testar endpoints**
  ```bash
  # Resumo
  curl http://127.0.0.1:8000/api/v1/nodes/18/rastreabilidade
  
  # Histórico
  curl http://127.0.0.1:8000/api/v1/nodes/18/historico?limit=50
  ```
- [ ] **3. Criar componente RastreabilidadeCard**
- [ ] **4. Criar componente HistoricoModal**
- [ ] **5. Integrar nos detalhes do documento**
- [ ] **6. Adicionar logs automáticos nas ações** (criar, editar, mover, etc)

---

## 🚀 Resultado Final

Com esta implementação você terá:

✅ **Rastreabilidade completa** de todos os documentos  
✅ **Auditoria** de quem fez o quê e quando  
✅ **Histórico detalhado** com timeline visual  
✅ **Informações de IP e navegador** para segurança  
✅ **Performance otimizada** com índices no banco  
✅ **Interface elegante** para visualização  

**Sistema pronto para auditoria e compliance! 🔒📋**
