/**
 * Utilitários para trabalhar com colaboradores
 */

export interface CollaboratorInfo {
    isCollaborator: boolean;
    userId: number;
    companyId: number;
    companyType: string;
    permissions?: {
        manage_files: boolean;
        view_metrics: boolean;
        view_only: boolean;
        manage_collaborators: boolean;
        view_shared: boolean;
    };
}

/**
 * Verifica se o usuário logado é um colaborador
 */
export const isCollaborator = (): boolean => {
    try {
        const userInfoStr = localStorage.getItem('infosUserLogin');
        if (!userInfoStr) return false;

        const userInfo = JSON.parse(userInfoStr);
        return userInfo.is_collaborator === true;
    } catch {
        return false;
    }
};

/**
 * Obtém informações do colaborador logado
 */
export const getCollaboratorInfo = (): CollaboratorInfo | null => {
    try {
        const userInfoStr = localStorage.getItem('infosUserLogin');
        if (!userInfoStr) return null;

        const userInfo = JSON.parse(userInfoStr);

        if (userInfo.is_collaborator) {
            return {
                isCollaborator: true,
                userId: userInfo.user?.id || 0,
                companyId: userInfo.company_id || 0,
                companyType: userInfo.company_type || 'pf',
                permissions: userInfo.permissions
            };
        }

        return null;
    } catch (err) {
        console.error('Erro ao obter info do colaborador:', err);
        return null;
    }
};

/**
 * Verifica se o colaborador tem uma permissão específica
 */
export const hasPermission = (permission: keyof NonNullable<CollaboratorInfo['permissions']>): boolean => {
    const info = getCollaboratorInfo();
    if (!info || !info.permissions) return false;
    return info.permissions[permission] === true;
};

/**
 * Obtém o ID da empresa (seja PF, PJ ou Colaborador)
 */
export const getCompanyId = (): number | null => {
    try {
        const userInfoStr = localStorage.getItem('infosUserLogin');
        if (!userInfoStr) return null;

        const userInfo = JSON.parse(userInfoStr);

        // Colaborador
        if (userInfo.is_collaborator && userInfo.company_id) {
            return Number(userInfo.company_id);
        }

        // PF/PJ normal
        if (userInfo.user?.id) {
            return Number(userInfo.user.id);
        }

        // Fallback
        if (userInfo.id) {
            return Number(userInfo.id);
        }

        return null;
    } catch {
        return null;
    }
};

/**
 * Obtém o tipo da empresa
 */
export const getCompanyType = (): string => {
    try {
        const userInfoStr = localStorage.getItem('infosUserLogin');
        const typeUser = localStorage.getItem('type_user');

        if (!userInfoStr) return 'pf';

        const userInfo = JSON.parse(userInfoStr);

        // Colaborador
        if (userInfo.is_collaborator && userInfo.company_type) {
            return userInfo.company_type;
        }

        // PF/PJ normal
        if (userInfo.tipo) {
            return userInfo.tipo.toLowerCase();
        }

        return typeUser || 'pf';
    } catch {
        return 'pf';
    }
};

/**
 * Limpa dados do colaborador ao fazer logout
 */
export const clearCollaboratorData = (): void => {
    localStorage.removeItem('infosUserLogin');
    localStorage.removeItem('type_user');
    localStorage.removeItem('userType');
    localStorage.removeItem('collaboratorData');
    localStorage.removeItem('collaboratorPermissions');
    localStorage.removeItem('selectedCompanyId');
    localStorage.removeItem('token');
};
