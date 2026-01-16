import React from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlatformSelectorHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const getUserName = () => {
    const userInfo = localStorage.getItem('infosUserLogin');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.user?.nome || 'Usuário';
      } catch {
        return 'Usuário';
      }
    }
    return 'Usuário';
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/salexpress-logo.png" 
              alt="Salexpress" 
              className="h-8 w-auto"
            />
            <span className="ml-2 text-lg font-semibold text-gray-900">
              Seleção de Plataforma
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span>{getUserName()}</span>
            </div>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Sair do sistema"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PlatformSelectorHeader;
