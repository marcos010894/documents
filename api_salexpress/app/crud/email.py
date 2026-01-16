from sqlalchemy.orm import Session
from app.models.email import EmailsValidade
from datetime import datetime


def create_item_code(email: str, codeVerify: str, db: Session):
    try:
        # Tenta encontrar o código já existente para o email
        existing_code = db.query(EmailsValidade).filter(EmailsValidade.email == email).first()

        if existing_code:
            # Se o código já existe, atualiza o código de verificação e a data
            existing_code.codeVerify = codeVerify
            existing_code.created_at = datetime.utcnow()  # Atualiza a data de criação
            db.commit()  # Salva a atualização no banco de dados
            db.refresh(existing_code)  # Atualiza o objeto com as novas informações
            return {"message": "Código atualizado com sucesso", "email": email}
        
        
        # Se o código não existir, cria um novo registro
        new_code = EmailsValidade(email=email, codeVerify=codeVerify, created_at=datetime.utcnow())
        db.add(new_code)
        db.commit()
        return {"message": "Novo código gerado", "email": email}
    except Exception as e:
        db.rollback()
        raise Exception(f"Erro ao gerar código: {e}")

def verify_code_valid(email: str, codeVerify: str, db: Session):
    # Verifica se o email existe
    existing_mail = db.query(EmailsValidade).filter(EmailsValidade.email == email).first()

    if existing_mail:
        print(existing_mail.codeVerify)
        # Verifica se o código de verificação para o email é válido
        if existing_mail.codeVerify == codeVerify:
            return {"correct": True}
        else:
            return {"correct": False, "message": "Código de verificação inválido"}
    else:
        return {"correct": False, "message": "Email não encontrado"}
