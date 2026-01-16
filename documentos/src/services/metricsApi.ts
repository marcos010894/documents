const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface MetricsArmazenamento {
    total_bytes: number;
    total_mb: number;
    total_gb: number;
}

export interface MetricsTotais {
    arquivos: number;
    pastas: number;
    total: number;
}

export interface MetricsStatus {
    status_id: number | null;
    status_name: string;
    status_color: string;
    total: number;
}

export interface MetricsResponse {
    armazenamento: MetricsArmazenamento;
    totais: MetricsTotais;
    status: MetricsStatus[];
}

/**
 * Busca métricas da empresa (todos os usuários)
 */
export const getCompanyMetrics = async (
    companyId: number,
    tipoUsuario: 'pf' | 'pj' | 'freelancer'
): Promise<MetricsResponse> => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/v1/metrics/storage/empresa/${companyId}?tipo_usuario=${tipoUsuario}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar métricas da empresa');
    }

    return response.json();
};

/**
 * Busca métricas de um usuário específico
 */
export const getUserMetrics = async (
    userId: number,
    tipoUsuario: 'pf' | 'pj' | 'freelancer'
): Promise<MetricsResponse> => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/v1/metrics/storage/usuario/${userId}?tipo_usuario=${tipoUsuario}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar métricas do usuário');
    }

    return response.json();
};

export const metricsApi = {
    getCompanyMetrics,
    getUserMetrics
};
