import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { Collaborator, CollaboratorPermissions } from '../../../services/collaboratorsApi';

interface CollaboratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    collaborator?: Collaborator | null;
    mode: 'create' | 'edit';
}

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    collaborator,
    mode
}) => {
    const { t } = useTranslation();

    const PERMISSION_LABELS: Record<keyof CollaboratorPermissions, string> = {
        manage_files: t('modals.collaborator.permission_manage_files'),
        view_metrics: t('modals.collaborator.permission_view_metrics'),
        view_only: t('modals.collaborator.permission_view_only'),
        manage_collaborators: t('modals.collaborator.permission_manage_collaborators'),
        view_shared: t('modals.collaborator.permission_view_shared')
    };

    const PERMISSION_DESCRIPTIONS: Record<keyof CollaboratorPermissions, string> = {
        manage_files: t('modals.collaborator.permission_manage_files_desc'),
        view_metrics: t('modals.collaborator.permission_view_metrics_desc'),
        view_only: t('modals.collaborator.permission_view_only_desc'),
        manage_collaborators: t('modals.collaborator.permission_manage_collaborators_desc'),
        view_shared: t('modals.collaborator.permission_view_shared_desc')
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        permissions: {
            manage_files: false,
            view_metrics: false,
            view_only: false,
            manage_collaborators: false,
            view_shared: false
        }
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (collaborator && mode === 'edit') {
            setFormData({
                name: collaborator.name,
                email: collaborator.email,
                password: '',
                permissions: collaborator.permissions
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                permissions: {
                    manage_files: false,
                    view_metrics: false,
                    view_only: false,
                    manage_collaborators: false,
                    view_shared: false
                }
            });
        }
        setError('');
    }, [collaborator, mode, isOpen]);

    const handlePermissionChange = (permission: keyof CollaboratorPermissions) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: !prev.permissions[permission]
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações
        if (!formData.name.trim()) {
            setError(t('modals.collaborator.error_name_required'));
            return;
        }

        if (!formData.email.trim()) {
            setError(t('modals.collaborator.error_email_required'));
            return;
        }

        if (mode === 'create' && !formData.password.trim()) {
            setError(t('modals.collaborator.error_password_required'));
            return;
        }

        // Validar se ao menos uma permissão foi selecionada
        const hasPermission = Object.values(formData.permissions).some(p => p === true);
        if (!hasPermission) {
            setError(t('modals.collaborator.error_permission_required'));
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || t('modals.collaborator.error_save'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {mode === 'create' ? t('modals.collaborator.new_title') : t('modals.collaborator.edit_title')}
                            </h2>
                            <p className="text-sm text-red-100">
                                {mode === 'create' 
                                    ? t('modals.collaborator.new_subtitle')
                                    : t('modals.collaborator.edit_subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Dados Pessoais */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-red-600" />
                            {t('modals.collaborator.personal_data')}
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('modals.collaborator.name_label')} *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                placeholder={t('modals.collaborator.name_placeholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('modals.collaborator.email_label')} *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={mode === 'edit'}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder={t('modals.collaborator.email_placeholder')}
                                />
                            </div>
                            {mode === 'edit' && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('modals.collaborator.email_cannot_change')}
                                </p>
                            )}
                        </div>

                        {mode === 'create' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('modals.collaborator.password_label')} *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                        placeholder={t('modals.collaborator.password_placeholder')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Permissões */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            {t('modals.collaborator.permissions_label')}
                        </h3>

                        <div className="space-y-3">
                            {(Object.keys(formData.permissions) as Array<keyof CollaboratorPermissions>).map((permission) => (
                                <label
                                    key={permission}
                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        formData.permissions[permission]
                                            ? 'border-red-600 bg-red-50'
                                            : 'border-gray-200 hover:border-red-300 bg-white'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions[permission]}
                                        onChange={() => handlePermissionChange(permission)}
                                        className="mt-1 h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                            {PERMISSION_LABELS[permission]}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-0.5">
                                            {PERMISSION_DESCRIPTIONS[permission]}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('modals.collaborator.saving')}
                            </>
                        ) : (
                            <>
                                <Shield className="h-4 w-4" />
                                {mode === 'create' ? t('modals.collaborator.create') : t('modals.collaborator.save')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollaboratorModal;
