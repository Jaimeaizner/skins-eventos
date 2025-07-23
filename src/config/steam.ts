// Configuração das APIs públicas da Valve
export const STEAM_CONFIG = {
  // App ID do CS2
  CS2_APP_ID: 730,
  
  // URLs das APIs públicas
  API_BASE_URL: 'https://api.steampowered.com',
  COMMUNITY_BASE_URL: 'https://steamcommunity.com',
  MARKET_BASE_URL: 'https://steamcommunity.com/market',
  
  // Endpoints públicos (não precisam de chave)
  ENDPOINTS: {
    // Steam Web API (pública)
    PLAYER_SUMMARIES: '/ISteamUser/GetPlayerSummaries/v0002/',
    OWNED_GAMES: '/IPlayerService/GetOwnedGames/v1/',
    RECENT_GAMES: '/IPlayerService/GetRecentlyPlayedGames/v1/',
    
    // Steam Community API (pública)
    INVENTORY: '/inventory',
    MARKET_PRICE: '/market/priceoverview',
    MARKET_SEARCH: '/market/search',
    
    // CS2 API (pública)
    CS2_ITEMS: '/ISteamEconomy/GetAssetClassInfo/v1/',
    CS2_PRICES: '/ISteamEconomy/GetMarketPrices/v1/'
  }
};

// Função para construir URLs da API pública
export function buildSteamApiUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(STEAM_CONFIG.API_BASE_URL + endpoint);
  
  // Adicionar parâmetros customizados
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
}

// Função para construir URLs da Community API
export function buildCommunityUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(STEAM_CONFIG.COMMUNITY_BASE_URL + endpoint);
  
  // Adicionar parâmetros customizados
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
}

// Função para verificar se a API está disponível (sempre true para APIs públicas)
export function isSteamApiAvailable(): boolean {
  return true;
} 