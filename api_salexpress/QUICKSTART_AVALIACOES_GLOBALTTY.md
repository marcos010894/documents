# ⚡ Quick Start - Avaliações da Salexpress

## 🎯 O Que São?

Avaliações que os **clientes fazem sobre a experiência de usar a plataforma Salexpress** para encontrar fornecedores (não são as avaliações dos serviços dos fornecedores).

---

## 📡 Endpoints

### 1. Listar Avaliações
```
GET /api/v1/avaliacoes/Salexpress/avaliacoes?skip=0&limit=100
```

### 2. Estatísticas
```
GET /api/v1/avaliacoes/Salexpress/estatisticas
```

---

## 💻 Uso Rápido (JavaScript)

```javascript
// Buscar avaliações
const response = await fetch(
  'https://api-Salexpress3.fly.dev/api/v1/avaliacoes/Salexpress/avaliacoes?skip=0&limit=50'
);
const resultado = await response.json();

console.log('Total:', resultado.total);
console.log('Média:', resultado.estatisticas.media_geral);
console.log('NPS:', resultado.estatisticas.nps);

// Listar avaliações
resultado.data.forEach(av => {
  console.log(`${av.nome_avaliador} - ${av.nota_busca_fornecedor}⭐`);
  console.log(`Comentário: ${av.comentario_experiencia}`);
});
```

---

## 📊 Resposta

```json
{
  "data": [
    {
      "id": 1,
      "nome_avaliador": "Maria Santos",
      "email_avaliador": "maria@example.com",
      "nota_busca_fornecedor": 5.0,
      "comentario_experiencia": "Plataforma excelente!",
      "created_at": "2025-11-25T10:30:00",
      "servico_avaliado": "Desenvolvimento web",
      "media_servico": 4.8
    }
  ],
  "total": 150,
  "estatisticas": {
    "total_avaliacoes": 150,
    "media_geral": 4.6,
    "nps": 85.5,
    "percentual_positivas": 90.0
  }
}
```

---

## 🔑 Campos Importantes

| Campo | O Que É |
|-------|---------|
| `nota_busca_fornecedor` | Nota de 0-5 sobre a plataforma |
| `comentario_experiencia` | O que o cliente achou |
| `servico_avaliado` | Qual serviço o cliente contratou |
| `media_servico` | Nota que deu para o serviço |

---

## 📈 Estatísticas

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

## 🎨 Exemplo Completo

```javascript
class AvaliacoesSalexpressAPI {
  constructor() {
    this.baseUrl = 'https://api-Salexpress3.fly.dev/api/v1/avaliacoes/Salexpress';
  }
  
  async buscarAvaliacoes(skip = 0, limit = 100) {
    const response = await fetch(`${this.baseUrl}/avaliacoes?skip=${skip}&limit=${limit}`);
    return await response.json();
  }
  
  async buscarEstatisticas() {
    const response = await fetch(`${this.baseUrl}/estatisticas`);
    return await response.json();
  }
}

// Usar
const api = new AvaliacoesSalexpressAPI();

// Carregar tudo
const avaliacoes = await api.buscarAvaliacoes();
const stats = await api.buscarEstatisticas();

console.log(`${stats.total_avaliacoes} avaliações`);
console.log(`Média: ${stats.media_geral}⭐`);
console.log(`NPS: ${stats.nps}`);
```

---

## ✅ Pronto!

Agora você pode:
- ✅ Listar todas as avaliações da Salexpress
- ✅ Ver estatísticas completas
- ✅ Exibir em um dashboard
- ✅ Calcular métricas personalizadas

📚 **Documentação completa:** `COMO_PUXAR_AVALIACOES_Salexpress.md`
