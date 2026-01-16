from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.core.conn import get_db
from app.schemas.password_reset import (
    PasswordResetRequest,
    PasswordResetConfirm,
    PasswordResetResponse,
    PasswordResetSuccess
)
from app.crud.password_reset import (
    criar_token_reset,
    validar_token_reset,
    redefinir_senha
)
from app.services.email_service import set_email

router = APIRouter()

@router.post("/esqueci-senha", response_model=dict)
def solicitar_reset_senha(
    payload: PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Solicita reset de senha e envia email com link temporário
    
    Exemplo:
    ```json
    {
        "email": "usuario@exemplo.com"
    }
    ```
    """
    base_url = str(request.base_url).rstrip('/')
    
    try:
        # Criar token de reset
        reset_data = criar_token_reset(db, payload, base_url)
        
        # Enviar email com link de reset
        assunto = "Salexpress - Redefinir Senha"
        mensagem = gerar_email_reset_html(reset_data)
        
        email_enviado = set_email(
            destinatarios=reset_data['email'],
            assunto=assunto,
            mensagem=mensagem
        )
        
        if not email_enviado:
            raise HTTPException(
                status_code=500,
                detail="Erro ao enviar email. Tente novamente mais tarde."
            )
        
        return {
            "message": "Email de recuperação enviado com sucesso",
            "email": reset_data['email']
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar solicitação: {str(e)}"
        )

@router.get("/redefinir-senha/{token}", response_class=HTMLResponse)
def renderizar_formulario_reset(token: str, db: Session = Depends(get_db)):
    """
    Renderiza o formulário de redefinição de senha
    """
    try:
        # Validar token
        reset = validar_token_reset(db, token)
        
        # Renderizar formulário
        return get_html_form_reset(token, reset.email)
        
    except HTTPException as e:
        return f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Link Inválido - Salexpress</title>
            <style>
                {get_css_styles_reset()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-message">
                    <h1>❌ Link Inválido</h1>
                    <p>{e.detail}</p>
                    <a href="https://Salexpress.com" class="btn-home">Voltar para o site</a>
                </div>
            </div>
        </body>
        </html>
        """

@router.post("/redefinir-senha/{token}", response_model=PasswordResetSuccess)
def confirmar_reset_senha(
    token: str,
    payload: PasswordResetConfirm,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Confirma a redefinição de senha
    
    Exemplo:
    ```json
    {
        "senha": "NovaSenha123",
        "confirmar_senha": "NovaSenha123"
    }
    ```
    """
    # Obter IP do cliente
    ip_address = request.client.host if request.client else None
    
    # Redefinir senha
    resultado = redefinir_senha(db, token, payload.senha, ip_address)
    
    return resultado


def gerar_email_reset_html(reset_data: dict) -> str:
    """Gera o HTML do email de reset de senha"""
    return f'''
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - Salexpress</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
                text-align: center;
            }}
            .logo {{
                max-width: 150px;
                margin-bottom: 20px;
            }}
            h1 {{
                color: #e98344;
                font-size: 28px;
                margin-bottom: 10px;
            }}
            p {{
                color: #333;
                font-size: 16px;
                line-height: 1.6;
                margin: 15px 0;
            }}
            .button {{
                display: inline-block;
                padding: 15px 40px;
                margin: 30px 0;
                color: #fff;
                background-color: #e98344;
                text-decoration: none;
                font-size: 18px;
                font-weight: bold;
                border-radius: 8px;
                transition: background-color 0.3s;
            }}
            .button:hover {{
                background-color: #d4671f;
            }}
            .info-box {{
                background-color: #fff3e0;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #e98344;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 13px;
                color: #888;
                border-top: 1px solid #e0e0e0;
                padding-top: 20px;
            }}
            .security-note {{
                font-size: 12px;
                color: #666;
                margin-top: 15px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://Salexpress.com/aplicativorelatorios/assets/images/logo2%204.png" alt="Salexpress" class="logo">
            
            <h1>🔒 Redefinir Senha</h1>
            
            <p>Olá,</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Salexpress</strong>.</p>
            
            <div class="info-box">
                <p style="margin: 0;"><strong>Email:</strong> {reset_data['email']}</p>
            </div>
            
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            
            <a href="{reset_data['link_completo']}" class="button">Redefinir Minha Senha</a>
            
            <p class="security-note">
                ⚠️ <strong>Importante:</strong> Este link expira em 1 hora e pode ser usado apenas uma vez.
            </p>
            
            <p class="security-note">
                Se você não solicitou a redefinição de senha, ignore este email e sua senha permanecerá inalterada.
            </p>
            
            <div class="footer">
                <p>Salexpress - Plataforma de Gestão Empresarial</p>
                <p style="font-size: 11px; color: #aaa;">
                    Este é um email automático, por favor não responda.
                </p>
            </div>
        </div>
    </body>
    </html>
    '''


def get_css_styles_reset() -> str:
    """Retorna os estilos CSS para o formulário de reset"""
    return """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #e98344 0%, #d4671f 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .email-badge {
            background: #f0f0f0;
            padding: 10px 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            word-break: break-all;
        }
        
        .email-badge strong {
            color: #e98344;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #e98344;
        }
        
        .password-requirements {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .password-strength {
            height: 4px;
            background: #e0e0e0;
            border-radius: 2px;
            margin-top: 10px;
            overflow: hidden;
        }
        
        .password-strength-bar {
            height: 100%;
            width: 0%;
            background: #e98344;
            transition: width 0.3s, background-color 0.3s;
        }
        
        .password-strength-bar.weak {
            width: 33%;
            background: #f44336;
        }
        
        .password-strength-bar.medium {
            width: 66%;
            background: #ff9800;
        }
        
        .password-strength-bar.strong {
            width: 100%;
            background: #4CAF50;
        }
        
        .btn-primary {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            background: #e98344;
            color: white;
            margin-top: 20px;
        }
        
        .btn-primary:hover {
            background: #d4671f;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(233, 131, 68, 0.4);
        }
        
        .btn-primary:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-home {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: #e98344;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s;
        }
        
        .btn-home:hover {
            background: #d4671f;
        }
        
        .success-message, .error-message {
            text-align: center;
            padding: 40px;
        }
        
        .success-message h1 {
            color: #4CAF50;
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .error-message h1 {
            color: #f44336;
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .error-message p, .success-message p {
            color: #666;
            font-size: 16px;
            margin-bottom: 20px;
        }
        
        .alert {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .alert-info {
            background: #e3f2fd;
            color: #1976d2;
            border-left: 4px solid #1976d2;
        }
        
        .alert-danger {
            background: #ffebee;
            color: #c62828;
            border-left: 4px solid #c62828;
        }
        
        .alert-success {
            background: #e8f5e9;
            color: #2e7d32;
            border-left: 4px solid #2e7d32;
        }
    """


def get_html_form_reset(token: str, email: str) -> str:
    """Retorna o HTML completo do formulário de reset de senha"""
    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - Salexpress</title>
        <style>
            {get_css_styles_reset()}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Redefinir Senha</h1>
                <p>Crie uma nova senha para sua conta</p>
            </div>
            
            <div class="email-badge">
                <strong>Email:</strong> {email}
            </div>
            
            <div class="alert alert-info">
                ⚠️ A senha deve ter no mínimo 8 caracteres
            </div>
            
            <form id="resetForm">
                <div class="form-group">
                    <label for="senha">Nova Senha *</label>
                    <input 
                        type="password" 
                        id="senha" 
                        name="senha" 
                        required 
                        minlength="8"
                        placeholder="Digite sua nova senha"
                    >
                    <div class="password-strength">
                        <div id="strengthBar" class="password-strength-bar"></div>
                    </div>
                    <p class="password-requirements">Mínimo 8 caracteres</p>
                </div>
                
                <div class="form-group">
                    <label for="confirmar_senha">Confirmar Senha *</label>
                    <input 
                        type="password" 
                        id="confirmar_senha" 
                        name="confirmar_senha" 
                        required 
                        minlength="8"
                        placeholder="Digite novamente sua senha"
                    >
                </div>
                
                <div id="errorAlert" style="display: none;" class="alert alert-danger"></div>
                
                <button type="submit" class="btn-primary" id="submitBtn">
                    Redefinir Senha
                </button>
            </form>
        </div>
        
        <script>
            const form = document.getElementById('resetForm');
            const senhaInput = document.getElementById('senha');
            const confirmarSenhaInput = document.getElementById('confirmar_senha');
            const strengthBar = document.getElementById('strengthBar');
            const errorAlert = document.getElementById('errorAlert');
            const submitBtn = document.getElementById('submitBtn');
            
            // Verificar força da senha
            senhaInput.addEventListener('input', function() {{
                const senha = this.value;
                const length = senha.length;
                
                if (length === 0) {{
                    strengthBar.className = 'password-strength-bar';
                    strengthBar.style.width = '0%';
                }} else if (length < 8) {{
                    strengthBar.className = 'password-strength-bar weak';
                }} else if (length < 12) {{
                    strengthBar.className = 'password-strength-bar medium';
                }} else {{
                    strengthBar.className = 'password-strength-bar strong';
                }}
            }});
            
            form.addEventListener('submit', async function(e) {{
                e.preventDefault();
                
                const senha = senhaInput.value;
                const confirmarSenha = confirmarSenhaInput.value;
                
                // Validações
                if (senha.length < 8) {{
                    showError('A senha deve ter no mínimo 8 caracteres');
                    return;
                }}
                
                if (senha !== confirmarSenha) {{
                    showError('As senhas não coincidem');
                    return;
                }}
                
                // Desabilitar botão
                submitBtn.disabled = true;
                submitBtn.textContent = 'Processando...';
                errorAlert.style.display = 'none';
                
                try {{
                    const response = await fetch('/api/v1/auth/redefinir-senha/{token}', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json'
                        }},
                        body: JSON.stringify({{
                            senha: senha,
                            confirmar_senha: confirmarSenha
                        }})
                    }});
                    
                    const data = await response.json();
                    
                    if (response.ok) {{
                        // Sucesso!
                        document.querySelector('.container').innerHTML = `
                            <div class="success-message">
                                <h1>✅</h1>
                                <h2>Senha Redefinida!</h2>
                                <p>Sua senha foi alterada com sucesso.</p>
                                <p>Você já pode fazer login com sua nova senha.</p>
                                <a href="https://www.marketplaceSalexpress.com/painel" class="btn-home">Voltar para o site</a>
                            </div>
                        `;
                    }} else {{
                        showError(data.detail || 'Erro ao redefinir senha');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Redefinir Senha';
                    }}
                }} catch (error) {{
                    showError('Erro ao processar solicitação. Tente novamente.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Redefinir Senha';
                }}
            }});
            
            function showError(message) {{
                errorAlert.textContent = message;
                errorAlert.style.display = 'block';
                errorAlert.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
            }}
        </script>
    </body>
    </html>
    """
