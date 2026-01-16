import { useState, useRef, useEffect } from 'react';
import { Camera, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserInfos {
    name: string;
    photoLink: string;
    typeProfile: string;
}

interface HeaderPainelGlobalInfos {
    info: UserInfos;
}

const HeaderPainel = ({ info }: HeaderPainelGlobalInfos) => {
    const { t, i18n } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(info.photoLink);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);

    const currentLanguage = i18n.language;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('lng', lng);
        setLangMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    const handleOpenFile = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                localStorage.setItem('userPhoto', imageUrl);
                setImagePreview(imageUrl);
                uploadUserPhoto(imageUrl); // Chamada à API aqui
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadUserPhoto = async (imageBase64: string) => {
        const id_user = localStorage.getItem('id_user');
        const type_user = localStorage.getItem('type_user');
        const typePlan = localStorage.getItem('typePlan');

        if (!id_user || !type_user || !typePlan) {
            console.error('Faltam dados obrigatórios para o upload da imagem');
            return;
        }

        const query = new URLSearchParams({
            id_user,
            type_user,
            typePlan,
            urlPhoto: imageBase64,
        });

        try {
            const response = await fetch(`https://suaapi.com/api/update-photo?${query.toString()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar foto');
            }

            console.log('Foto atualizada com sucesso!');
        } catch (error) {
            console.error('Erro no upload da imagem:', error);
        }
    };

    return (
        <>
            {/* Header SIMPLIFICADO */}
            <header className="h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b-2 border-red-600 shadow-sm sticky top-0 z-30">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <img 
                            src="/salexpress-logo.png" 
                            alt="SalExpress Logo" 
                            className="h-8 lg:h-10 w-auto object-contain" 
                        />
                    </div>
                </div>

                {/* Right side: Language selector + User menu */}
                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <div className="relative" ref={langMenuRef}>
                        <button
                            onClick={() => setLangMenuOpen(prev => !prev)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                            title={t('header.language')}
                        >
                            <Globe size={20} />
                            <span className="hidden sm:inline text-sm font-medium uppercase">
                                {currentLanguage}
                            </span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Language Dropdown */}
                        {langMenuOpen && (
                            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-44 py-2 animate-fade-in-down">
                                <button
                                    onClick={() => changeLanguage('pt')}
                                    className={`w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 ${
                                        currentLanguage === 'pt' ? 'bg-red-50 text-red-600' : 'text-gray-700'
                                    }`}
                                >
                                    <span className="text-xl">🇧🇷</span>
                                    <span className="font-medium">Português</span>
                                    {currentLanguage === 'pt' && (
                                        <svg className="w-4 h-4 ml-auto text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 ${
                                        currentLanguage === 'en' ? 'bg-red-50 text-red-600' : 'text-gray-700'
                                    }`}
                                >
                                    <span className="text-xl">🇺🇸</span>
                                    <span className="font-medium">English</span>
                                    {currentLanguage === 'en' && (
                                        <svg className="w-4 h-4 ml-auto text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User menu */}
                    <div className="relative flex items-center gap-3" ref={menuRef}>
                    {/* Avatar com efeito hover */}
                    <div className="relative group">
                        <img
                            src={imagePreview}
                            alt="Avatar"
                            className="h-10 w-10 lg:h-12 lg:w-12 rounded-full object-cover border-2 border-red-600 shadow-md group-hover:border-red-700 transition-all cursor-pointer"
                            onClick={() => setMenuOpen(prev => !prev)}
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* User info - hidden no mobile */}
                    <div 
                        className="hidden sm:flex flex-col cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => setMenuOpen(prev => !prev)}
                    >
                        <span className="font-semibold text-gray-800 text-sm lg:text-base leading-tight">
                            {info.name}
                        </span>
                        <span className="text-xs lg:text-sm text-gray-500">
                            {info.typeProfile}
                        </span>
                    </div>

                    {/* Dropdown icon */}
                    <button 
                        onClick={() => setMenuOpen(prev => !prev)}
                        className="hidden sm:block text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg 
                            className={`w-5 h-5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown menu MELHORADO */}
                    {menuOpen && (
                        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-56 py-2 animate-fade-in-down">
                            <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                                <p className="font-semibold text-gray-800 text-sm">{info.name}</p>
                                <p className="text-xs text-gray-500">{info.typeProfile}</p>
                            </div>
                            
                            <button
                                className="w-full text-left px-4 py-3 hover:bg-red-50 text-gray-700 transition-colors flex items-center gap-3 group"
                                onClick={() => {
                                    setShowModal(true);
                                    setMenuOpen(false);
                                }}
                            >
                                <Camera size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
                                <span>{t('header.change_photo')}</span>
                            </button>
                            
                            <button
                                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors flex items-center gap-3 group"
                                onClick={handleLogout}
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>{t('header.logout')}</span>
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </header>

            {/* Modal MELHORADO */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-white p-6 lg:p-8 rounded-2xl max-h-[90vh] w-full max-w-md shadow-2xl flex flex-col overflow-auto">
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                            {t('header.change_photo')}
                        </h2>

                        <div className="w-full flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200">
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                                />
                                <button
                                    onClick={handleOpenFile}
                                    className="absolute bottom-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full p-3 hover:scale-110 hover:shadow-lg transition-all"
                                >
                                    <Camera size={20} />
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <h3 className="text-xl font-bold text-center mt-4 text-gray-800">
                                {info.name}
                            </h3>
                            <p className="text-gray-600 text-center text-sm">
                                {info.typeProfile}
                            </p>
                        </div>

                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                onClick={() => setShowModal(false)}
                            >
                                {t('modals.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HeaderPainel;
