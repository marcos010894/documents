import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as useApi } from '../../../../services/api';

interface Company {
    link_id: number;
    business_id: number;
    business_type: string;
    cnpj?: string;
    cpf?: string;
    // Campos unificados para exibição
    nome_exibicao?: string;
    razao_social?: string;
    nome_fantasia?: string;
    nome?: string;
    permissions?: any; // Adicionado para suportar permissões dinâmicas
    status: number;
}

interface UserCompaniesResponse {
    user: any;
    companies: Company[];
    total_companies: number;
}

export default function EnvironmentSelection() {
    const navigate = useNavigate();
    const { api } = useApi();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                // Recuperar dados do login
                const userDataStr = localStorage.getItem('infosUserLogin');
                if (!userDataStr) {
                    navigate('/login');
                    return;
                }
                const userData = JSON.parse(userDataStr);
                const email = userData.email || userData.user?.email;

                if (!email) {
                    setError('Email não encontrado na sessão.');
                    return;
                }

                const response = await api.get(`v1/user-business-links/companies/by-email/${email}`);
                if (response.data && response.data.companies) {
                    setCompanies(response.data.companies);
                }
            } catch (err) {
                console.error('Erro ao buscar empresas:', err);
                setError('Falha ao carregar ambientes.');
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, [navigate]);

    const handleSelectEnvironment = (type: 'own' | 'company', company?: Company) => {
        if (type === 'own') {
            // Ambiente Próprio
            localStorage.setItem('selectedCompanyId', 'own');

            // LIMPAR permissões antigas do contexto (se houver)
            try {
                const userDataStr = localStorage.getItem('infosUserLogin');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    // Remove propriedades de contexto e permissões de empresa
                    delete userData.permissions;
                    delete userData.company_id;
                    delete userData.company_type;

                    localStorage.setItem('infosUserLogin', JSON.stringify(userData));
                    console.log('Permissões limpas para ambiente próprio');
                }
            } catch (e) {
                console.error('Erro ao limpar permissões locais:', e);
            }

            // Disparar evento customizado para notificar outros componentes (ex: Documents.tsx)
            window.dispatchEvent(new CustomEvent('companyChanged', {
                detail: { companyId: 'own' }
            }));

            navigate('/ged');
        } else if (company) {
            // Ambiente de Empresa Vinculada
            // Salvar ID da empresa selecionada para contexto das requisições
            localStorage.setItem('selectedCompanyId', company.business_id.toString());
            // Salvar tipo da empresa selecionada também pode ser útil
            localStorage.setItem('selectedBusinessType', company.business_type);

            // ATUALIZAR infosUserLogin com as permissões desta empresa
            try {
                const userDataStr = localStorage.getItem('infosUserLogin');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    // Injetar permissões no objeto do usuário para que os hooks funcionem
                    userData.permissions = company.permissions || {};
                    userData.company_id = company.business_id; // Atualizar contexto atual
                    userData.company_type = company.business_type;

                    localStorage.setItem('infosUserLogin', JSON.stringify(userData));
                    console.log('Permissões atualizadas para ambiente empresa:', userData.permissions);
                }
            } catch (e) {
                console.error('Erro ao atualizar permissões locais:', e);
            }

            // Disparar evento customizado
            window.dispatchEvent(new CustomEvent('companyChanged', {
                detail: { companyId: company.business_id.toString() }
            }));

            navigate('/ged');
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Selecione o Ambiente de Trabalho</h1>
                <p className="text-gray-600 mb-10 text-center">Você possui vínculos com empresas. Onde deseja trabalhar agora?</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card Ambiente Próprio */}
                    <div
                        onClick={() => handleSelectEnvironment('own')}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-l-4 border-blue-500 flex flex-col items-center justify-center h-48 group"
                    >
                        <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Meu Ambiente</h3>
                        <p className="text-sm text-gray-500 mt-2 text-center">Gerenciar meus próprios arquivos</p>
                    </div>

                    {/* Cards de Empresas Vinculadas */}
                    {companies.map((company) => (
                        <div
                            key={company.link_id}
                            onClick={() => handleSelectEnvironment('company', company)}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-l-4 border-red-600 flex flex-col items-center justify-center h-48 group"
                        >
                            <div className="bg-red-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 text-center truncate w-full px-2">
                                {company.nome_exibicao || company.nome_fantasia || company.razao_social || company.nome || 'Empresa'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                {company.business_type === 'pj' ? 'Empresa' : 'Projeto/Freelancer'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
