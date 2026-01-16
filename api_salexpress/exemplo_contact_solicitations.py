"""
Exemplo de uso da API de Solicitações de Contato - Salexpress
Demonstra todas as funcionalidades disponíveis

Autor: Salexpress
Data: 25/11/2025
"""

import requests
import json
from typing import Dict, List, Optional

# Configurações
BASE_URL = "https://api-Salexpress3.fly.dev/api/v1/contactsSolicitations"

class ContactSolicitationAPI:
    """Cliente para interação com a API de Solicitações de Contato"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
    
    def criar_solicitacao(self, nome: str, email: str, telefone: str, 
                         id_busness: int, type_user: str) -> Dict:
        """
        Cria uma nova solicitação de contato
        
        Args:
            nome: Nome do solicitante
            email: Email do solicitante
            telefone: Telefone do solicitante
            id_busness: ID do negócio/usuário que receberá a solicitação
            type_user: Tipo do destinatário (pf, pj, freelancer)
        
        Returns:
            Dados da solicitação criada
        """
        payload = {
            "nome": nome,
            "email": email,
            "telefone": telefone,
            "termos_aceitos": True,
            "id_busness": id_busness,
            "type_user": type_user
        }
        
        response = requests.post(f"{self.base_url}/", json=payload)
        response.raise_for_status()
        return response.json()
    
    def buscar_minhas_solicitacoes(self, email_logado: str, 
                                   skip: int = 0, limit: int = 10) -> Dict:
        """
        Busca todas as solicitações recebidas por um usuário
        
        Args:
            email_logado: Email do usuário logado
            skip: Quantidade de registros a pular
            limit: Quantidade de registros por página
        
        Returns:
            Dict com data, total e totalPages
        """
        params = {
            "email": email_logado,
            "skip": skip,
            "limit": limit
        }
        
        response = requests.get(
            f"{self.base_url}/my-solicitations/", 
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def buscar_por_id(self, contact_id: int) -> Dict:
        """
        Busca uma solicitação específica por ID
        
        Args:
            contact_id: ID da solicitação
        
        Returns:
            Dados da solicitação
        """
        response = requests.get(f"{self.base_url}/{contact_id}")
        response.raise_for_status()
        return response.json()
    
    def atualizar_status(self, contact_id: int, email_owner: str, 
                        novo_status: str) -> Dict:
        """
        Atualiza o status de uma solicitação
        Apenas o proprietário (quem recebeu) pode atualizar
        
        Args:
            contact_id: ID da solicitação
            email_owner: Email do proprietário
            novo_status: Novo status (Pendente, Aguardando avaliação, 
                        Avaliado, Solicitação não feita)
        
        Returns:
            Dados da solicitação atualizada
        """
        STATUS_VALIDOS = [
            "Pendente",
            "Aguardando avaliação",
            "Avaliado",
            "Solicitação não feita"
        ]
        
        if novo_status not in STATUS_VALIDOS:
            raise ValueError(f"Status deve ser um de: {', '.join(STATUS_VALIDOS)}")
        
        payload = {"status": novo_status}
        params = {"email": email_owner}
        
        response = requests.patch(
            f"{self.base_url}/{contact_id}/status",
            json=payload,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def listar_todas(self, skip: int = 0, limit: int = 10) -> Dict:
        """
        Lista todas as solicitações (uso administrativo)
        
        Args:
            skip: Quantidade de registros a pular
            limit: Quantidade de registros por página
        
        Returns:
            Dict com data, total e totalPages
        """
        params = {"skip": skip, "limit": limit}
        response = requests.get(f"{self.base_url}/", params=params)
        response.raise_for_status()
        return response.json()


def exemplo_uso_completo():
    """Demonstra o uso completo da API"""
    
    api = ContactSolicitationAPI()
    
    print("=" * 70)
    print("🧪 Exemplo de Uso - API de Solicitações de Contato")
    print("=" * 70)
    print()
    
    # ========================================
    # 1. Criar Solicitação
    # ========================================
    print("📝 1. Criando nova solicitação...")
    try:
        nova_solicitacao = api.criar_solicitacao(
            nome="MARCOS PAULO MACHADO AZEVEDO",
            email="marcosmachadodev@gmail.com",
            telefone="27999227060",
            id_busness=44,
            type_user="Freelancer"
        )
        
        contact_id = nova_solicitacao['id']
        print(f"✓ Solicitação criada com ID: {contact_id}")
        print(f"  Status inicial: {nova_solicitacao['status']}")
        print()
    except Exception as e:
        print(f"✗ Erro ao criar solicitação: {e}")
        return
    
    # ========================================
    # 2. Buscar Solicitações do Usuário
    # ========================================
    print("📥 2. Buscando solicitações do usuário...")
    try:
        email_dono = "empresario@example.com"
        minhas_solicitacoes = api.buscar_minhas_solicitacoes(
            email_logado=email_dono,
            skip=0,
            limit=10
        )
        
        print(f"✓ Encontradas {minhas_solicitacoes['total']} solicitações")
        print(f"  Total de páginas: {minhas_solicitacoes['totalPages']}")
        
        if minhas_solicitacoes['data']:
            print("  Últimas solicitações:")
            for sol in minhas_solicitacoes['data'][:3]:
                print(f"    - ID {sol['id']}: {sol['nome']} ({sol['status']})")
        print()
    except Exception as e:
        print(f"✗ Erro ao buscar solicitações: {e}")
    
    # ========================================
    # 3. Buscar por ID
    # ========================================
    print(f"🔍 3. Buscando solicitação ID {contact_id}...")
    try:
        solicitacao = api.buscar_por_id(contact_id)
        print(f"✓ Solicitação encontrada")
        print(f"  Nome: {solicitacao['nome']}")
        print(f"  Email: {solicitacao['email']}")
        print(f"  Status: {solicitacao['status']}")
        print()
    except Exception as e:
        print(f"✗ Erro ao buscar solicitação: {e}")
    
    # ========================================
    # 4. Atualizar Status
    # ========================================
    print("✏️  4. Atualizando status da solicitação...")
    try:
        # Use o email correto do dono do negócio (id_busness=44, type_user=Freelancer)
        email_dono = "dono@example.com"
        
        solicitacao_atualizada = api.atualizar_status(
            contact_id=contact_id,
            email_owner=email_dono,
            novo_status="Aguardando avaliação"
        )
        
        print(f"✓ Status atualizado")
        print(f"  Status anterior: Pendente")
        print(f"  Novo status: {solicitacao_atualizada['status']}")
        print()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            print("✗ Sem permissão para atualizar (email incorreto)")
        else:
            print(f"✗ Erro ao atualizar: {e}")
        print()
    except Exception as e:
        print(f"✗ Erro: {e}")
        print()
    
    # ========================================
    # 5. Testar Validação de Status
    # ========================================
    print("❌ 5. Testando validação de status inválido...")
    try:
        api.atualizar_status(
            contact_id=contact_id,
            email_owner=email_dono,
            novo_status="Status Inválido"
        )
        print("✗ Deveria ter rejeitado o status inválido")
    except ValueError as e:
        print(f"✓ Validação funcionando corretamente: {e}")
    except Exception as e:
        print(f"⚠️  Erro inesperado: {e}")
    print()
    
    # ========================================
    # 6. Listar Todas (Admin)
    # ========================================
    print("📋 6. Listando todas as solicitações...")
    try:
        todas = api.listar_todas(skip=0, limit=5)
        print(f"✓ Total de {todas['total']} solicitações no sistema")
        print(f"  Páginas: {todas['totalPages']}")
        print()
    except Exception as e:
        print(f"✗ Erro ao listar: {e}")
        print()
    
    # ========================================
    # Resumo
    # ========================================
    print("=" * 70)
    print("✅ Exemplo completo executado!")
    print("=" * 70)
    print()
    print("📊 Status Disponíveis:")
    print("   1. Pendente - aguardando a resposta do cliente")
    print("   2. Aguardando avaliação - o contato com o cliente foi realizado")
    print("   3. Avaliado - o cliente avaliou o serviço")
    print("   4. Solicitação não feita - o cliente não solicitou o serviço")
    print()
    print("📚 Veja a documentação completa em: README_SOLICITACOES_CONTATO.md")
    print()


def exemplo_frontend():
    """Exemplo de como usar no frontend (JavaScript equivalente)"""
    
    print("\n" + "=" * 70)
    print("🎨 Exemplo de Integração Frontend (JavaScript)")
    print("=" * 70)
    print("""
// Classe para gerenciar solicitações
class ContactSolicitationManager {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || 'https://api-Salexpress3.fly.dev/api/v1/contactsSolicitations';
    }
    
    // Buscar solicitações do usuário logado
    async buscarMinhasSolicitacoes(emailLogado, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const url = `${this.baseUrl}/my-solicitations/?email=${emailLogado}&skip=${skip}&limit=${limit}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao buscar solicitações');
        
        return await response.json();
    }
    
    // Atualizar status
    async atualizarStatus(contactId, emailLogado, novoStatus) {
        const url = `${this.baseUrl}/${contactId}/status?email=${emailLogado}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao atualizar status');
        }
        
        return await response.json();
    }
}

// Uso no frontend
const manager = new ContactSolicitationManager();
const emailUsuario = localStorage.getItem('userEmail');

// Carregar solicitações ao abrir a página
async function carregarSolicitacoes() {
    try {
        const resultado = await manager.buscarMinhasSolicitacoes(emailUsuario);
        exibirSolicitacoes(resultado.data);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar solicitações');
    }
}

// Atualizar status quando usuário clicar
async function handleAtualizarStatus(contactId, novoStatus) {
    try {
        await manager.atualizarStatus(contactId, emailUsuario, novoStatus);
        alert('Status atualizado com sucesso!');
        carregarSolicitacoes(); // Recarregar lista
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}
    """)
    print()


if __name__ == "__main__":
    # Executar exemplo completo
    exemplo_uso_completo()
    
    # Mostrar exemplo de integração frontend
    exemplo_frontend()
    
    print("\n" + "=" * 70)
    print("💡 Dicas:")
    print("   - Sempre use o email do usuário logado nas requisições")
    print("   - Status são case-sensitive (use exatamente como documentado)")
    print("   - Apenas o proprietário pode atualizar o status")
    print("   - Sistema envia email automaticamente ao criar solicitação")
    print("=" * 70)
