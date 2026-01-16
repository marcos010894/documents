import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    text = 'Carregando...',
    fullScreen = false 
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Spinner animado */}
            <div className="relative">
                <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
                <div className={`${sizeClasses[size]} border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
            </div>
            
            {/* Texto */}
            {text && (
                <p className={`${textSizes[size]} font-medium text-gray-600 animate-pulse`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

// Skeleton loader para listas
export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${100 - i * 10}%` }}></div>
            ))}
        </div>
    );
};

// Skeleton para tabela
export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-6 py-4">
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100">
                            {Array.from({ length: cols }).map((_, colIndex) => (
                                <td key={colIndex} className="px-6 py-4">
                                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Loading inline para botões
export const ButtonSpinner: React.FC = () => {
    return (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    );
};

export default LoadingSpinner;
