"""
Script de teste para verificar o compartilhamento recursivo

Este script testa:
1. Busca de usuários por email
2. Compartilhamento recursivo de pastas
3. Listagem de compartilhamentos
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_get_user_by_email():
    """Testa a busca de usuário por email"""
    print("🧪 Testando busca de usuário por email...")
    
    # Substitua por um email real do seu banco
    email = "teste@exemplo.com"
    
    response = requests.get(f"{BASE_URL}/api/v1/user-business-links/search/by-email/{email}")
    
    if response.status_code == 200:
        user_info = response.json()
        print(f"✅ Usuário encontrado:")
        print(f"   ID: {user_info['user_id']}")
        print(f"   Tipo: {user_info['type_user']}")
        print(f"   Nome: {user_info['user_data'].get('nome', 'N/A')}")
        return user_info
    else:
        print(f"❌ Erro ao buscar usuário: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def test_folder_structure(folder_id):
    """Testa a estrutura de uma pasta"""
    print(f"\n🧪 Testando estrutura da pasta ID {folder_id}...")
    
    response = requests.get(f"{BASE_URL}/api/v1/shares/debug/folder-structure/{folder_id}")
    
    if response.status_code == 200:
        structure = response.json()
        print(f"✅ Pasta '{structure['folder']['name']}' tem {structure['total_children']} itens:")
        
        for item in structure['children']:
            icon = "📁" if item['type'] == "folder" else "📄"
            print(f"   {icon} {item['name']} (ID: {item['id']}, Pai: {item['parent_id']})")
        
        return structure
    else:
        print(f"❌ Erro ao buscar estrutura: {response.status_code}")
        return None

def test_share_folder(folder_id, sender_email, receiver_email):
    """Testa compartilhamento de pasta"""
    print(f"\n🧪 Testando compartilhamento da pasta ID {folder_id}...")
    
    share_data = {
        "node_id": folder_id,
        "shared_with_email": receiver_email,
        "shared_by_email": sender_email
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/shares/", json=share_data)
    
    if response.status_code == 200:
        share = response.json()
        print(f"✅ Compartilhamento criado com sucesso!")
        print(f"   Share ID: {share['id']}")
        return share
    else:
        print(f"❌ Erro ao compartilhar: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def test_debug_shares(node_id):
    """Testa debug de compartilhamentos"""
    print(f"\n🧪 Verificando compartilhamentos do nó ID {node_id}...")
    
    response = requests.get(f"{BASE_URL}/api/v1/shares/debug/shares/{node_id}")
    
    if response.status_code == 200:
        debug_info = response.json()
        print(f"✅ Encontrados {debug_info['total_shares']} compartilhamentos:")
        
        for share in debug_info['shares']:
            print(f"   🔗 Share ID {share['share_id']}: User {share['shared_by_user_id']} → User {share['shared_with_user_id']}")
        
        return debug_info
    else:
        print(f"❌ Erro ao buscar debug: {response.status_code}")
        return None

if __name__ == "__main__":
    print("🚀 Iniciando testes de compartilhamento recursivo\n")
    
    # Configurações de teste - ALTERE CONFORME SEUS DADOS
    FOLDER_ID = 3  # ID da pasta que você quer testar
    SENDER_EMAIL = "usuario1@exemplo.com"  # Email de quem compartilha
    RECEIVER_EMAIL = "usuario2@exemplo.com"  # Email de quem recebe
    
    # Teste 1: Verificar usuários
    sender_info = test_get_user_by_email()
    
    # Teste 2: Verificar estrutura da pasta
    structure = test_folder_structure(FOLDER_ID)
    
    # Teste 3: Compartilhar pasta
    if sender_info and structure:
        share = test_share_folder(FOLDER_ID, SENDER_EMAIL, RECEIVER_EMAIL)
        
        # Teste 4: Verificar compartilhamentos criados
        if share:
            test_debug_shares(FOLDER_ID)
            
            # Verificar compartilhamentos dos filhos também
            for child in structure['children']:
                test_debug_shares(child['id'])
    
    print("\n🏁 Testes finalizados!")
