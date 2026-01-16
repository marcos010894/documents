from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from app.core.config import settings
from app.models import Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Defina o target_metadata com Base.metadata
target_metadata = Base.metadata

# Função para obter a URL do banco de dados
def get_url():
    return settings.DATABASE_URL

# Define a URL do banco de dados
url = get_url()

def run_migrations_offline() -> None:
    """Executa migrações em modo offline.

    Isso configura o contexto apenas com uma URL
    e não com um Engine, embora um Engine também seja aceitável
    aqui. Ao pular a criação do Engine,
    nem precisamos de um DBAPI disponível.
    """
    context.configure(
        url=url,  # Usa a URL do banco de dados configurada
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Executa migrações em modo online.

    Aqui precisamos criar um Engine e associar
    uma conexão com o contexto.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

# Determina se o Alembic deve rodar em modo offline ou online
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
