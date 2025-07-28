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

// Função para iniciar o login Steam
export const initiateSteamLogin = () => {
  const baseUrl = window.location.origin;
  const returnUrl = `${baseUrl}/api/auth/steam/callback`;
  
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': baseUrl,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
  });

  const steamLoginUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;
  window.location.href = steamLoginUrl;
};

// Função para extrair SteamID do claimed_id
export const extractSteamIdFromClaimedId = (claimedId: string): string | null => {
  const match = claimedId.match(/\/(\d{17,})$/);
  return match ? match[1] : null;
};

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

// Função para buscar dados do usuário Steam via API do servidor
export const getSteamUserData = async (steamId: string) => {
  try {
    if (!steamId) {
      console.warn('Steam ID não fornecido para getSteamUserData');
      return null;
    }
    
    const response = await fetch(`/api/steam/user/${steamId}`);
    
    if (!response.ok) {
      console.error(`Erro HTTP ao buscar dados do usuário: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data) {
      console.error('Resposta vazia ao buscar dados do usuário');
      return null;
    }
    
    if (data.error) {
      console.error('Erro retornado pela API:', data.error);
      return null;
    }
    
    if (data.response && data.response.players && data.response.players.length > 0) {
      return data.response.players[0];
    }
    
    console.warn('Usuário não encontrado na resposta da API');
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário Steam:', error);
    return null;
  }
};

// Função para buscar inventário do usuário via API do servidor
export const getSteamInventory = async (steamId: string, appId: string = '730') => {
  try {
    const response = await fetch(`/api/steam/inventory/${steamId}/${appId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('Resposta vazia da API');
    }
    
    if (data.success && data.descriptions && data.assets) {
      return processInventoryData(data);
    }
    
    // Se não há sucesso, retornar array vazio em vez de erro
    console.warn('Inventário não encontrado ou privado para Steam ID:', steamId);
    return [];
  } catch (error) {
    console.error('Erro ao buscar inventário Steam:', error);
    // Retornar array vazio em vez de lançar erro
    return [];
  }
};

// Função para buscar preços do mercado via API do servidor
export const getSteamMarketPrice = async (marketHashName: string) => {
  try {
    const response = await fetch(`/api/steam/market/${encodeURIComponent(marketHashName)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('Resposta vazia da API');
    }
    
    if (data.success) {
      return {
        price: data.lowest_price,
        volume: data.volume,
        median_price: data.median_price
      };
    }
    
    // Se não há sucesso, retornar preço padrão
    console.warn('Preço não encontrado para:', marketHashName);
    return {
      price: 'R$ 0,00',
      volume: 0,
      median_price: 'R$ 0,00'
    };
  } catch (error) {
    console.error('Erro ao buscar preço do mercado Steam:', error);
    // Retornar preço padrão em vez de lançar erro
    return {
      price: 'R$ 0,00',
      volume: 0,
      median_price: 'R$ 0,00'
    };
  }
};

// Função para processar dados do inventário
const processInventoryData = (inventoryData: any) => {
  const { descriptions, assets } = inventoryData;
  
  // Criar mapa de descrições por classid
  const descriptionsMap = new Map();
  descriptions.forEach((desc: any) => {
    descriptionsMap.set(desc.classid, desc);
  });
  
  // Processar assets
  const processedItems = assets.map((asset: any) => {
    const description = descriptionsMap.get(asset.classid);
    if (!description) return null;
    
    return {
      assetid: asset.assetid,
      classid: asset.classid,
      instanceid: asset.instanceid,
      name: description.name,
      market_hash_name: description.market_hash_name,
      icon_url: description.icon_url,
      icon_url_large: description.icon_url_large,
      type: description.type,
      rarity: getRarityFromTags(description.tags),
      condition: getConditionFromTags(description.tags),
      tradable: description.tradable === 1,
      marketable: description.marketable === 1,
      market_tradable_restriction: description.market_tradable_restriction || 0
    };
  }).filter(Boolean);
  
  return processedItems;
};

// Função para extrair raridade das tags
const getRarityFromTags = (tags: any[]) => {
  if (!tags) return 'Common';
  
  const rarityTag = tags.find(tag => tag.category === 'Rarity');
  return rarityTag ? rarityTag.name : 'Common';
};

// Função para extrair condição das tags
const getConditionFromTags = (tags: any[]) => {
  if (!tags) return 'Factory New';
  
  const wearTag = tags.find(tag => tag.category === 'Exterior');
  return wearTag ? wearTag.name : 'Factory New';
};

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
          try {
            const priceData = await getSteamMarketPrice(hashName);
            prices[hashName] = parseFloat(priceData.price?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          } catch (error) {
            prices[hashName] = 0;
          }
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

// Função para buscar dados reais de skins da Steam
export const getSteamSkinData = async (marketHashName: string) => {
  try {
    // Buscar dados da skin no mercado Steam
    const marketResponse = await fetch(`/api/steam/market/${encodeURIComponent(marketHashName)}`);
    const marketData = await marketResponse.json();
    
    // Buscar informações detalhadas da skin
    const skinResponse = await fetch(`/api/steam/skin/${encodeURIComponent(marketHashName)}`);
    const skinData = await skinResponse.json();
    
    return {
      marketData,
      skinData,
      imageUrl: getSkinImageUrl(skinData.icon_url || ''),
      stickers: skinData.stickers || [],
      nameTag: skinData.name_tag || null,
      wear: skinData.wear || 0,
      rarity: getRarityFromTags(skinData.tags || []),
      condition: getConditionFromTags(skinData.tags || [])
    };
  } catch (error) {
    console.error('Erro ao buscar dados da skin:', error);
    throw error;
  }
};

// Função para buscar inventário real do usuário e criar eventos
export const getRealSteamInventoryForEvents = async (steamId: string) => {
  try {
    if (!steamId) {
      console.warn('Steam ID não fornecido');
      return [];
    }

    const inventory = await getSteamInventory(steamId, '730'); // CS2
    
    if (!inventory || inventory.length === 0) {
      console.warn('Inventário vazio ou não encontrado para Steam ID:', steamId);
      return [];
    }
    
    // Filtrar apenas skins que podem ser usadas em eventos
    const eligibleSkins = inventory.filter((item: any) => {
      return item && item.type === 'weapon' && 
             item.marketable && 
             item.tradeable &&
             item.rarity !== 'consumer'; // Excluir skins muito comuns
    });
    
    if (eligibleSkins.length === 0) {
      console.warn('Nenhuma skin elegível encontrada para Steam ID:', steamId);
      return [];
    }
    
    // Buscar preços do mercado para cada skin
    const skinsWithPrices = await Promise.all(
      eligibleSkins.map(async (skin: any) => {
        try {
          const marketPrice = await getSteamMarketPrice(skin.market_hash_name);
          return {
            ...skin,
            name: skin.name || 'Skin Desconhecida',
            icon_url: skin.icon_url || '',
            market_price: marketPrice.price || 'R$ 0,00',
            steamPrice: parseFloat(marketPrice.price?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
            ticketPrice: Math.max(1, Math.floor((parseFloat(marketPrice.price?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0) / 100))
          };
        } catch (error) {
          console.error(`Erro ao buscar preço para ${skin.market_hash_name}:`, error);
          return {
            ...skin,
            name: skin.name || 'Skin Desconhecida',
            icon_url: skin.icon_url || '',
            market_price: 'R$ 0,00',
            steamPrice: 0,
            ticketPrice: 1
          };
        }
      })
    );
    
    return skinsWithPrices;
  } catch (error) {
    console.error('Erro ao buscar inventário para eventos:', error);
    // Retornar array vazio em vez de lançar erro
    return [];
  }
};

// Função para obter URL da imagem da skin com alta qualidade
export function getSkinImageUrl(iconUrl: string): string {
  if (!iconUrl) return '';
  
  // Converter para URL de alta qualidade
  return iconUrl.replace('_medium', '_large').replace('_small', '_large');
}

// Função para obter URL dos adesivos
export function getStickerImageUrl(stickerId: string): string {
  return `https://steamcdn-a.akamaihd.net/apps/730/icons/econ/stickers/${stickerId}.png`;
}

// Função para obter URL do pingente
export function getPendantImageUrl(pendantId: string): string {
  return `https://steamcdn-a.akamaihd.net/apps/730/icons/econ/charms/${pendantId}.png`;
} 