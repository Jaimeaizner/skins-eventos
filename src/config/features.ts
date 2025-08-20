// Configuração de funcionalidades da plataforma
// Controla quais recursos estão visíveis para os usuários

export const FEATURES = {
  // ✅ FUNCIONALIDADES ATIVAS (VISÍVEIS)
  RIFFAS: true,           // Eventos promocionais próprios do site
  LOGIN_STEAM: true,      // Autenticação via Steam
  DASHBOARD: true,        // Dashboard principal
  CARTEIRA: true,         // Gerenciamento de saldo
  
  // 🔒 FUNCIONALIDADES ESCONDIDAS (NÃO ACESSÍVEIS)
  INVENTARIO: false,      // Inventário Steam
  LEILOES: false,         // Sistema de leilões
  MARKETPLACE: false,     // Marketplace de skins
  OUTROS_JOGOS: false,    // Outros jogos além de CS2
  TRANSACOES: false,      // Histórico de transações
  ADMIN: false,           // Painel administrativo
  MEUS_BILHETES: false,   // Bilhetes comprados
  
  // ⚙️ CONFIGURAÇÕES GERAIS
  MAINTENANCE_MODE: false, // Modo manutenção
  BETA_FEATURES: false,   // Funcionalidades em beta
};

// Função para verificar se uma funcionalidade está ativa
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature] === true;
};

// Função para verificar se múltiplas funcionalidades estão ativas
export const areFeaturesEnabled = (features: (keyof typeof FEATURES)[]): boolean => {
  return features.every(feature => isFeatureEnabled(feature));
};

// Função para obter lista de funcionalidades ativas
export const getActiveFeatures = (): string[] => {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
};

// Função para obter lista de funcionalidades escondidas
export const getHiddenFeatures = (): string[] => {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => !enabled)
    .map(([feature]) => feature);
};

// Configuração por ambiente
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    // Em produção, apenas funcionalidades essenciais
    return {
      ...FEATURES,
      MAINTENANCE_MODE: false,
      BETA_FEATURES: false,
    };
  }
  
  if (env === 'development') {
    // Em desenvolvimento, pode ativar mais funcionalidades
    return {
      ...FEATURES,
      BETA_FEATURES: true,
    };
  }
  
  return FEATURES;
};
