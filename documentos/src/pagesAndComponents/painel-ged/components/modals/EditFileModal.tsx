import React, { useState, useRef } from 'react';
import { TfiClose, TfiFile, TfiUpload, TfiSave, TfiCalendar, TfiTag } from 'react-icons/tfi';
import { STATUS_OPTIONS, getStatusIcon, getStatusLabel } from '../../status/statusConfig';

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
}

interface EditFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileItem | null;
    onConfirm: (updatedFile: Partial<FileItem>, newFile?: File) => void;
}

const EditFileModal: React.FC<EditFileModalProps> = ({
    isOpen,
    onClose,
    file,
    onConfirm
}) => {
    const [formData, setFormData] = useState({
        name: '',
        status: '',
        validityDate: '',
        comments: ''
    });
    const [newFile, setNewFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // statusOptions agora vem de STATUS_OPTIONS centralizado

    React.useEffect(() => {
        if (file && isOpen) {
            setFormData({
                name: file.name || '',
                status: file.status || '',
                validityDate: file.validityDate || '',
                comments: file.comments || ''
            });
            setNewFile(null);
            setErrors({});
        }
    }, [file, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Verificar se o tipo de arquivo é compatível com o arquivo original
            const originalExtension = file?.extension?.toLowerCase();
            const newExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
            
            if (originalExtension && originalExtension !== newExtension) {
                setErrors(prev => ({ 
                    ...prev, 
                    file: `O novo arquivo deve ter a mesma extensão (${originalExtension.toUpperCase()})`
                }));
                return;
            }

            // Verificar tamanho (máximo 50MB)
            if (selectedFile.size > 50 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, file: 'Arquivo deve ter no máximo 50MB' }));
                return;
            }

            setNewFile(selectedFile);
            setErrors(prev => ({ ...prev, file: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const updatedFile: Partial<FileItem> = {
            name: formData.name.trim(),
            status: formData.status as any,
            validityDate: formData.validityDate,
            comments: formData.comments
        };

        onConfirm(updatedFile, newFile || undefined);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            name: '',
            status: '',
            validityDate: '',
            comments: ''
        });
        setNewFile(null);
        setErrors({});
        onClose();
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen || !file) return null;

    return (
        <>
            {/* Backdrop com blur */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={handleClose} />
            
            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideIn">
                    {/* Header clean */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <TfiFile size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Editar Arquivo</h2>
                                    <p className="text-gray-500 text-sm">Alterar informações e substituir arquivo</p>
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
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        {/* Informações do arquivo atual */}
                        <div className="mb-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Arquivo Atual</h4>
                                <p className="text-gray-800 font-semibold">{file.name}</p>
                                <p className="text-gray-500 text-sm">
                                    {file.size} • {file.extension?.toUpperCase()} • Criado em {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        {/* Nome do arquivo */}
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Arquivo *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Digite o nome do arquivo"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Substituir arquivo */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Substituir Arquivo (Opcional)
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleFileButtonClick}
                                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <TfiUpload size={16} />
                                    Escolher Novo Arquivo
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="*/*"
                                />
                                {newFile && (
                                    <span className="text-sm text-green-600 font-medium">
                                        {newFile.name} ({(newFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                )}
                            </div>
                            {errors.file && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                    {errors.file}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Selecione um status</option>
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.icon} {opt.label}
                                    </option>
                                ))}
                            </select>
                            {formData.status && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                    <span>{getStatusIcon(formData.status)} {getStatusLabel(formData.status)}</span>
                                </div>
                            )}
                        </div>

                        {/* Data de validade */}
                        <div className="mb-4">
                            <label htmlFor="validityDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Validade
                            </label>
                            <input
                                type="date"
                                id="validityDate"
                                name="validityDate"
                                value={formData.validityDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Comentários */}
                        <div className="mb-6">
                            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                                Comentários
                            </label>
                            <textarea
                                id="comments"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                placeholder="Adicione comentários sobre o arquivo..."
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg transition-colors duration-200"
                                style={{ backgroundColor: '#DCDCDC' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c5c5c5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DCDCDC'}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                style={{ backgroundColor: '#f37329' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
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

export default EditFileModal;
