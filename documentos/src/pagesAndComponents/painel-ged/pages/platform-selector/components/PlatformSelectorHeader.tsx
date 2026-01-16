import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlatformSelectorHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('infosUserLogin');
    localStorage.removeItem('selectedPlatform');
    navigate('/');
  };

  const getUserInfo = () => {
    const userInfo = localStorage.getItem('infosUserLogin');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return {
          nome: user.user?.nome || 'Usuário',
          email: user.user?.email || '',
          empresa: user.business?.name || ''
        };
      } catch {
        return { nome: 'Usuário', email: '', empresa: '' };
      }
    }
    return { nome: 'Usuário', email: '', empresa: '' };
  };

  const user = getUserInfo();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/salexpress-logo.png" 
              alt="Salexpress" 
              className="h-8 w-auto"
            />
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Seleção de Plataforma
            </span>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.nome}
              </div>
              {user.empresa && (
                <div className="text-xs text-gray-500">
                  {user.empresa}
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.nome.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sair do Sistema"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PlatformSelectorHeader;
