from fastapi import FastAPI
from app.api.v1.v1 import router as v1_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Adicionando o middleware CORS
# Adicionando o middleware CORS
# allow_origins=["*"] com allow_credentials=True é inválido para CORS estrito.
# Usamos regex para permitir localhost (qualque porta) e origens específicas.
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],  # REMOVIDO pois quebra com credentials=True
    allow_origin_regex="https?://.*", # Permite HTTP e HTTPS de qualquer lugar (dev mode)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos HTTP
    allow_headers=["*"],  # Permite todos os cabeçalhos
)


# Incluindo as rotas da API versão 1
app.include_router(v1_router, prefix="/api/v1")
