# Frontend - Avaliação da Salexpress

## 📋 Visão Geral

Sistema de avaliação que permite aos clientes avaliarem tanto o **profissional/empresa** quanto a **Salexpress como intermediadora** do serviço, tudo na mesma sessão/formulário.

---

## 🎯 Funcionalidade

Quando um cliente preenche uma avaliação, ele pode:
1. **Avaliar o Profissional/Empresa** (obrigatório)
   - Nota de atendimento (0-5 estrelas)
   - Nota de preço (0-5 estrelas)
   - Nota de qualidade (0-5 estrelas)
   - Comentário sobre o serviço

2. **Avaliar a Salexpress** (opcional)
   - Nota para a intermediação (0-5 estrelas)
   - Comentário sobre a experiência com a Salexpress

---

## 🔗 Endpoints

### 1. Criar Avaliação (POST)

```http
POST /api/v1/avaliacoes/avaliar/{token}
Content-Type: application/json

{
  "nome_avaliador": "João Silva",
  "numero_avaliador": "11987654321",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "comentario": "Excelente serviço prestado pela empresa!",
  "nota_Salexpress": 4.5,
  "comentario_Salexpress": "A Salexpress intermediou muito bem o contato, processo transparente e rápido."
}
```

**Resposta (200 OK):**
```json
{
  "id": 7,
  "nome_avaliador": "João Silva",
  "numero_avaliador": "11987654321",
  "id_avaliado": 1,
  "tipo_avaliado": "pj",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "media_total": 4.83,
  "servico_prestado": "Consultoria em TI",
  "comentario": "Excelente serviço prestado pela empresa!",
  "nota_Salexpress": 4.5,
  "comentario_Salexpress": "A Salexpress intermediou muito bem o contato, processo transparente e rápido.",
  "status": "AGUARDANDO_APROVACAO",
  "created_at": "2025-01-19T10:30:00"
}
```

### 2. Listar Avaliações com Filtro (GET)

```http
GET /api/v1/avaliacoes?id_avaliado=1&tipo_avaliado=pj&status=APROVADO
```

**Resposta:**
```json
[
  {
    "id": 7,
    "nome_avaliador": "João Silva",
    "media_total": 4.83,
    "nota_Salexpress": 4.5,
    "comentario": "Excelente serviço!",
    "comentario_Salexpress": "Ótima intermediação!",
    "created_at": "2025-01-19T10:30:00"
  }
]
```

---

## 💻 Componente React - Formulário de Avaliação

```jsx
import React, { useState } from 'react';
import './AvaliacaoForm.css';

const AvaliacaoForm = ({ token }) => {
  const [formData, setFormData] = useState({
    nome_avaliador: '',
    numero_avaliador: '',
    nota_atendimento: 0,
    nota_preco: 0,
    nota_qualidade: 0,
    comentario: '',
    nota_Salexpress: 0,
    comentario_Salexpress: ''
  });

  const [mostrarAvaliacaoSalexpress, setMostrarAvaliacaoSalexpress] = useState(false);

  const handleStarClick = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderStars = (field, currentValue) => {
    const stars = [];
    for (let i = 0.5; i <= 5; i += 0.5) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= currentValue ? 'filled' : ''} ${i % 1 === 0.5 ? 'half' : 'full'}`}
          onClick={() => handleStarClick(field, i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/v1/avaliacoes/avaliar/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
        setFormData({
          nome_avaliador: '',
          numero_avaliador: '',
          nota_atendimento: 0,
          nota_preco: 0,
          nota_qualidade: 0,
          comentario: '',
          nota_Salexpress: 0,
          comentario_Salexpress: ''
        });
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('❌ Erro ao enviar avaliação. Tente novamente.');
    }
  };

  return (
    <div className="avaliacao-container">
      <h1>📝 Avaliação de Serviço</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Dados do Avaliador */}
        <div className="form-section">
          <h2>👤 Seus Dados</h2>
          <input
            type="text"
            placeholder="Nome completo"
            value={formData.nome_avaliador}
            onChange={(e) => setFormData({ ...formData, nome_avaliador: e.target.value })}
            required
            minLength="3"
          />
          <input
            type="tel"
            placeholder="Telefone (11987654321)"
            value={formData.numero_avaliador}
            onChange={(e) => setFormData({ ...formData, numero_avaliador: e.target.value })}
            required
            minLength="10"
          />
        </div>

        {/* Avaliação do Profissional/Empresa */}
        <div className="form-section">
          <h2>⭐ Avalie o Serviço Prestado</h2>
          
          <div className="rating-group">
            <label>Atendimento:</label>
            <div className="stars">{renderStars('nota_atendimento', formData.nota_atendimento)}</div>
            <span className="rating-value">{formData.nota_atendimento.toFixed(1)}</span>
          </div>

          <div className="rating-group">
            <label>Preço:</label>
            <div className="stars">{renderStars('nota_preco', formData.nota_preco)}</div>
            <span className="rating-value">{formData.nota_preco.toFixed(1)}</span>
          </div>

          <div className="rating-group">
            <label>Qualidade:</label>
            <div className="stars">{renderStars('nota_qualidade', formData.nota_qualidade)}</div>
            <span className="rating-value">{formData.nota_qualidade.toFixed(1)}</span>
          </div>

          <textarea
            placeholder="Conte-nos sobre sua experiência com o serviço..."
            value={formData.comentario}
            onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
            maxLength="1000"
            rows="4"
          />
        </div>

        {/* Avaliação da Salexpress (Opcional) */}
        <div className="form-section Salexpress-section">
          <button
            type="button"
            className="toggle-Salexpress"
            onClick={() => setMostrarAvaliacaoSalexpress(!mostrarAvaliacaoSalexpress)}
          >
            {mostrarAvaliacaoSalexpress ? '▼' : '▶'} Avaliar a Salexpress (Opcional)
          </button>

          {mostrarAvaliacaoSalexpress && (
            <div className="Salexpress-rating">
              <p className="info-text">
                ℹ️ Queremos saber como foi sua experiência com a Salexpress como intermediadora do serviço.
              </p>

              <div className="rating-group">
                <label>Como você avalia a Salexpress?</label>
                <div className="stars">{renderStars('nota_Salexpress', formData.nota_Salexpress)}</div>
                <span className="rating-value">
                  {formData.nota_Salexpress > 0 ? formData.nota_Salexpress.toFixed(1) : 'Não avaliado'}
                </span>
              </div>

              <textarea
                placeholder="Conte-nos sobre sua experiência com a Salexpress... (Opcional)"
                value={formData.comentario_Salexpress}
                onChange={(e) => setFormData({ ...formData, comentario_Salexpress: e.target.value })}
                maxLength="1000"
                rows="3"
              />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          📤 Enviar Avaliação
        </button>
      </form>
    </div>
  );
};

export default AvaliacaoForm;
```

---

## 🎨 CSS - AvaliacaoForm.css

```css
.avaliacao-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.avaliacao-container h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
}

.form-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.form-section h2 {
  color: #34495e;
  font-size: 20px;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.form-section input,
.form-section textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 2px solid #dce4ec;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-section input:focus,
.form-section textarea:focus {
  outline: none;
  border-color: #3498db;
}

.rating-group {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
}

.rating-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 16px;
}

.stars {
  display: inline-flex;
  gap: 5px;
  margin-right: 15px;
}

.star {
  font-size: 32px;
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s, transform 0.2s;
  user-select: none;
}

.star:hover {
  transform: scale(1.2);
}

.star.filled {
  color: #f39c12;
}

.star.half {
  position: relative;
}

.rating-value {
  font-size: 18px;
  font-weight: 600;
  color: #3498db;
  vertical-align: middle;
}

/* Seção Salexpress */
.Salexpress-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.toggle-Salexpress {
  width: 100%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  text-align: left;
}

.toggle-Salexpress:hover {
  background: rgba(255, 255, 255, 0.3);
}

.Salexpress-rating {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
}

.info-text {
  color: #5a5a5a;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px;
  background: #e8f4fd;
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

.Salexpress-rating .rating-group {
  background: white;
}

.Salexpress-rating textarea {
  border-color: #764ba2;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

/* Responsivo */
@media (max-width: 768px) {
  .avaliacao-container {
    margin: 20px;
    padding: 20px;
  }

  .star {
    font-size: 28px;
  }

  .form-section h2 {
    font-size: 18px;
  }
}
```

---

## 📊 Componente de Visualização de Avaliações

```jsx
import React from 'react';
import './AvaliacoesDisplay.css';

const AvaliacoesDisplay = ({ avaliacoes }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half-filled">★</span>);
    }
    while (stars.length < 5) {
      stars.push(<span key={stars.length} className="star">★</span>);
    }
    return stars;
  };

  return (
    <div className="avaliacoes-display">
      <h2>📊 Avaliações Recebidas</h2>
      {avaliacoes.map((avaliacao) => (
        <div key={avaliacao.id} className="avaliacao-card">
          <div className="avaliacao-header">
            <h3>{avaliacao.nome_avaliador}</h3>
            <span className="data">{new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="avaliacao-servico">
            <p className="servico">{avaliacao.servico_prestado}</p>
            <div className="rating-stars">
              {renderStars(avaliacao.media_total)}
              <span className="rating-number">{avaliacao.media_total.toFixed(1)}</span>
            </div>
            {avaliacao.comentario && (
              <p className="comentario">"{avaliacao.comentario}"</p>
            )}
          </div>

          {avaliacao.nota_Salexpress && (
            <div className="avaliacao-Salexpress">
              <h4>💼 Avaliação da Salexpress</h4>
              <div className="rating-stars">
                {renderStars(avaliacao.nota_Salexpress)}
                <span className="rating-number">{avaliacao.nota_Salexpress.toFixed(1)}</span>
              </div>
              {avaliacao.comentario_Salexpress && (
                <p className="comentario">"{avaliacao.comentario_Salexpress}"</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AvaliacoesDisplay;
```

---

## 🎨 CSS - AvaliacoesDisplay.css

```css
.avaliacoes-display {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
}

.avaliacoes-display h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 26px;
}

.avaliacao-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.avaliacao-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.avaliacao-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.avaliacao-header h3 {
  color: #2c3e50;
  font-size: 20px;
  margin: 0;
}

.data {
  color: #95a5a6;
  font-size: 14px;
}

.avaliacao-servico {
  margin-bottom: 20px;
}

.servico {
  color: #7f8c8d;
  font-size: 14px;
  font-style: italic;
  margin-bottom: 10px;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 10px 0;
}

.rating-stars .star {
  font-size: 24px;
  color: #ddd;
}

.rating-stars .star.filled {
  color: #f39c12;
}

.rating-stars .star.half-filled {
  background: linear-gradient(90deg, #f39c12 50%, #ddd 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rating-number {
  font-size: 18px;
  font-weight: 600;
  color: #3498db;
  margin-left: 10px;
}

.comentario {
  color: #34495e;
  font-size: 16px;
  line-height: 1.6;
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

.avaliacao-Salexpress {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 8px;
  border: 2px solid #667eea;
}

.avaliacao-Salexpress h4 {
  color: #667eea;
  font-size: 16px;
  margin-bottom: 10px;
}

.avaliacao-Salexpress .comentario {
  border-left-color: #667eea;
}

@media (max-width: 768px) {
  .avaliacao-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .data {
    margin-top: 5px;
  }
}
```

---

## 🔍 Exemplos de Uso

### 1. Criar Avaliação com Salexpress (JavaScript Puro)

```javascript
async function enviarAvaliacao(token) {
  const response = await fetch(`/api/v1/avaliacoes/avaliar/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome_avaliador: "Maria Santos",
      numero_avaliador: "11999887766",
      nota_atendimento: 5.0,
      nota_preco: 4.0,
      nota_qualidade: 4.5,
      comentario: "Serviço muito bom, recomendo!",
      nota_Salexpress: 5.0,
      comentario_Salexpress: "Plataforma excelente, facilitou muito o processo!"
    })
  });

  const data = await response.json();
  console.log('Avaliação criada:', data);
}
```

### 2. Buscar Avaliações da Salexpress

```javascript
async function buscarAvaliacoesSalexpress() {
  const response = await fetch('/api/v1/avaliacoes?skip=0&limit=50');
  const avaliacoes = await response.json();

  // Filtrar apenas avaliações com nota da Salexpress
  const avaliacoesComSalexpress = avaliacoes.filter(a => a.nota_Salexpress !== null);

  // Calcular média da Salexpress
  const mediaSalexpress = avaliacoesComSalexpress.reduce((acc, a) => acc + a.nota_Salexpress, 0) 
    / avaliacoesComSalexpress.length;

  console.log(`Média Salexpress: ${mediaSalexpress.toFixed(2)} ⭐`);
  console.log(`Total de avaliações: ${avaliacoesComSalexpress.length}`);
}
```

---

## ✅ Estrutura de Dados

### Campos Adicionados na Tabela `avaliacoes`:

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `nota_Salexpress` | FLOAT | YES | Nota de 0-5 para a Salexpress |
| `comentario_Salexpress` | TEXT | YES | Comentário sobre a Salexpress |

### Exemplo de Resposta Completa:

```json
{
  "id": 7,
  "nome_avaliador": "João Silva",
  "numero_avaliador": "11987654321",
  "id_avaliado": 1,
  "tipo_avaliado": "pj",
  "nota_atendimento": 5.0,
  "nota_preco": 4.5,
  "nota_qualidade": 5.0,
  "media_total": 4.83,
  "servico_prestado": "Consultoria em TI",
  "comentario": "Excelente serviço!",
  "nota_Salexpress": 4.5,
  "comentario_Salexpress": "Ótima intermediação da Salexpress!",
  "status": "AGUARDANDO_APROVACAO",
  "created_at": "2025-01-19T10:30:00",
  "ip_avaliador": "192.168.1.100"
}
```

---

## 🎯 Benefícios

1. **Feedback Duplo**: Cliente avalia tanto o serviço quanto a intermediação
2. **Transparência**: Salexpress recebe feedback direto dos usuários
3. **Opcional**: Avaliação da Salexpress não é obrigatória
4. **Mesma Sessão**: Tudo em um único formulário, sem burocracia
5. **Métricas**: Permite calcular NPS e satisfação da plataforma

---

## 📈 Métricas Sugeridas

```javascript
// Calcular NPS da Salexpress
function calcularNPSSalexpress(avaliacoes) {
  const comNota = avaliacoes.filter(a => a.nota_Salexpress !== null);
  
  const promotores = comNota.filter(a => a.nota_Salexpress >= 4.5).length;
  const neutros = comNota.filter(a => a.nota_Salexpress >= 3.5 && a.nota_Salexpress < 4.5).length;
  const detratores = comNota.filter(a => a.nota_Salexpress < 3.5).length;
  
  const nps = ((promotores - detratores) / comNota.length) * 100;
  
  return {
    nps: nps.toFixed(1),
    promotores,
    neutros,
    detratores,
    total: comNota.length
  };
}
```

---

✅ **Sistema completo e funcionando!** 🎉
