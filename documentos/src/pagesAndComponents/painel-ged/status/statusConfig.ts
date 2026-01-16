// Centralização de configuração de Status do GED
// Adicione/remova/edite status aqui e toda a aplicação refletirá automaticamente

export interface StatusConfig {
  value: string;      // valor salvo (slug)
  label: string;      // texto exibido ao usuário
  colors: string;     // classes Tailwind para texto + background
  borderColors?: string; // classes extras para borda se necessário
  icon?: string;      // emoji ou ícone simples
}

export const STATUS_OPTIONS: StatusConfig[] = [
  { value: 'valido',        label: 'Válido',        colors: 'text-green-600 bg-green-50',  borderColors: 'border-green-200',  icon: '✅' },
  { value: 'a-vencer',      label: 'A vencer',      colors: 'text-red-600 bg-red-50', borderColors: 'border-red-200', icon: '⚠️' },
  { value: 'vencido',       label: 'Vencido',       colors: 'text-red-600 bg-red-50',      borderColors: 'border-red-200',    icon: '❌' },
  { value: 'em-renovacao',  label: 'Em renovação',  colors: 'text-blue-600 bg-blue-50',    borderColors: 'border-blue-200',   icon: '🔄' },
  { value: 'em-processo',   label: 'Em processo',   colors: 'text-purple-600 bg-purple-50', borderColors: 'border-purple-200', icon: '⏳' },
  { value: 'pendente',      label: 'Pendente',      colors: 'text-red-700 bg-red-50', borderColors: 'border-red-200', icon: '🕐' },
  { value: 'cancelado',     label: 'Cancelado',     colors: 'text-gray-600 bg-gray-50',    borderColors: 'border-gray-200',   icon: '🚫' }
];

// Helpers --------------------------------------------------------------------
export const findStatus = (status?: string) => {
  if (!status) return undefined;
  return STATUS_OPTIONS.find(s => s.value === status || s.label === status);
};

export const getStatusColor = (status?: string) => {
  const cfg = findStatus(status);
  return cfg ? cfg.colors : 'text-gray-600 bg-gray-50';
};

export const getStatusColorWithBorder = (status?: string) => {
  const cfg = findStatus(status);
  return cfg ? `${cfg.colors} ${cfg.borderColors || ''}`.trim() : 'text-gray-600 bg-gray-50 border-gray-200';
};

export const getStatusIcon = (status?: string) => {
  const cfg = findStatus(status);
  return cfg?.icon || '';
};

export const getStatusLabel = (status?: string) => {
  const cfg = findStatus(status);
  return cfg ? cfg.label : (status || 'Sem status');
};

// Lista para filtros (inclui opção "todos") ---------------------------------
export const buildStatusFilterList = () => [
  { key: 'todos', label: 'Todos', colors: 'text-gray-700 bg-gray-100', icon: '📁' },
  ...STATUS_OPTIONS.map(s => ({ key: s.value, label: s.label, colors: s.colors, icon: s.icon || '' }))
];
