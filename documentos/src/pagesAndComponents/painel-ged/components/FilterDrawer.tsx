import React from 'react';
import { TfiClose, TfiSearch } from 'react-icons/tfi';

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;

    // Busca
    searchTerm: string;
    onSearchChange: (term: string) => void;

    // Filtros de status
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    statusCounts: {
        todos: number;
        'Válido': number;
        'A vencer': number;
        'Vencido': number;
        'Em renovação': number;
        'Em processo': number;
        'Novo Status': number;
    };

    // Filtros de tipo
    selectedFileType: string;
    onFileTypeChange: (type: string) => void;
    typeCounts: {
        todos: number;
        pdf: number;
        word: number;
        excel: number;
        powerpoint: number;
        csv: number;
        image: number;
        video: number;
        audio: number;
    };

    // Função para limpar filtros
    onClearFilters: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
    isOpen,
    onClose,
    searchTerm,
    onSearchChange,
    selectedStatus,
    onStatusChange,
    statusCounts,
    selectedFileType,
    onFileTypeChange,
    typeCounts,
    onClearFilters
}) => {
    return (
        <>
            {/* Overlay com fundo desfocado */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer lateral */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header do drawer */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700">
                    <h2 className="text-xl font-bold text-white">Filtros</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <TfiClose size={20} className="text-white" />
                    </button>
                </div>

                {/* Conteúdo do drawer com scroll */}
                <div className="h-[calc(100%-80px)] overflow-y-auto p-6 space-y-6">
                    {/* Busca */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Buscar Documento
                        </label>
                        <div className="relative">
                            <TfiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Digite para buscar..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent w-full text-sm"
                            />
                        </div>
                        {searchTerm && (
                            <p className="text-xs text-gray-500 mt-2">
                                Buscando em todos os documentos
                            </p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Filtro por Status */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Status do Documento
                        </h3>
                        <div className="space-y-2">
                            {[
                                { key: 'todos', label: 'Todos', count: statusCounts.todos, color: 'gray' },
                                { key: 'Válido', label: 'Válidos', count: statusCounts['Válido'], color: 'green' },
                                { key: 'A vencer', label: 'A Vencer', count: statusCounts['A vencer'], color: 'yellow' },
                                { key: 'Vencido', label: 'Vencidos', count: statusCounts['Vencido'], color: 'red' },
                                { key: 'Em renovação', label: 'Em Renovação', count: statusCounts['Em renovação'], color: 'blue' },
                                { key: 'Em processo', label: 'Em Processo', count: statusCounts['Em processo'], color: 'purple' },
                                { key: 'Novo Status', label: 'Novo Status', count: statusCounts['Novo Status'], color: 'indigo' },
                            ].map(status => (
                                <button
                                    key={status.key}
                                    onClick={() => onStatusChange(status.key)}
                                    disabled={false}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStatus === status.key
                                            ? `bg-${status.color}-100 text-${status.color}-700 border-2 border-${status.color}-400 shadow-md`
                                            : `bg-${status.color}-50 text-${status.color}-700 border border-${status.color}-200 hover:border-${status.color}-300 hover:shadow-sm`
                                        }`}
                                    style={
                                        selectedStatus === status.key
                                            ? {
                                                backgroundColor: getStatusBgColor(status.color, true),
                                                color: getStatusTextColor(status.color),
                                                borderColor: getStatusBorderColor(status.color)
                                            }
                                            : {
                                                backgroundColor: getStatusBgColor(status.color, false),
                                                color: getStatusTextColor(status.color),
                                                borderColor: getStatusBorderLightColor(status.color)
                                            }
                                    }
                                >
                                    <span>{status.label}</span>
                                    {/* Com filtro no backend, a contagem reflete apenas a view atual. 
                                        Se estiver filtrado, contagem 0 não significa vazio.
                                        Podemos ocultar o badge se for 0 e não estiver selecionado, ou mostrar sempre.
                                        Vou manter mostrando, mas sem desabilitar o botão. */}
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedStatus === status.key
                                            ? 'bg-white/80'
                                            : 'bg-white'
                                        }`}>
                                        {status.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Filtro por Tipo de Arquivo */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Tipo de Arquivo
                        </h3>
                        <div className="space-y-2">
                            {[
                                { key: 'todos', label: 'Todos os Tipos', icon: '📁', count: typeCounts.todos },
                                { key: 'pdf', label: 'PDF', icon: '📄', count: typeCounts.pdf },
                                { key: 'word', label: 'Word', icon: '📝', count: typeCounts.word },
                                { key: 'excel', label: 'Excel', icon: '📊', count: typeCounts.excel },
                                { key: 'powerpoint', label: 'PowerPoint', icon: '📽️', count: typeCounts.powerpoint },
                                { key: 'csv', label: 'CSV', icon: '📋', count: typeCounts.csv },
                                { key: 'image', label: 'Imagens', icon: '🖼️', count: typeCounts.image },
                                { key: 'video', label: 'Vídeos', icon: '🎥', count: typeCounts.video },
                                { key: 'audio', label: 'Áudios', icon: '🎵', count: typeCounts.audio },
                            ].map(type => (
                                <button
                                    key={type.key}
                                    onClick={() => onFileTypeChange(type.key)}
                                    disabled={false}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${selectedFileType === type.key
                                            ? 'bg-red-100 text-red-800 border-2 border-red-500 shadow-md'
                                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">{type.icon}</span>
                                        <span>{type.label}</span>
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedFileType === type.key
                                            ? 'bg-white/80 text-red-800'
                                            : 'bg-white text-gray-700'
                                        }`}>
                                        {type.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer com botão de limpar filtros */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                    <button
                        onClick={onClearFilters}
                        className="w-full px-4 py-3 font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        style={{ backgroundColor: '#f37329' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1722f'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f37329'}
                    >
                        Limpar Todos os Filtros
                    </button>
                </div>
            </div>
        </>
    );
};

// Funções auxiliares para cores dinâmicas
function getStatusBgColor(color: string, selected: boolean): string {
    const colors: { [key: string]: { selected: string; normal: string } } = {
        gray: { selected: '#F3F4F6', normal: '#F9FAFB' },
        green: { selected: '#D1FAE5', normal: '#ECFDF5' },
        yellow: { selected: '#FEF3C7', normal: '#FEFCE8' },
        red: { selected: '#FEE2E2', normal: '#FEF2F2' },
        blue: { selected: '#DBEAFE', normal: '#EFF6FF' },
        purple: { selected: '#E9D5FF', normal: '#F5F3FF' },
        indigo: { selected: '#E0E7FF', normal: '#EEF2FF' },
    };
    return selected ? colors[color].selected : colors[color].normal;
}

function getStatusTextColor(color: string): string {
    const colors: { [key: string]: string } = {
        gray: '#374151',
        green: '#065F46',
        yellow: '#92400E',
        red: '#991B1B',
        blue: '#1E40AF',
        purple: '#6B21A8',
        indigo: '#3730A3',
    };
    return colors[color];
}

function getStatusBorderColor(color: string): string {
    const colors: { [key: string]: string } = {
        gray: '#9CA3AF',
        green: '#10B981',
        yellow: '#F59E0B',
        red: '#EF4444',
        blue: '#3B82F6',
        purple: '#A855F7',
        indigo: '#6366F1',
    };
    return colors[color];
}

function getStatusBorderLightColor(color: string): string {
    const colors: { [key: string]: string } = {
        gray: '#E5E7EB',
        green: '#A7F3D0',
        yellow: '#FDE68A',
        red: '#FECACA',
        blue: '#BFDBFE',
        purple: '#DDD6FE',
        indigo: '#C7D2FE',
    };
    return colors[color];
}
