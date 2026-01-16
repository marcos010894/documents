import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlatformCard from './components/PlatformCard.tsx';
import PlatformSelectorHeader from './components/PlatformSelectorHeader.tsx';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
  isExternal?: boolean;
}

const PlatformSelector: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const platforms: Platform[] = [
    {
      id: 'ged',
      name: 'GED',
      description: 'Plataforma de Gerenciamento Eletrônico de Documentos',
      icon: 'https://Salexpress.com/assets/images/icones/ged.png',
      route: '/marketplaceDash', // CORRETO: é marketplaceDash mesmo!
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      isExternal: false
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      description: 'Marketplace Plataforma de Negócios e Oportunidades',
      icon: 'https://Salexpress.com/assets/images/icones/mark.png',
      route: 'https://www.marketplaceSalexpress.com/login',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      isExternal: true
    }
  ];

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform.id);
    
    // Salva a plataforma escolhida no localStorage para futuras referências
    localStorage.setItem('selectedPlatform', platform.id);
    
    // Pequena animação antes de navegar
    setTimeout(() => {
      if (platform.isExternal) {
        // Redireciona para URL externa (Marketplace)
        window.location.href = platform.route;
      } else {
        // Navegação interna (GED)
        navigate(platform.route);
      }
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
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/footer.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <PlatformSelectorHeader />
      
      <div className="flex items-center justify-center min-h-screen p-4 pt-24 relative z-10">
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
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Escolha qual plataforma você deseja acessar hoje. 
              Cada uma oferece ferramentas específicas para suas necessidades.
            </p>

            {/* Imagens ilustrativas */}
            
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
              GED: Mantenha seus documentos organizados | Marketplace: Explore oportunidades de negócio
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
