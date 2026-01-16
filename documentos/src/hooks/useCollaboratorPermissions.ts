import { useState, useEffect } from 'react';

export interface CollaboratorPermissions {
    manage_files: boolean;
    view_metrics: boolean;
    view_only: boolean;
    manage_collaborators: boolean;
    view_shared: boolean;
}

export interface UserInfo {
    isCollaborator: boolean;
    permissions: CollaboratorPermissions | null;
    userId: number | null;
    companyId: number | null;
    companyType: string | null;
    userName: string | null;
    userEmail: string | null;
}

/**
 * Hook para gerenciar permissões de colaboradores
 */
export const useCollaboratorPermissions = (): UserInfo => {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        isCollaborator: false,
        permissions: null,
        userId: null,
        companyId: null,
        companyType: null,
        userName: null,
        userEmail: null
    });

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = () => {
        try {
            const infosUserLoginStr = localStorage.getItem('infosUserLogin');
            if (!infosUserLoginStr) {
                return;
            }

            const data = JSON.parse(infosUserLoginStr);

            // Verificar se é colaborador
            if (data.is_collaborator === true) {
                setUserInfo({
                    isCollaborator: true,
                    permissions: data.permissions || null,
                    userId: data.user?.id || null,
                    companyId: data.company_id || null,
                    companyType: data.company_type || null,
                    userName: data.user?.name || null,
                    userEmail: data.user?.email || null
                });

                console.log('👤 Colaborador detectado!');
                console.log('🔐 Permissões:', data.permissions);
            } else {
                // Usuário normal (PF/PJ/Freelancer)
                setUserInfo({
                    isCollaborator: false,
                    permissions: {
                        manage_files: true,
                        view_metrics: true,
                        view_only: false,
                        manage_collaborators: true,
                        view_shared: false
                    }, // Permissões totais
                    userId: data.user?.id || data.id || null,
                    companyId: data.user?.id || data.id || null,
                    companyType: data.tipo?.toLowerCase() || data.company_type || 'pf',
                    userName: data.user?.nome || data.nome || null,
                    userEmail: data.user?.email || data.email || null
                });

                console.log('👤 Usuário normal (PF/PJ/Freelancer)');
                console.log('🔐 Permissões: TODAS');
            }
        } catch (err) {
            console.error('❌ Erro ao carregar info do usuário:', err);
        }
    };

    return userInfo;
};

/**
 * Função auxiliar para verificar permissão específica
 */
export const hasPermission = (permission: keyof CollaboratorPermissions): boolean => {
    try {
        const infosUserLoginStr = localStorage.getItem('infosUserLogin');
        if (!infosUserLoginStr) return false;

        const data = JSON.parse(infosUserLoginStr);

        // Se for colaborador, verificar permissão específica (já existente)
        if (data.is_collaborator) {
            return data.permissions?.[permission] === true;
        }

        // NOVO: Se for Freelancer com dados da empresa selecionada (que agora tem permissions)
        if (data.permissions && Object.keys(data.permissions).length > 0) {
            // Se o objeto de permissões existir no nível raiz (onde é salvo ao selecionar empresa)
            // Se a permissão não estiver definida (null/undefined), assume true para manter compatibilidade
            // Mas se estiver definida como false, retorna false.
            if (data.permissions[permission] === false) {
                 return false;
            }
            if (data.permissions[permission] === true) {
                 return true;
            }
            // Se vier vazio, assumimos permissão padrão (geralmente true no modelo antigo, mas aqui queremos segurança)
            // Vamos assumir que se permissions existe, ele é a fonte da verdade.
        }

        // Fallback: Se não tiver permissões explícitas (Dono/PJ/PF/Admin), tem acesso total
        return true;
    } catch {
        return false;
    }
};

/**
 * Função para obter apenas as permissões
 */
export const getPermissions = (): CollaboratorPermissions | null => {
    try {
        const infosUserLoginStr = localStorage.getItem('infosUserLogin');
        if (!infosUserLoginStr) return null;

        const data = JSON.parse(infosUserLoginStr);

        // Se tiver permissões explícitas (Colaborador OU Freelancer com empresa selecionada)
        if (data.permissions) {
             return data.permissions;
        }

        // Se não, retorna permissões totais (Dono)
        return {
            manage_files: true,
            view_metrics: true,
            view_only: false,
            manage_collaborators: true,
            view_shared: false
        };
    } catch {
        return null;
    }
};
