# Documents Platform - GED System

Sistema de Gestão Eletrônica de Documentos (GED) com backend FastAPI e frontend React + TypeScript.

## 📁 Estrutura do Projeto

```
documents_plataforma_interna/
├── api_salexpress/     # Backend FastAPI
└── documentos/         # Frontend React
```

## 🚀 Deploy no Fly.io

### Backend (FastAPI)

```bash
cd api_salexpress
fly deploy
```

### Frontend (React)

```bash
cd documentos
fly deploy
```

## 🔧 Configuração Local

### Backend

1. Copie o `.env.example` para `.env` e configure as variáveis:
```bash
cd api_salexpress
cp .env.example .env
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Execute o servidor:
```bash
uvicorn app.main:app --reload
```

### Frontend

1. Copie o `.env.example` para `.env`:
```bash
cd documentos
cp .env.example .env
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

## 📝 Variáveis de Ambiente

### Backend (.env)
- `DATABASE_URL`: URL de conexão MySQL
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe
- `R2_ENDPOINT`: Endpoint do Cloudflare R2
- `R2_ACCESS_KEY`: Chave de acesso R2
- `R2_SECRET_KEY`: Chave secreta R2
- `OPENAI_API_KEY`: Chave da OpenAI (opcional)

### Frontend (.env)
- `VITE_API_URL`: URL da API backend

## 🔐 Segurança

- **Nunca** commite arquivos `.env` com credenciais reais
- Use `.env.example` como template
- Configure secrets no Fly.io para produção

## 📦 Tecnologias

**Backend:**
- FastAPI
- SQLAlchemy
- MySQL
- Cloudflare R2
- Stripe

**Frontend:**
- React
- TypeScript
- Tailwind CSS
- Vite
