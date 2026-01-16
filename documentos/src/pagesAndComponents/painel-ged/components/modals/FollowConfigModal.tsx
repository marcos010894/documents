import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TfiClose, TfiBell, TfiCalendar, TfiCheck } from 'react-icons/tfi';

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    validityDate?: string;
    usuario_atual_segue?: {
        seguindo: boolean;
        dias_antes_alerta?: number;
        alertar_no_vencimento?: boolean;
    };
}

interface FollowConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileItem | null;
    onConfirm: (config: {
        dias_antes_alerta: number;
        alertar_no_vencimento: boolean;
    }) => void;
    isFollowing: boolean; // Se está seguindo ou vai começar a seguir
}

const FollowConfigModal: React.FC<FollowConfigModalProps> = ({
    isOpen,
    onClose,
    file,
    onConfirm,
    isFollowing
}) => {
    const { t } = useTranslation();
    const [diasAntes, setDiasAntes] = useState<number>(7);
    const [alertarNoVencimento, setAlertarNoVencimento] = useState<boolean>(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (file && isOpen) {
            // Se já está seguindo, usar as configurações atuais
            if (isFollowing && file.usuario_atual_segue) {
                setDiasAntes(file.usuario_atual_segue.dias_antes_alerta || 7);
                setAlertarNoVencimento(file.usuario_atual_segue.alertar_no_vencimento ?? true);
            } else {
                // Configurações padrão
                setDiasAntes(7);
                setAlertarNoVencimento(true);
            }
            setErrors({});
        }
    }, [file, isOpen, isFollowing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};

        if (diasAntes < 0 || diasAntes > 90) {
            newErrors.diasAntes = t('modals.follow_config.error_days_range');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onConfirm({
            dias_antes_alerta: diasAntes,
            alertar_no_vencimento: alertarNoVencimento
        });

        handleClose();
    };

    const handleClose = () => {
        setDiasAntes(7);
        setAlertarNoVencimento(true);
        setErrors({});
        onClose();
    };

    if (!isOpen || !file) return null;

    return (
        <>
            {/* Backdrop com blur */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={handleClose} />
            
            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slideIn">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TfiBell size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {isFollowing ? t('modals.follow_config.title_configure') : t('modals.follow_config.title_follow')}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {isFollowing ? t('modals.follow_config.subtitle_configure') : t('modals.follow_config.subtitle_follow')}
                                    </p>
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
                        {/* Nome do arquivo */}
                        <div className="mb-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <h4 className="text-sm font-medium text-blue-800 mb-1">{t('modals.follow_config.document')}</h4>
                                <p className="text-blue-700 font-semibold">{file.name}</p>
                                {file.validityDate && (
                                    <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                                        <TfiCalendar size={12} />
                                        {t('modals.follow_config.expires_at')}: {new Date(file.validityDate).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dias antes do alerta */}
                        <div className="mb-4">
                            <label htmlFor="diasAntes" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('modals.follow_config.days_before_label')} *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="diasAntes"
                                    min="0"
                                    max="90"
                                    value={diasAntes}
                                    onChange={(e) => {
                                        setDiasAntes(parseInt(e.target.value) || 0);
                                        if (errors.diasAntes) {
                                            setErrors(prev => ({ ...prev, diasAntes: '' }));
                                        }
                                    }}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.diasAntes ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: 7"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    {t('modals.follow_config.days')}
                                </span>
                            </div>
                            {errors.diasAntes && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                    {errors.diasAntes}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                {t('modals.follow_config.days_help')}
                            </p>
                        </div>

                        {/* Sugestões rápidas */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">{t('modals.follow_config.quick_suggestions')}:</p>
                            <div className="flex flex-wrap gap-2">
                                {[7, 15, 30, 60].map(dias => (
                                    <button
                                        key={dias}
                                        type="button"
                                        onClick={() => setDiasAntes(dias)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                                            diasAntes === dias
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {dias} {t('modals.follow_config.days')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Alertar no vencimento */}
                        <div className="mb-6">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={alertarNoVencimento}
                                        onChange={(e) => setAlertarNoVencimento(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                                        alertarNoVencimento ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}>
                                        <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                                            alertarNoVencimento ? 'transform translate-x-5' : ''
                                        }`} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        {t('modals.follow_config.alert_on_expiration')}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('modals.follow_config.alert_on_expiration_help')}
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Info adicional */}
                        <div className="mb-6">
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="flex items-start space-x-2">
                                    <TfiBell className="text-red-600 mt-0.5" size={16} />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800 mb-1">
                                            {t('modals.follow_config.how_alerts_work')}
                                        </h4>
                                        <ul className="text-xs text-red-700 space-y-1">
                                            <li>• {t('modals.follow_config.alert_info_1')}</li>
                                            <li>• {t('modals.follow_config.alert_info_2')}</li>
                                            <li>• {t('modals.follow_config.alert_info_3')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
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
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                style={{ backgroundColor: '#4169E1' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#315ab8'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4169E1'}
                            >
                                <TfiCheck size={16} />
                                {isFollowing ? t('modals.follow_config.update_config') : t('modals.follow_config.start_following')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default FollowConfigModal;
