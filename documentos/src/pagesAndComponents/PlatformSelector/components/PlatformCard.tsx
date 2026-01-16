import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
}

interface PlatformCardProps {
  platform: Platform;
  isSelected: boolean;
  onClick: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, isSelected, onClick }) => {
  return (
    <div
      className={`
        relative rounded-lg border transition-all duration-200 cursor-pointer
        hover:shadow-md
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      onClick={onClick}
    >
      {/* Card Content */}
      <div className="p-6">
        {/* Icon and Title */}
        <div className="flex items-center gap-4 mb-3">
          <img 
            src={platform.icon} 
            alt={`${platform.name} Icon`}
            className="w-12 h-12"
          />
          <h3 className={`text-lg font-semibold ${platform.color}`}>
            {platform.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          {platform.description}
        </p>

        {/* Action Button */}
        <button className={`
          w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium
          transition-colors duration-200
          ${isSelected 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}>
          <span>
            {isSelected ? 'Acessando...' : 'Acessar'}
          </span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PlatformCard;
