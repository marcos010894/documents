import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

interface FilterState {
  tipo: string;
  categoria: string;
  nomeFantasia: string;
  estado: string;
  cidade: string;
  certificados: string[];
}

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Função para obter os filtros da URL
  const getFiltersFromUrl = useCallback((): FilterState => {
    return {
      tipo: searchParams.get('tipo') || '',
      categoria: searchParams.get('categoria') || '',
      nomeFantasia: searchParams.get('nomeFantasia') || '',
      estado: searchParams.get('estado') || '',
      cidade: searchParams.get('cidade') || '',
      certificados: searchParams.get('certificados') ? searchParams.get('certificados')!.split(',') : []
    };
  }, [searchParams]);

  // Função para atualizar os filtros na URL (apenas adiciona, não interfere na navegação)
  const updateFiltersInUrl = useCallback((filters: Partial<FilterState>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            newSearchParams.set(key, value.join(','));
          } else {
            newSearchParams.delete(key);
          }
        } else if (value !== '') {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      }
    });

    // Usar replace: true para não adicionar ao histórico de navegação
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Função para verificar se há filtros ativos
  const hasActiveFilters = useCallback(() => {
    const filters = getFiltersFromUrl();
    return !!(filters.tipo || filters.categoria || filters.nomeFantasia || 
              filters.estado || filters.cidade || filters.certificados.length > 0);
  }, [getFiltersFromUrl]);

  return {
    filters: getFiltersFromUrl(),
    updateFilters: updateFiltersInUrl,
    hasActiveFilters
  };
}; 