// Função de debug para verificar dados do localStorage
function debugUserInfo() {
  console.log('🔍 === DEBUG USER INFO ===');
  
  const userInfoStr = localStorage.getItem('infosUserLogin');
  
  if (!userInfoStr) {
    console.log('❌ Nenhum dado encontrado no localStorage');
    return;
  }
  
  try {
    const userInfo = JSON.parse(userInfoStr);
    console.log('📊 Dados completos do localStorage:', userInfo);
    console.log('🆔 userInfo.user:', userInfo.user);
    console.log('🆔 userInfo.user?.id:', userInfo.user?.id);
    console.log('👤 userInfo.tipo:', userInfo.tipo);
    
    // Estrutura esperada
    console.log('✅ business_id seria:', userInfo.user?.id);
    console.log('✅ type_user seria:', userInfo.tipo);
    
  } catch (error) {
    console.error('❌ Erro ao parsear dados:', error);
  }
  
  console.log('🔍 === FIM DEBUG ===');
}

// Exporta para uso global no console do browser
(window as any).debugUserInfo = debugUserInfo;

export { debugUserInfo };
