import { useState, useEffect, useCallback } from 'react';

export interface GlobalFilter {
    id: string;
    type: 'status' | 'fileType' | 'urgency' | 'date' | 'text';
    value: string;
    label: string;
    count?: number;
}

export interface GlobalFilterState {
    activeFilters: GlobalFilter[];
    searchTerm: string;
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
}

export interface UseGlobalFiltersReturn {
    filters: GlobalFilterState;
    addFilter: (filter: Omit<GlobalFilter, 'id'>) => void;
    removeFilter: (filterId: string) => void;
    updateFilter: (filterId: string, updates: Partial<GlobalFilter>) => void;
    clearAllFilters: () => void;
    setSearchTerm: (term: string) => void;
    setDateRange: (range: { start: Date | null; end: Date | null }) => void;
    isFilterActive: (type: string, value: string) => boolean;
    getFiltersByType: (type: GlobalFilter['type']) => GlobalFilter[];
}

const STORAGE_KEY = 'ged_global_filters';

export function useGlobalFilters(): UseGlobalFiltersReturn {
    const [filters, setFilters] = useState<GlobalFilterState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    activeFilters: parsed.activeFilters || [],
                    searchTerm: parsed.searchTerm || '',
                    dateRange: {
                        start: parsed.dateRange?.start ? new Date(parsed.dateRange.start) : null,
                        end: parsed.dateRange?.end ? new Date(parsed.dateRange.end) : null,
                    }
                };
            }
        } catch (error) {
            console.warn('Erro ao carregar filtros salvos:', error);
        }
        
        return {
            activeFilters: [],
            searchTerm: '',
            dateRange: { start: null, end: null }
        };
    });

    // Salvar no localStorage sempre que houver mudanças
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
        } catch (error) {
            console.warn('Erro ao salvar filtros:', error);
        }
    }, [filters]);

    const addFilter = useCallback((filter: Omit<GlobalFilter, 'id'>) => {
        const id = `${filter.type}_${filter.value}_${Date.now()}`;
        const newFilter: GlobalFilter = { ...filter, id };
        
        setFilters(prev => ({
            ...prev,
            activeFilters: [
                ...prev.activeFilters.filter(f => !(f.type === filter.type && f.value === filter.value)),
                newFilter
            ]
        }));
    }, []);

    const removeFilter = useCallback((filterId: string) => {
        setFilters(prev => ({
            ...prev,
            activeFilters: prev.activeFilters.filter(f => f.id !== filterId)
        }));
    }, []);

    const updateFilter = useCallback((filterId: string, updates: Partial<GlobalFilter>) => {
        setFilters(prev => ({
            ...prev,
            activeFilters: prev.activeFilters.map(f => 
                f.id === filterId ? { ...f, ...updates } : f
            )
        }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({
            activeFilters: [],
            searchTerm: '',
            dateRange: { start: null, end: null }
        });
    }, []);

    const setSearchTerm = useCallback((term: string) => {
        setFilters(prev => ({ ...prev, searchTerm: term }));
    }, []);

    const setDateRange = useCallback((range: { start: Date | null; end: Date | null }) => {
        setFilters(prev => ({ ...prev, dateRange: range }));
    }, []);

    const isFilterActive = useCallback((type: string, value: string) => {
        return filters.activeFilters.some(f => f.type === type && f.value === value);
    }, [filters.activeFilters]);

    const getFiltersByType = useCallback((type: GlobalFilter['type']) => {
        return filters.activeFilters.filter(f => f.type === type);
    }, [filters.activeFilters]);

    return {
        filters,
        addFilter,
        removeFilter,
        updateFilter,
        clearAllFilters,
        setSearchTerm,
        setDateRange,
        isFilterActive,
        getFiltersByType
    };
}
