"""
Script de teste para os endpoints de documentos com permissões

Este script testa:
1. Busca de documentos por empresa e status
2. Busca de documentos por status (todas as empresas)
3. Busca de documentos com informações de permissões
"""

import requests
import json
from urllib.parse import quote

BASE_URL = "http://127.0.0.1:8000"

def test_documents_by_business_status():
    """Testa busca de documentos por empresa e status"""
    print("🧪 Testando busca de documentos por empresa e status...")
    
    # Parâmetros de teste - ALTERE CONFORME SEUS DADOS
    user_email = "l34421574@gmail.com"
    business_email = "empresa@exemplo.com" 
    status = "Válido"
    
    url = f"{BASE_URL}/api/v1/nodes/documents/by-business-status"
    params = {
        "user_email": user_email,
        "business_email": business_email,
        "status": status
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        documents = response.json()
        print(f"✅ Encontrados {len(documents)} documentos da empresa com status '{status}':")
        
        for doc in documents[:5]:  # Mostra apenas os primeiros 5
            print(f"   📄 {doc['name']} (ID: {doc['id']}) - Status: {doc['status']}")
            
        return documents
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def test_documents_by_status_all():
    """Testa busca de documentos por status (todas as empresas)"""
    print(f"\n🧪 Testando busca de documentos por status (todas as empresas)...")
    
    user_email = "l34421574@gmail.com"
    status = "Válido"
    
    url = f"{BASE_URL}/api/v1/nodes/documents/by-status"
    params = {
        "user_email": user_email,
        "status": status
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        documents = response.json()
        print(f"✅ Encontrados {len(documents)} documentos em todas as empresas com status '{status}':")
        
        # Agrupa por empresa
        by_business = {}
        for doc in documents:
            business_id = doc['business_id']
            if business_id not in by_business:
                by_business[business_id] = []
            by_business[business_id].append(doc)
        
        for business_id, docs in by_business.items():
            print(f"   🏢 Empresa ID {business_id}: {len(docs)} documentos")
            
        return documents
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def test_documents_with_permissions():
    """Testa busca de documentos com informações de permissões"""
    print(f"\n🧪 Testando busca de documentos com informações de permissões...")
    
    user_email = "l34421574@gmail.com"
    status = "Válido"
    
    url = f"{BASE_URL}/api/v1/nodes/documents/with-permissions"
    params = {
        "user_email": user_email,
        "status": status
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Usuário: {result['user_email']}")
        print(f"   Status filtrado: {result['status_filter']}")
        print(f"   Total de documentos: {result['total_documents']}")
        print(f"   Permissões em {len(result['user_permissions'])} empresas:")
        
        for perm in result['user_permissions']:
            print(f"      🔑 Empresa ID {perm['business_id']}: {perm['permission_level']} ({perm['permission_description']})")
        
        print(f"   📄 Documentos acessíveis:")
        for doc in result['documents'][:5]:  # Mostra apenas os primeiros 5
            print(f"      - {doc['name']} (Empresa ID: {doc['business_id']})")
            
        return result
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def test_user_permissions():
    """Testa busca de permissões do usuário"""
    print(f"\n🧪 Testando busca de permissões do usuário...")
    
    user_email = "l34421574@gmail.com"
    
    url = f"{BASE_URL}/api/v1/permissions/user/{quote(user_email)}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        permissions = response.json()
        print(f"✅ Usuário {permissions['user_data']['nome']} ({permissions['type_user']}):")
        print(f"   Tem permissões em {len(permissions['permissions'])} empresas:")
        
        for perm in permissions['permissions']:
            business_data = perm.get('business_data', {})
            business_name = business_data.get('nome', business_data.get('razao_social', f"ID {perm['business_id']}"))
            print(f"      🏢 {business_name}: {perm['permission_level']}")
            print(f"         {perm['permission_description']}")
            
        return permissions
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

if __name__ == "__main__":
    print("🚀 Iniciando testes de documentos com permissões\n")
    
    # Teste 1: Verificar permissões do usuário
    permissions = test_user_permissions()
    
    # Teste 2: Buscar documentos por status (todas as empresas)
    all_docs = test_documents_by_status_all()
    
    # Teste 3: Buscar documentos com informações completas de permissões
    docs_with_perms = test_documents_with_permissions()
    
    # Teste 4: Buscar documentos de empresa específica (se há permissões)
    if permissions and len(permissions['permissions']) > 0:
        # Pega a primeira empresa que o usuário tem permissão
        first_business = permissions['permissions'][0]
        business_email = first_business['business_data'].get('email')
        
        if business_email:
            print(f"\n🧪 Testando busca específica na empresa {business_email}...")
            business_docs = test_documents_by_business_status()
    
    print("\n🏁 Testes finalizados!")
    
    # Resumo
    if all_docs:
        print(f"\n📊 Resumo:")
        print(f"   - Total de documentos acessíveis: {len(all_docs)}")
        
        if permissions:
            print(f"   - Permissões em {len(permissions['permissions'])} empresas")
            
        # Estatísticas por status
        status_count = {}
        for doc in all_docs:
            status = doc.get('status', 'Sem status')
            status_count[status] = status_count.get(status, 0) + 1
        
        print(f"   - Documentos por status:")
        for status, count in status_count.items():
            print(f"     • {status}: {count} documentos")
