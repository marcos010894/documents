import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TfiUser, TfiEmail, TfiCalendar, TfiCheck, TfiClose, TfiTrash } from 'react-icons/tfi';
import { MdPersonAdd, MdPeople } from 'react-icons/md';
import { Users, UserPlus, Shield, Edit2, Trash2 } from 'lucide-react';
import { userBusinessLinksApi, UserBusinessLink } from '../../../services/userBusinessLinksApi';
import { collaboratorsApi, Collaborator } from '../../../services/collaboratorsApi';
import AddUserToCompanyModal from '../components/modals/AddUserToCompanyModal';
import CollaboratorModal from '../components/CollaboratorModal';
import FreelancerPermissionsModal from '../components/modals/FreelancerPermissionsModal';

const CompanyUsers = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'users' | 'collaborators'>('users');

    // Estados para Freelancers vinculados
    const [users, setUsers] = useState<UserBusinessLink[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<UserBusinessLink | null>(null);

    // Estados para colaboradores
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [collaboratorsLoading, setCollaboratorsLoading] = useState(false);
    const [collaboratorsError, setCollaboratorsError] = useState<string | null>(null);
    const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
    const [collaboratorModalMode, setCollaboratorModalMode] = useState<'create' | 'edit'>('create');

    // Dados da empresa
    const getCompanyData = () => {
        const userInfoStr = localStorage.getItem('infosUserLogin');
        const typeUser = localStorage.getItem('type_user');

        console.log('📦 localStorage infosUserLogin:', userInfoStr);
        console.log('📦 localStorage type_user:', typeUser);

        if (userInfoStr) {
            try {
                const userInfo = JSON.parse(userInfoStr);
                console.log('✅ userInfo parseado:', userInfo);

                let companyId: number;
                let companyType: string;

                // Verificar se é colaborador (login unificado)
                if (userInfo.is_collaborator && userInfo.company_id) {
                    companyId = Number(userInfo.company_id);
                    companyType = userInfo.company_type || 'pf';
                    console.log('👤 Detectado como COLABORADOR');
                }
                // Login PF/PJ normal
                else if (userInfo.user?.id) {
                    companyId = Number(userInfo.user.id);
                    companyType = userInfo.tipo?.toLowerCase() || typeUser || 'pf';
                    console.log('👤 Detectado como PF/PJ');
                }
                // Fallback (estrutura antiga)
                else {
                    companyId = Number(userInfo.id);
                    companyType = typeUser || userInfo.tipo_usuario || 'pf';
                    console.log('👤 Usando estrutura antiga');
                }

                console.log('🏢 Company ID:', companyId, typeof companyId);
                console.log('🏢 Company Type:', companyType);

                if (!companyId || companyId === 0 || isNaN(companyId)) {
                    console.error('❌ Company ID inválido:', companyId);
                    return null;
                }

                return {
                    companyId,
                    companyType
                };
            } catch (err) {
                console.error('❌ Erro ao parsear infosUserLogin:', err);
                return null;
            }
        }

        console.warn('⚠️ infosUserLogin não encontrado no localStorage');
        return null;
    };

    // Carregar usuários ao montar componente
    useEffect(() => {
        loadUsers();
        loadCollaborators();
    }, []);

    // Carregar Freelancers vinculados
    const loadUsers = async () => {
        setUsersLoading(true);
        setUsersError(null);
        try {
            const data = await userBusinessLinksApi.listCompanyUsers();
            setUsers(data);
        } catch (err) {
            setUsersError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
            console.error('Erro ao carregar usuários:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    // Carregar colaboradores
    const loadCollaborators = async () => {
        const companyData = getCompanyData();
        if (!companyData) {
            setCollaboratorsError('Dados da empresa não encontrados');
            return;
        }

        setCollaboratorsLoading(true);
        setCollaboratorsError(null);
        try {
            const data = await collaboratorsApi.listCompanyCollaborators(
                companyData.companyId,
                companyData.companyType
            );
            setCollaborators(data.collaborators || []);
        } catch (err) {
            setCollaboratorsError(err instanceof Error ? err.message : 'Erro ao carregar colaboradores');
            console.error('Erro ao carregar colaboradores:', err);
        } finally {
            setCollaboratorsLoading(false);
        }
    };

    const handleAddUser = async (email: string, permissions: any) => {
        try {
            await userBusinessLinksApi.addUserToCompany(email, permissions);
            alert(`✅ Usuário ${email} vinculado com sucesso!`);
            setIsAddUserModalOpen(false);
            await loadUsers(); // Recarregar lista
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao vincular usuário';
            alert(`❌ ${errorMsg}`);
            throw err; // Re-lançar para o modal tratar
        }
    };

    const handleToggleStatus = async (link: UserBusinessLink) => {
        const action = link.status === 1 ? 'desativar' : 'ativar';
        const newStatus = link.status === 1 ? 0 : 1;

        if (!confirm(`Tem certeza que deseja ${action} ${link.nome}?`)) {
            return;
        }

        setUsersLoading(true);
        try {
            await userBusinessLinksApi.updateLinkStatus(link.id, newStatus);
            alert(`✅ Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
            await loadUsers();
        } catch (err) {
            alert(`❌ Erro ao ${action} usuário`);
            console.error('Erro ao alterar status:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleRemoveUser = async (link: UserBusinessLink) => {
        if (!confirm(`Tem certeza que deseja REMOVER ${link.nome} da empresa?\n\nEsta ação não pode ser desfeita!`)) {
            return;
        }

        setUsersLoading(true);
        try {
            await userBusinessLinksApi.removeUserFromCompany(link.id);
            alert(`✅ Usuário removido com sucesso!`);
            await loadUsers();
        } catch (err) {
            alert(`❌ Erro ao remover usuário`);
            console.error('Erro ao remover:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return 'Data inválida';
        }
    };

    const getTipoLabel = (tipo: string) => {
        const tipos: Record<string, string> = {
            'pf': 'Pessoa Física',
            'pj': 'Pessoa Jurídica',
            'freelancer': 'Freelancer'
        };
        return tipos[tipo] || tipo;
    };

    const getTipoColor = (tipo: string) => {
        const colors: Record<string, string> = {
            'pf': 'bg-blue-100 text-blue-700',
            'pj': 'bg-purple-100 text-purple-700',
            'freelancer': 'bg-green-100 text-green-700'
        };
        return colors[tipo] || 'bg-gray-100 text-gray-700';
    };

    // ============ FUNÇÕES COLABORADORES ============

    const handleCreateCollaborator = () => {
        setSelectedCollaborator(null);
        setCollaboratorModalMode('create');
        setIsCollaboratorModalOpen(true);
    };

    const handleEditCollaborator = (collaborator: Collaborator) => {
        setSelectedCollaborator(collaborator);
        setCollaboratorModalMode('edit');
        setIsCollaboratorModalOpen(true);
    };

    const handleSaveCollaborator = async (data: any) => {
        const companyData = getCompanyData();
        if (!companyData) {
            throw new Error('Dados da empresa não encontrados');
        }

        console.log('🔍 Dados da empresa para criar colaborador:', companyData);
        console.log('📝 Dados do colaborador:', data);

        if (collaboratorModalMode === 'create') {
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                company_id: Number(companyData.companyId), // Garantir que é número
                company_type: companyData.companyType,
                permissions: data.permissions
            };

            console.log('📤 Payload que será enviado:', payload);

            await collaboratorsApi.createCollaborator(payload);
            alert('✅ Colaborador criado com sucesso!');
        } else if (selectedCollaborator) {
            await collaboratorsApi.updateCollaborator(selectedCollaborator.id, {
                name: data.name,
                permissions: data.permissions
            });
            alert('✅ Colaborador atualizado com sucesso!');
        }

        await loadCollaborators();
    };

    const handleEditPermissions = (user: UserBusinessLink) => {
        setSelectedUserForPermissions(user);
        setIsPermissionModalOpen(true);
    };

    const handleSavePermissions = async (linkId: number, permissions: any) => {
        try {
            await userBusinessLinksApi.updatePermissions(linkId, permissions);
            alert('✅ Permissões atualizadas com sucesso!');
            await loadUsers(); // Recarregar para atualizar estado local
        } catch (err) {
            alert('❌ Erro ao salvar permissões');
            console.error(err);
        }
    };

    const handleDeleteCollaborator = async (collaborator: Collaborator) => {
        if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE ${collaborator.name}?\n\n⚠️ ATENÇÃO: TODOS os arquivos e pastas criados por este usuário serão APAGADOS do sistema.\n\nEsta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            setCollaboratorsLoading(true);
            await collaboratorsApi.deactivateCollaborator(collaborator.id); // Mantendo nome da API por enquanto
            alert('✅ Colaborador e seus arquivos excluídos com sucesso!');
            await loadCollaborators();
        } catch (err) {
            alert('❌ Erro ao excluir colaborador');
            console.error('Erro ao excluir:', err);
        } finally {
            setCollaboratorsLoading(false);
        }
    };

    const getPermissionsCount = (permissions: any) => {
        return Object.values(permissions).filter(p => p === true).length;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl">
                            <Users size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{t('users.title')}</h1>
                            <p className="text-gray-600">{t('users.linked_freelancers')} & {t('users.collaborators')}</p>
                        </div>
                    </div>

                    {activeTab === 'users' ? (
                        <button
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold"
                        >
                            <MdPersonAdd size={20} />
                            {t('users.add_freelancer')}
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateCollaborator}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold"
                        >
                            <UserPlus size={20} />
                            {t('users.add_collaborator')}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'users'
                            ? 'text-red-700'
                            : 'text-gray-600 hover:text-red-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MdPeople size={20} />
                            {t('users.linked_freelancers')}
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                                {users.length}
                            </span>
                        </div>
                        {activeTab === 'users' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-700" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('collaborators')}
                        className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'collaborators'
                            ? 'text-red-700'
                            : 'text-gray-600 hover:text-red-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Shield size={20} />
                            {t('users.collaborators')}
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                                {collaborators.length}
                            </span>
                        </div>
                        {activeTab === 'collaborators' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-700" />
                        )}
                    </button>
                </div>

                {/* Estatísticas */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">{t('users.linked_freelancers')}</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">{users.length}</p>
                                </div>
                                <MdPeople size={32} className="text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">{t('users.active')}</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">
                                        {users.filter(u => u.status === 1).length}
                                    </p>
                                </div>
                                <TfiCheck size={32} className="text-green-400" />
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">{t('users.inactive')}</p>
                                    <p className="text-2xl font-bold text-red-700 mt-1">
                                        {users.filter(u => u.status === 0).length}
                                    </p>
                                </div>
                                <TfiClose size={32} className="text-red-400" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'collaborators' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">{t('users.collaborators')}</p>
                                    <p className="text-2xl font-bold text-purple-700 mt-1">{collaborators.length}</p>
                                </div>
                                <Shield size={32} className="text-purple-400" />
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">{t('users.active')}</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">
                                        {collaborators.filter(c => c.is_active).length}
                                    </p>
                                </div>
                                <TfiCheck size={32} className="text-green-400" />
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">{t('users.inactive')}</p>
                                    <p className="text-2xl font-bold text-red-700 mt-1">
                                        {collaborators.filter(c => !c.is_active).length}
                                    </p>
                                </div>
                                <TfiClose size={32} className="text-red-400" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Conteúdo das Abas */}
            {activeTab === 'users' && (
                <UsersTab
                    users={users}
                    loading={usersLoading}
                    error={usersError}
                    onToggleStatus={handleToggleStatus}
                    onRemoveUser={handleRemoveUser}
                    onAddUser={() => setIsAddUserModalOpen(true)}
                    onEditPermissions={handleEditPermissions}
                    formatDate={formatDate}
                    getTipoLabel={getTipoLabel}
                    getTipoColor={getTipoColor}
                />
            )}

            {activeTab === 'collaborators' && (
                <CollaboratorsTab
                    collaborators={collaborators}
                    loading={collaboratorsLoading}
                    error={collaboratorsError}
                    onEditCollaborator={handleEditCollaborator}
                    onDeleteCollaborator={handleDeleteCollaborator}
                    onCreateCollaborator={handleCreateCollaborator}
                    formatDate={formatDate}
                    getPermissionsCount={getPermissionsCount}
                />
            )}

            {/* Modais */}
            <AddUserToCompanyModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onConfirm={handleAddUser}
            />

            <CollaboratorModal
                isOpen={isCollaboratorModalOpen}
                onClose={() => setIsCollaboratorModalOpen(false)}
                onSave={handleSaveCollaborator}
                collaborator={selectedCollaborator}
                mode={collaboratorModalMode}
            />

            <FreelancerPermissionsModal
                isOpen={isPermissionModalOpen}
                onClose={() => setIsPermissionModalOpen(false)}
                onSave={handleSavePermissions}
                user={selectedUserForPermissions}
            />
        </div>
    );
};

// ============ COMPONENTE USERS TAB ============

interface UsersTabProps {
    users: UserBusinessLink[];
    loading: boolean;
    error: string | null;
    onToggleStatus: (link: UserBusinessLink) => void;
    onRemoveUser: (link: UserBusinessLink) => void;
    onAddUser: () => void;
    onEditPermissions: (link: UserBusinessLink) => void;
    formatDate: (date: string) => string;
    getTipoLabel: (tipo: string) => string;
    getTipoColor: (tipo: string) => string;
}

const UsersTab: React.FC<UsersTabProps> = ({
    users,
    loading,
    error,
    onToggleStatus,
    onRemoveUser,
    onAddUser,
    onEditPermissions,
    formatDate,
    getTipoLabel,
    getTipoColor
}) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MdPeople size={24} className="text-red-700" />
                {t('users.linked_freelancers')}
            </h2>

            {/* Indicador de erro */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-red-600 mr-3">❌</div>
                        <div>
                            <h4 className="text-red-800 font-medium">{t('common.error')}</h4>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Indicador de loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-200 border-t-red-600"></div>
                    <span className="ml-3 text-gray-600">{t('users.loading')}</span>
                </div>
            )}

            {/* Lista vazia */}
            {!loading && users.length === 0 && (
                <div className="text-center py-12">
                    <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <MdPeople size={40} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        {t('users.no_users')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('users.start_adding')}
                    </p>
                    <button
                        onClick={onAddUser}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium"
                    >
                        <MdPersonAdd className="inline mr-2" size={18} />
                        {t('users.link_first_user')}
                    </button>
                </div>
            )}

            {/* Tabela de usuários */}
            {!loading && users.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('users.name')}</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vinculado em</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-gray-100 hover:bg-red-50/50 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-semibold">
                                                {user.nome ? user.nome.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{user.nome || 'Sem nome'}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <TfiEmail size={12} />
                                                    {user.email || 'Sem email'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(user.type_user)}`}>
                                            {getTipoLabel(user.type_user)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {user.status === 1 ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <TfiCheck size={12} className="mr-1" />
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <TfiClose size={12} className="mr-1" />
                                                Inativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            <TfiCalendar size={12} />
                                            {formatDate(user.created_at)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEditPermissions(user)}
                                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium flex items-center gap-1"
                                                title="Gerenciar Permissões"
                                            >
                                                <Shield size={14} />
                                            </button>
                                            <button
                                                onClick={() => onToggleStatus(user)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.status === 1
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                                title={user.status === 1 ? 'Desativar' : 'Ativar'}
                                            >
                                                {user.status === 1 ? 'Desativar' : 'Ativar'}
                                            </button>
                                            <button
                                                onClick={() => onRemoveUser(user)}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium flex items-center gap-1"
                                                title="Remover usuário"
                                            >
                                                <TfiTrash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ============ COMPONENTE COLLABORATORS TAB ============

interface CollaboratorsTabProps {
    collaborators: Collaborator[];
    loading: boolean;
    error: string | null;
    onEditCollaborator: (collaborator: Collaborator) => void;
    onDeleteCollaborator: (collaborator: Collaborator) => void;
    onCreateCollaborator: () => void;
    formatDate: (date: string) => string;
    getPermissionsCount: (permissions: any) => number;
}

const CollaboratorsTab: React.FC<CollaboratorsTabProps> = ({
    collaborators,
    loading,
    error,
    onEditCollaborator,
    onDeleteCollaborator,
    onCreateCollaborator,
    formatDate,
    getPermissionsCount
}) => {
    const { t } = useTranslation();
    const getPermissionBadges = (permissions: any) => {
        const badges = [];
        if (permissions.manage_files) badges.push({ label: t('users.manage_files'), color: 'blue' });
        if (permissions.view_metrics) badges.push({ label: t('users.view_metrics'), color: 'green' });
        if (permissions.view_only) badges.push({ label: t('users.view_only'), color: 'yellow' });
        if (permissions.manage_collaborators) badges.push({ label: t('users.manage_collaborators'), color: 'purple' });
        if (permissions.view_shared) badges.push({ label: t('modals.share.view_only'), color: 'red' });
        return badges;
    };

    const getBadgeColor = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-700',
            green: 'bg-green-100 text-green-700',
            yellow: 'bg-red-100 text-red-700',
            purple: 'bg-purple-100 text-purple-700',
            red: 'bg-red-100 text-red-800'
        };
        return colors[color] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={24} className="text-red-700" />
                {t('users.collaborators')}
            </h2>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    {t('users.collaborators_tip')}
                </p>
            </div>

            {/* Indicador de erro */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-red-600 mr-3">❌</div>
                        <div>
                            <h4 className="text-red-800 font-medium">{t('common.error')}</h4>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Indicador de loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-200 border-t-red-600"></div>
                    <span className="ml-3 text-gray-600">{t('users.loading')}</span>
                </div>
            )}

            {/* Lista vazia */}
            {!loading && collaborators.length === 0 && (
                <div className="text-center py-12">
                    <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                        <Shield size={40} className="text-purple-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        {t('users.no_collaborators')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('users.no_collaborators_desc')}
                    </p>
                    <button
                        onClick={onCreateCollaborator}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium"
                    >
                        <UserPlus className="inline mr-2" size={18} />
                        {t('users.add_collaborator')}
                    </button>
                </div>
            )}

            {/* Lista de colaboradores */}
            {!loading && collaborators.length > 0 && (
                <div className="space-y-4">
                    {collaborators.map((collaborator) => {
                        const badges = getPermissionBadges(collaborator.permissions);
                        return (
                            <div
                                key={collaborator.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                            {collaborator.name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Informações */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{collaborator.name}</h3>
                                                {collaborator.is_active ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <TfiCheck size={10} className="mr-1" />
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        <TfiClose size={10} className="mr-1" />
                                                        Inativo
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                                                <TfiEmail size={12} />
                                                {collaborator.email}
                                            </p>

                                            {/* Permissões */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {badges.length > 0 ? (
                                                    badges.map((badge, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getBadgeColor(badge.color)}`}
                                                        >
                                                            <Shield size={10} className="mr-1" />
                                                            {badge.label}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500 italic">Nenhuma permissão ativa</span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <TfiCalendar size={10} />
                                                Criado em {formatDate(collaborator.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => onEditCollaborator(collaborator)}
                                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                            title="Editar colaborador"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteCollaborator(collaborator)}
                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            title="Excluir Colaborador e Arquivos"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CompanyUsers;
