import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { TfiFolder, TfiFile, TfiPlus, TfiArrowLeft, TfiSearch, TfiUpload, TfiImage, TfiVideoCamera, TfiMusic, TfiClose } from "react-icons/tfi";
import { MdCreateNewFolder, MdNoteAdd, MdPictureAsPdf, MdDescription, MdTableChart, MdSlideshow, MdFilterList, MdFileDownload } from "react-icons/md";
import * as XLSX from 'xlsx';
import CreateFolderModal from "../components/modals/CreateFolderModal";
import CreateDocumentModal from "../components/modals/CreateDocumentModal";
import FileInfoModal from "../components/modals/FileInfoModal";
import ShareModal from "../components/modals/ShareModal";
import EditFileModal from "../components/modals/EditFileModal";
import EditFolderModal from "../components/modals/EditFolderModal";
import FollowConfigModal from "../components/modals/FollowConfigModal";
import MoveFolderModal from "../components/modals/MoveFolderModal";
import ImageViewerModal from "../components/modals/ImageViewerModal";
import VideoPlayerModal from "../components/modals/VideoPlayerModal";
import { FilterDrawer } from "../components/FilterDrawer";
import { debugUserInfo } from "../../../services/debugUserInfo";
import DocumentViewerModal from "../components/modals/DocumentViewerModal";
import RealFileViewerModal from "../components/modals/RealFileViewerModal";
import { STATUS_OPTIONS, getStatusColor, getStatusIcon, getStatusLabel, buildStatusFilterList } from "../status/statusConfig";
import { storageApi } from "../../../services/storageApi";
import { followDocumentApi, Seguidor, UsuarioAtualSegue } from "../../../services/followDocumentApi";
import { hasPermission } from "../../../hooks/useCollaboratorPermissions";

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    parentId?: string;
    createdAt: string;
    size?: string;
    extension?: string;
    status?: string; // dinâmico
    validityDate?: string;
    comments?: string;
    url?: string;
    // Campos de seguimento
    seguidores?: Seguidor[];
    total_seguidores?: number;
    usuario_atual_segue?: UsuarioAtualSegue;
    usuario_e_dono?: boolean;
    allowEditing?: boolean;
    sharedByName?: string; // Quem compartilhou
}

interface BreadcrumbItem {
    id: string;
    name: string;
}

const Documents = () => {
    const { t } = useTranslation();
    const [currentFolderId, setCurrentFolderId] = useState<string>('root');
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
        { id: 'root', name: t('dashboard.documents') }
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('todos');
    const [selectedFileType, setSelectedFileType] = useState<string>('todos');
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
    const [isFileInfoModalOpen, setIsFileInfoModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
    const [isFollowConfigModalOpen, setIsFollowConfigModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
    const [isRealFileViewerOpen, setIsRealFileViewerOpen] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null); // Menu de ações aberto
    const [visibleCount, setVisibleCount] = useState<number>(50); // Virtualização: itens visíveis


    // Estados para API
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allFiles, setAllFiles] = useState<FileItem[]>([]); // Para busca global

    // Configurações (podem vir de context/props)
    const businessId = 1; // TODO: pegar do contexto do usuário

    // Carregar arquivos compartilhados comigo
    const loadSharedFiles = async (): Promise<FileItem[]> => {
        try {
            // Obter email do usuário do localStorage
            const userInfo = localStorage.getItem('infosUserLogin');
            let userEmail = 'l34421574@gmail.com'; // email padrão como fallback

            if (userInfo) {
                try {
                    const user = JSON.parse(userInfo);
                    userEmail = user.user?.email || userEmail;
                } catch (error) {
                    console.error('Erro ao parsear informações do usuário:', error);
                }
            }

            // Codificar o email para URL
            const encodedEmail = encodeURIComponent(userEmail);
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${API_BASE_URL}/api/v1/shares/shared_with_me/by-email/${encodedEmail}`);

            if (!response.ok) {
                throw new Error(`Erro ao carregar arquivos compartilhados: ${response.status}`);
            }

            const sharedData = await response.json();
            console.log('📤 Dados compartilhados recebidos:', sharedData);

            // Converter os dados da API para o formato FileItem
            return sharedData.map((item: any): FileItem => ({
                id: item.id?.toString() || '',
                name: item.name || 'Sem nome',
                type: item.type === 'folder' ? 'folder' : 'file',
                parentId: item.parent_id ? item.parent_id.toString() : null,
                createdAt: item.created_at || new Date().toISOString(),
                size: item.size || undefined,
                extension: item.extension || undefined,
                status: item.status || 'compartilhado',
                url: item.url || undefined,
                comments: item.comments || undefined,
                validityDate: item.data_validade || undefined,
                // Campos de seguimento
                seguidores: item.seguidores || undefined,
                total_seguidores: item.total_seguidores || 0,
                usuario_atual_segue: item.usuario_atual_segue || undefined,
                usuario_e_dono: item.usuario_e_dono || false,
                allowEditing: item.allow_editing || false,
                sharedByName: item.shared_by_name || undefined
            }));
        } catch (error) {
            console.error('Erro ao carregar arquivos compartilhados:', error);
            throw error;
        }
    };

    // Carregar arquivos da pasta atual
    const loadFiles = async (folderId: string = currentFolderId) => {
        setLoading(true);
        setError(null);
        try {
            const isFiltering = selectedStatus !== 'todos' || selectedFileType !== 'todos' || searchTerm !== '';

            const filters = {
                status: selectedStatus,
                file_type: selectedFileType,
                search_term: searchTerm
            };

            let folderFiles: FileItem[] = [];

            if (isFiltering) {
                // MODO FILTRO: Busca Global / Flattened (Independente da pasta)
                // Atende: "mostrar so os arquivos que batem naquele status, independente da pasta"
                console.log('🔍 Modo Filtro Ativo: Buscando globalmente...');
                folderFiles = await storageApi.searchAllFiles(businessId, filters);

                // Garantir que SÓ ARQUIVOS apareçam quando filtrado (sem pastas)
                // Atende: "mostrar so os arquivos... puxou tudo que é pasta"
                folderFiles = folderFiles.filter(f => f.type === 'file');
            } else if (folderId === 'shared_with_me') {
                // Carregar TODOS os arquivos compartilhados comigo
                // ⚠️ Na raiz de "Compartilhados Comigo", mostramos TUDO que foi compartilhado
                // Não importa se está dentro de pastas ou não no sistema original
                folderFiles = await loadSharedFiles();

                // ⚠️ CORREÇÃO: Filtrar apenas os itens "Raiz" do compartilhamento
                // (Esconder arquivos que estão dentro de pastas já compartilhadas)
                const sharedIds = new Set(folderFiles.map(f => f.id));
                folderFiles = folderFiles.filter(item => {
                    // Se não tiver pai, é raiz -> Mostra
                    if (!item.parentId) return true;
                    // Se o pai NÃO estiver na lista de compartilhados -> É "raiz" desse compartilhamento (arquivo avulso) -> Mostra
                    // Se o pai ESTIVER na lista -> É filho de uma pasta compartilhada -> Esconde (user deve entrar na pasta)
                    return !sharedIds.has(item.parentId);
                });

                console.log('📂 Arquivos compartilhados (Filtrados Raiz):', folderFiles);
            } else if (breadcrumb.some(b => b.id === 'shared_with_me')) {
                // Estamos navegando dentro de uma pasta compartilhada
                const allSharedFiles = await loadSharedFiles();
                folderFiles = allSharedFiles.filter(file => file.parentId === folderId);
            } else {
                // MODO NORMAL: Navegação por pastas
                folderFiles = await storageApi.loadFolderContents(folderId, businessId);

                // Se estivermos na raiz, adicionar a pasta "Compartilhados Comigo"
                if (folderId === 'root') {
                    const sharedFolder: FileItem = {
                        id: 'shared_with_me',
                        name: 'Compartilhados Comigo',
                        type: 'folder',
                        parentId: 'root',
                        createdAt: new Date().toISOString(),
                        status: 'valido'
                    };
                    folderFiles = [sharedFolder, ...folderFiles];
                }
            }

            setFiles(folderFiles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar arquivos');
            console.error('Erro ao carregar arquivos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Carregar todos os arquivos para busca global (incluindo compartilhados)
    const loadAllFiles = async () => {
        try {
            const filters = {
                status: selectedStatus,
                file_type: selectedFileType,
                search_term: searchTerm
            };

            // Buscar arquivos próprios
            // Nota: storageApi.searchAllFiles usa getUserInfo internamente, que pega o company_id atual
            const ownFiles = await storageApi.searchAllFiles(businessId, filters);

            // Buscar arquivos compartilhados
            const sharedFiles = await loadSharedFiles();

            // Mesclar os dois arrays, removendo duplicatas por ID
            const allFilesMap = new Map<string, FileItem>();

            // Adicionar arquivos próprios
            ownFiles.forEach(file => allFilesMap.set(file.id, file));

            // Adicionar/substituir com arquivos compartilhados (prioridade para dados mais recentes)
            sharedFiles.forEach(file => allFilesMap.set(file.id, file));

            const mergedFiles = Array.from(allFilesMap.values());
            console.log('📚 Total de arquivos carregados (próprios + compartilhados):', mergedFiles.length);

            setAllFiles(mergedFiles);
        } catch (err) {
            console.error('Erro ao carregar todos os arquivos:', err);
        }
    };

    // Listener para mudanças de contexto (Troca de empresa/ambiente)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent | CustomEvent) => {
            // Se houver evento de troca de empresa, recarregar tudo
            console.log('🔄 Detectada mudança de contexto (Storage/Custom Event). Recarregando arquivos...');
            setCurrentFolderId('root');
            setBreadcrumb([{ id: 'root', name: t('dashboard.documents') }]);
            loadFiles('root');
            loadAllFiles();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('companyChanged', handleStorageChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleStorageChange as EventListener);
        };
    }, []);

    // Monitorar mudança manual de businessId (se vier via props/contexto no futuro)
    useEffect(() => {
        loadFiles();
        loadAllFiles();
    }, [businessId]);

    // Carregar arquivos quando a pasta atual mudar OU filtros mudarem
    useEffect(() => {
        console.log('🚀 Componente Documents - Recarregando (Pasta/Filtros)...');
        debugUserInfo();
        setVisibleCount(50);

        // Debounce para busca
        const timer = setTimeout(() => {
            loadFiles();
        }, 500);

        return () => clearTimeout(timer);
    }, [currentFolderId, businessId, selectedStatus, selectedFileType, searchTerm]);

    // Carregar todos os arquivos na inicialização (apenas uma vez ou quando mudar contexto macro)
    useEffect(() => {
        loadAllFiles();
    }, [businessId]);

    const getCurrentFolderFiles = () => {
        // Sempre filtrar corretamente baseado na pasta atual
        if (currentFolderId === 'shared_with_me') {
            // Na raiz dos compartilhados, mostrar apenas arquivos sem parent ou com parent = null
            return files.filter(file => file.parentId === null);
        } else if (breadcrumb.some(b => b.id === 'shared_with_me')) {
            // Nas subpastas dos compartilhados, filtrar por parentId
            return files.filter(file => file.parentId === currentFolderId);
        } else {
            // Nas outras pastas normais, filtrar por parentId
            return files.filter(file => file.parentId === currentFolderId);
        }
    };

    // Função para obter todos os arquivos (busca global) ou apenas da pasta atual
    const getFilesToDisplay = () => {
        // V3: Sempre usar 'files', pois o backend já traz filtrado (inclusive busca por nome)
        // Isso atende o requisito: "filtra por pastas aberta... funciona direto no backend"
        return files;
    };

    // Função para categorizar arquivos por tipo
    const getFileCategory = (extension: string): string => {
        const ext = extension.toLowerCase();

        if (['.pdf'].includes(ext)) return 'pdf';
        if (['.doc', '.docx'].includes(ext)) return 'word';
        if (['.xls', '.xlsx'].includes(ext)) return 'excel';
        if (['.ppt', '.pptx'].includes(ext)) return 'powerpoint';
        if (['.csv'].includes(ext)) return 'csv';
        if (['.txt'].includes(ext)) return 'text';
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext)) return 'image';
        if (['.mp4', '.avi', '.mov'].includes(ext)) return 'video';
        if (['.mp3', '.wav'].includes(ext)) return 'audio';
        if (['.zip', '.rar'].includes(ext)) return 'compressed';

        return 'other';
    };

    // Filtro simplificado: Backend já mandou filtrado!
    const filteredFiles = getFilesToDisplay();
    // (Lógica antiga removida pois agora o backend filtra status, tipo e nome)

    // Função para verificar urgência de documentos
    const getDocumentUrgency = (file: FileItem): 'critical' | 'warning' | 'normal' => {
        if (!file.validityDate || file.status === 'Vencido') return 'normal';

        const today = new Date();
        const validityDate = new Date(file.validityDate);
        const diffTime = validityDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'critical'; // Vencido
        if (diffDays <= 7) return 'critical';  // Vence em 7 dias ou menos
        if (diffDays <= 30) return 'warning';  // Vence em 30 dias ou menos

        return 'normal';
    };

    // Função para obter o caminho completo de um arquivo
    const getFilePath = (file: FileItem): string => {
        if (!file.parentId || file.parentId === 'root') {
            return 'Documentos';
        }

        const buildPath = (fileId: string): string[] => {
            const parent = files.find(f => f.id === fileId);
            if (!parent || parent.parentId === 'root') {
                return parent ? [parent.name] : [];
            }
            return [...buildPath(parent.parentId || 'root'), parent.name];
        };

        const pathParts = buildPath(file.parentId);
        return ['Documentos', ...pathParts].join(' / ');
    };

    // Função para obter estatísticas dos filtros
    const getFilterStats = () => {
        const currentFiles = getCurrentFolderFiles().filter(file => file.type === 'file');

        const statusCounts = {
            'todos': currentFiles.length,
            'Válido': currentFiles.filter(f => f.status === 'Válido').length,
            'A vencer': currentFiles.filter(f => f.status === 'A vencer').length,
            'Vencido': currentFiles.filter(f => f.status === 'Vencido').length,
            'Em renovação': currentFiles.filter(f => f.status === 'Em renovação').length,
            'Em processo': currentFiles.filter(f => f.status === 'Em processo').length,
            'Novo Status': currentFiles.filter(f => f.status === 'Novo Status').length,
        };

        const typeCounts = {
            'todos': currentFiles.length,
            'pdf': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'pdf').length,
            'word': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'word').length,
            'excel': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'excel').length,
            'powerpoint': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'powerpoint').length,
            'csv': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'csv').length,
            'image': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'image').length,
            'video': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'video').length,
            'audio': currentFiles.filter(f => f.extension && getFileCategory(f.extension) === 'audio').length,
        };

        return { statusCounts, typeCounts };
    };

    const { statusCounts, typeCounts } = getFilterStats();

    // Verificar se estamos na área de compartilhados
    const isInSharedArea = () => {
        return currentFolderId === 'shared_with_me' || breadcrumb.some(b => b.id === 'shared_with_me');
    };

    const navigateToFolder = (folderId: string, folderName: string) => {
        // Limpar filtros ao navegar para nova pasta
        setSelectedStatus('todos');
        setSelectedFileType('todos');
        setSearchTerm('');

        if (folderId === 'root') {
            setCurrentFolderId('root');
            setBreadcrumb([{ id: 'root', name: 'Documentos' }]);
        } else if (folderId === 'shared_with_me') {
            setCurrentFolderId('shared_with_me');
            setBreadcrumb([
                { id: 'root', name: 'Documentos' },
                { id: 'shared_with_me', name: 'Compartilhados Comigo' }
            ]);
        } else {
            setCurrentFolderId(folderId);
            let newBreadcrumb;

            // Se já estamos na área compartilhada, manter o breadcrumb da área compartilhada
            if (isInSharedArea()) {
                newBreadcrumb = [...breadcrumb, { id: folderId, name: folderName }];
            } else {
                newBreadcrumb = [...breadcrumb, { id: folderId, name: folderName }];
            }

            setBreadcrumb(newBreadcrumb);
        }
    };

    const navigateToBreadcrumb = (index: number) => {
        // Limpar filtros ao navegar via breadcrumb
        setSelectedStatus('todos');
        setSelectedFileType('todos');
        setSearchTerm('');

        const newBreadcrumb = breadcrumb.slice(0, index + 1);
        setBreadcrumb(newBreadcrumb);
        setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id);
    };

    const handleShare = () => {
        setIsFileInfoModalOpen(false);
        setIsShareModalOpen(true);
    };

    const handleViewFile = () => {
        if (selectedFile) {
            setIsFileInfoModalOpen(false);
            openDocument(selectedFile);
        }
    };

    const handleEdit = () => {
        setIsFileInfoModalOpen(false);
        setIsEditModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            await storageApi.deleteStorageNode(parseInt(selectedFile.id));

            // Recarregar arquivos
            await loadFiles();
            await loadAllFiles();

            setIsFileInfoModalOpen(false);
            setSelectedFile(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao deletar arquivo');
            console.error('Erro ao deletar arquivo:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditFile = async (updatedFile: Partial<FileItem>, newFile?: File) => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            await storageApi.updateStorageNode(parseInt(selectedFile.id), {
                name: updatedFile.name,
                comments: updatedFile.comments,
                status: updatedFile.status,
                data_validade: updatedFile.validityDate,
                file: newFile
            });

            // Recarregar arquivos
            await loadFiles();
            await loadAllFiles();

            setIsEditModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao editar arquivo');
            console.error('Erro ao editar arquivo:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditFolder = async (updatedFolder: Partial<FileItem>) => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            await storageApi.updateStorageNode(parseInt(selectedFile.id), {
                name: updatedFolder.name,
                comments: updatedFolder.comments
            });

            // Recarregar arquivos
            await loadFiles();
            await loadAllFiles();

            setIsEditFolderModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao editar pasta');
            console.error('Erro ao editar pasta:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handlers para seguir documentos
    const handleFollowClick = (file: FileItem) => {
        // Validação: só pode seguir arquivos
        if (file.type !== 'file') {
            alert('Só é possível seguir arquivos, não pastas');
            return;
        }

        setSelectedFile(file);
        setIsFollowConfigModalOpen(true);
    };

    const handleFollowConfirm = async (config: { dias_antes_alerta: number; alertar_no_vencimento: boolean }) => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            const isFollowing = selectedFile.usuario_atual_segue?.seguindo === true;

            if (isFollowing) {
                // Atualizar configurações
                await followDocumentApi.configurarAlertas(parseInt(selectedFile.id), config);
                alert('Configurações de alerta atualizadas com sucesso!');
            } else {
                // Começar a seguir
                await followDocumentApi.seguirDocumento(parseInt(selectedFile.id), {
                    diasAntes: config.dias_antes_alerta,
                    alertarNoVencimento: config.alertar_no_vencimento
                });
                alert('Agora você está seguindo este documento!');
            }

            // Recarregar arquivos para atualizar info de seguidores
            await loadFiles();
            await loadAllFiles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao configurar seguimento');
            console.error('Erro ao seguir documento:', err);
            alert(err instanceof Error ? err.message : 'Erro ao configurar seguimento');
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollowClick = async (file: FileItem) => {
        // Validação: dono não pode deixar de seguir
        if (file.usuario_e_dono) {
            alert('Como dono do documento, você não pode deixar de seguir');
            return;
        }

        // Validação: precisa estar seguindo
        if (!file.usuario_atual_segue?.seguindo) {
            alert('Você não está seguindo este documento');
            return;
        }

        // Confirmação
        const confirmar = confirm(
            'Tem certeza que deseja deixar de seguir este documento? ' +
            'Você não receberá mais alertas de vencimento.'
        );

        if (!confirmar) return;

        setLoading(true);
        try {
            await followDocumentApi.deixarDeSeguir(parseInt(file.id));
            alert('Você deixou de seguir o documento');

            // Recarregar arquivos
            await loadFiles();
            await loadAllFiles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao deixar de seguir');
            console.error('Erro ao deixar de seguir:', err);
            alert(err instanceof Error ? err.message : 'Erro ao deixar de seguir');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDocument = (content: string) => {
        if (selectedFile) {
            console.log('Salvando conteúdo do documento:', selectedFile.name);
            console.log('Novo conteúdo:', content);

            // Atualizar o arquivo com o novo conteúdo
            const updatedFiles = files.map(file =>
                file.id === selectedFile.id
                    ? { ...file, comments: `Editado em ${new Date().toLocaleDateString('pt-BR')}` }
                    : file
            );
            setFiles(updatedFiles);

            // Em produção, aqui seria feita a chamada para a API para salvar o conteúdo
            // await api.saveDocument(selectedFile.id, content);

            setIsDocumentViewerOpen(false);
            alert('Documento salvo com sucesso!');
        }
    };

    const goBack = () => {
        if (breadcrumb.length > 1) {
            // Limpar filtros ao voltar
            setSelectedStatus('todos');
            setSelectedFileType('todos');
            setSearchTerm('');

            const newBreadcrumb = breadcrumb.slice(0, -1);
            setBreadcrumb(newBreadcrumb);
            setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id);
        }
    };

    const handleCreateFolder = async (folderName: string) => {
        setLoading(true);
        try {
            const apiResult = await storageApi.createStorageNode({
                name: folderName,
                type: 'folder',
                parent_id: currentFolderId === 'root' ? null : parseInt(currentFolderId),
                business_id: businessId,
                status: 'valido'
            });

            // Recarregar arquivos da pasta atual
            await loadFiles();
            await loadAllFiles(); // Atualizar busca global

            setIsCreateFolderModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar pasta');
            console.error('Erro ao criar pasta:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDocument = async (documentData: {
        title: string;
        comments: string;
        validityDate: string;
        status: string;
        notifyToExpire: string;
        file: File | null;
    }) => {
        if (!documentData.file) {
            setError('Arquivo é obrigatório para documentos');
            return;
        }

        setLoading(true);
        try {
            const apiResult = await storageApi.createStorageNode({
                name: documentData.title,
                type: 'file',
                file: documentData.file,
                parent_id: currentFolderId === 'root' ? null : parseInt(currentFolderId),
                business_id: businessId,
                status: documentData.status,
                comments: documentData.comments,
                data_validade: documentData.validityDate
            });

            // Recarregar arquivos da pasta atual
            await loadFiles();
            await loadAllFiles(); // Atualizar busca global

            setIsCreateDocumentModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar documento');
            console.error('Erro ao criar documento:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = (file: FileItem) => {
        if (file.type === 'folder') {
            navigateToFolder(file.id, file.name);
        } else {
            // Sempre abrir modal de informações para arquivos
            setSelectedFile(file);
            setIsFileInfoModalOpen(true);
        }
    };

    const handleEditItem = (file: FileItem) => {
        setSelectedFile(file);

        if (file.type === 'folder') {
            setIsEditFolderModalOpen(true);
        } else {
            setIsEditModalOpen(true);
        }
    };

    const handleShareItem = (file: FileItem) => {
        console.log('🔄 handleShareItem chamado com:', file);
        setSelectedFile(file);
        setIsShareModalOpen(true);
        console.log('📋 Estado após setIsShareModalOpen(true)');
    };

    const handleCopyLink = (file: FileItem) => {
        const link = file.url || `${window.location.origin}/documents/${file.id}`;
        navigator.clipboard.writeText(link);
        alert('Link copiado para área de transferência!');
    };

    const handleDeleteItem = async (file: FileItem) => {
        const isSharedArea = isInSharedArea();
        const confirmMessage = isSharedArea
            ? `Tem certeza que deseja remover o acesso ao ${file.type === 'folder' ? 'pasta' : 'arquivo'} "${file.name}"?`
            : `Tem certeza que deseja ${file.type === 'folder' ? 'excluir a pasta' : 'excluir o arquivo'} "${file.name}"?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        setLoading(true);
        try {
            if (isSharedArea) {
                // TODO: Implementar API para remover compartilhamento
                // await storageApi.removeSharedAccess(parseInt(file.id));
                console.log('Removendo acesso compartilhado para:', file.name);
                alert('Funcionalidade de remoção de compartilhamento será implementada em breve');
            } else {
                await storageApi.deleteStorageNode(parseInt(file.id));
            }

            // Recarregar arquivos
            await loadFiles();
            await loadAllFiles();
        } catch (err) {
            setError(err instanceof Error ? err.message : `Erro ao ${isSharedArea ? 'remover acesso' : 'deletar'} ${file.type === 'folder' ? 'pasta' : 'arquivo'}`);
            console.error('Erro ao processar:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handler para abrir modal de mover
    const handleMoveItem = (file: FileItem) => {
        setSelectedFile(file);
        setIsMoveModalOpen(true);
    };

    // Handler para confirmar movimentação
    const handleMoveConfirm = async (targetFolderId: string | null) => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            const nodeId = parseInt(selectedFile.id);
            const newParentId = targetFolderId ? parseInt(targetFolderId) : null;

            const response = await storageApi.moveNode(nodeId, newParentId);

            const destino = targetFolderId
                ? 'para a pasta selecionada'
                : 'para a raiz';

            alert(`✅ ${response.message}\n\n"${selectedFile.name}" foi movido ${destino} com sucesso!`);

            // Recarregar arquivos
            await loadFiles();
            await loadAllFiles();

            setIsMoveModalOpen(false);
            setSelectedFile(null);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao mover item';
            alert(`❌ ${errorMsg}`);
            console.error('Erro ao mover:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handler para adicionar seguidor por email
    const handleAddFollower = async (email: string, diasAntes: number, alertarNoVencimento: boolean) => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            const nodeId = parseInt(selectedFile.id);

            const resultado = await followDocumentApi.adicionarSeguidorPorEmail(
                nodeId,
                email,
                { diasAntes, alertarNoVencimento }
            );

            alert(`✅ Seguidor adicionado com sucesso!\n\n${email} agora receberá notificações deste documento.`);

            // Recarregar arquivos para atualizar lista de seguidores
            await loadFiles();
            await loadAllFiles();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar seguidor';
            alert(`❌ ${errorMsg}`);
            console.error('Erro ao adicionar seguidor:', err);
            throw err; // Re-lançar para o modal tratar
        } finally {
            setLoading(false);
        }
    };

    // Função para exportar todos os documentos para Excel
    const exportToExcel = async () => {
        try {
            setLoading(true);
            
            console.log('� === EXPORTAÇÃO EXCEL ===');
            console.log('📦 Arquivos no estado atual:', allFiles.length);
            
            // Recarregar TODOS os arquivos (próprios + compartilhados)
            console.log('🔄 Recarregando todos os arquivos...');
            await loadAllFiles();
            
            // Aguardar um momento para garantir que o estado foi atualizado
            await new Promise(resolve => setTimeout(resolve, 800));
            
            console.log('📦 Arquivos após reload:', allFiles.length);
            
            // Filtrar apenas arquivos (remover pastas virtuais)
            const todosArquivos = allFiles.filter(f => 
                f.type === 'file' && 
                f.id !== 'shared_with_me' &&
                f.name !== 'Compartilhados Comigo'
            );
            
            console.log('📄 Arquivos filtrados (sem pastas):', todosArquivos.length);
            
            if (todosArquivos.length === 0) {
                alert('⚠️ Nenhum arquivo encontrado!\n\nVocê tem ' + allFiles.length + ' itens, mas nenhum é arquivo.\nVerifique o console (F12).');
                console.log('📦 Todos os itens:', allFiles);
                return;
            }

            // Preparar dados para Excel
            const excelData = todosArquivos.map((file: any) => ({
                'ID': file.id,
                'Nome': file.name,
                'Caminho': getFilePath(file),
                'Tipo': file.extension?.toUpperCase() || 'N/A',
                'Tamanho': file.size || 'N/A',
                'Status': file.status || 'N/A',
                'Data de Validade': file.validityDate
                    ? new Date(file.validityDate).toLocaleDateString('pt-BR')
                    : 'N/A',
                'Data de Criação': file.createdAt
                    ? new Date(file.createdAt).toLocaleDateString('pt-BR')
                    : 'N/A',
                'Comentários': file.comments || 'N/A',
                'URL': file.url || 'N/A'
            }));

            // Criar planilha Excel
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            worksheet['!cols'] = [
                { wch: 8 }, { wch: 40 }, { wch: 50 }, { wch: 10 }, 
                { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, 
                { wch: 40 }, { wch: 50 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Documentos');

            const dataHora = new Date().toLocaleString('pt-BR').replace(/[/:]/g, '-').replace(',', '');
            const fileName = `Relatorio_Documentos_${dataHora}.xlsx`;

            XLSX.writeFile(workbook, fileName);

            alert(`✅ Exportado com sucesso!\n\n${todosArquivos.length} documentos em:\n${fileName}`);
            console.log('✅ Exportação concluída!');
        } catch (err) {
            console.error('❌ Erro:', err);
            alert(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const isViewMode = (file: FileItem): boolean => {
        // Lista de extensões que podem ser abertas diretamente
        const viewableExtensions = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
            '.mp4', '.avi', '.mov', '.mp3', '.wav', '.zip', '.rar'
        ];

        const extension = file.extension?.toLowerCase() || '';
        return viewableExtensions.includes(extension);
    };

    const openDocument = (file: FileItem) => {
        const extension = file.extension?.toLowerCase() || '';

        // Notificar que o arquivo está sendo aberto
        console.log(`Abrindo ${file.name}...`);

        // Se o arquivo tem URL real, usar o RealFileViewerModal
        if (file.url) {
            openRealFileViewer(file);
            return;
        }

        // Caso contrário, usar os visualizadores simulados
        switch (extension) {
            case '.pdf':
            case '.doc':
            case '.docx':
            case '.xls':
            case '.xlsx':
            case '.ppt':
            case '.pptx':
            case '.txt':
            case '.csv':
                // Para documentos de escritório e CSV, usar o DocumentViewerModal
                openDocumentViewer(file);
                break;

            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
            case '.bmp':
            case '.svg':
                // Para imagens, abrir em modal de visualização
                openImageViewer(file);
                break;

            case '.mp4':
            case '.avi':
            case '.mov':
                // Para vídeos
                openVideoPlayer(file);
                break;

            case '.mp3':
            case '.wav':
                // Para áudio
                openAudioPlayer(file);
                break;

            case '.zip':
            case '.rar':
                // Para arquivos compactados, fazer download
                downloadFile(file);
                break;

            default:
                // Para outros tipos, mostrar modal de informações
                setSelectedFile(file);
                setIsFileInfoModalOpen(true);
                break;
        }
    };

    const openRealFileViewer = (file: FileItem) => {
        setSelectedFile(file);
        setIsRealFileViewerOpen(true);
    };

    const openDocumentViewer = (file: FileItem) => {
        setSelectedFile(file);
        setIsDocumentViewerOpen(true);
    };

    const openImageViewer = (file: FileItem) => {
        setSelectedFile(file);
        setIsImageViewerOpen(true);
    };

    const openVideoPlayer = (file: FileItem) => {
        setSelectedFile(file);
        setIsVideoPlayerOpen(true);
    };

    const openAudioPlayer = (file: FileItem) => {
        // Implementar player de áudio usando URL real
        console.log('Abrindo player de áudio para:', file.name);
        const audioUrl = file.url || `/api/documents/${file.id}/view`;
        window.open(audioUrl, '_blank');
    };

    const downloadFile = (file: FileItem) => {
        // Implementar download de arquivo usando URL real
        console.log('Fazendo download do arquivo:', file.name);
        const downloadUrl = file.url || `/api/documents/${file.id}/download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        link.click();
    };

    const getFileIcon = (file: FileItem, size: number = 40) => {
        if (file.type === 'folder') {
            // Ícone especial para pasta "Compartilhados Comigo"
            if (file.id === 'shared_with_me') {
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="text-red-600"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        <path d="M8 12h8" />
                    </svg>
                );
            }
            return <TfiFolder size={size} className="text-red-600" />;
        }

        const extension = file.extension?.toLowerCase() || '';
        const className = isViewMode(file) ? "text-red-600" : "text-gray-500";

        switch (extension) {
            case '.pdf':
                return <MdPictureAsPdf size={size} className="text-red-500" />;
            case '.doc':
            case '.docx':
                return <MdDescription size={size} className="text-red-600" />;
            case '.xls':
            case '.xlsx':
                return <MdTableChart size={size} className="text-red-600" />;
            case '.csv':
                return <MdTableChart size={size} className="text-red-600" />;
            case '.ppt':
            case '.pptx':
                return <MdSlideshow size={size} className="text-red-700" />;
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
            case '.bmp':
            case '.svg':
                return <TfiImage size={size} className="text-red-500" />;
            case '.mp4':
            case '.avi':
            case '.mov':
                return <TfiVideoCamera size={size} className="text-red-600" />;
            case '.mp3':
            case '.wav':
                return <TfiMusic size={size} className="text-red-500" />;
            default:
                return <TfiFile size={size} className={className} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Válido':
                return 'text-red-600 bg-red-50';
            case 'A vencer':
                return 'text-red-600 bg-red-50';
            case 'Vencido':
                return 'text-red-600 bg-red-50';
            case 'Em renovação':
                return 'text-red-600 bg-red-50';
            case 'Em processo':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getCurrentPath = () => {
        return breadcrumb.map(item => item.name).join(' / ');
    };

    return (
        <div className="">
            {/* Header com breadcrumb e ações */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Breadcrumb e botão voltar */}
                    <div className="flex items-center gap-3">
                        {breadcrumb.length > 1 && (
                            <button
                                onClick={goBack}
                                className="group flex items-center gap-2 px-4 py-2.5 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-red-500 hover:text-red-600 bg-white transition-all duration-300 text-sm transform hover:-translate-x-1"
                            >
                                <TfiArrowLeft size={16} className="group-hover:animate-pulse" />
                                <span className="hidden sm:inline">Voltar</span>
                            </button>
                        )}

                        <nav className="flex items-center gap-2 flex-1 min-w-0 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                            {breadcrumb.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <button
                                        onClick={() => navigateToBreadcrumb(index)}
                                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 truncate ${
                                            index === breadcrumb.length - 1 
                                                ? 'bg-red-600 text-white font-bold shadow-md' 
                                                : 'text-gray-600 hover:bg-red-50 hover:text-red-700 font-medium'
                                        }`}
                                    >
                                        {index === 0 && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        )}
                                        <span className={index === breadcrumb.length - 1 ? 'text-sm' : 'text-xs sm:text-sm'}>
                                            {item.name}
                                        </span>
                                        {index === breadcrumb.length - 1 && filteredFiles.length > 0 && (
                                            <span className="ml-1.5 px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                                                {filteredFiles.length}
                                            </span>
                                        )}
                                    </button>
                                    {index < breadcrumb.length - 1 && (
                                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </React.Fragment>
                            ))}
                        </nav>

                        {/* Botões de ação rápida */}
                        <div className="flex gap-2 ml-auto">
                            {/* Botão de Exportar para Excel */}
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2.5 font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                style={{ backgroundColor: '#16A34A' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803D'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
                                title="Exportar todos os documentos para Excel"
                            >
                                <MdFileDownload size={20} />
                                <span className="hidden sm:inline">Excel</span>
                            </button>

                            {/* Botão de Filtros */}
                            <button
                                onClick={() => setIsFilterDrawerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                style={{ backgroundColor: '#DC2626' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                            >
                                <MdFilterList size={20} />
                                <span>Filtros</span>
                                {(selectedStatus !== 'todos' || selectedFileType !== 'todos' || searchTerm) && (
                                    <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                                        ativo
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Indicadores de filtros ativos */}
                    {(selectedStatus !== 'todos' || selectedFileType !== 'todos' || searchTerm) && (
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                            <span className="text-xs font-semibold text-gray-600">Filtros ativos:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                                    <TfiSearch size={12} />
                                    "{searchTerm.length > 20 ? searchTerm.substring(0, 20) + '...' : searchTerm}"
                                </span>
                            )}
                            {selectedStatus !== 'todos' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                                    Status: {selectedStatus}
                                </span>
                            )}
                            {selectedFileType !== 'todos' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                                    Tipo: {selectedFileType}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedStatus('todos');
                                    setSelectedFileType('todos');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium hover:bg-red-200 transition-colors"
                            >
                                <TfiClose size={12} />
                                Limpar tudo
                            </button>
                        </div>
                    )}
                </div>

                {/* Botões de ação responsivos - requer manage_files */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                    {!isInSharedArea() && hasPermission('manage_files') && (
                        <div className="flex gap-3 flex-1">
                            <button
                                onClick={() => setIsCreateFolderModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex-1 sm:flex-none"
                                style={{ backgroundColor: '#DC2626' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                            >
                                <MdCreateNewFolder size={18} />
                                <span className="hidden sm:inline">{t('documents.create_folder')}</span>
                                <span className="sm:hidden">{t('documents.folder')}</span>
                            </button>

                            <button
                                onClick={() => setIsCreateDocumentModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex-1 sm:flex-none"
                                style={{ backgroundColor: '#DC2626' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                            >
                                <MdNoteAdd size={18} />
                                <span className="hidden sm:inline">{t('documents.new_document')}</span>
                                <span className="sm:hidden">{t('documents.document')}</span>
                            </button>
                        </div>
                    )}

                    {/* Mostrar aviso na pasta compartilhados */}
                    {isInSharedArea() && (
                        <div className="flex-1 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 text-red-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">
                                    {t('documents.shared_folder_notice')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Toggle de visualização */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <button
                            onClick={() => setSelectedView('grid')}
                            className={`px-4 py-3 text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${selectedView === 'grid'
                                ? 'text-white shadow-inner'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            style={{
                                backgroundColor: selectedView === 'grid' ? '#DC2626' : 'white'
                            }}
                        >
                            {t('documents.grid_view')}
                        </button>
                        <button
                            onClick={() => setSelectedView('list')}
                            className={`px-4 py-3 text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${selectedView === 'list'
                                ? 'text-white shadow-inner'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            style={{
                                backgroundColor: selectedView === 'list' ? '#DC2626' : 'white'
                            }}
                        >
                            {t('documents.list_view')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista/Grade de arquivos */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 relative">
                <div className="mb-4">
                    <h2 className="text-base font-medium text-gray-800">
                        {searchTerm.trim() ? t('documents.search_results') : breadcrumb[breadcrumb.length - 1].name}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-600 mt-1">
                        <span>
                            {filteredFiles.length} {filteredFiles.length === 1 ? t('documents.item') : t('documents.items')}
                            {searchTerm.trim() && (
                                <span className="text-red-700"> • {t('documents.found_in_all')}</span>
                            )}
                        </span>
                        {searchTerm.trim() && (
                            <span className="text-gray-500">
                                para "{searchTerm}"
                            </span>
                        )}
                    </div>
                </div>

                {/* Indicador de erro */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="text-red-600 mr-3">❌</div>
                            <div>
                                <h4 className="text-red-800 font-medium">Erro</h4>
                                <p className="text-red-700 text-sm">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicador de loading como overlay sutil - não bloqueia a visualização */}
                {loading && (
                    <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-red-200 z-10">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        <span className="ml-2 text-sm text-gray-600">{t('documents.loading')}</span>
                    </div>
                )}

                {filteredFiles.length === 0 && !loading ? (
                    <div className="text-center py-8 sm:py-12">
                        <TfiFolder size={40} className="mx-auto text-gray-400 mb-4 sm:mb-6" />
                        <h3 className="text-base font-medium text-gray-600 mb-2">
                            {searchTerm || selectedStatus !== 'todos' || selectedFileType !== 'todos'
                                ? t('documents.no_results')
                                : t('documents.empty_folder')}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 px-4">
                            {searchTerm || selectedStatus !== 'todos' || selectedFileType !== 'todos'
                                ? t('documents.try_adjust_filters')
                                : t('documents.start_creating')
                            }
                        </p>
                        {/* Sugestões quando há filtros ativos mas sem resultados */}
                        {(searchTerm || selectedStatus !== 'todos' || selectedFileType !== 'todos') && getCurrentFolderFiles().length > 0 && (
                            <div className="bg-red-50 p-4 rounded-lg max-w-sm mx-auto">
                                <p className="text-sm text-red-700 mb-3">
                                    {t('documents.items_in_folder', { count: getCurrentFolderFiles().length })}
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedStatus('todos');
                                        setSelectedFileType('todos');
                                        setSearchTerm('');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors w-full sm:w-auto"
                                    style={{ backgroundColor: '#DC2626' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                                >
                                    {t('documents.clear_filters')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : filteredFiles.length === 0 && loading ? (
                    /* Mostra um placeholder de loading enquanto carrega pela primeira vez */
                    <div className="text-center py-8 sm:py-12">
                        <div className="animate-pulse">
                            <div className="flex justify-center gap-4 mb-6">
                                <div className="w-24 h-28 bg-gray-200 rounded-lg"></div>
                                <div className="w-24 h-28 bg-gray-200 rounded-lg"></div>
                                <div className="w-24 h-28 bg-gray-200 rounded-lg"></div>
                            </div>
                            <p className="text-gray-500 text-sm">{t('documents.loading_files')}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {selectedView === 'grid' ? (
                            /* Vista em Grade com Virtualização (Infinite Scroll Mock) */
                            <div className="flex flex-col gap-6">
                                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 ${loading ? 'opacity-60' : ''}`}>
                                    {filteredFiles.slice(0, visibleCount).map((file) => {
                                        const urgency = file.type === 'file' ? getDocumentUrgency(file) : 'normal';
                                        return (
                                            <div
                                                key={file.id}
                                                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors relative group"
                                                title={
                                                    file.type === 'folder'
                                                        ? 'Clique para abrir a pasta'
                                                        : isViewMode(file)
                                                            ? 'Clique para visualizar o arquivo'
                                                            : 'Clique para ver informações do arquivo'
                                                }
                                            >
                                                {/* Menu de 3 pontinhos */}
                                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === file.id ? null : file.id);
                                                        }}
                                                        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                                        title="Opções"
                                                    >
                                                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                        </svg>
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {openMenuId === file.id && (
                                                        <>
                                                            {/* Overlay para fechar o menu */}
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenMenuId(null);
                                                                }}
                                                            />
                                                            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 animate-fadeIn">
                                                                {/* Editar - requer manage_files OU permissão de edição */}
                                                                {(hasPermission('manage_files') || file.allowEditing) && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            handleEditItem(file);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Editar
                                                                    </button>
                                                                )}

                                                                {/* Compartilhar - apenas fora da área compartilhada */}
                                                                {!isInSharedArea() && hasPermission('manage_files') && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            handleShareItem(file);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                                                        </svg>
                                                                        Compartilhar
                                                                    </button>
                                                                )}

                                                                {/* Mover - apenas fora da área compartilhada */}
                                                                {!isInSharedArea() && hasPermission('manage_files') && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            handleMoveItem(file);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                                        </svg>
                                                                        Mover
                                                                    </button>
                                                                )}

                                                                {/* Seguir/Configurar alertas - apenas para arquivos */}
                                                                {file.type === 'file' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            handleFollowClick(file);
                                                                        }}
                                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${file.usuario_atual_segue?.seguindo
                                                                            ? 'text-red-700 hover:bg-red-50'
                                                                            : 'text-gray-700 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                                        </svg>
                                                                        {file.usuario_atual_segue?.seguindo ? 'Configurar Alertas' : 'Seguir Documento'}
                                                                    </button>
                                                                )}

                                                                {/* Separador antes de deletar */}
                                                                {!isInSharedArea() && hasPermission('manage_files') && (
                                                                    <div className="border-t border-gray-100 my-1"></div>
                                                                )}

                                                                {/* Deletar - apenas fora da área compartilhada ou com permissão explicita */}
                                                                {((!isInSharedArea() && hasPermission('manage_files')) || file.allowEditing) && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenMenuId(null);
                                                                            handleDeleteItem(file);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Excluir
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Indicadores de status do arquivo */}
                                                {file.type === 'file' && (urgency !== 'normal' || file.url || isViewMode(file)) && (
                                                    <div className="absolute top-2 left-2 flex gap-1">
                                                        {/* Indicador de urgência */}
                                                        {urgency === 'critical' && (
                                                            <div className="w-2 h-2 bg-red-500 rounded-full" title="Crítico"></div>
                                                        )}
                                                        {urgency === 'warning' && (
                                                            <div className="w-2 h-2 bg-orange-400 rounded-full" title="Atenção"></div>
                                                        )}
                                                    </div>
                                                )}
                                                <div
                                                    className="flex flex-col items-center text-center cursor-pointer"
                                                    onClick={() => handleFileClick(file)}
                                                >
                                                    <div className="mb-2">
                                                        {getFileIcon(file, 36)}
                                                    </div>
                                                    <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                                                        {file.name}
                                                    </h3>
                                                    {/* Mostrar caminho quando em busca global */}
                                                    {searchTerm.trim() && (
                                                        <p className="text-xs text-gray-400 mb-1 line-clamp-1">
                                                            📁 {getFilePath(file)}
                                                        </p>
                                                    )}
                                                    {file.type === 'file' && (
                                                        <>
                                                            <p className="text-xs text-gray-400 mb-1">
                                                                {file.size} • {file.extension?.toUpperCase()}
                                                            </p>
                                                            <div className="flex flex-col items-center gap-1">
                                                                {file.status && (
                                                                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(file.status)}`}>
                                                                        {getStatusLabel(file.status)}
                                                                    </span>
                                                                )}
                                                                {/* Mostrar data de validade para documentos urgentes */}
                                                                {urgency !== 'normal' && file.validityDate && (
                                                                    <span className="text-xs text-red-600">
                                                                        {new Date(file.validityDate).toLocaleDateString('pt-BR')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Botão Ver Mais (Grade) */}
                                {filteredFiles.length > visibleCount && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 50)}
                                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors shadow-sm"
                                        >
                                            Carregar mais ({filteredFiles.length - visibleCount} restantes)
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Vista em Lista */
                            <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                                            {isInSharedArea() && (
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Compartilhado por</th>
                                            )}
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tamanho</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Validade</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Criado em</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-600 w-32">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFiles.slice(0, visibleCount).map((file) => {
                                            const urgency = file.type === 'file' ? getDocumentUrgency(file) : 'normal';
                                            return (
                                                <tr
                                                    key={file.id}
                                                    className={`border-b border-gray-100 hover:bg-gray-50 ${urgency === 'critical' ? 'bg-red-50' :
                                                        urgency === 'warning' ? 'bg-red-50' : ''
                                                        }`}
                                                >
                                                    <td className="py-3 px-4">
                                                        <div
                                                            className="flex items-center gap-3 cursor-pointer"
                                                            onClick={() => handleFileClick(file)}
                                                        >
                                                            {getFileIcon(file, 20)}
                                                            <div className="min-w-0 flex-1">
                                                                <span className="font-medium text-gray-800 text-sm block truncate">{file.name}</span>
                                                                {/* Mostrar caminho quando em busca global */}
                                                                {searchTerm.trim() && (
                                                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                                                        📁 {getFilePath(file)}
                                                                    </div>
                                                                )}
                                                                {/* Mostrar informações extras no mobile */}
                                                                <div className="sm:hidden text-xs text-gray-500 mt-1">
                                                                    {file.type === 'file' && file.extension && `${file.extension.toUpperCase()}`}
                                                                    {file.type === 'file' && file.size && ` • ${file.size}`}
                                                                    {isInSharedArea() && file.sharedByName && ` • Por: ${file.sharedByName}`}
                                                                </div>
                                                            </div>
                                                            {/* Indicadores na lista */}
                                                            <div className="flex gap-1">
                                                                {urgency === 'critical' && (
                                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Crítico"></div>
                                                                )}
                                                                {urgency === 'warning' && (
                                                                    <div className="w-2 h-2 bg-red-500 rounded-full" title="Atenção"></div>
                                                                )}
                                                                {file.url && (
                                                                    <div className="w-2 h-2 bg-red-600 rounded-full" title="Arquivo real"></div>
                                                                )}
                                                                {file.type === 'file' && isViewMode(file) && (
                                                                    <div className="w-2 h-2 bg-red-600 rounded-full" title="Visualizável"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {isInSharedArea() && (
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            {file.sharedByName || '-'}
                                                        </td>
                                                    )}
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {file.type === 'folder' ? 'Pasta' : file.extension?.toUpperCase()}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {file.type === 'folder' ? '—' : file.size}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {file.status ? (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                                                                {getStatusIcon(file.status)} {getStatusLabel(file.status)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        {file.validityDate ? (
                                                            <span className={
                                                                urgency === 'critical' ? 'text-red-600 font-medium' :
                                                                    urgency === 'warning' ? 'text-red-600 font-medium' :
                                                                        'text-gray-600'
                                                            }>
                                                                {new Date(file.validityDate).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="flex gap-2 justify-center">
                                                            {/* Editar - requer manage_files */}
                                                            {hasPermission('manage_files') && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditItem(file);
                                                                    }}
                                                                    className="p-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                                                    title={`Editar ${file.type === 'folder' ? 'pasta' : 'arquivo'}`}
                                                                >
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {/* Compartilhar - requer manage_files */}
                                                            {hasPermission('manage_files') && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleShareItem(file);
                                                                    }}
                                                                    className="p-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                                                    title={`Compartilhar ${file.type === 'folder' ? 'pasta' : 'arquivo'}`}
                                                                >
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {/* Mover - requer manage_files */}
                                                            {hasPermission('manage_files') && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMoveItem(file);
                                                                    }}
                                                                    className="p-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                                                    title={`Mover ${file.type === 'folder' ? 'pasta' : 'arquivo'}`}
                                                                >
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {/* Deletar - requer manage_files */}
                                                            {hasPermission('manage_files') && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteItem(file);
                                                                    }}
                                                                    className="p-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                                                    title={`Deletar ${file.type === 'folder' ? 'pasta' : 'arquivo'}`}
                                                                >
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {/* Botão de Seguir/Deixar de Seguir - apenas para arquivos */}
                                                            {file.type === 'file' && (
                                                                <>
                                                                    {file.usuario_atual_segue?.seguindo ? (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleFollowClick(file);
                                                                            }}
                                                                            className="p-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                                                            title="Configurar alertas"
                                                                        >
                                                                            <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                                                                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                                                                            </svg>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleFollowClick(file);
                                                                            }}
                                                                            className="p-2 bg-gray-400 text-white text-xs font-medium rounded-lg hover:bg-gray-500 transition-colors shadow-sm"
                                                                            title="Seguir documento"
                                                                        >
                                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Botão Ver Mais (Lista) */}
                                {filteredFiles.length > visibleCount && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 50)}
                                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors shadow-sm"
                                        >
                                            Carregar mais ({filteredFiles.length - visibleCount} restantes)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>


            {/* Modais */}
            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onConfirm={handleCreateFolder}
                currentPath={getCurrentPath()}
            />

            <CreateDocumentModal
                isOpen={isCreateDocumentModalOpen}
                onClose={() => setIsCreateDocumentModalOpen(false)}
                onConfirm={handleCreateDocument}
                currentPath={getCurrentPath()}
            />

            <FileInfoModal
                isOpen={isFileInfoModalOpen}
                onClose={() => setIsFileInfoModalOpen(false)}
                file={selectedFile}
                onEdit={handleEdit}
                onShare={handleShare}
                onDelete={handleDelete}
                onViewFile={handleViewFile}
                onFollow={() => selectedFile && handleFollowClick(selectedFile)}
                onUnfollow={() => selectedFile && handleUnfollowClick(selectedFile)}
                onAddFollower={handleAddFollower}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                file={selectedFile}
                onConfirm={async (shareData) => {
                    if (!selectedFile) return;

                    try {
                        const results = await storageApi.shareStorageNode(
                            parseInt(selectedFile.id),
                            shareData.users,
                            shareData.allowEditing
                        );

                        const successCount = results.filter(r => r.success).length;
                        const errorCount = results.length - successCount;

                        const itemType = selectedFile.type === 'folder' ? 'Pasta' : 'Arquivo';

                        if (successCount > 0) {
                            if (errorCount === 0) {
                                alert(`${itemType} compartilhado com sucesso com ${successCount} usuário(s)!`);
                            } else {
                                alert(`${itemType} compartilhado com ${successCount} usuário(s). ${errorCount} falha(s) encontrada(s).`);
                            }
                        } else {
                            alert(`Erro ao compartilhar ${itemType.toLowerCase()} com todos os usuários.`);
                        }

                        console.log('Resultado do compartilhamento:', results);
                    } catch (error) {
                        console.error('Erro ao compartilhar:', error);
                        alert('Erro inesperado ao compartilhar.');
                    }

                    setIsShareModalOpen(false);
                }}
            />

            <ImageViewerModal
                isOpen={isImageViewerOpen}
                onClose={() => setIsImageViewerOpen(false)}
                file={selectedFile}
            />

            <VideoPlayerModal
                isOpen={isVideoPlayerOpen}
                onClose={() => setIsVideoPlayerOpen(false)}
                file={selectedFile}
            />

            <EditFileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                file={selectedFile}
                onConfirm={handleEditFile}
            />

            <EditFolderModal
                isOpen={isEditFolderModalOpen}
                onClose={() => setIsEditFolderModalOpen(false)}
                folder={selectedFile}
                onConfirm={handleEditFolder}
            />

            <FollowConfigModal
                isOpen={isFollowConfigModalOpen}
                onClose={() => setIsFollowConfigModalOpen(false)}
                file={selectedFile}
                onConfirm={handleFollowConfirm}
                isFollowing={selectedFile?.usuario_atual_segue?.seguindo === true}
            />

            <MoveFolderModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                currentItem={selectedFile!}
                businessId={businessId}
                onMove={handleMoveConfirm}
            />

            <DocumentViewerModal
                isOpen={isDocumentViewerOpen}
                onClose={() => setIsDocumentViewerOpen(false)}
                file={selectedFile}
                onSave={handleSaveDocument}
            />

            <RealFileViewerModal
                isOpen={isRealFileViewerOpen}
                onClose={() => setIsRealFileViewerOpen(false)}
                file={selectedFile}
            />

            {/* Filter Drawer */}
            <FilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                statusCounts={statusCounts}
                selectedFileType={selectedFileType}
                onFileTypeChange={setSelectedFileType}
                typeCounts={typeCounts}
                onClearFilters={() => {
                    setSearchTerm('');
                    setSelectedStatus('todos');
                    setSelectedFileType('todos');
                    setIsFilterDrawerOpen(false);
                }}
            />
        </div>
    );
};

export default Documents;
