from fastapi import APIRouter, Depends
from app.schemas.chatbot import ChatBot
from app.core.db import SessionLocal
from app.crud.chatbot import chat_conversation, atendimento_virtual
from sqlalchemy.orm import Session



router = APIRouter()

# Dependência para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/conversation")
def conversations(prompt: ChatBot):
     try:
        return atendimento_virtual(prompt)
     except:
        raise 
