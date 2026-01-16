import json
from PIL import Image, ImageOps
import requests
from io import BytesIO
import base64
def corrigir_rotacao(url):
    # Baixa a imagem
    response = requests.get(url)
    image = Image.open(BytesIO(response.content))

    # Corrige a orientação EXIF
    image = ImageOps.exif_transpose(image)

    # Converte a imagem para bytes no formato base64
    img_byte_arr = BytesIO()
    image.save(img_byte_arr, format='JPEG')
    img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

    return img_base64

def read_to_imagens(arr):
    html_images = '''
    <style>
        .item img {
            width: 100%;
            height: auto;
        }
    </style>
    '''
    for item in arr:
        if item != "Sem imagem":
            url = item['url'].replace('http://Salexpress.com/aplicativorelatorios/', '')
            full_url = f"https://Salexpress.com/aplicativorelatorios/{url}"
            
            # Corrige a rotação da imagem e obtém a imagem em base64
            # img_base64 = corrigir_rotacao(full_url)

            # Adiciona a imagem corrigida ao HTML como base64
            html_images += f'''
                <div class="item">
                    <img src="{full_url}" alt="">
                    <p>{item['desc']}</p>
                </div>
            '''
        else:
            html_images = ""

    return html_images

async def read_to_json_app(name, jsonStr):
    # Configuração dinâmica
    html = """
            <!DOCTYPE html>
            <html lang="pt-BR">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Relatório de Visita</title>
        <style>
        /* Contêiner principal que utiliza display flex */
            .gallery {
                    text-align: center;
                    width: 100%;
                }

                .item {
                    display: inline-block;
                    width: 45%;
                    margin: 10px;
                    text-align: center;
                    vertical-align: top;
                }

                .item img {
                    width: 100%;
                    height: auto;

                }
                @media (max-width: 768px) {
                    .item {
                        width:25%;
                    }
                }

        body {
            font-family: Arial, sans-serif;
            background-color: #fefefe;
            margin: 0;
            padding: 0;
            color: #333;
        }

        .container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            border: 2px solid #cc5500;
            border-radius: 10px;
            background-color: rgba(255, 246, 230, 0.9);
            background-size: 300px;
            /* Ajuste o tamanho da marca d'água */
            background-repeat: no-repeat;
            background-position: center;
            background-attachment: fixed;
        }

        .title {
            text-align: center;
            color: #cc5500;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: bold;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 18px;
            color: #cc5500;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .content {
            padding: 10px;
            border: 1px solid #cc5500;
            border-radius: 5px;
            background-color: #fff;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table th,
        table td {
            border: 1px solid #cc5500;
            padding: 8px;
            text-align: left;
        }

        table th {
            background-color: #ffcc99;
            color: #333;
        }

        .flex-container {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }

        .flex-item {
            flex: 1;
            padding: 10px;
            border: 1px solid #cc5500;
            border-radius: 5px;
            background-color: #fff;
        }

        textarea {
            width: 90%;
            height: 100px;
            border: 1px solid #cc5500;
            border-radius: 5px;
            padding: 10px;
        }

        td img {
            width: 250px;
        }

        .assinatura-container {
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fff;
            padding: 10px 15px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            width: auto;
            /* Ajusta automaticamente à largura do conteúdo */
            max-width: 100%;
            /* Previne que o contêiner exceda o tamanho do pai */
        }

        .selo {
            flex-shrink: 0;
            margin-right: 10px;
        }

        .selo img {
            max-width: 50px;
            height: auto;
            display: block;
        }

        .assinatura-dados {
            line-height: 1.4;
        }

        .assinatura-dados p {
            margin: 0;
            font-size: 14px;
        }

        .assinatura-dados p span {
            font-weight: bold;
        }

    </style>
            </head>

            <body>
             

    """
    data = jsonStr



    html += f'''
        <div class="container">
                    <img src="https://www.globalty.com.br/img/logo2.png" style="width:100px" />
                    <div class="title">Relatório de Visita</div>
                    <div class="section">
                        <div class="section-title">Dados da Visita</div>
                        <div class="content">
                            <p><strong>Data:</strong> {data['Visita Tecnica']['Data']}</p>
                            <p><strong>Objetivo da visita:</strong> {data['Visita Tecnica']['Objetivo da visita']}</p>
                            <p><strong>Empresa:</strong>{data['Visita Tecnica']['Empresa']}</p>
                            <p><strong>Unidade:</strong> {data['Visita Tecnica']['Unidade']}</p>
                            <p><strong>Ramo de atividade:</strong> {data['Visita Tecnica']['Ramo_atividade']}</p>
                            <p><strong>Representantes acionados durante a visita:</strong> {data['Visita Tecnica']['Representantes acionados durante a visita'][0]['nome']}</p>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-title">Realizada por</div>
                        <div class="flex-container">
                            <div class="flex-item">
                                <strong>Nome:</strong> {data['Visita Tecnica']['Realizado por'][0]['nome']}
                            </div>
                            <div class="flex-item">
                                <strong>Formação:</strong> {data['Visita Tecnica']['Realizado por'][0]['formação']}
                            </div>
                            <div class="flex-item">
                                <strong>Ident. Conselho de Classe:</strong> {data['Visita Tecnica']['Realizado por'][0]['Ident. Conselho de Classe']}
                            </div>
                        </div>
                    </div>
                    
            '''
    

    #AVALIAÇÃO ASSUNTOS REGULATÓRIOS
    itenVerificados = data['CONSIDERAÇÕES GERAIS']['itens_verificados']
    itensUpper = []

    for item in itenVerificados:
        if(item == "Reclamação/Devolução/Recall"): item = "RECLAMAÇÃO/ DEVOLUÇÃO/ RECALL"
        if item is not None:  # Verifica se o item não é None
            itensUpper.append(item.upper())

        else:
            itensUpper.append(None)  # Adiciona None para itens inválidos (opcional)
    print(itensUpper)
  


    for chave, valor in  data.items():

        try:
            if chave in itensUpper:
                print(itensUpper)
        
                if chave != 'Visita Tecnica':
                    html += f'''
                        <div class="section">
                            <div class="section-title">{chave}</div>

                        '''
                    
                    for chaveItem, valorItem in  valor.items():

                        
                        if chaveItem != 'OBSERVAÇÕES' and chaveItem != 'observacao':   
                                try:
                                    img_div = read_to_imagens(valorItem['imagens'])
                                    if 'Os registros de treinamento encontram-se disponíveis? Descrever registro de treinamento por amostragem' not in chaveItem:                     
                                        if valorItem['descricao'] != "" or valorItem['disponivel_na'] == 'sim':
                                                desc = valorItem['decricao'] if 'decricao' in valorItem else valorItem['descricao']

                                                # Remover espaços em branco extras e dividir os itens com base no hífen

                                                html += f'''
                                                <div style="border: 1px solid #cc5500; padding: 10px;">
                                                        <h3> {chaveItem} : {valorItem['disponivel_na']}</h3>
                                                        <p style="display: {'none' if desc == "" else 'block'};">Descrição:</p>
                                                        <p style="display: {'none' if desc == "" else 'block'}; margin-left: 5px"> {'' if desc == '' else desc}</p>
                                                        <P style="display: {'none' if img_div == "" else 'block'}" >Fotos: </P>
                                                        <div  class="gallery">
                                                                {img_div}
                                                        </div>      
                                                    </div>
                                                '''
                                    else:
                                        if valorItem['descricao'] != "" and valorItem['disponivel_na'] == 'sim':

                                                desc = valorItem['decricao'] if 'decricao' in valorItem else valorItem['descricao']
                                                # Remover espaços em branco extras e dividir os itens com base no hífen
                                            
                                                html += f'''

                                                <div style="border: 1px solid #cc5500; padding: 10px;">
                                                    <h3> {chaveItem} : {'' if valorItem['descricao'] == "" and valorItem['disponivel_na'] == "não" else valorItem['disponivel_na']}</h3>
                                                    <p>Descrição:</p>
                                                    <p style="display: {'none' if desc == "" else 'block'}">Descrição: {'' if desc == "" else desc} </p>

                                                    <p>Titulo: {valorItem['items'][0]['titulo']} </p><br>
                                                    <p>Data: {valorItem['items'][0]['data']} </p><br>
                                                    <p>Quem Realizou: {valorItem['items'][0]['quem_realizou']} </p><br>
                                                    <p>Onde está arquivado: {valorItem['items'][0]['onde_esta_aquivado']} </p> <br>                                        <P>Fotos: </P>
                                                    <p style="display: {'none' if img_div == "" else 'block'}">Fotos: </p>
                                                    <div class="gallery">
                                                            {img_div}
                                                    </div>      
                                                </div>               
                                                '''
                                except:
                                    try:
                                        for chaveItemSub, valorItemSub in  valorItem.items():
                                                try:
                                                    if valorItemSub['descricao'] != "" and valorItemSub['disponivel_na'] == 'sim':

                                                        desc = valorItemSub['decricao'] if 'decricao' in valorItemSub else valorItemSub['descricao']
                                                        # Remover espaços em branco extras e dividir os itens com base no hífen
                                                        img_divSub = read_to_imagens(valorItemSub['imagens'])
                                                        print('entrou no subitem')

                                                        html += f'''
                                                        <div style="border: 1px solid #cc5500; padding: 10px;">
                                                                <h3> {chaveItem} <br> {chaveItemSub}:  {'' if valorItemSub['descricao'] == "" "" and valorItemSub['disponivel_na'] == "não" else valorItemSub['disponivel_na']}</h3>
                                                                <p style="display: {'none' if desc == "" else 'block'}">Descrição:</p>
                                                                <p style="display: {'none' if desc == "" else 'block'}">{'' if desc == '' else desc} </p>                                   <P>Fotos: </P>
                                                                <p>Fotos: </p>
                                                                <div style="display: {'none' if img_divSub == "" else 'block'}" class="gallery">
                                                                        {img_divSub}
                                                                </div>      
                                                            </div>
                                                                            
                                                        '''                              
                                                except:
                                                    try:
                                                        print('entrou no subitem 2')
                                                        
                                                        for chaveItemSubTwo, valorItemSubTwo in  valorItemSub.items():
                                                            if valorItemSubTwo['descricao'] != "" and valorItemSubTwo['disponivel_na'] == 'sim':
                                                                desc = valorItemSubTwo['decricao'] if 'decricao' in valorItemSubTwo else valorItemSubTwo['descricao']
                                                                # Remover espaços em branco extras e dividir os itens com base no hífen
                                                                
                                                                img_divSub = read_to_imagens(chaveItemSubTwo['imagens'])
                                                                

                                                                html += f'''
                                                                <div style="border: 1px solid #cc5500; padding: 10px;">
                                                                    <h3> {chaveItemSub} <br> {chaveItemSubTwo}:  {'' if valorItemSubTwo['descricao'] == "" and valorItemSubTwo['disponivel_na'] == "não"  else valorItemSubTwo['disponivel_na']}</h3>
                                                                    <p style="display: {'none' if desc == "" else 'block'}">Descrição:</p>
                                                                    <p>{'' if desc == '' else desc} </p>                                  <P>Fotos: </P>
                                                                    <p>Fotos: </p>
                                                                    <div style="display: {'none' if img_divSub == "" else 'block'}" class="gallery">
                                                                            {img_divSub}
                                                                    </div>      
                                                                </div>              
                                                                '''       
                                                    except:
                                                        print('erro no subitem 2')

                                    except:
                                            print('')
                        else:
                            try:
                                img_div = read_to_imagens(valorItem['imagens'])
                                desc = valorItem['decricao'] if 'decricao' in valorItem else valorItem['descricao']
                                # Remover espaços em branco extras e dividir os itens com base no hífen
                            
                                html += f'''
                                <div style="border: 1px solid #cc5500; padding: 10px;">
                                            <h3>Observação:</h3>
                                            <p style="display: {'none' if desc == "" else 'block'}">{'' if desc == '' else desc} </p>                                              
                                            <P style="display: {'none' if img_div == "" else 'block'}">Fotos: </P>
                                            <div class="gallery">
                                                    {img_div}
                                            </div>      
                                        </div>
                        
                            </div>
                            '''
                            except:
                                print('erro aqui')

        except:
            print('erro no for')
            continue
    html += f'''
                    <div class="section">
                        <div class="section-title">Assinatura Digital</div>

                        <div class="assinatura-container">
                            <div class="selo">
                                <img src="https://Salexpress.com/assets/images/fvincon.png" alt="Selo de Verificação">
                            </div>
                            <div class="assinatura-dados">
                                <p><span>Nome:</span> {data['Visita Tecnica']['Realizado por'][0]['nome']} </p>
                                <p><span>Data:</span> {data['Visita Tecnica']['Data']} </p>
                                <p style="font-size: 8px;">Assinado pela Salexpress.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        '''   
 
    #print(html)
   
    return html 