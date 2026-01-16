const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Normalizar tipo de usuário
function normalizeTipoUsuario(tipo: string): 'pf' | 'pj' | 'freelancer' {
  const tipoLower = tipo.toLowerCase().trim();
  
  if (tipoLower === 'pf' || tipoLower === 'pessoa física' || tipoLower === 'pessoa fisica') {
    return 'pf';
  }
  if (tipoLower === 'pj' || tipoLower === 'pessoa jurídica' || tipoLower === 'pessoa juridica') {
    return 'pj';
  }
  if (tipoLower === 'freelancer' || tipoLower === 'free lancer') {
    return 'freelancer';
  }
  
  return 'freelancer';
}

// Obter dados da empresa do localStorage
function getCompanyInfo() {
  const userInfoStr = localStorage.getItem('infosUserLogin');
  
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      const business_id = userInfo.user?.id;
      const business_type_raw = userInfo.tipo;
      
      // Também tentar pegar de selectedCompany (caso seja freelancer)
      const company_id = localStorage.getItem('selectedCompanyId');
      const company_type = localStorage.getItem('selectedCompanyType');
      
      if (business_id && business_type_raw) {
        const business_type = normalizeTipoUsuario(business_type_raw);
        
        return {
          business_id: company_id ? parseInt(company_id) : business_id,
          business_type: company_type ? normalizeTipoUsuario(company_type) : business_type
        };
      }
    } catch (error) {
      console.error('Erro ao parsear localStorage:', error);
    }
  }
  
  return {
    business_id: 1,
    business_type: 'pj' as const
  };
}

export interface UserBusinessLink {
  id: number;
  user_id: number;
  type_user: 'pf' | 'pj' | 'freelancer';
  email: string;
  nome: string;
  business_id: number;
  business_type: 'pf' | 'pj' | 'freelancer';
  permissions?: {
    manage_files?: boolean;
    view_metrics?: boolean;
    view_only?: boolean;
    manage_collaborators?: boolean;
    view_shared?: boolean;
  };
  status: number; // 1 = ativo, 0 = inativo
  created_at: string;
}

export interface AddUserRequest {
  email: string;
  business_id: number;
  business_type: string;
  status?: number;
  permissions?: {
    manage_files?: boolean;
    view_metrics?: boolean;
    view_only?: boolean;
    manage_collaborators?: boolean;
    view_shared?: boolean;
  };
}

export interface CompaniesResponse {
  user: {
    user_id: number;
    type_user: string;
    email: string;
  };
  companies: Array<{
    id: number;
    business_id: number;
    business_type: string;
    nome_exibicao: string;
    razao_social?: string;
    cnpj?: string;
    cpf?: string;
    cidade?: string;
    estado?: string;
    status: number;
  }>;
  total_companies: number;
}

class UserBusinessLinksApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // 1. Adicionar usuário à empresa (por email)
  async addUserToCompany(email: string, permissions?: any): Promise<UserBusinessLink> {
    const companyInfo = getCompanyInfo();
    
    const payload: AddUserRequest = {
      email: email.trim(),
      business_id: companyInfo.business_id,
      business_type: companyInfo.business_type,
      status: 1, // Ativo
      permissions: permissions
    };

    console.log('➕ Adicionando usuário à empresa:', payload);

    return this.request<UserBusinessLink>('/api/v1/user-business-links/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // 2. Listar Freelancers vinculados à minha empresa
  async listCompanyUsers(): Promise<UserBusinessLink[]> {
    const companyInfo = getCompanyInfo();
    
    const searchParams = new URLSearchParams({
      business_id: String(companyInfo.business_id),
      business_type: companyInfo.business_type
    });

    console.log('📋 Listando usuários da empresa:', companyInfo);

    return this.request<UserBusinessLink[]>(
      `/api/v1/user-business-links/?${searchParams.toString()}`
    );
  }

  // 3. Buscar empresas de um usuário (por email)
  async getUserCompanies(email: string): Promise<CompaniesResponse> {
    const encodedEmail = encodeURIComponent(email);
    
    console.log('🏢 Buscando empresas do usuário:', email);

    return this.request<CompaniesResponse>(
      `/api/v1/user-business-links/companies/by-email/${encodedEmail}`
    );
  }

  // 4. Atualizar status do vínculo
  async updateLinkStatus(linkId: number, status: number): Promise<UserBusinessLink> {
    const payload = {
      status: status // 1 = ativo, 0 = inativo
    };

    console.log('🔄 Atualizando status do vínculo:', linkId, 'para:', status);

    return this.request<UserBusinessLink>(`/api/v1/user-business-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // 4a. Atualizar permissões do vínculo
  async updatePermissions(linkId: number, permissions: any): Promise<UserBusinessLink> {
    const payload = {
      permissions: permissions
    };

    console.log('🛡️ Atualizando permissões do vínculo:', linkId, permissions);

    return this.request<UserBusinessLink>(`/api/v1/user-business-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // 5. Deletar vínculo (remover usuário da empresa)
  async removeUserFromCompany(linkId: number): Promise<{ message: string }> {
    console.log('❌ Removendo vínculo:', linkId);

    return this.request<{ message: string }>(`/api/v1/user-business-links/${linkId}`, {
      method: 'DELETE'
    });
  }

  // 6. Ativar usuário
  async activateUser(linkId: number): Promise<UserBusinessLink> {
    return this.updateLinkStatus(linkId, 1);
  }

  // 7. Desativar usuário
  async deactivateUser(linkId: number): Promise<UserBusinessLink> {
    return this.updateLinkStatus(linkId, 0);
  }
}

// Exportar instância singleton
export const userBusinessLinksApi = new UserBusinessLinksApiService();
