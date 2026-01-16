import React, { useState } from 'react';
import { TfiClose, TfiFolder, TfiSave } from 'react-icons/tfi';

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
}

interface EditFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: FileItem | null;
    onConfirm: (updatedFolder: Partial<FileItem>) => void;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({
    isOpen,
    onClose,
    folder,
    onConfirm
}) => {
    const [formData, setFormData] = useState({
        name: '',
        comments: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    React.useEffect(() => {
        if (folder && isOpen) {
            setFormData({
                name: folder.name || '',
                comments: folder.comments || ''
            });
            setErrors({});
        }
    }, [folder, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome da pasta é obrigatório';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Nome deve ter no máximo 100 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const updatedFolder = {
            name: formData.name.trim(),
            comments: formData.comments.trim()
        };

        onConfirm(updatedFolder);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            name: '',
            comments: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen || !folder) return null;

    return (
        <>
            {/* Backdrop com blur */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={handleClose} />
            
            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TfiFolder size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Editar Pasta</h2>
                                    <p className="text-gray-500 text-sm">Alterar informações da pasta</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                            >
                                <TfiClose size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Nome da pasta */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Pasta *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Digite o nome da pasta"
                                maxLength={100}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.name.length}/100 caracteres
                            </p>
                        </div>

                        {/* Comentários */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descrição (opcional)
                            </label>
                            <textarea
                                value={formData.comments}
                                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                                placeholder="Adicione uma descrição para a pasta..."
                                maxLength={500}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.comments.length}/500 caracteres
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors"
                                style={{ backgroundColor: '#DCDCDC' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c5c5c5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DCDCDC'}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                style={{ backgroundColor: '#3B82F6' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                            >
                                <TfiSave size={16} />
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditFolderModal;
