import React, { useState, useEffect } from 'react';
import { TfiClose, TfiFolder, TfiHome } from 'react-icons/tfi';
import { storageApi } from '../../../../services/storageApi';

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    parentId?: string | null;
}

interface MoveFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (targetFolderId: string | null) => void;
    currentItem: FileItem;
    businessId: number;
}

const MoveFolderModal: React.FC<MoveFolderModalProps> = ({
    isOpen,
    onClose,
    onMove,
    currentItem,
    businessId
}) => {
    const [folders, setFolders] = useState<FileItem[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carregar todas as pastas disponíveis
    useEffect(() => {
        if (isOpen) {
            loadFolders();
        }
    }, [isOpen]);

    const loadFolders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await storageApi.listStorageNodes({
                business_id: businessId
            });
            
            // Filtrar apenas pastas e remover a pasta atual (não pode mover para si mesma)
            const availableFolders = response
                .filter(item => item.type === 'folder' && String(item.id) !== currentItem.id)
                .map(item => ({
                    id: String(item.id),
                    name: item.name,
                    type: 'folder' as const,
                    parentId: item.parent_id ? String(item.parent_id) : null
                }));
            
            // Se o item sendo movido é uma pasta, remover também suas subpastas
            // (previne ciclos - não pode mover pasta para dentro dela mesma)
            const filteredFolders = currentItem.type === 'folder' 
                ? availableFolders.filter(folder => !isDescendant(folder, currentItem.id, availableFolders))
                : availableFolders;
            
            setFolders(filteredFolders);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar pastas');
            console.error('Erro ao carregar pastas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Verificar se uma pasta é descendente (filha/neta/etc) de outra
    const isDescendant = (folder: FileItem, ancestorId: string, allFolders: FileItem[]): boolean => {
        if (!folder.parentId) return false;
        if (folder.parentId === ancestorId) return true;
        
        const parent = allFolders.find(f => f.id === folder.parentId);
        if (!parent) return false;
        
        return isDescendant(parent, ancestorId, allFolders);
    };

    // Organizar pastas em estrutura hierárquica
    const buildFolderTree = (folders: FileItem[], parentId: string | null = null, level: number = 0): JSX.Element[] => {
        return folders
            .filter(folder => folder.parentId === parentId)
            .map(folder => (
                <div key={folder.id}>
                    <div
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                            selectedFolder === folder.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        style={{ paddingLeft: `${16 + level * 24}px` }}
                    >
                        <TfiFolder className={`text-lg ${selectedFolder === folder.id ? 'text-blue-500' : 'text-red-600'}`} />
                        <span className={`text-sm ${selectedFolder === folder.id ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                            {folder.name}
                        </span>
                    </div>
                    {/* Renderizar subpastas recursivamente */}
                    {buildFolderTree(folders, folder.id, level + 1)}
                </div>
            ));
    };

    const handleMove = () => {
        onMove(selectedFolder);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Mover {currentItem.type === 'folder' ? 'Pasta' : 'Arquivo'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            "{currentItem.name}"
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <TfiClose className="text-xl text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Selecione o destino:
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-600">Carregando pastas...</span>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            {/* Opção: Mover para Raiz */}
                            <div
                                onClick={() => setSelectedFolder(null)}
                                className={`flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors border-b ${
                                    selectedFolder === null ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                            >
                                <TfiHome className={`text-lg ${selectedFolder === null ? 'text-blue-500' : 'text-gray-500'}`} />
                                <span className={`text-sm ${selectedFolder === null ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                                    📁 Raiz (Pasta Principal)
                                </span>
                            </div>

                            {/* Lista de Pastas em Árvore */}
                            {folders.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <TfiFolder className="text-4xl mx-auto mb-2 text-gray-300" />
                                    <p>Nenhuma pasta disponível</p>
                                    <p className="text-xs mt-1">Crie uma pasta primeiro para organizar seus arquivos</p>
                                </div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto">
                                    {buildFolderTree(folders)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Informação sobre destino atual */}
                    {selectedFolder !== undefined && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>📍 Destino selecionado:</strong>{' '}
                                {selectedFolder === null 
                                    ? 'Raiz (Pasta Principal)' 
                                    : folders.find(f => f.id === selectedFolder)?.name || 'Desconhecido'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleMove}
                        disabled={selectedFolder === undefined || loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Movendo...' : 'Mover'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveFolderModal;
