from fastapi import APIRouter, Depends
from app.schemas.reportsJson import ReportGenerate 
from app.crud.chatbot import chat_conversation, atendimento_virtual
from sqlalchemy.orm import Session
from app.utils.read_to_json import *
from fastapi.responses import HTMLResponse


router = APIRouter()

@router.post("/generateReport")
async def baixar_pdf(report: ReportGenerate):
    # Gerar o HTML do relatório
    reponseFunction = await read_to_json_app(report.name, report.json_data)
    
    # Retornar o HTML diretamente como resposta
    return HTMLResponse(content=reponseFunction)