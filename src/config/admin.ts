// Configuração de Administradores
// IMPORTANTE: Substitua pelos Steam IDs reais dos administradores

export const ADMIN_CONFIG = {
  // Steam IDs dos administradores
  STEAM_IDS: [
    '76561198088038105', // Xuxa Lanches - Admin Principal
    // Adicione mais Steam IDs conforme necessário
  ],
  
  // Configurações de permissões
  PERMISSIONS: {
    SUPER_ADMIN: [
      'create_events',
      'edit_events', 
      'delete_events',
      'manage_users',
      'view_analytics',
      'manage_payments',
      'manage_system',
      'manage_admins'
    ],
    ADMIN: [
      'create_events',
      'edit_events',
      'view_analytics',
      'manage_payments'
    ]
  },
  
  // Configurações do sistema
  SYSTEM: {
    MAX_EVENTS_PER_DAY: 10,
    MAX_TICKETS_PER_EVENT: 1000,
    MIN_EVENT_PRICE: 5,
    MAX_EVENT_PRICE: 1000
  }
};

// Função para verificar se um usuário é admin
export const isUserAdmin = (steamId: string): boolean => {
  return ADMIN_CONFIG.STEAM_IDS.includes(steamId);
};

// Função para obter permissões do usuário
export const getUserPermissions = (steamId: string): string[] => {
  if (isUserAdmin(steamId)) {
    // Por enquanto, todos os admins são super admins
    // Em produção, você pode implementar diferentes níveis
    return ADMIN_CONFIG.PERMISSIONS.SUPER_ADMIN;
  }
  return [];
};
