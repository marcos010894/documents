import { API_BASE_URL } from '../config/api';

// Normalizar tipo de usuário para o formato esperado pela API
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
  
  console.warn('⚠️ Tipo de usuário não reconhecido:', tipo, '- usando "freelancer" como padrão');
  return 'freelancer';
}

// Função para obter informações do usuário do localStorage
function getUserInfo() {
  const userInfoStr = localStorage.getItem('infosUserLogin');
  
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      const user_id = userInfo.user?.id;
      const business_id = userInfo.user?.id;
      const tipo_usuario_raw = userInfo.tipo;
      
      if (user_id && tipo_usuario_raw) {
        const tipo_usuario = normalizeTipoUsuario(tipo_usuario_raw);
        
        return {
          user_id,
          business_id,
          tipo_usuario
        };
      }
      
      console.warn('⚠️ Dados incompletos no localStorage:', { user_id, tipo_usuario_raw });
    } catch (error) {
      console.error('❌ Erro ao parsear localStorage:', error);
    }
  }
  
  return {
    user_id: 1,
    business_id: 1,
    tipo_usuario: 'freelancer' as const
  };
}

export interface TrashItem {
  id: number;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  extension?: string;
  status?: string;
  url?: string;
  created_at: string;
  deleted_at: string;
  deleted_by_id: number;
  deleted_by_type: string;
  children_count: number;
}

export interface RestoreResponse {
  message: string;
  node: {
    id: number;
    name: string;
    type: string;
    parent_id: number | null;
  };
}

export interface EmptyTrashResponse {
  message: string;
}

class TrashApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🗑️ Trash API Request:', url, options.method || 'GET');
    
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

  /**
   * Listar todos os items na lixeira
   * @param filters - Filtros opcionais (business_id, tipo_usuario, user_id)
   */
  async listarLixeira(filters?: {
    business_id?: number;
    tipo_usuario?: string;
    user_id?: number;
  }): Promise<TrashItem[]> {
    const userInfo = getUserInfo();
    const searchParams = new URLSearchParams();

    // Usar filtros passados ou valores do localStorage
    const finalFilters = {
      business_id: filters?.business_id || userInfo.business_id,
      tipo_usuario: filters?.tipo_usuario || userInfo.tipo_usuario,
      user_id: filters?.user_id || userInfo.user_id
    };

    console.log('🗑️ Listando lixeira com filtros:', finalFilters);

    Object.entries(finalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    const endpoint = `/api/v1/nodes/trash${query ? `?${query}` : ''}`;

    return this.request<TrashItem[]>(endpoint);
  }

  /**
   * Restaurar um item da lixeira
   * @param nodeId - ID do item a restaurar
   * @param restoreToParent - ID da pasta de destino (opcional, se não especificar restaura para local original)
   */
  async restaurarItem(nodeId: number, restoreToParent?: number): Promise<RestoreResponse> {
    const searchParams = new URLSearchParams();
    
    if (restoreToParent !== undefined) {
      searchParams.append('restore_to_parent', String(restoreToParent));
    }

    const query = searchParams.toString();
    const endpoint = `/api/v1/nodes/trash/${nodeId}/restore${query ? `?${query}` : ''}`;

    console.log('♻️ Restaurando item:', nodeId, restoreToParent ? `para pasta ${restoreToParent}` : 'para local original');

    return this.request<RestoreResponse>(endpoint, {
      method: 'POST'
    });
  }

  /**
   * Deletar permanentemente um item da lixeira
   * ⚠️ ATENÇÃO: Esta ação não pode ser desfeita!
   * @param nodeId - ID do item a deletar permanentemente
   */
  async deletarPermanentemente(nodeId: number): Promise<{ message: string }> {
    console.log('💀 Deletando permanentemente item:', nodeId);

    return this.request<{ message: string }>(`/api/v1/nodes/trash/${nodeId}/permanent`, {
      method: 'DELETE'
    });
  }

  /**
   * Esvaziar a lixeira (deletar permanentemente todos os items)
   * ⚠️ ATENÇÃO: Esta ação não pode ser desfeita!
   * @param filters - Filtros opcionais (business_id, tipo_usuario, user_id, older_than_days)
   */
  async esvaziarLixeira(filters?: {
    business_id?: number;
    tipo_usuario?: string;
    user_id?: number;
    older_than_days?: number;
  }): Promise<EmptyTrashResponse> {
    const searchParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    const endpoint = `/api/v1/nodes/trash/empty${query ? `?${query}` : ''}`;

    console.log('🧹 Esvaziando lixeira com filtros:', filters);

    return this.request<EmptyTrashResponse>(endpoint, {
      method: 'POST'
    });
  }
}

export const trashApi = new TrashApiService();
