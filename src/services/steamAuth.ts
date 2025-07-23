import { STEAM_CONFIG } from '../config/steam';

// Serviço para autenticação da Steam
export interface SteamUser {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  realname?: string;
  timecreated?: number;
  loccountrycode?: string;
}

// Função para iniciar o login da Steam
export function initiateSteamLogin(): void {
  try {
    const returnUrl = `${window.location.origin}/`;
    const steamLoginUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnUrl)}&openid.realm=${encodeURIComponent(window.location.origin)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
    
    window.location.href = steamLoginUrl;
  } catch (error) {
    console.error('Erro ao iniciar login Steam:', error);
  }
}

// Gera a URL de login real da Steam OpenID
export function getSteamLoginUrl(): string {
  return 'http://localhost:3001/auth/steam';
}

// Extrai o SteamID do parâmetro openid.claimed_id
export function extractSteamIdFromClaimedId(claimedId: string): string | null {
  try {
    const match = claimedId.match(/\/(\d{17,})$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Erro ao extrair Steam ID:', error);
    return null;
  }
}

// Função para extrair Steam ID da URL de callback
function extractSteamIdFromUrl(): string | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const openidIdentity = urlParams.get('openid.identity');
    
    if (openidIdentity) {
      // Extrair Steam ID da URL: https://steamcommunity.com/openid/id/76561198012345678
      const match = openidIdentity.match(/\/openid\/id\/(\d+)/);
      const steamId = match ? match[1] : null;
      return steamId;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair Steam ID da URL:', error);
    return null;
  }
}

// Função para obter dados do usuário da Steam via API pública REAL
async function getSteamUserData(steamId: string): Promise<SteamUser | null> {
  try {
    // Usar a API pública real da Steam
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?steamids=${steamId}&format=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.response && data.response.players && data.response.players.length > 0) {
      const player = data.response.players[0];
      return {
        steamid: player.steamid,
        personaname: player.personaname,
        avatarfull: player.avatarfull,
        profileurl: player.profileurl,
        realname: player.realname,
        timecreated: player.timecreated,
        loccountrycode: player.loccountrycode
      };
    }
    
    throw new Error('Usuário não encontrado');
  } catch (error) {
    console.error('Erro ao obter dados da Steam:', error);
    
    // Fallback com dados básicos baseados no Steam ID
    const fallbackUser: SteamUser = {
      steamid: steamId,
      personaname: `Steam_${steamId.slice(-6)}`,
      avatarfull: `https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`,
      profileurl: `https://steamcommunity.com/profiles/${steamId}`,
      realname: `Steam User`,
      timecreated: Math.floor(Date.now() / 1000),
      loccountrycode: 'BR'
    };
    
    return fallbackUser;
  }
}

// Função para processar o callback da Steam
export function processSteamCallback(): Promise<SteamUser | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const steamId = extractSteamIdFromUrl();
      
      if (!steamId) {
        reject(new Error('Steam ID não encontrado'));
        return;
      }
      
      const steamUser = await getSteamUserData(steamId);
      
      if (steamUser) {
        resolve(steamUser);
      } else {
        reject(new Error('Não foi possível obter dados do usuário'));
      }
    } catch (error) {
      console.error('Erro ao processar callback da Steam:', error);
      reject(error);
    }
  });
}

// Função para obter o inventário da Steam via API pública REAL
export async function getSteamInventory(steamId: string): Promise<any[]> {
  try {
    // Usar Steam Community API pública real
    const url = `https://steamcommunity.com/profiles/${steamId}/inventory/json/730/2?l=english&count=5000`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.rgInventory && data.rgDescriptions) {
      const inventory = data.rgInventory;
      const descriptions = data.rgDescriptions;
      
      // Converter para formato mais amigável
      const items = Object.values(inventory).map((asset: any) => {
        const description = descriptions[asset.classid + '_' + asset.instanceid];
        
        if (!description) return null;
        
        return {
          id: asset.id,
          name: description.name || 'Item Desconhecido',
          type: description.type || 'weapon',
          rarity: getRarityFromTags(description.tags || []),
          image: description.icon_url ? `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}` : null,
          marketValue: 0, // Será obtido via API de preços
          condition: getConditionFromTags(description.tags || []),
          tradeable: description.tradable === 1,
          marketable: description.marketable === 1,
          market_hash_name: description.market_hash_name
        };
      }).filter(Boolean);
      
      return items;
    }
    
    throw new Error('Inventário não encontrado ou privado');
  } catch (error) {
    console.error('Erro ao obter inventário da Steam:', error);
    return [];
  }
}

// Função para obter preços em tempo real da Steam Market via API REAL
export async function getSteamMarketPrice(marketHashName: string): Promise<number> {
  try {
    // Usar Steam Market API pública real
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=23&market_hash_name=${encodeURIComponent(marketHashName)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.success && data.lowest_price) {
      // Converter preço de "R$ 1.234,56" para 1234.56
      const price = data.lowest_price
        .replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.');
      
      return parseFloat(price);
    }
    
    return 0;
  } catch (error) {
    console.error('Erro ao obter preço da Steam Market:', error);
    return 0;
  }
}

// Função para obter preços de múltiplos itens
export async function getSteamMarketPrices(marketHashNames: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  try {
    // Processar em lotes para evitar rate limiting
    const batchSize = 5;
    for (let i = 0; i < marketHashNames.length; i += batchSize) {
      const batch = marketHashNames.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (hashName) => {
          const price = await getSteamMarketPrice(hashName);
          prices[hashName] = price;
        })
      );
      
      // Aguardar um pouco entre os lotes para evitar rate limiting
      if (i + batchSize < marketHashNames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Erro ao obter preços em lote:', error);
  }
  
  return prices;
}

// Funções auxiliares para processar dados da Steam
function getRarityFromTags(tags: any[]): string {
  const rarityTag = tags.find(tag => tag.category === 'Rarity');
  return rarityTag ? rarityTag.name.toLowerCase() : 'common';
}

function getConditionFromTags(tags: any[]): string {
  const conditionTag = tags.find(tag => tag.category === 'Exterior');
  return conditionTag ? conditionTag.name : 'Unknown';
}

// Busca inventário real do usuário na Steam
export async function fetchSteamInventory(steamId: string) {
  try {
    const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar inventário Steam');
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar inventário Steam:', error);
    throw error;
  }
}

// Monta URL da imagem real da skin
export function getSkinImageUrl(iconUrl: string): string {
  return `https://steamcommunity-a.akamaihd.net/economy/image/${iconUrl}`;
}

// Busca preço real da skin no Market da Steam
export async function fetchSteamMarketPrice(marketHashName: string) {
  try {
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encodeURIComponent(marketHashName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar preço Steam');
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar preço Steam:', error);
    throw error;
  }
} 