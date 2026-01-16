import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TfiClose, TfiFile, TfiFolder, TfiShare, TfiTrash, TfiCalendar, TfiUser, TfiTag, TfiEye, TfiBell, TfiTime } from 'react-icons/tfi';
import { MdEdit, MdPeople, MdPersonAdd, MdHistory, MdCreateNewFolder, MdDriveFileMove } from 'react-icons/md';
import { VerifyDataExistInJson } from '../../../../services/funcitons';
import { getStatusColorWithBorder, getStatusIcon, getStatusLabel } from '../../status/statusConfig';
import { Seguidor, UsuarioAtualSegue } from '../../../../services/followDocumentApi';
import { getNodeShares, Compartilhamento, formatUserType, getUserTypeBadgeColor } from '../../../../services/sharesApi';
import { storageApi, DocumentHistoryItem } from '../../../../services/storageApi';
import AddFollowerModal from './AddFollowerModal';
import { hasPermission } from '../../../../hooks/useCollaboratorPermissions';

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    parentId?: string;
    createdAt: string;
    size?: string;
    extension?: string;
    status?: string;
    validityDate?: string;
    comments?: string;
    // Campos de seguimento
    seguidores?: Seguidor[];
    total_seguidores?: number;
    usuario_atual_segue?: UsuarioAtualSegue;
    usuario_e_dono?: boolean;
    allowEditing?: boolean;
}

interface FileInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileItem | null;
    onEdit?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onViewFile?: () => void;
    onFollow?: () => void;
    onUnfollow?: () => void;
    onAddFollower?: (email: string, diasAntes: number, alertarNoVencimento: boolean) => void;
}

const FileInfoModal: React.FC<FileInfoModalProps> = ({
    isOpen,
    onClose,
    file,
    onEdit,
    onShare,
    onDelete,
    onViewFile,
    onFollow,
    onUnfollow,
    onAddFollower
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'info' | 'seguidores' | 'compartilhamentos' | 'historico'>('info');
    const [isAddFollowerModalOpen, setIsAddFollowerModalOpen] = useState(false);
    const [addingFollower, setAddingFollower] = useState(false);

    // Estados para compartilhamentos
    const [compartilhamentos, setCompartilhamentos] = useState<Compartilhamento[]>([]);
    const [totalCompartilhamentos, setTotalCompartilhamentos] = useState(0);
    const [loadingShares, setLoadingShares] = useState(false);
    const [sharesError, setSharesError] = useState<string | null>(null);

    // Estados para histórico
    const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // Buscar histórico quando a aba for aberta
    useEffect(() => {
        if (activeTab === 'historico' && file) {
            loadHistory();
        }
    }, [activeTab, file]);

    const loadHistory = async () => {
        if (!file) return;

        setLoadingHistory(true);
        setHistoryError(null);

        try {
            const data = await storageApi.getDocumentHistory(Number(file.id));
            setHistory(data.historico);
        } catch (error: any) {
            console.error('Erro ao carregar histórico:', error);
            setHistoryError(error.message || 'Erro ao carregar histórico');
            setHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Buscar compartilhamentos quando a aba for aberta
    useEffect(() => {
        if (activeTab === 'compartilhamentos' && file && file.type === 'file') {
            loadCompartilhamentos();
        }
    }, [activeTab, file]);

    const loadCompartilhamentos = async () => {
        if (!file) return;

        setLoadingShares(true);
        setSharesError(null);

        try {
            const data = await getNodeShares(Number(file.id));
            setCompartilhamentos(data.compartilhamentos);
            setTotalCompartilhamentos(data.total_compartilhamentos);
        } catch (error: any) {
            console.error('Erro ao carregar compartilhamentos:', error);
            setSharesError(error.message || 'Erro ao carregar compartilhamentos');
            setCompartilhamentos([]);
            setTotalCompartilhamentos(0);
        } finally {
            setLoadingShares(false);
        }
    };

    if (!isOpen || !file) return null;

    // Verificar permissões do usuário (planos + permissões de colaborador)
    const hasPlanoEdit = VerifyDataExistInJson('GEDMASTER') ||
        VerifyDataExistInJson('GEDADM') ||
        VerifyDataExistInJson('GEDEDUIT');

    const hasPlanoDelete = VerifyDataExistInJson('GEDMASTER') ||
        VerifyDataExistInJson('GEDADM') ||
        VerifyDataExistInJson('GEDEDUIT');

    const hasPlanoShare = VerifyDataExistInJson('GEDMASTER') ||
        VerifyDataExistInJson('GEDADM') ||
        VerifyDataExistInJson('GEDSHARED');

    // Combinar permissões de plano com permissões de colaborador OU permissão de compartilhamento
    const canEdit = (hasPlanoEdit && hasPermission('manage_files')) || file.allowEditing;
    const canDelete = (hasPlanoDelete && hasPermission('manage_files')) || file.allowEditing;
    const canShare = hasPlanoShare && hasPermission('manage_files');

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Data não disponível';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return 'Data inválida';
        }
    };

    const formatDateTime = (dateString: string | undefined) => {
        if (!dateString) return 'Data não disponível';
        try {
            const date = new Date(dateString);
            return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } catch {
            return 'Data inválida';
        }
    };

    // Mostrar aba de seguidores apenas para arquivos
    const showSeguidoresTab = file.type === 'file';

    return (
        <>
            {/* Backdrop com blur */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 ">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideIn">
                    {/* Header clean */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    {file.type === 'folder' ? <TfiFolder size={24} className="text-gray-600" /> : <TfiFile size={24} className="text-gray-600" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{file.type === 'folder' ? t('modals.file_info.folder_title') : t('modals.file_info.title')}</h2>
                                    <p className="text-gray-500 text-sm">{t('modals.file_info.subtitle')}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                            >
                                <TfiClose size={20} />
                            </button>
                        </div>

                        {/* Tabs - apenas para arquivos */}
                        {showSeguidoresTab && (
                            <div className="flex gap-2 mt-4 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === 'info'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <TfiFile size={16} />
                                        {t('modals.file_info.tab_info')}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('seguidores')}
                                    className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === 'seguidores'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MdPeople size={18} />
                                        {t('modals.file_info.tab_followers')}
                                        {file.total_seguidores !== undefined && file.total_seguidores > 0 && (
                                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                {file.total_seguidores}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('compartilhamentos')}
                                    className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === 'compartilhamentos'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <TfiShare size={16} />
                                        {t('modals.file_info.tab_shares')}
                                        {totalCompartilhamentos > 0 && (
                                            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                {totalCompartilhamentos}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('historico')}
                                    className={`px-3 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${activeTab === 'historico'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    title={t('modals.file_info.tab_history')}
                                >
                                    <div className="flex items-center gap-1">
                                        <MdHistory size={18} />
                                        <span className="hidden sm:inline">{t('modals.file_info.history')}</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Conteúdo principal */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        {activeTab === 'info' ? (
                            <>{/* ABA DE INFORMAÇÕES */}
                                {/* Nome do arquivo */}
                                <div className="mb-6">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{file.name}</h3>
                                        <p className="text-sm text-gray-500 capitalize">{file.type === 'folder' ? t('modals.file_info.folder') : t('modals.file_info.file')}</p>
                                    </div>
                                </div>

                                {/* Informações em grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* Data de criação */}
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <TfiCalendar className="text-blue-600" size={16} />
                                            <span className="text-sm font-medium text-blue-800">{t('modals.file_info.created_at')}</span>
                                        </div>
                                        <p className="text-blue-700 font-semibold">{formatDate(file.createdAt)}</p>
                                    </div>

                                    {/* Tamanho (se for arquivo) */}
                                    {file.type === 'file' && file.size && (
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <TfiTag className="text-green-600" size={16} />
                                                <span className="text-sm font-medium text-green-800">{t('modals.file_info.size')}</span>
                                            </div>
                                            <p className="text-green-700 font-semibold">{file.size}</p>
                                        </div>
                                    )}

                                    {/* Status */}
                                    {file.status && (
                                        <div className={`rounded-lg p-4 border ${getStatusColorWithBorder(file.status)}`}>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <TfiTag size={16} />
                                                <span className="text-sm font-medium flex items-center gap-1">{t('modals.file_info.status')} {getStatusIcon(file.status)}</span>
                                            </div>
                                            <p className="font-semibold flex items-center gap-2">{getStatusIcon(file.status)} {getStatusLabel(file.status)}</p>
                                        </div>
                                    )}

                                    {/* Data de validade */}
                                    {file.validityDate && (
                                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <TfiCalendar className="text-purple-600" size={16} />
                                                <span className="text-sm font-medium text-purple-800">{t('modals.file_info.validity')}</span>
                                            </div>
                                            <p className="text-purple-700 font-semibold">{formatDate(file.validityDate)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Comentários */}
                                {file.comments && (
                                    <div className="mb-6">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <TfiUser size={14} className="mr-2" />
                                                {t('modals.file_info.comments')}
                                            </h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">{file.comments}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Botões de ação */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                    {/* Botão Ver Arquivo - sempre disponível */}
                                    {onViewFile && (
                                        <button
                                            onClick={onViewFile}
                                            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                            style={{ backgroundColor: '#f37329' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
                                        >
                                            <TfiEye size={16} />
                                            {t('actions.view_file')}
                                        </button>
                                    )}
                                    {canShare && onShare && (
                                        <button
                                            onClick={onShare}
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg transition-colors duration-200 shadow-sm"
                                            style={{ backgroundColor: '#DCDCDC' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c5c5c5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DCDCDC'}
                                        >
                                            <TfiShare size={16} />
                                        </button>
                                    )}
                                    {canEdit && onEdit && (
                                        <button
                                            onClick={onEdit}
                                            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                            style={{ backgroundColor: '#f37329' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
                                        >
                                            <MdEdit size={16} />
                                        </button>
                                    )}
                                    {/* Botões de Seguir - apenas para arquivos */}
                                    {file.type === 'file' && (
                                        <>
                                            {file.usuario_atual_segue?.seguindo ? (
                                                <>
                                                    <button
                                                        onClick={onFollow}
                                                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                                        style={{ backgroundColor: '#10B981' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                                                        title={t('actions.configure_alerts')}
                                                    >
                                                        <TfiBell size={16} />
                                                    </button>
                                                    {!file.usuario_e_dono && onUnfollow && (
                                                        <button
                                                            onClick={onUnfollow}
                                                            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm bg-gray-500 hover:bg-gray-600"
                                                            title="Deixar de seguir"
                                                        >
                                                            <TfiBell size={16} />
                                                            Deixar de Seguir
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                onFollow && (
                                                    <button
                                                        onClick={onFollow}
                                                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                                        style={{ backgroundColor: '#3B82F6' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                                                        title="Seguir documento"
                                                    >
                                                        <TfiBell size={16} />
                                                        Seguir Documento
                                                    </button>
                                                )
                                            )}
                                        </>
                                    )}
                                    {canDelete && onDelete && (
                                        <button
                                            onClick={onDelete}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
                                        >
                                            <TfiTrash size={16} />

                                        </button>
                                    )}
                                </div>
                            </>
                        ) : activeTab === 'seguidores' ? (
                            <>{/* ABA DE SEGUIDORES */}
                                <div className="space-y-4">
                                    {/* Header da lista com botão adicionar */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                <MdPeople size={24} />
                                                Seguidores do Documento
                                            </h3>
                                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                                                {file.total_seguidores || 0} {file.total_seguidores === 1 ? 'seguidor' : 'seguidores'}
                                            </span>
                                        </div>

                                        {/* Botão Adicionar Seguidor - apenas para donos do arquivo */}
                                        {file.usuario_e_dono && onAddFollower && (
                                            <button
                                                onClick={() => setIsAddFollowerModalOpen(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm font-medium"
                                                title="Adicionar seguidor por email"
                                            >
                                                <MdPersonAdd size={18} />
                                                <span className="hidden sm:inline">Adicionar Seguidor</span>
                                                <span className="sm:hidden">Adicionar</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Lista de seguidores */}
                                    {file.seguidores && file.seguidores.length > 0 ? (
                                        <div className="space-y-3">
                                            {file.seguidores.map((seguidor) => (
                                                <div
                                                    key={seguidor.seguidor_id}
                                                    className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-3 flex-1">
                                                            {/* Avatar */}
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                                {seguidor.usuario.nome.charAt(0).toUpperCase()}
                                                            </div>

                                                            {/* Informações do seguidor */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-800 truncate">
                                                                    {seguidor.usuario.nome}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {seguidor.usuario.email}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                                        {seguidor.usuario.tipo}
                                                                    </span>
                                                                    {seguidor.dias_antes_alerta > 0 && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                            <TfiBell size={10} className="mr-1" />
                                                                            {seguidor.dias_antes_alerta} dias antes
                                                                        </span>
                                                                    )}
                                                                    {seguidor.alertar_no_vencimento && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                            <TfiCalendar size={10} className="mr-1" />
                                                                            No vencimento
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Data que começou a seguir */}
                                                        <div className="text-right ml-2 flex-shrink-0">
                                                            <p className="text-xs text-gray-500">Seguindo desde</p>
                                                            <p className="text-xs font-medium text-gray-700">
                                                                {formatDateTime(seguidor.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                                <MdPeople size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                Nenhum seguidor ainda
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Este documento ainda não está sendo seguido por ninguém.
                                            </p>
                                        </div>
                                    )}

                                    {/* Info adicional sobre você */}
                                    {file.usuario_atual_segue?.seguindo && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-start gap-3">
                                                <TfiBell className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-blue-800 mb-1">
                                                        Você está seguindo este documento
                                                    </h4>
                                                    <p className="text-xs text-blue-700">
                                                        Alertas configurados: {file.usuario_atual_segue.dias_antes_alerta} dias antes
                                                        {file.usuario_atual_segue.alertar_no_vencimento && ' + alerta no vencimento'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {file.usuario_e_dono && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-start gap-3">
                                                <TfiUser className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-green-800 mb-1">
                                                        Você é o dono deste documento
                                                    </h4>
                                                    <p className="text-xs text-green-700">
                                                        Como dono, você automaticamente segue e recebe todas as notificações.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : activeTab === 'compartilhamentos' ? (
                            <>{/* ABA DE COMPARTILHAMENTOS */}
                                <div className="space-y-4">
                                    {/* Header da lista */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                <TfiShare size={24} />
                                                Compartilhado com
                                            </h3>
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                                                {totalCompartilhamentos} {totalCompartilhamentos === 1 ? 'pessoa' : 'pessoas'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Loading */}
                                    {loadingShares && (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 animate-pulse">
                                                <TfiShare size={32} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">Carregando compartilhamentos...</p>
                                        </div>
                                    )}

                                    {/* Erro */}
                                    {sharesError && !loadingShares && (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                                <TfiShare size={32} className="text-red-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                Erro ao carregar
                                            </h3>
                                            <p className="text-sm text-red-600 mb-4">{sharesError}</p>
                                            <button
                                                onClick={loadCompartilhamentos}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                Tentar novamente
                                            </button>
                                        </div>
                                    )}

                                    {/* Lista de compartilhamentos */}
                                    {!loadingShares && !sharesError && compartilhamentos.length > 0 && (
                                        <div className="space-y-3">
                                            {compartilhamentos.map((comp) => (
                                                <div
                                                    key={comp.share_id}
                                                    className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-3 flex-1">
                                                            {/* Avatar */}
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                                {comp.compartilhado_com.nome.charAt(0).toUpperCase()}
                                                            </div>

                                                            {/* Informações de quem recebeu */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-800 truncate">
                                                                    {comp.compartilhado_com.nome}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {comp.compartilhado_com.email}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeBadgeColor(comp.compartilhado_com.tipo)}`}>
                                                                        {formatUserType(comp.compartilhado_com.tipo)}
                                                                    </span>
                                                                    {comp.compartilhado_com.tipo === 'collaborator' && comp.compartilhado_com.company_id && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                            Empresa #{comp.compartilhado_com.company_id}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Informação de quem compartilhou */}
                                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                                    <p className="text-xs text-gray-500">
                                                                        Compartilhado por <span className="font-medium text-gray-700">{comp.compartilhado_por.nome}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Data do compartilhamento */}
                                                        <div className="text-right ml-2 flex-shrink-0">
                                                            <p className="text-xs text-gray-500">Compartilhado em</p>
                                                            <p className="text-xs font-medium text-gray-700">
                                                                {formatDateTime(comp.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {!loadingShares && !sharesError && compartilhamentos.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                                <TfiShare size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                Nenhum compartilhamento
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Este documento ainda não foi compartilhado com ninguém.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : activeTab === 'historico' ? (
                            <>{/* ABA DE HISTÓRICO */}
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                <MdHistory size={24} />
                                                Histórico de Movimentações
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Loading */}
                                    {loadingHistory && (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 animate-pulse">
                                                <MdHistory size={32} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">Carregando histórico...</p>
                                        </div>
                                    )}

                                    {/* Erro */}
                                    {historyError && !loadingHistory && (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                                <MdHistory size={32} className="text-red-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                Erro ao carregar
                                            </h3>
                                            <p className="text-sm text-red-600 mb-4">{historyError}</p>
                                            <button
                                                onClick={loadHistory}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                Tentar novamente
                                            </button>
                                        </div>
                                    )}

                                    {!loadingHistory && !historyError && history.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                                <MdHistory size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                Nenhum histórico
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Nenhuma atividade registrada para este documento.
                                            </p>
                                        </div>
                                    )}

                                    {!loadingHistory && !historyError && history.length > 0 && (
                                        <div className="relative">
                                            {/* Linha vertical da timeline */}
                                            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                            <div className="space-y-6">
                                                {history.map((item) => {
                                                    // Determinar ícone e cor baseado na ação
                                                    let Icon = MdHistory;
                                                    let colorClass = "bg-gray-500";

                                                    switch (item.acao) {
                                                        case 'created':
                                                        case 'uploaded':
                                                            Icon = MdCreateNewFolder;
                                                            colorClass = "bg-green-500";
                                                            break;
                                                        case 'edited':
                                                        case 'renamed':
                                                            Icon = MdEdit;
                                                            colorClass = "bg-blue-500";
                                                            break;
                                                        case 'moved':
                                                            Icon = MdDriveFileMove;
                                                            colorClass = "bg-red-600";
                                                            break;
                                                        case 'deleted':
                                                        case 'permanently_deleted':
                                                            Icon = TfiTrash;
                                                            colorClass = "bg-red-500";
                                                            break;
                                                        case 'shared':
                                                        case 'unshared':
                                                            Icon = TfiShare;
                                                            colorClass = "bg-purple-500";
                                                            break;
                                                        case 'viewed':
                                                        case 'downloaded':
                                                            Icon = TfiEye;
                                                            colorClass = "bg-gray-400";
                                                            break;
                                                        case 'permission_changed':
                                                            Icon = TfiTag;
                                                            colorClass = "bg-red-500";
                                                            break;
                                                    }

                                                    return (
                                                        <div key={item.id} className="relative flex gap-4">
                                                            <div className="relative z-10 flex-shrink-0">
                                                                <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shadow-md`}>
                                                                    <Icon className="text-white" size={item.acao === 'shared' || item.acao === 'viewed' ? 16 : 20} />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="font-semibold text-gray-800">{item.acao_descricao}</h4>
                                                                    <span className="text-xs text-gray-500">{formatDateTime(item.data_hora)}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    Realizado por <span className="font-medium">{item.usuario.nome}</span>
                                                                </p>

                                                                {/* Detalhes específicos */}
                                                                {item.detalhes && Object.keys(item.detalhes).length > 0 && (
                                                                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200 mt-2">
                                                                        {item.acao === 'moved' && item.detalhes.from_folder && (
                                                                            <>
                                                                                <span className="font-medium">De:</span> {item.detalhes.from_folder}<br />
                                                                                <span className="font-medium">Para:</span> {item.detalhes.to_folder}
                                                                            </>
                                                                        )}
                                                                        {item.acao === 'renamed' && (
                                                                            <>
                                                                                <span className="font-medium">De:</span> {item.detalhes.old_name}<br />
                                                                                <span className="font-medium">Para:</span> {item.detalhes.new_name}
                                                                            </>
                                                                        )}
                                                                        {item.detalhes.old_version && (
                                                                            <div className="mt-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                                                <p className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                                                                                    <MdHistory size={16} /> Versão Anterior Salva
                                                                                </p>
                                                                                <div className="text-xs text-gray-600 mb-3 space-y-1">
                                                                                    <p>Substituído em: {formatDateTime(item.data_hora)}</p>
                                                                                    <p>Tamanho: {item.detalhes.old_version.size}</p>
                                                                                </div>
                                                                                <a
                                                                                    href={item.detalhes.old_version.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-2 text-xs font-medium bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition shadow-sm"
                                                                                >
                                                                                    <TfiEye size={14} /> Ver/Baixar Versão Antiga
                                                                                </a>
                                                                            </div>
                                                                        )}

                                                                        {item.detalhes.changes && Array.isArray(item.detalhes.changes) && (
                                                                            <div className="mt-2 space-y-2 bg-gray-50 p-2 rounded border border-gray-100">
                                                                                {item.detalhes.changes.map((change: any, idx: number) => (
                                                                                    <div key={idx} className="text-sm">
                                                                                        <span className="font-semibold text-gray-700 block mb-0.5">{change.label}</span>
                                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                                            <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs line-through">{change.old || 'Vazio'}</span>
                                                                                            <span className="text-gray-400">➔</span>
                                                                                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">{change.new || 'Vazio'}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {item.acao !== 'moved' && item.acao !== 'renamed' && !item.detalhes.old_version && !item.detalhes.changes && (
                                                                            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-400 mt-1">
                                                                                {JSON.stringify(item.detalhes, null, 2)}
                                                                            </pre>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Modal Adicionar Seguidor */}
            <AddFollowerModal
                isOpen={isAddFollowerModalOpen}
                onClose={() => setIsAddFollowerModalOpen(false)}
                loading={addingFollower}
                onConfirm={async (email, diasAntes, alertarNoVencimento) => {
                    if (!onAddFollower) return;

                    setAddingFollower(true);
                    try {
                        await onAddFollower(email, diasAntes, alertarNoVencimento);
                        setIsAddFollowerModalOpen(false);
                    } catch (error) {
                        console.error('Erro ao adicionar seguidor:', error);
                    } finally {
                        setAddingFollower(false);
                    }
                }}
            />
        </>
    );
};

export default FileInfoModal;
