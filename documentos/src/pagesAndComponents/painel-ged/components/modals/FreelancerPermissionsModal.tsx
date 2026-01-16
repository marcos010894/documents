import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Shield, Lock } from 'lucide-react';
import { UserBusinessLink } from '../../../../services/userBusinessLinksApi';
import { CollaboratorPermissions } from '../../../../services/collaboratorsApi';

interface FreelancerPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (linkId: number, permissions: any) => Promise<void>;
    user: UserBusinessLink | null;
}

const FreelancerPermissionsModal: React.FC<FreelancerPermissionsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    user
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

    const [permissions, setPermissions] = useState({
        manage_files: false,
        view_metrics: false,
        view_only: false,
        manage_collaborators: false,
        view_shared: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && isOpen) {
            setPermissions({
                manage_files: user.permissions?.manage_files || false,
                view_metrics: user.permissions?.view_metrics || false,
                view_only: user.permissions?.view_only || false,
                manage_collaborators: user.permissions?.manage_collaborators || false,
                view_shared: user.permissions?.view_shared || false
            });
        }
        setError('');
    }, [user, isOpen]);

    const handlePermissionChange = (permission: keyof CollaboratorPermissions) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission as keyof typeof prev]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');

        try {
            setLoading(true);
            await onSave(user.id, permissions);
            onClose();
        } catch (err: any) {
            setError(err.message || t('modals.collaborator.error_save'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Gerenciar Permissões
                            </h2>
                            <p className="text-sm text-red-100">
                                {user.nome} ({user.email})
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

                    {/* Permissões */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            {t('modals.collaborator.permissions_label')}
                        </h3>

                        <div className="space-y-3">
                            {(Object.keys(permissions) as Array<keyof CollaboratorPermissions>).map((permission) => (
                                <label
                                    key={permission}
                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${permissions[permission]
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-gray-200 hover:border-red-300 bg-white'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={permissions[permission]}
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
                                Salvar Permissões
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreelancerPermissionsModal;
