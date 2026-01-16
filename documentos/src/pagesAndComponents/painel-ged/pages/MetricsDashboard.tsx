import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TfiPieChart, TfiReload, TfiServer, TfiFolder, TfiFile } from 'react-icons/tfi';
import { MdCloudDone, MdWarning } from 'react-icons/md';
import { getCompanyMetrics, getUserMetrics, MetricsResponse } from '../../../services/metricsApi';

interface MetricsPageProps {
    viewMode?: 'company' | 'user';
}

export const MetricsDashboard: React.FC<MetricsPageProps> = ({ viewMode = 'company' }) => {
    const { t } = useTranslation();
    const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Buscar dados do localStorage seguindo o padrão do sistema
    const getStoredUserData = () => {
        const userInfoStr = localStorage.getItem('infosUserLogin');
        if (!userInfoStr) {
            console.error('❌ infosUserLogin não encontrado no localStorage');
            return null;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo.user?.id;

            // Buscar type_user do localStorage (igual ao storageApi)
            const typeUserFromStorage = localStorage.getItem('type_user');
            const userType = typeUserFromStorage || userInfo.tipo || userInfo.user?.type_user;

            // Buscar company_id
            const companyIdStr = localStorage.getItem('selectedCompanyId') ||
                localStorage.getItem('companyId');

            let finalCompanyId = userId;
            if (companyIdStr && companyIdStr !== 'own') {
                const parsed = parseInt(companyIdStr);
                if (!isNaN(parsed)) {
                    finalCompanyId = parsed;
                }
            }

            const companyId = finalCompanyId;

            console.log('📊 Dados para métricas:', {
                userId,
                companyId,
                userType,
                typeUserFromStorage,
                userInfoTipo: userInfo.tipo,
                viewMode
            });

            return {
                userId,
                companyId,
                userType
            };
        } catch (error) {
            console.error('❌ Erro ao parsear infosUserLogin:', error);
            return null;
        }
    };

    const userData = getStoredUserData();
    const companyId = userData?.companyId;
    const userId = userData?.userId;

    // Normalizar tipo de usuário (IGUAL ao storageApi - 3 tipos)
    const normalizeTipoUsuario = (tipo: string): 'pf' | 'pj' | 'freelancer' => {
        if (!tipo) {
            console.warn('⚠️ Tipo de usuário não encontrado, usando "freelancer" como padrão');
            return 'freelancer';
        }

        const tipoLower = tipo.toLowerCase().trim();

        console.log('🔍 Normalizando tipo:', {
            tipoOriginal: tipo,
            tipoLower
        });

        // Mapear variações para os valores aceitos pela API
        if (tipoLower === 'pf' || tipoLower === 'pessoa física' || tipoLower === 'pessoa fisica') {
            return 'pf';
        }
        if (tipoLower === 'pj' || tipoLower === 'pessoa jurídica' || tipoLower === 'pessoa juridica' ||
            tipoLower === 'empresa' || tipoLower === 'company') {
            return 'pj';
        }
        if (tipoLower === 'freelancer' || tipoLower === 'free lancer') {
            return 'freelancer';
        }

        // Se não reconhecer, usar freelancer como padrão
        console.warn('⚠️ Tipo de usuário não reconhecido:', tipo, '- usando "freelancer" como padrão');
        return 'freelancer';
    };

    const tipoUsuario = normalizeTipoUsuario(userData?.userType || '');

    const loadMetrics = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!companyId || !userId) {
                throw new Error('Dados do usuário não encontrados. Faça login novamente.');
            }

            console.log('🔄 Carregando métricas...', {
                viewMode,
                companyId,
                userId,
                tipoUsuario
            });

            const data = viewMode === 'company'
                ? await getCompanyMetrics(companyId, tipoUsuario)
                : await getUserMetrics(userId, tipoUsuario);

            setMetrics(data);
            console.log('✅ Métricas carregadas:', data);
        } catch (err: any) {
            console.error('❌ Erro ao carregar métricas:', err);
            setError(err.message || 'Erro ao carregar métricas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, [viewMode]);

    // Auto-refresh a cada 1 minuto se ativado
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadMetrics();
        }, 60000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const formatBytes = (bytes: number): string => {
        if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
        if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${bytes} bytes`;
    };

    const getStoragePercentage = (): number => {
        if (!metrics) return 0;
        const limitGB = 10; // Limite padrão de 10GB
        return (metrics.armazenamento.total_gb / limitGB) * 100;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">{t('metrics.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <MdWarning size={32} />
                        <h2 className="text-xl font-bold">{t('metrics.error_loading')}</h2>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadMetrics}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        {t('metrics.try_again')}
                    </button>
                </div>
            </div>
        );
    }

    if (!metrics) return null;

    const storagePercentage = getStoragePercentage();
    const isStorageWarning = storagePercentage > 80;
    const isStorageCritical = storagePercentage > 90;

    // Dados para o gráfico de pizza
    const pieData = metrics.status.map(s => ({
        name: s.status_name,
        value: s.total,
        color: s.status_color
    }));

    // Dados para o gráfico de barras
    const barData = metrics.status.map(s => ({
        name: s.status_name.length > 15 ? s.status_name.substring(0, 12) + '...' : s.status_name,
        quantidade: s.total,
        color: s.status_color
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl">
                                <TfiPieChart className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">
                                    {t('metrics.dashboard_title')}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {viewMode === 'company' ? t('metrics.company_view') : t('metrics.user_view')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Toggle Auto-refresh */}
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${autoRefresh
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <TfiReload className={autoRefresh ? 'animate-spin' : ''} />
                                <span className="text-sm font-medium">
                                    {autoRefresh ? t('metrics.auto_refresh_on') : t('metrics.auto_refresh_off')}
                                </span>
                            </button>

                            {/* Botão Atualizar */}
                            <button
                                onClick={loadMetrics}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all hover:shadow-lg"
                            >
                                <TfiReload />
                                <span className="font-medium">{t('metrics.refresh')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Card Armazenamento */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">{t('metrics.storage')}</h3>
                            <TfiServer className="text-blue-500" size={28} />
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-blue-600">
                                {metrics.armazenamento.total_gb.toFixed(2)} GB
                            </div>
                            <div className="text-sm text-gray-600">
                                {formatBytes(metrics.armazenamento.total_bytes)}
                            </div>

                            {/* Barra de Progresso */}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>{t('metrics.storage_usage')}</span>
                                    <span>{storagePercentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isStorageCritical
                                                ? 'bg-red-500'
                                                : isStorageWarning
                                                    ? 'bg-red-500'
                                                    : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                                    />
                                </div>
                                {isStorageWarning && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                                        <MdWarning />
                                        <span>
                                            {isStorageCritical
                                                ? t('metrics.critical_space')
                                                : t('metrics.near_limit')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Arquivos */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">{t('metrics.files')}</h3>
                            <TfiFile className="text-green-500" size={28} />
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                            {metrics.totais.arquivos}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            {t('metrics.total_documents')}
                        </div>
                        {metrics.totais.arquivos > 0 && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                                <MdCloudDone />
                                <span>{t('metrics.operational_system')}</span>
                            </div>
                        )}
                    </div>

                    {/* Card Pastas */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-700">{t('metrics.folders')}</h3>
                            <TfiFolder className="text-purple-500" size={28} />
                        </div>
                        <div className="text-3xl font-bold text-purple-600">
                            {metrics.totais.pastas}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            {t('metrics.organization_structure')}
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            {t('common.total')}: <span className="font-bold">{metrics.totais.total}</span> {t('metrics.items')}
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Gráfico de Pizza - Status */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🥧</span>
                            {t('metrics.status_distribution')}
                        </h3>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[350px] text-gray-400">
                                <p>{t('metrics.no_documents_status')}</p>
                            </div>
                        )}
                    </div>

                    {/* Gráfico de Barras - Status */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            {t('metrics.quantity_by_status')}
                        </h3>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[350px] text-gray-400">
                                <p>{t('metrics.no_documents_display')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabela de Status Detalhada */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        {t('metrics.detail_by_status')}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('common.status')}</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('metrics.color')}</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('metrics.quantity')}</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('metrics.percentage')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.status.map((status, index) => {
                                    const total = metrics.status.reduce((sum, s) => sum + s.total, 0);
                                    const percentage = total > 0 ? (status.total / total) * 100 : 0;

                                    return (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{status.status_name}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                                                        style={{ backgroundColor: status.status_color }}
                                                    />
                                                    <span className="text-xs text-gray-500">{status.status_color}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-gray-800">
                                                {status.total}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: status.status_color
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer com informações */}
                <div className="mt-6 bg-gradient-to-r from-red-100 to-red-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">
                        {t('metrics.last_update')}: {new Date().toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US')} •{' '}
                        {autoRefresh && t('metrics.auto_refresh_active')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MetricsDashboard;
