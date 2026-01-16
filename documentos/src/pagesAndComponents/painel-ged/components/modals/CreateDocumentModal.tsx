import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TfiClose, TfiFile, TfiUpload } from 'react-icons/tfi';

interface CreateDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (documentData: {
        title: string;
        comments: string;
        validityDate: string;
        status: string;
        notifyToExpire: string;
        file: File | null;
    }) => void;
    currentPath: string;
}

const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    currentPath
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        comments: '',
        validityDate: '',
        status: 'Em processo',
        notifyToExpire: 'Para mim'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const statusOptions = [
        'Em renovação',
        'A vencer', 
        'Em processo',
        'Válido',
        'Vencido'
    ];

    const notifyOptions = [
        'Para mim',
        'Para seguidores'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpar erro do campo quando usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Verificar tamanho do arquivo (máximo 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, file: t('modals.create_document.error_file_size') }));
                return;
            }
            
            // Verificar tipos de arquivo permitidos
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/jpg',
                'image/gif',
                'image/bmp',
                'image/svg+xml',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
                'application/csv',
                'text/xml',
                'application/xml',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'video/mp4',
                'video/avi',
                'video/quicktime',
                'audio/mpeg',
                'audio/wav',
                'application/zip',
                'application/x-rar-compressed'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ 
                    ...prev, 
                    file: t('modals.create_document.error_file_type')
                }));
                return;
            }

            setSelectedFile(file);
            setErrors(prev => ({ ...prev, file: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.title.trim()) {
            newErrors.title = t('modals.create_document.error_title_required');
        }

        if (!formData.validityDate) {
            newErrors.validityDate = t('modals.create_document.error_validity_required');
        } else {
            const selectedDate = new Date(formData.validityDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                newErrors.validityDate = t('modals.create_document.error_validity_past');
            }
        }

        if (!selectedFile) {
            newErrors.file = t('modals.create_document.error_file_required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        onConfirm({
            ...formData,
            file: selectedFile
        });

        // Reset form
        setFormData({
            title: '',
            comments: '',
            validityDate: '',
            status: 'Em processo',
            notifyToExpire: 'Para mim'
        });
        setSelectedFile(null);
        setErrors({});
    };

    const handleClose = () => {
        setFormData({
            title: '',
            comments: '',
            validityDate: '',
            status: 'Em processo',
            notifyToExpire: 'Para mim'
        });
        setSelectedFile(null);
        setErrors({});
        onClose();
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
                <>
            {/* Backdrop com blur */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={handleClose} />
            
            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
                    {/* Header clean */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <TfiFile size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{t('modals.create_document.title')}</h2>
                                    <p className="text-gray-500 text-sm">{t('modals.create_document.subtitle')}</p>
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
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{/* Localização atual */}
                        <div className="mb-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <h4 className="text-sm font-medium text-blue-800 mb-1">{t('modals.create_folder.location')}</h4>
                                <p className="text-blue-700 text-sm">{currentPath}</p>
                            </div>
                        </div>

                    {/* Título */}
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('modals.create_document.title_label')} *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                                errors.title ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder={t('modals.create_document.title_placeholder')}
                            autoFocus
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* Comentários */}
                    <div className="mb-4">
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('modals.create_document.comments_label')}
                        </label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                            placeholder={t('modals.create_document.comments_placeholder')}
                        />
                    </div>

                    {/* Data de Validade e Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="validityDate" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('modals.create_document.validity_label')} *
                            </label>
                            <input
                                type="date"
                                id="validityDate"
                                name="validityDate"
                                value={formData.validityDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                                    errors.validityDate ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.validityDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.validityDate}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('modals.create_document.status_label')}
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            >
                                {statusOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Upload do arquivo */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('modals.create_document.file_label')} *
                        </label>
                        <div 
                            onClick={handleFileButtonClick}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                errors.file 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
                            }`}
                        >
                            <TfiUpload className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm text-gray-600 mb-1">
                                {selectedFile ? selectedFile.name : t('modals.create_document.file_placeholder')}
                            </p>
                            <p className="text-xs text-gray-500">
                                {t('modals.create_document.file_types')}
                            </p>
                            {selectedFile && (
                                <p className="text-xs text-red-700 mt-2">
                                    {t('modals.create_document.file_selected', { size: (selectedFile.size / 1024 / 1024).toFixed(2) })}
                                </p>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.xml,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.svg,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar"
                            className="hidden"
                        />
                        {errors.file && (
                            <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                        )}
                    </div>

                    {/* Notificações */}
                    {/* <div className="mb-6">
                        <label htmlFor="notifyToExpire" className="block text-sm font-medium text-gray-700 mb-2">
                            Notificar ao vencer
                        </label>
                        <select
                            id="notifyToExpire"
                            name="notifyToExpire"
                            value={formData.notifyToExpire}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        >
                            {notifyOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div> */}

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
                            {t('modals.create_document.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                            style={{ backgroundColor: '#f37329' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
                        >
                            {t('modals.create_document.create_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default CreateDocumentModal;
