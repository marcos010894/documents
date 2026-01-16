import requests
import json

def set_email(destinatarios, assunto, mensagem):
    # URL do serviço de envio de e-mail
    url = "https://Salexpress-email.vercel.app/email"

    # Criando o corpo da requisição em JSON
    data = {
        "email": destinatarios,
        "assunto": assunto,
        "Mensagem": mensagem
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        # Fazendo a requisição POST para a API
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=150)

        # Verificando se a requisição foi bem-sucedida
        if response.status_code == 200:
            print("E-mail enviado com sucesso!")
            return True
        else:
            print(f"Erro ao enviar e-mail. Código de resposta: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"Erro na requisição: {e}")
        return False


def confirmCode(codeVerify, email):
    
        html = '''
                        <!DOCTYPE html>
                        <html lang="pt-BR">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Confirmação de Cadastro - Salexpress</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                    margin: 0;
                                    padding: 0;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    background: #ffffff;
                                    padding: 20px;
                                    border-radius: 10px;
                                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                                    text-align: center;
                                }
                                .logo {
                                    max-width: 150px;
                                    margin-bottom: 20px;
                                }
                                h1 {
                                    color: #ff7300;
                                }
                                p {
                                    color: #333;
                                    font-size: 16px;
                                    line-height: 1.5;
                                }
                                .button {
                                    display: inline-block;
                                    padding: 12px 25px;
                                    margin: 20px 0;
                                    color: #fff;
                                    background-color: #ff7300;
                                    text-decoration: none;
                                    font-size: 18px;
                                    border-radius: 5px;
                                }
                                .footer {
                                    margin-top: 20px;
                                    font-size: 14px;
                                    color: #888;
                                }
                            </style>
                        </head>
                        <body>
                          

            '''
        html += f'''
            <div class="container">
                    <img src="https://Salexpress.com/aplicativorelatorios/assets/images/logo2%204.png" alt="Salexpress" class="logo">
                    <h1>Confirme seu e-mail</h1>
                    <p>Olá</p>
                    <p>Obrigado por se cadastrar na <strong>Salexpress</strong>. Para prosseguir com seu cadastro, insira o codigo a baixo na plataforma.</p>
                    <p class="button">{codeVerify}</p>
                    <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
                    <p class="footer">© 2025 Salexpress. Todos os direitos reservados.</p>
                </div>
            </body>
            </html>'''

        # Teste de envio de e-mail
        set_email(
            destinatarios=[email],
            assunto="Validação de email - Sistema Salexpress",
            mensagem=html
        )


def send_active_freelancer_email(email, company_name):
    html = f'''
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Nova Conexão - Salexpress</title>
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
                                padding: 20px;
                                border-radius: 10px;
                                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                                text-align: center;
                            }}
                            .logo {{
                                max-width: 150px;
                                margin-bottom: 20px;
                            }}
                            h1 {{
                                color: #ff7300;
                            }}
                            p {{
                                color: #333;
                                font-size: 16px;
                                line-height: 1.5;
                            }}
                            .button {{
                                display: inline-block;
                                padding: 12px 25px;
                                margin: 20px 0;
                                color: #fff;
                                background-color: #ff7300;
                                text-decoration: none;
                                font-size: 18px;
                                border-radius: 5px;
                            }}
                            .footer {{
                                margin-top: 20px;
                                font-size: 14px;
                                color: #888;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <img src="https://Salexpress.com/aplicativorelatorios/assets/images/logo2%204.png" alt="Salexpress" class="logo">
                            <h1>Você foi adicionado a um projeto!</h1>
                            <p>Olá,</p>
                            <p>A empresa <strong>{company_name}</strong> adicionou você como freelancer em um projeto.</p>
                            <p>Acesse a plataforma para visualizar e selecionar o ambiente de trabalho.</p>
                            <a href="https://Salexpress.com" class="button">Acessar Plataforma</a>
                            <p class="footer">© 2025 Salexpress. Todos os direitos reservados.</p>
                        </div>
                    </body>
                    </html>'''

    return set_email(
        destinatarios=[email],
        assunto=f"Novo Vínculo - {company_name}",
        mensagem=html
    )
