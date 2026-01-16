import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ============================================
// INTERFACES
// ============================================

export interface CompartilhadoCom {
  id: number;
  nome: string;
  email: string;
  tipo: 'pf' | 'pj' | 'freelancer' | 'collaborator';
  company_id?: number;
  company_type?: string;
}

export interface CompartilhadoPor {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}

export interface Compartilhamento {
  share_id: number;
  compartilhado_com: CompartilhadoCom;
  compartilhado_por: CompartilhadoPor;
  created_at: string;
}

export interface NodeSharesResponse {
  node_id: number;
  node_name: string;
  node_type: 'file' | 'folder';
  total_compartilhamentos: number;
  compartilhamentos: Compartilhamento[];
}

// ============================================
// FUNÇÕES DA API
// ============================================

/**
 * Busca todos os compartilhamentos de um documento/pasta
 */
export const getNodeShares = async (nodeId: number): Promise<NodeSharesResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get<NodeSharesResponse>(
      `${API_URL}/api/v1/nodes/${nodeId}/compartilhamentos`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar compartilhamentos:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Documento não encontrado');
    }
    if (error.response?.status === 403) {
      throw new Error('Você não tem permissão para ver os compartilhamentos deste documento');
    }
    
    throw new Error(error.response?.data?.detail || 'Erro ao buscar compartilhamentos');
  }
};

/**
 * Formata o tipo de usuário para exibição
 */
export const formatUserType = (tipo: string): string => {
  const tipos: Record<string, string> = {
    'pf': 'Pessoa Física',
    'pj': 'Pessoa Jurídica',
    'freelancer': 'Freelancer',
    'collaborator': 'Colaborador'
  };
  
  return tipos[tipo] || tipo;
};

/**
 * Retorna a cor do badge baseado no tipo de usuário
 */
export const getUserTypeBadgeColor = (tipo: string): string => {
  const cores: Record<string, string> = {
    'pf': 'bg-blue-100 text-blue-700',
    'pj': 'bg-purple-100 text-purple-700',
    'freelancer': 'bg-green-100 text-green-700',
    'collaborator': 'bg-red-100 text-red-800'
  };
  
  return cores[tipo] || 'bg-gray-100 text-gray-700';
};
