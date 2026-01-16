import React, { useState } from 'react';
import { X, Filter, Search, Calendar, FileText } from 'lucide-react';
import { GlobalFilter, useGlobalFilters } from '../hooks/useGlobalFilters';

interface GlobalFiltersBarProps {
    onFiltersChange?: (filters: any) => void;
    availableStatuses?: string[];
    availableFileTypes?: string[];
}

export const GlobalFiltersBar: React.FC<GlobalFiltersBarProps> = ({
    onFiltersChange,
    availableStatuses = ['Válido', 'A vencer', 'Vencido', 'Em renovação', 'Em processo'],
    availableFileTypes = ['PDF', 'Word', 'Excel', 'Image', 'Video', 'Audio']
}) => {
    const {
        filters,
        addFilter,
        removeFilter,
        clearAllFilters,
        setSearchTerm,
        setDateRange,
        isFilterActive
    } = useGlobalFilters();

    const [isExpanded, setIsExpanded] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleStatusFilter = (status: string) => {
        if (isFilterActive('status', status)) {
            const filter = filters.activeFilters.find((f: GlobalFilter) => f.type === 'status' && f.value === status);
            if (filter) removeFilter(filter.id);
        } else {
            addFilter({
                type: 'status',
                value: status,
                label: status
            });
        }
    };

    const handleFileTypeFilter = (fileType: string) => {
        if (isFilterActive('fileType', fileType)) {
            const filter = filters.activeFilters.find((f: GlobalFilter) => f.type === 'fileType' && f.value === fileType);
            if (filter) removeFilter(filter.id);
        } else {
            addFilter({
                type: 'fileType',
                value: fileType,
                label: fileType
            });
        }
    };

    const handleUrgencyFilter = (urgency: string) => {
        if (isFilterActive('urgency', urgency)) {
            const filter = filters.activeFilters.find((f: GlobalFilter) => f.type === 'urgency' && f.value === urgency);
            if (filter) removeFilter(filter.id);
        } else {
            addFilter({
                type: 'urgency',
                value: urgency,
                label: urgency === 'critical' ? 'Crítico' : urgency === 'warning' ? 'Atenção' : 'Normal'
            });
        }
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'Válido': 'bg-green-100 text-green-800 border-green-200',
            'A vencer': 'bg-red-100 text-red-800 border-red-200',
            'Vencido': 'bg-red-100 text-red-800 border-red-200',
            'Em renovação': 'bg-blue-100 text-blue-800 border-blue-200',
            'Em processo': 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getFileTypeColor = (fileType: string) => {
        const colors: { [key: string]: string } = {
            'PDF': 'bg-red-100 text-red-800 border-red-200',
            'Word': 'bg-blue-100 text-blue-800 border-blue-200',
            'Excel': 'bg-green-100 text-green-800 border-green-200',
            'Image': 'bg-purple-100 text-purple-800 border-purple-200',
            'Video': 'bg-purple-100 text-purple-800 border-purple-200',
            'Audio': 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[fileType] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getUrgencyColor = (urgency: string) => {
        const colors: { [key: string]: string } = {
            'critical': 'bg-red-100 text-red-800 border-red-200',
            'warning': 'bg-red-100 text-red-800 border-red-200',
            'normal': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[urgency] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            {/* Barra principal */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    {/* Botão para expandir/colapsar */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200"
                    >
                        <Filter size={16} />
                        <span className="font-medium">Filtros</span>
                        {filters.activeFilters.length > 0 && (
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {filters.activeFilters.length}
                            </span>
                        )}
                    </button>

                    {/* Barra de busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar em todos os documentos..."
                            value={filters.searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                        />
                    </div>

                    {/* Filtros ativos */}
                    {filters.activeFilters.length > 0 && (
                        <div className="flex items-center gap-2 max-w-md overflow-x-auto">
                            {filters.activeFilters.map((filter: GlobalFilter) => (
                                <span
                                    key={filter.id}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border ${
                                        filter.type === 'status' ? getStatusColor(filter.value) :
                                        filter.type === 'fileType' ? getFileTypeColor(filter.value) :
                                        filter.type === 'urgency' ? getUrgencyColor(filter.value) :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}
                                >
                                    {filter.label}
                                    <button
                                        onClick={() => removeFilter(filter.id)}
                                        className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botão limpar filtros */}
                {(filters.activeFilters.length > 0 || filters.searchTerm) && (
                    <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                        Limpar Tudo
                    </button>
                )}
            </div>

            {/* Painel expandido */}
            {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                    {/* Filtros por Status */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText size={14} />
                            Status dos Documentos
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {availableStatuses.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                                        isFilterActive('status', status)
                                            ? `border-red-600 shadow-md ${getStatusColor(status)} ring-2 ring-red-200`
                                            : `border-transparent ${getStatusColor(status)} hover:border-gray-200 hover:shadow-sm`
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtros por Tipo de Arquivo */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText size={14} />
                            Tipos de Arquivo
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {availableFileTypes.map((fileType) => (
                                <button
                                    key={fileType}
                                    onClick={() => handleFileTypeFilter(fileType)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                                        isFilterActive('fileType', fileType)
                                            ? `border-red-600 shadow-md ${getFileTypeColor(fileType)} ring-2 ring-red-200`
                                            : `border-transparent ${getFileTypeColor(fileType)} hover:border-gray-200 hover:shadow-sm`
                                    }`}
                                >
                                    {fileType}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtros por Urgência */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Urgência</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'critical', label: 'Crítico' },
                                { value: 'warning', label: 'Atenção' },
                                { value: 'normal', label: 'Normal' }
                            ].map((urgency) => (
                                <button
                                    key={urgency.value}
                                    onClick={() => handleUrgencyFilter(urgency.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                                        isFilterActive('urgency', urgency.value)
                                            ? `border-red-600 shadow-md ${getUrgencyColor(urgency.value)} ring-2 ring-red-200`
                                            : `border-transparent ${getUrgencyColor(urgency.value)} hover:border-gray-200 hover:shadow-sm`
                                    }`}
                                >
                                    {urgency.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro por Data */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Calendar size={14} />
                            Período
                        </h4>
                        <div className="flex gap-4 items-center">
                            <div className="flex gap-2 items-center">
                                <label className="text-sm text-gray-600">De:</label>
                                <input
                                    type="date"
                                    value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setDateRange({
                                        ...filters.dateRange,
                                        start: e.target.value ? new Date(e.target.value) : null
                                    })}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="text-sm text-gray-600">Até:</label>
                                <input
                                    type="date"
                                    value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setDateRange({
                                        ...filters.dateRange,
                                        end: e.target.value ? new Date(e.target.value) : null
                                    })}
                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
