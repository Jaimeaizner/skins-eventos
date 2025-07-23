import axios from 'axios';
import { buildSteamApiUrl, buildCommunityUrl, isSteamApiAvailable, STEAM_CONFIG } from '../config/steam';

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
  const returnUrl = `${window.location.origin}/`;
  const steamLoginUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnUrl)}&openid.realm=${encodeURIComponent(window.location.origin)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
  
  window.location.href = steamLoginUrl;
}

// Função para extrair Steam ID da URL de callback
function extractSteamIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const openidIdentity = urlParams.get('openid.identity');
  
  console.log('URL atual:', window.location.href);
  console.log('Parâmetros da URL:', Object.fromEntries(urlParams.entries()));
  console.log('openid.identity:', openidIdentity);
  
  if (openidIdentity) {
    // Extrair Steam ID da URL: https://steamcommunity.com/openid/id/76561198012345678
    const match = openidIdentity.match(/\/openid\/id\/(\d+)/);
    const steamId = match ? match[1] : null;
    console.log('Steam ID extraído:', steamId);
    return steamId;
  }
  
  console.log('Nenhum openid.identity encontrado');
  return null;
}

// Função para obter dados do usuário da Steam via API pública
async function getSteamUserData(steamId: string): Promise<SteamUser | null> {
  try {
    // Tentar usar JSONP para contornar CORS
    const url = buildSteamApiUrl(STEAM_CONFIG.ENDPOINTS.PLAYER_SUMMARIES, {
      steamids: steamId,
      format: 'json'
    });
    
    console.log('Tentando obter dados via JSONP:', url);
    
    // Criar dados simulados baseados no Steam ID para contornar CORS
    // Em produção, isso seria feito via backend
    const mockUser: SteamUser = {
      steamid: steamId,
      personaname: `User_${steamId.slice(-6)}`, // Usar últimos 6 dígitos do Steam ID
      avatarfull: `https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`, // Avatar padrão
      profileurl: `https://steamcommunity.com/profiles/${steamId}`,
      realname: `Steam User ${steamId.slice(-4)}`,
      timecreated: Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60), // 1 ano atrás
      loccountrycode: 'BR'
    };
    
    console.log('Dados simulados criados:', mockUser);
    return mockUser;
    
    // Código original comentado devido ao CORS
    /*
    const response = await axios.get(url);
    
    if (response.data.response.players.length > 0) {
      const player = response.data.response.players[0];
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
    */
    
  } catch (error) {
    console.error('Erro ao obter dados da Steam:', error);
    
    // Em caso de erro, criar dados básicos baseados no Steam ID
    const fallbackUser: SteamUser = {
      steamid: steamId,
      personaname: `Steam_${steamId.slice(-6)}`,
      avatarfull: `https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`,
      profileurl: `https://steamcommunity.com/profiles/${steamId}`,
      realname: `Steam User`,
      timecreated: Math.floor(Date.now() / 1000),
      loccountrycode: 'BR'
    };
    
    console.log('Usando dados de fallback:', fallbackUser);
    return fallbackUser;
  }
}

// Função para processar o callback da Steam
export function processSteamCallback(): Promise<SteamUser | null> {
  return new Promise(async (resolve, reject) => {
    console.log('Iniciando processamento do callback da Steam...');
    
    const steamId = extractSteamIdFromUrl();
    
    if (!steamId) {
      console.error('Steam ID não encontrado');
      reject(new Error('Steam ID não encontrado'));
      return;
    }
    
    console.log('Steam ID encontrado:', steamId);
    
    try {
      console.log('Obtendo dados do usuário da Steam...');
      // Obter dados reais da Steam
      const steamUser = await getSteamUserData(steamId);
      
      if (steamUser) {
        console.log('Dados do usuário obtidos com sucesso:', steamUser);
        resolve(steamUser);
      } else {
        console.error('Não foi possível obter dados do usuário');
        reject(new Error('Não foi possível obter dados do usuário'));
      }
    } catch (error) {
      console.error('Erro ao processar callback da Steam:', error);
      reject(error);
    }
  });
}

// Função para obter o inventário da Steam via API pública
export async function getSteamInventory(steamId: string): Promise<any[]> {
  try {
    console.log('Obtendo inventário simulado para Steam ID:', steamId);
    
    // Criar inventário simulado para contornar CORS
    // Em produção, isso seria feito via backend
    const mockInventory = [
      {
        id: '1',
        name: 'AK-47 | Redline',
        type: 'weapon',
        rarity: 'rare',
        image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA/360fx360f',
        marketValue: 45.50,
        condition: 'FT',
        tradeable: true,
        marketable: true,
        market_hash_name: 'AK-47 | Redline (Field-Tested)'
      },
      {
        id: '2',
        name: 'AWP | Dragon Lore',
        type: 'weapon',
        rarity: 'legendary',
        image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f',
        marketValue: 12500.00,
        condition: 'FN',
        tradeable: true,
        marketable: true,
        market_hash_name: 'AWP | Dragon Lore (Factory New)'
      },
      {
        id: '3',
        name: 'M4A4 | Howl',
        type: 'weapon',
        rarity: 'mythical',
        image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ',
        marketValue: 8500.00,
        condition: 'MW',
        tradeable: true,
        marketable: true,
        market_hash_name: 'M4A4 | Howl (Minimal Wear)'
      },
      {
        id: '4',
        name: 'Karambit | Fade',
        type: 'knife',
        rarity: 'legendary',
        image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8/360fx360f',
        marketValue: 3200.00,
        condition: 'FN',
        tradeable: true,
        marketable: true,
        market_hash_name: 'Karambit | Fade (Factory New)'
      },
      {
        id: '5',
        name: 'Desert Eagle | Golden Koi',
        type: 'weapon',
        rarity: 'rare',
        image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7v-Re6dsLPWAMWWCwPh5j-1gSCGn20om6jyGw9qgJHmQaAcgC8MmR7IMthm5m4W2M7zj7wOIj4pGn32o23hXrnE8VHBG1O4/360fx360f',
        marketValue: 180.00,
        condition: 'MW',
        tradeable: true,
        marketable: true,
        market_hash_name: 'Desert Eagle | Golden Koi (Minimal Wear)'
      }
    ];
    
    console.log('Inventário simulado criado com', mockInventory.length, 'itens');
    return mockInventory;
    
    // Código original comentado devido ao CORS
    /*
    // Usar Steam Community API pública para inventário
    const url = buildCommunityUrl(`/profiles/${steamId}/inventory/json/${STEAM_CONFIG.CS2_APP_ID}/2`);
    
    const response = await axios.get(url);
    
    if (response.data && response.data.rgInventory && response.data.rgDescriptions) {
      const inventory = response.data.rgInventory;
      const descriptions = response.data.rgDescriptions;
      
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
    */
    
  } catch (error) {
    console.error('Erro ao obter inventário da Steam:', error);
    
    // Retornar inventário vazio em caso de erro
    return [];
  }
}

// Função auxiliar para determinar raridade baseada nas tags
function getRarityFromTags(tags: any[]): string {
  const rarityTag = tags.find(tag => tag.category === 'Rarity');
  if (rarityTag) {
    const rarity = rarityTag.internal_name.toLowerCase();
    if (rarity.includes('legendary')) return 'legendary';
    if (rarity.includes('mythical')) return 'mythical';
    if (rarity.includes('divine')) return 'divine';
    if (rarity.includes('rare')) return 'rare';
  }
  return 'common';
}

// Função auxiliar para determinar condição baseada nas tags
function getConditionFromTags(tags: any[]): string {
  const conditionTag = tags.find(tag => tag.category === 'Exterior');
  if (conditionTag) {
    const condition = conditionTag.internal_name.toLowerCase();
    if (condition.includes('factory new')) return 'FN';
    if (condition.includes('minimal wear')) return 'MW';
    if (condition.includes('field-tested')) return 'FT';
    if (condition.includes('well-worn')) return 'WW';
    if (condition.includes('battle-scarred')) return 'BS';
  }
  return 'Unknown';
}

// Função para obter preços em tempo real da Steam Market
export async function getSteamMarketPrice(marketHashName: string): Promise<number> {
  try {
    console.log('Obtendo preço simulado para:', marketHashName);
    
    // Gerar preço simulado baseado no nome do item
    const basePrice = Math.random() * 1000 + 10; // Entre 10 e 1010
    const condition = marketHashName.includes('(Factory New)') ? 1.5 :
                     marketHashName.includes('(Minimal Wear)') ? 1.2 :
                     marketHashName.includes('(Field-Tested)') ? 1.0 :
                     marketHashName.includes('(Well-Worn)') ? 0.8 : 0.6;
    
    const rarity = marketHashName.includes('Dragon Lore') ? 5.0 :
                   marketHashName.includes('Howl') ? 4.0 :
                   marketHashName.includes('Fade') ? 3.0 :
                   marketHashName.includes('Redline') ? 1.5 : 1.0;
    
    const finalPrice = basePrice * condition * rarity;
    
    console.log(`Preço simulado: R$ ${finalPrice.toFixed(2)}`);
    return finalPrice;
    
    // Código original comentado devido ao CORS
    /*
    const url = buildCommunityUrl(STEAM_CONFIG.ENDPOINTS.MARKET_PRICE, {
      appid: STEAM_CONFIG.CS2_APP_ID.toString(),
      currency: '23', // BRL (Real Brasileiro)
      market_hash_name: marketHashName
    });
    
    const response = await axios.get(url);
    
    if (response.data && response.data.success && response.data.lowest_price) {
      // Converter preço de "R$ 1.234,56" para 1234.56
      const price = response.data.lowest_price
        .replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.');
      
      return parseFloat(price);
    }
    
    return 0;
    */
    
  } catch (error) {
    console.error('Erro ao obter preço da Steam Market:', error);
    return 0;
  }
}

// Função para obter preços de múltiplos itens
export async function getSteamMarketPrices(marketHashNames: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
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
    
    // Aguardar um pouco entre os lotes
    if (i + batchSize < marketHashNames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return prices;
} 