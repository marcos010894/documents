import { API_BASE_URL } from '../config/api';

export interface CollaboratorPermissions {
    manage_files: boolean;
    view_metrics: boolean;
    view_only: boolean;
    manage_collaborators: boolean;
    view_shared: boolean;
}

export interface Collaborator {
    id: number;
    email: string;
    name: string;
    company_id: number;
    company_type: string;
    permissions: CollaboratorPermissions;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCollaboratorData {
    email: string;
    password: string;
    name: string;
    company_id: number;
    company_type: string;
    permissions: CollaboratorPermissions;
}

export interface LoginCollaboratorData {
    email: string;
    password: string;
}

export interface LoginCollaboratorResponse {
    message: string;
    status: string;
    user: Collaborator;
    permissions: CollaboratorPermissions;
    tipo: string;
    company_id: number;
    company_type: string;
    is_collaborator: boolean; // Flag para identificar no frontend
}

/**
 * Criar novo colaborador
 */
export const createCollaborator = async (data: CreateCollaboratorData): Promise<Collaborator> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/v1/collaborators/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao criar colaborador');
    }

    return response.json();
};

/**
 * Login de colaborador (USA LOGIN UNIFICADO!)
 * Agora colaboradores usam o mesmo endpoint /api/v1/auth/login
 * O backend detecta automaticamente e retorna is_collaborator: true
 */
export const loginCollaborator = async (data: LoginCollaboratorData): Promise<LoginCollaboratorResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao fazer login');
    }

    return response.json();
};

/**
 * Listar colaboradores da empresa
 */
export const listCompanyCollaborators = async (
    companyId: number,
    companyType: string
): Promise<{ company_id: number; company_type: string; total: number; collaborators: Collaborator[] }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${API_BASE_URL}/api/v1/collaborators/company/${companyId}?company_type=${companyType}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao listar colaboradores');
    }

    return response.json();
};

/**
 * Buscar colaborador por ID
 */
export const getCollaborator = async (collaboratorId: number): Promise<Collaborator> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/v1/collaborators/${collaboratorId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao buscar colaborador');
    }

    return response.json();
};

/**
 * Atualizar colaborador
 */
export const updateCollaborator = async (
    collaboratorId: number,
    data: { name?: string; permissions?: CollaboratorPermissions }
): Promise<Collaborator> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/v1/collaborators/${collaboratorId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao atualizar colaborador');
    }

    return response.json();
};

/**
 * Desativar colaborador
 */
export const deactivateCollaborator = async (collaboratorId: number): Promise<{ message: string }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/v1/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao desativar colaborador');
    }

    return response.json();
};

/**
 * Verificar permissão específica
 */
export const checkPermission = async (
    collaboratorId: number,
    permission: keyof CollaboratorPermissions
): Promise<{ collaborator_id: number; permission: string; has_permission: boolean }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${API_BASE_URL}/api/v1/collaborators/${collaboratorId}/check-permission?permission=${permission}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao verificar permissão');
    }

    return response.json();
};

export const collaboratorsApi = {
    createCollaborator,
    loginCollaborator,
    listCompanyCollaborators,
    getCollaborator,
    updateCollaborator,
    deactivateCollaborator,
    checkPermission
};
