import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { TfiTrash, TfiReload, TfiClose, TfiFolder, TfiFile } from "react-icons/tfi";
import { MdDeleteForever, MdRestore } from "react-icons/md";
import { trashApi, TrashItem } from "../../../services/trashApi";

const Trash = () => {
    const { t } = useTranslation();
    const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');

    // Carregar items da lixeira
    const loadTrashItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const items = await trashApi.listarLixeira();
            console.log('🗑️ Items da lixeira carregados:', items);
            setTrashItems(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('trash.error_load'));
            console.error('Erro ao carregar lixeira:', err);
        } finally {
            setLoading(false);
        }
    };

    // Carregar ao montar o componente
    useEffect(() => {
        loadTrashItems();
    }, []);

    // Restaurar item
    const handleRestore = async (item: TrashItem) => {
        const confirmar = confirm(t('trash.confirm_restore', { name: item.name }));
        if (!confirmar) return;

        setLoading(true);
        try {
            const response = await trashApi.restaurarItem(item.id);
            alert(`✅ ${response.message}`);
            await loadTrashItems(); // Recarregar lista
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t('trash.error_restore');
            alert(`❌ ${errorMsg}`);
            console.error('Erro ao restaurar:', err);
        } finally {
            setLoading(false);
        }
    };

    // Deletar permanentemente
    const handlePermanentDelete = async (item: TrashItem) => {
        const folderWarning = item.type === 'folder' ? `\n\n${t('trash.confirm_delete_folder', { count: item.children_count })}` : '';
        const confirmar = confirm(t('trash.confirm_delete', { name: item.name }) + folderWarning);
        
        if (!confirmar) return;

        // Confirmação dupla para segurança
        const confirmarNovamente = confirm(t('trash.confirm_final', { name: item.name }));
        
        if (!confirmarNovamente) return;

        setLoading(true);
        try {
            const response = await trashApi.deletarPermanentemente(item.id);
            alert(`✅ ${response.message}`);
            await loadTrashItems(); // Recarregar lista
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t('trash.error_delete');
            alert(`❌ ${errorMsg}`);
            console.error('Erro ao deletar permanentemente:', err);
        } finally {
            setLoading(false);
        }
    };

    // Esvaziar lixeira
    const handleEmptyTrash = async () => {
        if (trashItems.length === 0) {
            alert(t('trash.empty_message'));
            return;
        }

        const confirmar = confirm(t('trash.confirm_empty'));
        
        if (!confirmar) return;

        // Confirmação dupla
        const confirmarNovamente = confirm(t('trash.confirm_empty_final', { count: trashItems.length }));
        
        if (!confirmarNovamente) return;

        setLoading(true);
        try {
            const response = await trashApi.esvaziarLixeira();
            alert(`✅ ${response.message}`);
            await loadTrashItems(); // Recarregar lista
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t('trash.error_empty');
            alert(`❌ ${errorMsg}`);
            console.error('Erro ao esvaziar lixeira:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar items por busca
    const filteredItems = trashItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Formatar data
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Ícone do arquivo
    const getFileIcon = (item: TrashItem) => {
        if (item.type === 'folder') {
            return <TfiFolder className="text-4xl text-red-600" />;
        }
        return <TfiFile className="text-4xl text-gray-500" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <TfiTrash className="text-3xl text-red-500" />
                            <h1 className="text-2xl font-bold text-gray-800">{t('trash.title')}</h1>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={loadTrashItems}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                            >
                                <TfiReload className={loading ? 'animate-spin' : ''} />
                                {t('trash.refresh')}
                            </button>
                            
                            <button
                                onClick={handleEmptyTrash}
                                disabled={loading || trashItems.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                            >
                                <MdDeleteForever className="text-xl" />
                                {t('trash.empty_trash')}
                            </button>
                        </div>
                    </div>

                    {/* Barra de busca */}
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder={t('trash.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Informações */}
                    <div className="mt-4 text-sm text-gray-600">
                        {trashItems.length === 0 ? (
                            <p>{t('trash.empty_message')}</p>
                        ) : (
                            <p>{t('trash.total_items', { count: trashItems.length })}</p>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-600">{t('trash.loading')}</p>
                    </div>
                )}

                {/* Lista de items */}
                {!loading && filteredItems.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-gray-500">
                        {t('trash.no_results', { search: searchTerm })}
                    </div>
                )}

                {!loading && filteredItems.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('trash.name')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('trash.type')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('trash.size')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('trash.deleted_at')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('trash.content')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('trash.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {getFileIcon(item)}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.name}
                                                        </div>
                                                        {item.extension && (
                                                            <div className="text-xs text-gray-500">
                                                                {item.extension}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    item.type === 'folder' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {item.type === 'folder' ? t('trash.folder') : t('trash.file')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.size || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(item.deleted_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.type === 'folder' && item.children_count > 0 ? (
                                                    <span className="text-red-700 font-medium">
                                                        {t('trash.items_count', { count: item.children_count })}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRestore(item)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                                        title={t('trash.restore')}
                                                    >
                                                        <MdRestore />
                                                        {t('trash.restore')}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(item)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                        title={t('trash.delete_permanently')}
                                                    >
                                                        <MdDeleteForever />
                                                        {t('trash.delete_permanently')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trash;
