# app/core/config.py

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+mysqlconnector://u580641237_doc:Mito010894!!@193.203.175.123/u580641237_doc"
    r2_endpoint: str
    r2_bucket: str
    r2_access_key: str
    r2_secret_key: str

    class Config:
        env_file = ".env"  # Carrega variáveis de ambiente do arquivo .env

settings = Settings()
