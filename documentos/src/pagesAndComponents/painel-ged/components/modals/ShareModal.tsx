import React, { useState } from 'react';
import { TfiClose, TfiShare, TfiUser } from 'react-icons/tfi';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: any;
    onConfirm: (shareData: {
        users: string[];
        allowEditing: boolean;
    }) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    file,
    onConfirm
}) => {
    const [shareData, setShareData] = useState({
        users: [''],
        allowEditing: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validUsers = shareData.users.filter(user => user.trim() !== '');
        if (validUsers.length === 0) {
            alert('Adicione pelo menos um usuário para compartilhar');
            return;
        }

        onConfirm({
            users: validUsers,
            allowEditing: shareData.allowEditing
        });

        // Reset form
        setShareData({
            users: [''],
            allowEditing: false
        });
    };

    const handleClose = () => {
        setShareData({
            users: [''],
            allowEditing: false
        });
        onClose();
    };

    const addUserField = () => {
        setShareData(prev => ({
            ...prev,
            users: [...prev.users, '']
        }));
    };

    const removeUserField = (index: number) => {
        setShareData(prev => ({
            ...prev,
            users: prev.users.filter((_, i) => i !== index)
        }));
    };

    const updateUser = (index: number, value: string) => {
        setShareData(prev => ({
            ...prev,
            users: prev.users.map((user, i) => i === index ? value : user)
        }));
    };

    console.log('📤 ShareModal render - isOpen:', isOpen, 'file:', file);
    if (!isOpen || !file) return null;

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
                                    <TfiShare size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Compartilhar</h2>
                                    <p className="text-gray-500 text-sm">Adicionar usuários para compartilhar</p>
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
                        {/* Arquivo sendo compartilhado */}
                        <div className="mb-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Compartilhando</h4>
                                <p className="text-gray-800 font-semibold">{file.name}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Usuários *
                            </label>
                            {shareData.users.map((user, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="email"
                                        value={user}
                                        onChange={(e) => updateUser(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="email@exemplo.com"
                                    />
                                    {shareData.users.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeUserField(index)}
                                            className="px-3 py-2 text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addUserField}
                                className="text-sm text-blue-500 hover:text-blue-700"
                            >
                                + Adicionar outro usuário
                            </button>
                        </div>

                        <div className="mb-6 bg-red-50 p-3 rounded-lg border border-red-100">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={shareData.allowEditing}
                                    onChange={(e) => setShareData(prev => ({ ...prev, allowEditing: e.target.checked }))}
                                    className="form-checkbox h-5 w-5 text-red-700 rounded border-gray-300 focus:ring-red-600"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-900 block">Permitir edição</span>
                                    <span className="text-xs text-gray-500 block">Usuários poderão editar, renomear e excluir este arquivo/pasta</span>
                                </div>
                            </label>
                        </div>



                        {/* Footer */}
                        <div className="flex justify-end gap-3">
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
                                className="px-6 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                style={{ backgroundColor: '#f37329' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
                            >
                                Compartilhar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ShareModal;
