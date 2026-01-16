import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlatformCard from './components/PlatformCard';
import PlatformSelectorHeader from './components/PlatformSelectorHeader';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
}

const PlatformSelector: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const platforms: Platform[] = [
    {
      id: 'ged',
      name: 'GED',
      description: 'Plataforma de Gerenciamento Eletrônico de Documentos',
      icon: '/assets/images/icones/ged.svg',
      route: '/ged/documents',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      description: 'Plataforma de Negócios e Oportunidades',
      icon: '/assets/images/icones/mark.svg',
      route: '/marketplaceDash',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100'
    }
  ];

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform.id);
    
    // Salva a plataforma escolhida no localStorage para futuras referências
    localStorage.setItem('selectedPlatform', platform.id);
    
    // Pequena animação antes de navegar
    setTimeout(() => {
      navigate(platform.route);
    }, 300);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 relative">
      <PlatformSelectorHeader />
      
      <div className="flex items-center justify-center min-h-screen p-4 pt-24">
        <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src="/salexpress-logo.png" 
              alt="Salexpress Logo" 
              className="h-16 mx-auto mb-4"
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Bem-vindo, {getUserName()}! 👋
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha qual plataforma você deseja acessar hoje. 
            Cada uma oferece ferramentas específicas para suas necessidades.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              isSelected={selectedPlatform === platform.id}
              onClick={() => handlePlatformSelect(platform)}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">
            Você pode alternar entre as plataformas a qualquer momento através do menu principal
          </p>
          <p>
            © 2025 Salexpress - Todas as plataformas em um só lugar
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PlatformSelector;
