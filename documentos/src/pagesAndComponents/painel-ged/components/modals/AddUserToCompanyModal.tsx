import React, { useState } from 'react';
import { TfiClose, TfiEmail, TfiCheck } from 'react-icons/tfi';
import { MdPersonAdd, MdInfo } from 'react-icons/md';

interface AddUserToCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (email: string, permissions: any) => Promise<void>;
    loading?: boolean;
}

const AddUserToCompanyModal: React.FC<AddUserToCompanyModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false
}) => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado inicial das permissões (padrão: gerenciar arquivos e métricas)
    const [permissions, setPermissions] = useState({
        manage_files: true,
        view_metrics: true,
        view_only: false,
        manage_collaborators: false,
        view_shared: false
    });

    if (!isOpen) return null;

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError('Email inválido');
        } else {
            setEmailError('');
        }
    };

    const handlePermissionChange = (key: string, checked: boolean) => {
        setPermissions(prev => {
            const newPermissions = { ...prev, [key]: checked };

            // Lógica de exclusão mútua
            if (key === 'view_only' && checked) {
                newPermissions.manage_files = false;
            }
            if (key === 'manage_files' && checked) {
                newPermissions.view_only = false;
            }

            return newPermissions;
        });
    };

    const handleConfirm = async () => {
        if (!email.trim()) {
            setEmailError('Email é obrigatório');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Email inválido');
            return;
        }

        setIsSubmitting(true);
        try {
            await onConfirm(email, permissions);

            // Limpar form
            setEmail('');
            setEmailError('');
        } catch (error) {
            // Erro já tratado pelo pai
            console.error('Erro ao adicionar usuário:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;

        setEmail('');
        setEmailError('');
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-2xl flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                    <MdPersonAdd size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Vincular Usuário</h2>
                                    <p className="text-red-100 text-sm">Adicionar colaborador à empresa</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
                                disabled={isSubmitting}
                            >
                                <TfiClose size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                        {/* Info box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <MdInfo className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Como funciona?</p>
                                    <ul className="text-blue-700 space-y-1">
                                        <li>• O usuário deve estar <strong>cadastrado no sistema</strong></li>
                                        <li>• Digite o <strong>email</strong> cadastrado</li>
                                        <li>• O sistema busca automaticamente e vincula à sua empresa</li>
                                        <li>• O usuário poderá acessar documentos e fazer uploads</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Campo Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <TfiEmail size={16} />
                                    Email do Usuário *
                                </div>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                placeholder="usuario@exemplo.com"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${emailError
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-red-600 focus:border-red-600'
                                    }`}
                                disabled={isSubmitting}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleConfirm();
                                    }
                                }}
                            />
                            {emailError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    ⚠️ {emailError}
                                </p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                Digite o email que o usuário usou no cadastro
                            </p>
                        </div>

                        {/* Resumo */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <TfiCheck size={16} />
                                O que acontece depois?
                            </h4>
                            <ul className="text-xs text-green-700 space-y-1">
                                <li>✓ Usuário vinculado à sua empresa</li>
                                <li>✓ Pode fazer upload de documentos</li>
                                <li>✓ Vê apenas documentos da sua empresa</li>
                                <li>✓ Você pode desativar o acesso a qualquer momento</li>
                            </ul>
                        </div>

                        {/* Permissões */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">Permissões de Acesso</label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={permissions.manage_files}
                                    onChange={(e) => handlePermissionChange('manage_files', e.target.checked)}
                                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-600"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Gerenciar Arquivos</div>
                                    <div className="text-xs text-gray-500">Pode criar, editar e excluir arquivos da empresa</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={permissions.view_metrics}
                                    onChange={(e) => handlePermissionChange('view_metrics', e.target.checked)}
                                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-600"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Visualizar Métricas</div>
                                    <div className="text-xs text-gray-500">Pode ver o dashboard de uso de armazenamento</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={permissions.view_only}
                                    onChange={(e) => handlePermissionChange('view_only', e.target.checked)}
                                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-600"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Apenas Visualizar</div>
                                    <div className="text-xs text-gray-500">Pode ver todos os arquivos mas não pode editar</div>
                                </div>
                            </label>
                        </div>

                        {/* Warning para freelancers */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-800">
                                <strong>⚠️ Importante:</strong> Se o usuário for freelancer e trabalhar para múltiplas empresas,
                                ele precisará selecionar sua empresa ao fazer login para ver seus documentos.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting || !email || !!emailError}
                            className="flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: isSubmitting || !email || !!emailError ? '#9CA3AF' : '#f37329'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting && email && !emailError) {
                                    e.currentTarget.style.backgroundColor = '#d1722f';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting && email && !emailError) {
                                    e.currentTarget.style.backgroundColor = '#f37329';
                                }
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Vinculando...
                                </>
                            ) : (
                                <>
                                    <MdPersonAdd size={18} />
                                    Vincular Usuário
                                </>
                            )}
                        </button>
                    </div>
                </div >
            </div >
        </>
    );
};

export default AddUserToCompanyModal;
