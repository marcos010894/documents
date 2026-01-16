# Cloudflare R2 Storage - Configuração

Adicione as seguintes variáveis ao seu arquivo `.env` na raiz do projeto:

```
R2_ENDPOINT=https://6d3e10284be29ce7a44f10d4dc047ad4.r2.cloudflarestorage.com
R2_BUCKET=ged
R2_ACCESS_KEY=77a2210f3311c69b54b2663a3dfe9b4b
R2_SECRET_KEY=8c5968c864386322f9afc7f5b6c99ef6e3c91a078c0987a9fd4db1c033fce22d
```

**Como usar:**

1. Reinicie o backend após alterar o .env.
2. Para upload, use o endpoint POST `/api/v1/nodes/` com multipart (file, name, type, ...).
3. Para deletar, use DELETE `/api/v1/storage/delete` com JSON `{ "key": "nome_do_arquivo_no_bucket.ext" }`.
4. Para listar arquivos, use GET `/api/v1/nodes`.

**Testar via terminal:**
```sh
aws --endpoint-url https://6d3e10284be29ce7a44f10d4dc047ad4.r2.cloudflarestorage.com s3 ls s3://ged
```

**Observações:**
- O campo `file` só é obrigatório para uploads de arquivos (type=file).
- Para criar pastas, envie apenas os campos de metadados (type=folder).
- O token “Token value” é para API REST da Cloudflare, não para boto3/S3.
- Use sempre o Access Key ID e Secret Access Key para boto3, awscli, ou backend Python.
### Explicação dos Diretórios e Arquivos

* **app/main.py** : Arquivo principal que inicia o servidor FastAPI. Você pode configurar rotas e incluir configurações globais aqui.
* **app/api/** : Contém as rotas/endpoints organizadas por versões da API (ex: `v1` e `v2`). Isso permite que você atualize a API de forma controlada.
* **app/core/** : Contém configurações e funcionalidades centrais do projeto, como configurações globais, logging, e exceções personalizadas.
* **app/models/** : Definição dos modelos de dados, como classes de ORM (ex: SQLAlchemy).
* **app/schemas/** : Definições dos esquemas de entrada e saída utilizando Pydantic. Aqui você define os dados que a API espera ou retorna.
* **app/crud/** : Funções CRUD que lidam com a lógica de interação com o banco de dados.
* **app/services/** : Funções e classes relacionadas à lógica de negócios, como integração com APIs externas, serviços de pagamento, e outros.
* **app/tests/** : Testes automatizados que garantem que sua API esteja funcionando corretamente. Utilize ferramentas como `pytest` para escrever e rodar os testes.
* **app/utils/** : Funções auxiliares, como formatação de datas, manipulação de strings, etc.
* **alembic/** : Diretório para migrações de banco de dados (se estiver usando SQLAlchemy).
* **.env** : Arquivo para armazenar variáveis de ambiente (ex: credenciais de banco de dados, chaves de API).
* **requirements.txt** : Lista de dependências do projeto.
* **Dockerfile** e  **docker-compose.yml** : Arquivos para configuração de containers Docker, caso você queira usar containers para rodar a aplicação de forma isolada.
* **README.md** : Documentação do projeto, onde você explica como configurar, rodar e utilizar a API.

### Comandos ALAMBIC

<pre class="!overflow-visible" data-start="218" data-end="311"><div class="contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative bg-token-sidebar-surface-primary dark:bg-gray-950"><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre language-sh"><span>alembic revision --autogenerate -m "Adicionando created_at à tabela email_validade"
</span></code></div></div></pre>

Isso criará um arquivo na pasta **migrations/versions/** contendo o código para atualizar a tabela.alembic upgrade head

<pre class="!overflow-visible" data-start="1180" data-end="1210"><div class="contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative bg-token-sidebar-surface-primary dark:bg-gray-950"><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre language-sh"><span>alembic upgrade head
</span></code></div></div></pre>

Isso atualizará a tabela  **expecifica**, adicionando a nova coluna `created_at` sem perder os dados existentes.

### Endpoint: `/subscriptions/status`

Retorna o status da assinatura no Stripe de um usuário e inclui também a
próxima data de pagamento e o valor da assinatura. Exemplo de resposta:

```json
[
  {
    "id_stripe": "sub_123",
    "status": "active",
    "proximo_pagamento": "2024-07-01T00:00:00",
    "valor": "R$ 99,90"
  }
]
```

### Endpoint: `/subscribers/info`

Retorna informações resumidas das assinaturas. O retorno agora inclui o
`status` obtido diretamente do Stripe.

```json
[
  {
    "nome": "Fulano",
    "proximo_pagamento": "2024-07-01T00:00:00",
    "ativo": true,
    "id_stripe": "sub_123",
    "status": "canceled"
  }
]
```

### Endpoint: `/subscription/cancel/{subscription_id}`

Cancela a assinatura no Stripe e remove o registro da tabela de inscrições.
Retorno esperado em caso de sucesso:

```json
{
  "ok": true
}
```
