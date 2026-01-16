import i18n from 'i18next';



interface localStorageSaveItens {
  key: string,
  value: string
}

export const changeLanguage = (lng: string) => {
  localStorage.setItem('lng', lng)
  i18n.changeLanguage(lng);
};



export const saveLocalstorageItens = ({ key, value }: localStorageSaveItens) => {
  localStorage.setItem(key, value)
}


// Função para obter um item do localStorage com garantia de tipo
export const getLocalStorageItem = (key: string): string => {
  return localStorage.getItem(key) || ""; // Se `null`, retorna string vazia
};




export const VerifyDataExistInJson = (key: string): boolean => {

  const user = localStorage.getItem('infosUserLogin')
  if (!user) return false;
  
  let info;
  try {
    info = JSON.parse(user);
  } catch {
    return false;
  }

  // Se é colaborador, verificar permissões específicas
  if (info.is_collaborator === true) {
    // Colaboradores não têm acesso aos planos GED diretamente
    // As permissões são controladas pelo objeto permissions (manage_files, etc)
    return false;
  }

  // Para usuários normais (PF/PJ/Freelancer), dar acesso completo
  // Esses usuários são donos das suas contas e têm todas as permissões
  if (!info.is_collaborator) {
    // Usuário normal - tem acesso a GEDMASTER, GEDADM, etc.
    return true;
  }

  // Se não tem permissions, verificar se é usuário normal
  if (!info.permissions) {
    // Se não é colaborador e não tem permissions, assume usuário normal com acesso total
    return !info.is_collaborator;
  }

  // Formato antigo: permissions é um array de arrays
  if (Array.isArray(info.permissions) && info.permissions[0] && Array.isArray(info.permissions[0])) {
    const array: string[] = info.permissions[0];
    return array.some((item: string) => item.includes(key));
  }

  // Formato novo (objeto): permissions é um objeto
  if (typeof info.permissions === 'object' && !Array.isArray(info.permissions)) {
    // Se não é colaborador, assume que é usuário normal com GEDMASTER
    return true;
  }

  return false;
}