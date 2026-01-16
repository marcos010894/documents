import HeaderPainel from "../../components_globals/header_global"
import GlobalMenu from "../../components_globals/globalMenu"
import PagesCenterGlobal from "../../components_globals/globalCenterPages";
import Metrics from "./pages/metrics";
import MetricsDashboard from "./pages/MetricsDashboard";
import Documents from "./pages/documents";
import Trash from "./pages/Trash";
import CompanyUsers from "./pages/CompanyUsers";
import KeyWords from "./components/keyworks";
import { Menu } from 'lucide-react'; // ícone hambúrguer
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Busness from "./components/busness";
import Indications from "./components/indications";
import EditUser from "./components/editUser";
import EditBusness from "./components/editBuness";
import EditProfile from "./flatBasic/photo";
import { VerifyDataExistInJson } from "../../services/funcitons";
import Subscribes from "./components/subscribes";
// First, add these icon imports at the top of your file
import {
    AiOutlineDashboard,
    AiOutlineUsergroupAdd
} from "react-icons/ai";
import {
    MdOutlineSubscriptions,
    MdOutlinePhotoCamera,
    MdOutlineWorkOutline,
    MdPeople
} from "react-icons/md";
import {
    FiUsers,
    FiKey
} from "react-icons/fi";
import {
    TfiCreditCard,
    TfiSettings,
    TfiLayout,
    TfiFolder,
    TfiTrash,
    TfiPieChart,
    TfiClose,
} from "react-icons/tfi";
import RequetsContacts from "./components/requestsContacts";

type PermissionType = 'manage_files' | 'view_metrics' | 'manage_collaborators' | 'view_only' | 'view_shared';

interface MenuItem {
    type: string;
    openTypeProps: any[];
    title: string;
    redirectText: React.ReactNode;
    icon: React.ReactNode;
    navigate: (redirectText: React.ReactNode) => void;
    requiredPermission?: PermissionType | PermissionType[];
}

const PainelMKT = () => {
    const { t } = useTranslation();

    const useNavigateFunc = (redirectText: React.ReactNode) => {
        setPage(redirectText)
    }

    const user = localStorage.getItem('infosUserLogin')
    let info: any = null;
    if (user) {
        info = JSON.parse(user)
    }

    // Verificação de segurança: redirecionar se não tiver dados
    const navigate = useNavigate();
    useEffect(() => {
        if (!info || !info.user) {
            console.error('❌ Dados do usuário não encontrados! Redirecionando para login...');
            navigate('/login');
        }
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [page, setPage] = useState<React.ReactNode>(<PagesCenterGlobal Title={t('menu.documents')} scratch={false} component={<Documents />} />)
    // Aplicar overflow hidden ao body quando o painel estiver ativo
    useEffect(() => {
        // Salvar o overflow original
        const originalOverflow = document.body.style.overflow;

        // Aplicar overflow hidden para layout fixo
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // Cleanup: restaurar quando o componente for desmontado
        return () => {
            document.body.style.overflow = originalOverflow;
            document.documentElement.style.overflow = '';
        };
    }, []);

    // Impede o scroll ao abrir o menu no mobile
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'hidden'; // Manter hidden para o painel
        }
    }, [isMenuOpen]);

    // const alterPage = () => {
    //     //setPage()
    //     setPage(<PagesCenterGlobal Title="MarketPlace" scratch={true} component={<Metrics />} />)
    //     setPage(<PagesCenterGlobal Title="Empresas" scratch={true} component={<Busness />} />)
    //     setPage(<PagesCenterGlobal Title="Freelancer" scratch={false} component={<Supplier />} />)
    //     setPage(< PagesCenterGlobal Title="Indicações" scratch={false} component={< Indications />} />)
    // }


    const infoUser = {
        name: info?.user?.nome || 'Usuário',
        photoLink: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
        typeProfile: info?.user?.email || 'email@exemplo.com'
    }
    // Then update your ListOptionDash code:
    var ListOptionDash: MenuItem[] = [{
        type: 'redirect',
        openTypeProps: [],
        title: t('dashboard.documents'),
        redirectText: <PagesCenterGlobal Title={t('dashboard.documents')} scratch={false} component={<Documents />} />,
        icon: <TfiFolder className="w-[24px] h-[24px]" />,
        navigate: useNavigateFunc,
        requiredPermission: ['manage_files', 'view_shared'] as any
    },
    {
        type: 'redirect',
        openTypeProps: [],
        title: t('dashboard.trash'),
        redirectText: <PagesCenterGlobal Title={t('dashboard.trash')} scratch={false} component={<Trash />} />,
        icon: <TfiTrash className="w-[24px] h-[24px]" />,
        navigate: useNavigateFunc,
        requiredPermission: 'manage_files' as const
    },
    {
        type: 'redirect',
        openTypeProps: [],
        title: t('dashboard.users'),
        redirectText: <PagesCenterGlobal Title={t('dashboard.company_users')} scratch={false} component={<CompanyUsers />} />,
        icon: <MdPeople className="w-[24px] h-[24px]" />,
        navigate: useNavigateFunc,
        requiredPermission: 'manage_collaborators' as const
    },
    {
        type: 'redirect',
        openTypeProps: [],
        title: t('dashboard.metrics'),
        redirectText: <PagesCenterGlobal Title={t('dashboard.metrics_dashboard')} scratch={false} component={<MetricsDashboard viewMode="company" />} />,
        icon: <TfiPieChart className="w-[24px] h-[24px]" />,
        navigate: useNavigateFunc,
        requiredPermission: 'view_metrics' as const
    }];

    if (VerifyDataExistInJson('GEDMASTER')) {
        let isFreelancerView = info?.tipo === 'Freelancer';

        ListOptionDash = [
            {
                type: 'redirect',
                openTypeProps: [],
                title: t('dashboard.documents'),
                redirectText: <PagesCenterGlobal Title={t('dashboard.documents')} scratch={false} component={<Documents />} />,
                icon: <TfiFolder className="w-[24px] h-[24px]" />,
                navigate: useNavigateFunc,
                requiredPermission: ['manage_files', 'view_shared'] as any
            },
            {
                type: 'redirect',
                openTypeProps: [],
                title: t('dashboard.trash'),
                redirectText: <PagesCenterGlobal Title={t('dashboard.trash')} scratch={false} component={<Trash />} />,
                icon: <TfiTrash className="w-[24px] h-[24px]" />,
                navigate: useNavigateFunc,
                requiredPermission: 'manage_files' as const
            },
            {
                type: 'redirect',
                openTypeProps: [],
                title: t('dashboard.users'),
                redirectText: <PagesCenterGlobal Title={t('dashboard.company_users')} scratch={false} component={<CompanyUsers />} />,
                icon: <MdPeople className="w-[24px] h-[24px]" />,
                navigate: useNavigateFunc,
                requiredPermission: 'manage_collaborators' as const
            },
            {
                type: 'redirect',
                openTypeProps: [],
                title: t('dashboard.metrics'),
                redirectText: <PagesCenterGlobal Title={t('dashboard.metrics_dashboard')} scratch={false} component={<MetricsDashboard viewMode="company" />} />,
                icon: <TfiPieChart className="w-[24px] h-[24px]" />,
                navigate: useNavigateFunc,
                requiredPermission: 'view_metrics' as const
            },
            
        ];
    }



    // ListOptionDash.push({
    //     type: 'redirect',
    //     openTypeProps: [],
    //     title: 'Minha assinatura',
    //     redirectText: <PagesCenterGlobal Title="Minha Assinatura" scratch={false} component={<SubscriptionCard />} />,
    //     icon: <TfiCreditCard className="w-[24px] h-[24px]" />, // Better credit card icon
    //     navigate: useNavigateFunc
    // });
    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header fixo com sombra suave */}
            <HeaderPainel info={infoUser} />

            {/* Container principal com menu lateral e conteúdo */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Botão hambúrguer - mobile/tablet */}
                <button
                    className="fixed top-5 right-4 z-40 lg:hidden bg-red-600 hover:bg-red-700 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setIsMenuOpen(true)}
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>

                {/* Menu lateral fixo - SIMPLIFICADO E LIMPO */}
                <aside className="hidden lg:flex lg:flex-col w-72 bg-white shadow-xl overflow-y-auto border-r border-gray-200">
                    <div className="p-6 space-y-6">
                        {/* Logo */}
                  

                        {/* Menu */}
                        <nav className="space-y-1">
                            <GlobalMenu listItem={ListOptionDash} />
                        </nav>
                    </div>
                </aside>

                {/* Menu lateral mobile - SIMPLIFICADO */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Fundo escuro */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Menu lateral limpo */}
                        <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
                            {/* Header do menu */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-600">
                                <img src="/salexpress-logo.png" alt="SalExpress Logo" className="h-8" />
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    <TfiClose className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Menu */}
                            <nav className="flex-1 overflow-y-auto p-6 space-y-1">
                                <GlobalMenu listItem={ListOptionDash} />
                            </nav>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <p className="text-xs text-gray-500 text-center">
                                    SalExpress © 2025
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Conteúdo principal - MELHORADO */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="min-h-full">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
                            <div className="text-base font-normal text-gray-800">
                                {page}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PainelMKT;
