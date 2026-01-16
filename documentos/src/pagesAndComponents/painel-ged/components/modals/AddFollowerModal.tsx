import React, { useState } from 'react';
import { TfiClose, TfiEmail, TfiCalendar, TfiBell, TfiCheck } from 'react-icons/tfi';
import { MdPersonAdd } from 'react-icons/md';

interface AddFollowerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (email: string, diasAntes: number, alertarNoVencimento: boolean) => void;
    loading?: boolean;
}

const AddFollowerModal: React.FC<AddFollowerModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false
}) => {
    const [email, setEmail] = useState('');
    const [diasAntes, setDiasAntes] = useState(7);
    const [alertarNoVencimento, setAlertarNoVencimento] = useState(true);
    const [emailError, setEmailError] = useState('');

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

    const handleConfirm = () => {
        if (!email.trim()) {
            setEmailError('Email é obrigatório');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Email inválido');
            return;
        }

        if (diasAntes < 0 || diasAntes > 90) {
            alert('Dias antes do alerta deve estar entre 0 e 90');
            return;
        }

        onConfirm(email, diasAntes, alertarNoVencimento);
        
        // Limpar form
        setEmail('');
        setDiasAntes(7);
        setAlertarNoVencimento(true);
        setEmailError('');
    };

    const handleClose = () => {
        setEmail('');
        setDiasAntes(7);
        setAlertarNoVencimento(true);
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
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                    <MdPersonAdd size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Adicionar Seguidor</h2>
                                    <p className="text-blue-100 text-sm">Compartilhar notificações do documento</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
                                disabled={loading}
                            >
                                <TfiClose size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">
                        {/* Info box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <TfiBell className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Apenas o dono pode adicionar seguidores</p>
                                    <p className="text-blue-700">
                                        O usuário receberá notificações sobre vencimentos de acordo com as configurações definidas.
                                    </p>
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
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    emailError 
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                                disabled={loading}
                            />
                            {emailError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    ⚠️ {emailError}
                                </p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                O sistema buscará automaticamente o usuário por este email
                            </p>
                        </div>

                        {/* Campo Dias Antes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <TfiCalendar size={16} />
                                    Alertar quantos dias antes do vencimento?
                                </div>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="0"
                                    max="90"
                                    value={diasAntes}
                                    onChange={(e) => setDiasAntes(parseInt(e.target.value) || 0)}
                                    className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    disabled={loading}
                                />
                                <span className="text-gray-600">dias antes</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1">
                                Valor entre 0 e 90 dias (padrão: 7 dias)
                            </p>
                        </div>

                        {/* Toggle Alertar no Vencimento */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="alertarNoVencimento"
                                checked={alertarNoVencimento}
                                onChange={(e) => setAlertarNoVencimento(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                disabled={loading}
                            />
                            <label 
                                htmlFor="alertarNoVencimento" 
                                className="flex-1 cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    <TfiBell size={14} />
                                    Alertar também no dia do vencimento
                                </div>
                                <p className="text-xs text-gray-600">
                                    O usuário receberá uma notificação extra no dia exato do vencimento
                                </p>
                            </label>
                        </div>

                        {/* Resumo das configurações */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <TfiCheck size={16} />
                                Configuração de Notificações
                            </h4>
                            <ul className="text-xs text-green-700 space-y-1">
                                <li>• Alerta {diasAntes} dias antes do vencimento</li>
                                {alertarNoVencimento && (
                                    <li>• Alerta no dia do vencimento</li>
                                )}
                                {!alertarNoVencimento && (
                                    <li className="text-green-600">• Sem alerta no dia do vencimento</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || !email || !!emailError}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Adicionando...
                                </>
                            ) : (
                                <>
                                    <MdPersonAdd size={18} />
                                    Adicionar Seguidor
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddFollowerModal;
