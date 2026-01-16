import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TfiClose, TfiFolder } from 'react-icons/tfi';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (folderName: string) => void;
    currentPath: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    currentPath
}) => {
    const { t } = useTranslation();
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!folderName.trim()) {
            setError(t('modals.create_folder.error_required'));
            return;
        }

        if (folderName.trim().length < 2) {
            setError(t('modals.create_folder.error_min_chars'));
            return;
        }

        // Verificar caracteres inválidos
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(folderName)) {
            setError(t('modals.create_folder.error_invalid_chars'));
            return;
        }

        onConfirm(folderName.trim());
        setFolderName('');
        setError('');
    };

    const handleClose = () => {
        setFolderName('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop com blur */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={handleClose} />
            
            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
                    {/* Header clean */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <TfiFolder size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{t('modals.create_folder.title')}</h2>
                                    <p className="text-gray-500 text-sm">{t('modals.create_folder.subtitle')}</p>
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
                        {/* Localização atual */}
                        <div className="mb-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <h4 className="text-sm font-medium text-blue-800 mb-1">{t('modals.create_folder.location')}</h4>
                                <p className="text-blue-700 text-sm">{currentPath}</p>
                            </div>
                        </div>

                        {/* Campo de entrada */}
                        <div className="mb-6">
                            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('modals.create_folder.name_label')} *
                            </label>
                            <input
                                type="text"
                                id="folderName"
                                value={folderName}
                                onChange={(e) => {
                                    setFolderName(e.target.value);
                                    setError('');
                                }}
                                placeholder={t('modals.create_folder.name_placeholder')}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 ${
                                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                autoFocus
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                    {error}
                                </p>
                            )}
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
                                {t('modals.create_folder.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                style={{ backgroundColor: '#f37329' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
                            >
                                {t('modals.create_folder.create_button')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateFolderModal;
