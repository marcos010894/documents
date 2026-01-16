import React from 'react';

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

interface PlatformCardProps {
  platform: Platform;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: (platform: Platform) => void;
  onShare?: (platform: Platform) => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, isSelected, onClick, onEdit, onShare }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(platform);
    setShowMenu(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(platform);
    setShowMenu(false);
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer
        transform hover:scale-105 hover:shadow-xl
        ${isSelected 
          ? 'border-blue-500 shadow-2xl scale-105' 
          : 'border-gray-200 hover:border-gray-300'
        }
        ${platform.bgColor}
      `}
    >
      {/* Menu de Três Pontos */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleMenuClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="Opções"
        >
          <svg 
            className="w-5 h-5 text-gray-500 hover:text-gray-700" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <img src="/edit.png" alt="Edit" className="w-4 h-4 mr-3" />
                Editar Plataforma
              </button>
              <button
                onClick={handleShare}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <img src="/indique.png" alt="Share" className="w-4 h-4 mr-3" />
                Compartilhar
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(platform.route);
                  setShowMenu(false);
                  alert('Link copiado para área de transferência!');
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
          <svg 
            className="w-4 h-4 text-white" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}

      {/* Platform Icon */}
      <div className="text-center mb-6">
        <div className={`w-20 h-20 mx-auto rounded-2xl ${platform.bgColor} flex items-center justify-center mb-4 shadow-lg overflow-hidden`}>
          <img 
            src={platform.icon}
            alt={`${platform.name} Icon`}
            className="w-34 h-34 object-contain"
            onError={(e) => {
              // Fallback para SVG caso a imagem não carregue
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* SVG Fallback (hidden por padrão) */}
          <svg 
            className={`w-10 h-10 ${platform.color} hidden`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {platform.id === 'ged' ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
              />
            )}
          </svg>
        </div>

        <h3 className={`text-2xl font-bold ${platform.color} mb-3`}>
          {platform.name}
        </h3>
      </div>

      {/* Platform Description */}
      <p className="text-gray-600 text-center leading-relaxed mb-6">
        {platform.description}
      </p>

      {/* Platform Features */}
      <div className="space-y-2 mb-6">
        {platform.id === 'ged' ? (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <img src="/circle-check.png" alt="Check" className="w-4 h-4 mr-3" />
              Gerenciar documentos digitais
            </div>
            <div className="flex items-center">
              <img src="/circle-check.png" alt="Check" className="w-4 h-4 mr-3" />
              Organizar arquivos por categorias
            </div>
            <div className="flex items-center">
              <img src="/circle-check.png" alt="Check" className="w-4 h-4 mr-3" />
              Controle de acesso e permissões
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <img src="/Currency--dollar.png" alt="Dollar" className="w-4 h-4 mr-3" />
              Oportunidades de negócio
            </div>
            <div className="flex items-center">
              <img src="/building-circle-check.png" alt="Building" className="w-4 h-4 mr-3" />
              Conectar-se com parceiros
            </div>
            <div className="flex items-center">
              <img src="/indique.png" alt="Network" className="w-4 h-4 mr-3" />
              Expandir sua rede profissional
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button 
          className={`
            px-6 py-3 rounded-xl font-semibold transition-all duration-200
            ${platform.color} border-2 border-current
            
            ${isSelected ? 'bg-current text-white' : 'bg-transparent'}
          `}
        >
          {platform.isExternal ? 'Acessar Marketplace' : 'Acessar GED'}
        </button>
      </div>

      {/* External Link Indicator */}
      {platform.isExternal && (
        <div className="absolute top-4 right-4">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default PlatformCard;
