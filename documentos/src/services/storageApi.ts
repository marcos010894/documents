const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
      const business_id = userInfo.user?.id;  // ID do usuário dono
      // Tentar encontrar tipo de usuário em várias propriedades possíveis
      const type_user_raw = userInfo.tipo || userInfo.type_user || userInfo.user?.type_user || userInfo.user?.tipo;
      
      // Buscar company_id
      const companyIdStr = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId');
      
      let finalCompanyId = business_id;
      if (companyIdStr && companyIdStr !== 'own') {
          const parsed = parseInt(companyIdStr);
          if (!isNaN(parsed)) {
              finalCompanyId = parsed;
          }
      }

      console.log('🆔 business_id extraído:', business_id);
      console.log('🏢 company_id extraído:', finalCompanyId);
      
      if (business_id) {
        // Se não tiver tipo, assume freelancer para não quebrar, mas loga aviso
        const type_user = normalizeTipoUsuario(type_user_raw || 'freelancer');
        
        return {
          business_id,              // ID do usuário dono
          type_user,                // Tipo do usuário dono
          company_id: finalCompanyId, // ID da empresa (fallback para business_id)
          company_type: 'freelancer' // Simplificação para evitar erros
        };
      }
      
      console.error('❌ Dados de usuário inválidos no localStorage:', userInfo);
    } catch (error) {
      console.error('❌ Erro ao parsear localStorage:', error);
    }
  }
  
  // Se chegou aqui, removeu o fallback perigoso
  console.error('⛔ FALHA CRÍTICA: Não foi possível recuperar informações do usuário. Redirecionando para login.');
  
  // Opcional: Forçar logout ou lançar erro que será pego pela UI
  // throw new Error("Sessão inválida. Por favor, faça login novamente.");
  
  // Retornar null ou objeto vazio seguro? 
  // Retornar um objeto que vai causar erro 401/403 na API é melhor que mostrar dados do User 1.
  return {
    business_id: 0,
    type_user: 'freelancer' as const,
    company_id: 0,
    company_type: 'freelancer' as const
  };
}

export interface ApiFileItem {
  id: number;
  name: string;
  type: 'file' | 'folder';
  parent_id?: number | null;
  business_id?: number;
  url?: string;
  size?: string;
  extension?: string;
  status?: string;
  comments?: string;
  data_validade?: string;
  created_at?: string;
  updated_at?: string;
  children?: ApiFileItem[];
  // Campos de seguimento
  seguidores?: any[];
  total_seguidores?: number;
  usuario_atual_segue?: {
    seguindo: boolean;
    seguidor_id?: number;
    dias_antes_alerta?: number;
    alertar_no_vencimento?: boolean;
    created_at?: string;
  };
  usuario_e_dono?: boolean;
}

export interface CreateFileRequest {
  file?: File;
  name: string;
  type: 'file' | 'folder';
  parent_id?: number | null;
  business_id?: number;
  type_user?: string;
  comments?: string;
  status?: string;
  data_validade?: string;
}

export interface UpdateFileRequest {
  file?: File;
  name?: string;
  parent_id?: number | null;
  comments?: string;
  status?: string;
  data_validade?: string;
}

export interface DocumentHistoryItem {
  id: number;
  acao: string;
  acao_descricao: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    tipo: string;
  };
  detalhes: any;
  data_hora: string;
  ip?: string;
}

export interface DocumentTraceability {
  node_id: number;
  criado_por?: any;
  criado_em?: string;
  ultima_edicao_por?: any;
  ultima_edicao_em?: string;
  ultima_movimentacao_por?: any;
  ultima_movimentacao_em?: string;
  movimentacao_detalhes?: any;
  total_edicoes: number;
  total_movimentacoes: number;
  total_compartilhamentos: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    return formData;
  }

  // Converter parent_id string para número (root = null)
  private parseParentId(parentId: string): number | null {
    if (parentId === 'root') return null;
    const parsed = parseInt(parentId);
    return isNaN(parsed) ? null : parsed;
  }

  // Converter dados da API para formato do frontend
  private convertApiToFrontend(apiItem: ApiFileItem): any {
    return {
      id: String(apiItem.id),
      name: apiItem.name,
      type: apiItem.type,
      parentId: apiItem.parent_id ? String(apiItem.parent_id) : 'root',
      createdAt: apiItem.created_at ? apiItem.created_at.split('T')[0] : new Date().toISOString().split('T')[0], // Apenas data, com fallback
      size: apiItem.size,
      extension: apiItem.extension,
      status: apiItem.status,
      validityDate: apiItem.data_validade, // Mapear data_validade da API
      comments: apiItem.comments,
      url: apiItem.url,
      // Campos de seguimento
      seguidores: apiItem.seguidores,
      total_seguidores: apiItem.total_seguidores,
      usuario_atual_segue: apiItem.usuario_atual_segue,
      usuario_e_dono: apiItem.usuario_e_dono,
    };
  }

  // Helper para formatar tamanho (mesma lógica do backend)
  private formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024.0;
      i++;
    }
    return `${n.toFixed(1)} ${units[i]}`;
  }

  // 1. Criar arquivo/pasta (OTIMIZADO com Upload Direto)
  async createStorageNode(data: CreateFileRequest): Promise<ApiFileItem> {
    const userInfo = getUserInfo();
    
    // ⚠️ VALIDAÇÃO CRÍTICA: Verificar se temos company_id
    if (!userInfo.company_id) {
      throw new Error('❌ Erro: company_id não encontrado. Selecione uma empresa antes de fazer upload.');
    }

    // A) FLUXO OTIMIZADO PARA ARQUIVOS (Direct Upload via R2)
    if (data.type === 'file' && data.file) {
      try {
        console.log('🚀 Iniciando Upload Otimizado (Direct R2)...');
        
        // 1. Solicitar URL Presignada
        const presignedPayload = {
          filename: data.file.name,
          content_type: data.file.type || 'application/octet-stream',
          size_bytes: data.file.size,
          business_id: userInfo.business_id,
          type_user: userInfo.type_user,
          company_id: userInfo.company_id,
          company_type: userInfo.company_type
        };

        const presigned = await this.request<any>('/api/v1/nodes/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(presignedPayload)
        });

        console.log('✅ URL Presignada recebida. Iniciando upload para R2...');

        // 2. Upload Direto para R2 (PUT)
        const uploadResponse = await fetch(presigned.upload_url, {
          method: 'PUT',
          headers: { 
            'Content-Type': data.file.type || 'application/octet-stream'
          },
          body: data.file
        });

        if (!uploadResponse.ok) {
          throw new Error(`Falha no upload para R2: ${uploadResponse.statusText}`);
        }
        
        console.log('✅ Upload para R2 concluído com sucesso!');

        // 3. Finalizar Criação no Backend
        const ext = data.file.name.includes('.') ? '.' + data.file.name.split('.').pop()?.toLowerCase() : undefined;
        const sizeStr = this.formatSize(data.file.size);
        const parentId = data.parent_id !== undefined ? this.parseParentId(String(data.parent_id)) : null;

        const completePayload = {
          name: data.name,
          type: 'file',
          parent_id: parentId,
          business_id: userInfo.business_id,
          type_user: userInfo.type_user,
          company_id: userInfo.company_id,
          company_type: userInfo.company_type,
          size: sizeStr,
          extension: ext,
          status: data.status || 'Válido',
          comments: data.comments,
          url: presigned.public_url,
          data_validade: data.data_validade
        };

        return await this.request<ApiFileItem>('/api/v1/nodes/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completePayload)
        });

      } catch (error) {
        console.warn('⚠️ Falha no upload direto (CORS ou erro de rede). Tentando método legado...', error);
        // Não lançar erro, apenas deixar cair no fluxo B (legado)
      }
    }
    
    // B) FLUXO LEGADO PARA PASTAS (Multipart)
    const formData = this.createFormData({
      ...data,
      parent_id: data.parent_id !== undefined ? this.parseParentId(String(data.parent_id)) : undefined,
      // ✅ DONO DO ARQUIVO (quem está fazendo upload)
      business_id: userInfo.business_id,
      type_user: userInfo.type_user,
      // ✅ EMPRESA RESPONSÁVEL (empresa selecionada)
      company_id: userInfo.company_id,
      company_type: userInfo.company_type
    });

    console.log('📤 Enviando dados para criar folder:', {
      ...data,
      business_id: userInfo.business_id,    // Usuário dono
      type_user: userInfo.type_user,
      company_id: userInfo.company_id,      // Empresa responsável
      company_type: userInfo.company_type
    });

    return this.request<ApiFileItem>('/api/v1/nodes/', {
      method: 'POST',
      body: formData,
    });
  }

  // 2. Buscar um arquivo específico
  async getStorageNode(nodeId: number): Promise<ApiFileItem> {
    const userInfo = getUserInfo();
    const searchParams = new URLSearchParams({
      user_id: String(userInfo.business_id),
      tipo_usuario: userInfo.type_user
    });
    
    return this.request<ApiFileItem>(`/api/v1/nodes/${nodeId}?${searchParams.toString()}`);
  }

  // 3. Listar arquivos/pastas
  async listStorageNodes(params?: {
    parent_id?: number | null;
    business_id?: number;
    type_user?: string;
    // Filtros
    status?: string | null;
    file_type?: string | null;
    search_term?: string | null;
  }): Promise<ApiFileItem[]> {
    const userInfo = getUserInfo();
    const searchParams = new URLSearchParams();
    
    // ✅ VISIBILIDADE: Filtra por user_id (dono) + arquivos compartilhados (backend faz isso)
    // ⚠️ company_id NÃO é usado para filtrar visibilidade, apenas para storage!
    const finalParams = {
      ...params,
      user_id: userInfo.business_id,           // ✅ Quem eu sou (para ver meus arquivos)
      tipo_usuario: userInfo.type_user,        // ✅ Meu tipo de usuário
      company_id: userInfo.company_id          // ℹ️ Apenas informativo para o backend
    };

    console.log('📋 Listando nodes (meus + compartilhados) com filtros:', finalParams);

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') { // Ignora strings vazias
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    const endpoint = `/api/v1/nodes/${query ? `?${query}` : ''}`;
    
    console.log('🔗 Endpoint chamado:', endpoint);
    
    return this.request<ApiFileItem[]>(endpoint);
  }

  // 4. Atualizar arquivo/pasta
  async updateStorageNode(nodeId: number, data: UpdateFileRequest): Promise<ApiFileItem> {
    const userInfo = getUserInfo();
    
    const formData = this.createFormData({
      ...data,
      parent_id: data.parent_id !== undefined ? this.parseParentId(String(data.parent_id)) : undefined,
      business_id: userInfo.business_id,
      type_user: userInfo.type_user
    });

    return this.request<ApiFileItem>(`/api/v1/nodes/${nodeId}`, {
      method: 'PUT',
      body: formData,
    });
  }

  // 5. Deletar arquivo/pasta (soft delete - move para lixeira)
  async deleteStorageNode(nodeId: number): Promise<void> {
    const userInfo = getUserInfo();
    const searchParams = new URLSearchParams({
      user_id: String(userInfo.business_id),
      tipo_usuario: userInfo.type_user
    });

    console.log('🗑️ Deletando (soft delete) node:', nodeId, 'por usuário:', userInfo);

    return this.request<void>(`/api/v1/nodes/${nodeId}?${searchParams.toString()}`, {
      method: 'DELETE',
    });
  }

  // 5a. Deletar arquivo (alias mais específico)
  async deleteFile(fileId: number): Promise<void> {
    console.log('📄 Deletando arquivo:', fileId);
    return this.deleteStorageNode(fileId);
  }

  // 5b. Deletar pasta recursivamente (move pasta e todos os arquivos dentro para lixeira)
  async deleteFolder(folderId: number): Promise<void> {
    console.log('📁 Deletando pasta recursivamente:', folderId);
    return this.deleteStorageNode(folderId);
  }

  // 6. Mover arquivo/pasta para nova localização
  async moveNode(nodeId: number, newParentId: number | null): Promise<{
    message: string;
    node: ApiFileItem;
  }> {
    const userInfo = getUserInfo();
    const searchParams = new URLSearchParams();
    
    if (newParentId !== null) {
      searchParams.append('new_parent_id', String(newParentId));
    }
    
    // Adicionar informações do usuário para validação de permissão
    searchParams.append('user_id', String(userInfo.business_id));
    searchParams.append('tipo_usuario', userInfo.type_user);
    
    const query = searchParams.toString();
    const endpoint = `/api/v1/nodes/${nodeId}/move${query ? `?${query}` : ''}`;
    
    console.log('📦 Movendo node:', nodeId, 'para:', newParentId === null ? 'raiz' : `pasta ${newParentId}`);
    
    return this.request<{ message: string; node: ApiFileItem }>(endpoint, {
      method: 'PATCH'
    });
  }

  // Método auxiliar para carregar arquivos de uma pasta específica
  async loadFolderContents(
    folderId: string, 
    businessId?: number, 
    filters?: { status?: string | null, file_type?: string | null, search_term?: string | null }
  ): Promise<any[]> {
    try {
      const parentId = this.parseParentId(folderId);
      // ⚠️ NÃO usar businessId aqui! Filtrar por company_id
      const apiItems = await this.listStorageNodes({
        parent_id: parentId,
        // Filtros backend
        status: filters?.status,
        file_type: filters?.file_type,
        search_term: filters?.search_term
        // company_id será pego automaticamente do getUserInfo() dentro de listStorageNodes
      });

      return apiItems.map(item => this.convertApiToFrontend(item));
    } catch (error) {
      console.error('Erro ao carregar conteúdo da pasta:', error);
      throw error;
    }
  }

  // Busca global (todos os arquivos)
  async searchAllFiles(
    businessId?: number,
    filters?: { status?: string | null, file_type?: string | null, search_term?: string | null }
  ): Promise<any[]> {
    try {
      // ⚠️ NÃO usar businessId aqui! Filtrar por company_id
      const apiItems = await this.listStorageNodes({
        // company_id será pego automaticamente do getUserInfo() dentro de listStorageNodes
        status: filters?.status,
        file_type: filters?.file_type,
        search_term: filters?.search_term
      });

      return apiItems.map(item => this.convertApiToFrontend(item));
    } catch (error) {
      console.error('Erro na busca global:', error);
      throw error;
    }
  }

  // Compartilhar arquivo/pasta
  async shareStorageNode(nodeId: number, sharedWithEmails: string[], allowEditing: boolean = false): Promise<any[]> {
    try {
      // Obter email do usuário que está compartilhando
      const userInfo = localStorage.getItem('infosUserLogin');
      let sharedByEmail = 'marcosmachadodev@gmail.com'; // fallback
      
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          sharedByEmail = user.user?.email || sharedByEmail;
        } catch (error) {
          console.error('Erro ao parsear informações do usuário:', error);
        }
      }

      console.log('📤 Compartilhando node:', nodeId, 'com emails:', sharedWithEmails, 'allowEditing:', allowEditing, 'por:', sharedByEmail);

      const results = [];
      
      // Fazer uma requisição para cada email
      for (const email of sharedWithEmails) {
        const shareData = {
          node_id: nodeId,
          shared_with_email: email.trim(),
          shared_by_email: sharedByEmail,
          allow_editing: allowEditing
        };

        const response = await fetch(`${API_BASE_URL}/api/v1/shares/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(shareData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ao compartilhar com ${email}: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        results.push({
          email,
          success: true,
          data: result
        });
        
        console.log(`✅ Compartilhado com sucesso com ${email}:`, result);
      }

      return results;
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      throw error;
    }
  }
  // 8. Obter histórico de movimentações (Audit Log)
  async getDocumentHistory(nodeId: number): Promise<{ total_registros: number; historico: DocumentHistoryItem[] }> {
    try {
      console.log('📜 Buscando histórico do node:', nodeId);
      return await this.request<{ total_registros: number; historico: DocumentHistoryItem[] }>(`/api/v1/nodes/${nodeId}/historico`);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  // 9. Obter rastreabilidade resumida
  async getDocumentTraceability(nodeId: number): Promise<DocumentTraceability> {
    try {
      console.log('📋 Buscando rastreabilidade do node:', nodeId);
      return await this.request<DocumentTraceability>(`/api/v1/nodes/${nodeId}/rastreabilidade`);
    } catch (error) {
      console.error('Erro ao buscar rastreabilidade:', error);
      throw error;
    }
  }
}

export const storageApi = new ApiService();
