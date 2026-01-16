import { API_BASE_URL } from '../config/api';

// Normalizar tipo de usuário para o formato esperado pela API
function normalizeTipoUsuario(tipo: string): 'pf' | 'pj' | 'freelancer' | 'collaborator' {
  const tipoLower = tipo.toLowerCase().trim();
  
  // Mapear variações para os valores aceitos pela API
  if (tipoLower === 'pf' || tipoLower === 'pessoa física' || tipoLower === 'pessoa fisica') {
    return 'pf';
  }
  if (tipoLower === 'pj' || tipoLower === 'pessoa jurídica' || tipoLower === 'pessoa juridica') {
    return 'pj';
  }
  if (tipoLower === 'freelancer' || tipoLower === 'free lancer') {
    return 'freelancer';
  }
  if (tipoLower === 'collaborator' || tipoLower === 'colaborador') {
    return 'collaborator';
  }
  
  // Se não reconhecer, retornar freelancer como padrão
  console.warn('⚠️ Tipo de usuário não reconhecido:', tipo, '- usando "freelancer" como padrão');
  return 'freelancer';
}

// Função para obter informações do usuário do localStorage
function getUserInfo() {
  const userInfoStr = localStorage.getItem('infosUserLogin');
  
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      
      // Verificar se é colaborador
      if (userInfo.is_collaborator === true) {
        const user_id = userInfo.user?.id;
        
        console.log('🆔 Colaborador detectado!');
        console.log('🆔 user_id extraído:', user_id);
        
        if (user_id) {
          return {
            user_id,
            tipo_usuario: 'collaborator' as const
          };
        }
      }
      
      // Se não é colaborador, buscar tipo normal
      const user_id = userInfo.user?.id;
      const tipo_usuario_raw = userInfo.tipo;
      
      console.log('🆔 user_id extraído:', user_id);
      console.log('👤 tipo_usuario extraído (raw):', tipo_usuario_raw);
      
      if (user_id && tipo_usuario_raw) {
        const tipo_usuario = normalizeTipoUsuario(tipo_usuario_raw);
        console.log('✅ tipo_usuario normalizado:', tipo_usuario);
        
        return {
          user_id,
          tipo_usuario
        };
      }
      
      console.warn('⚠️ Dados incompletos no localStorage:', { user_id, tipo_usuario_raw });
    } catch (error) {
      console.error('❌ Erro ao parsear localStorage:', error);
    }
  }
  
  // Fallback
  return {
    user_id: 1,
    tipo_usuario: 'freelancer' as const
  };
}

export interface Seguidor {
  seguidor_id: number;
  usuario: {
    id: number;
    nome: string;
    email: string;
    tipo: 'pf' | 'pj' | 'freelancer' | 'collaborator';
  };
  dias_antes_alerta: number;
  alertar_no_vencimento: boolean;
  created_at: string;
}

export interface UsuarioAtualSegue {
  seguindo: boolean;
  seguidor_id?: number;
  dias_antes_alerta?: number;
  alertar_no_vencimento?: boolean;
  created_at?: string;
}

export interface SeguirDocumentoRequest {
  node_id: number;
  user_id: number;
  tipo_usuario: string;
  dias_antes_alerta: number;
  alertar_no_vencimento: boolean;
}

export interface ConfigurarAlertaRequest {
  dias_antes_alerta?: number;
  alertar_no_vencimento?: boolean;
}

export interface SeguimentoResponse {
  id: number;
  node_id: number;
  user_id: number;
  tipo_usuario: string;
  dias_antes_alerta: number;
  alertar_no_vencimento: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentoSeguido {
  seguidor: SeguimentoResponse;
  documento: {
    id: number;
    name: string;
    type: string;
    url?: string;
    data_validade?: string;
    created_at: string;
  };
  dias_para_vencimento: number | null;
  status: 'VENCIDO' | 'VENCE_HOJE' | 'PROXIMO_VENCIMENTO' | 'VIGENTE';
}

export interface Estatisticas {
  total_documentos_seguidos: number;
  documentos_proximos_vencimento: number;
  documentos_vencidos: number;
  notificacoes_pendentes: number;
  ultimas_notificacoes: any[];
}

class FollowDocumentApiService {
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

  // 1. Seguir um documento
  async seguirDocumento(
    nodeId: number,
    config?: { diasAntes?: number; alertarNoVencimento?: boolean }
  ): Promise<SeguimentoResponse> {
    const userInfo = getUserInfo();
    
    const payload: SeguirDocumentoRequest = {
      node_id: nodeId,
      user_id: userInfo.user_id,
      tipo_usuario: userInfo.tipo_usuario,
      dias_antes_alerta: config?.diasAntes ?? 7,
      alertar_no_vencimento: config?.alertarNoVencimento ?? true,
    };

    console.log('📤 Seguindo documento:', payload);

    return this.request<SeguimentoResponse>('/api/v1/notificacoes-documentos/seguir', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 2. Deixar de seguir um documento
  async deixarDeSeguir(nodeId: number): Promise<{ message: string }> {
    const userInfo = getUserInfo();
    
    const searchParams = new URLSearchParams({
      user_id: String(userInfo.user_id),
      tipo_usuario: userInfo.tipo_usuario,
    });

    console.log('📤 Deixando de seguir documento:', nodeId);

    return this.request<{ message: string }>(
      `/api/v1/notificacoes-documentos/deixar-de-seguir/${nodeId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
      }
    );
  }

  // 3. Atualizar configurações de alerta
  async configurarAlertas(
    nodeId: number,
    config: ConfigurarAlertaRequest
  ): Promise<SeguimentoResponse> {
    const userInfo = getUserInfo();
    
    const searchParams = new URLSearchParams({
      user_id: String(userInfo.user_id),
      tipo_usuario: userInfo.tipo_usuario,
    });

    console.log('📤 Configurando alertas:', { nodeId, config });

    return this.request<SeguimentoResponse>(
      `/api/v1/notificacoes-documentos/configurar/${nodeId}?${searchParams.toString()}`,
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    );
  }

  // 4. Listar meus documentos seguidos
  async listarMeusDocumentosSeguidos(): Promise<DocumentoSeguido[]> {
    const userInfo = getUserInfo();
    
    const searchParams = new URLSearchParams({
      user_id: String(userInfo.user_id),
      tipo_usuario: userInfo.tipo_usuario,
    });

    console.log('📤 Listando documentos seguidos');

    return this.request<DocumentoSeguido[]>(
      `/api/v1/notificacoes-documentos/meus-documentos?${searchParams.toString()}`
    );
  }

  // 5. Buscar estatísticas
  async buscarEstatisticas(): Promise<Estatisticas> {
    const userInfo = getUserInfo();
    
    const searchParams = new URLSearchParams({
      user_id: String(userInfo.user_id),
      tipo_usuario: userInfo.tipo_usuario,
    });

    console.log('📤 Buscando estatísticas');

    return this.request<Estatisticas>(
      `/api/v1/notificacoes-documentos/estatisticas?${searchParams.toString()}`
    );
  }

  // 6. Histórico de notificações
  async buscarNotificacoes(limit: number = 50): Promise<any[]> {
    const userInfo = getUserInfo();
    
    const searchParams = new URLSearchParams({
      user_id: String(userInfo.user_id),
      tipo_usuario: userInfo.tipo_usuario,
      limit: String(limit),
    });

    console.log('📤 Buscando notificações');

    return this.request<any[]>(
      `/api/v1/notificacoes-documentos/notificacoes?${searchParams.toString()}`
    );
  }

  // 7. Adicionar seguidor por email (somente dono do arquivo)
  async adicionarSeguidorPorEmail(
    nodeId: number,
    email: string,
    config?: { diasAntes?: number; alertarNoVencimento?: boolean }
  ): Promise<SeguimentoResponse> {
    const payload = {
      email: email,
      dias_antes_alerta: config?.diasAntes ?? 7,
      alertar_no_vencimento: config?.alertarNoVencimento ?? true,
    };

    console.log('📤 Adicionando seguidor por email:', { nodeId, email });

    return this.request<SeguimentoResponse>(
      `/api/v1/document-followers/${nodeId}/seguir-por-email`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }
}

// Helper: Calcular dias para vencimento
export function calcularDiasParaVencimento(dataValidade: string | undefined): number | null {
  if (!dataValidade) return null;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const vencimento = new Date(dataValidade);
  vencimento.setHours(0, 0, 0, 0);
  
  const diffTime = vencimento.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Helper: Obter status do documento
export function obterStatusDocumento(
  dataValidade: string | undefined,
  diasAntes: number = 7
): 'VENCIDO' | 'VENCE_HOJE' | 'PROXIMO_VENCIMENTO' | 'VIGENTE' | null {
  if (!dataValidade) return null;
  
  const dias = calcularDiasParaVencimento(dataValidade);
  if (dias === null) return null;
  
  if (dias < 0) return 'VENCIDO';
  if (dias === 0) return 'VENCE_HOJE';
  if (dias <= diasAntes) return 'PROXIMO_VENCIMENTO';
  return 'VIGENTE';
}

// Helper: Formatar vencimento
export function formatarVencimento(dataValidade: string | undefined): string {
  if (!dataValidade) return 'Sem validade';
  
  const dias = calcularDiasParaVencimento(dataValidade);
  if (dias === null) return 'Sem validade';
  
  if (dias < 0) return `Vencido há ${Math.abs(dias)} dias`;
  if (dias === 0) return 'Vence hoje';
  if (dias === 1) return 'Vence amanhã';
  return `Vence em ${dias} dias`;
}

// Exportar instância singleton
export const followDocumentApi = new FollowDocumentApiService();
