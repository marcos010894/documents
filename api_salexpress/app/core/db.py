# app/core/db.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Criando o engine de conexão com o banco de dados
# Configurações otimizadas para MySQL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,           # Verifica conexão antes de usar
    pool_recycle=3600,             # Recicla conexões a cada 1 hora
    pool_size=5,                   # Máximo de 5 conexões no pool
    max_overflow=10,               # Máximo de 10 conexões extras
    connect_args={
        "connect_timeout": 10,     # Timeout de 10 segundos para conectar
    }
)

# Criando uma fábrica de sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base do SQLAlchemy, que será usada para criar as tabelas
Base = declarative_base()
