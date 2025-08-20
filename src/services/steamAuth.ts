import { STEAM_CONFIG } from '../config/steam';
import pLimit from 'p-limit';

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
    
    const url = `/api/steam/user/${steamId}`;
    console.log(`[USER] URL da requisição: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[USER] Erro HTTP ao buscar dados do usuário: ${response.status}`);
      return null;
    }
    
    // Verificar Content-Type antes de tentar fazer parse
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[USER] Content-Type inválido: ${contentType}`);
      return null;
    }
    
    // Ler o texto da resposta primeiro
    const responseText = await response.text();
    
    // Verificar se a resposta está vazia
    if (!responseText || responseText.trim() === '') {
      console.error(`[USER] Resposta vazia do servidor`);
      return null;
    }
    
    // Tentar fazer parse do JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[USER] Erro ao fazer parse do JSON:`, parseError as Error);
      console.error(`[USER] Resposta completa:`, responseText);
      return null;
    }
    
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
    console.log(`[STEAM AUTH] Buscando inventário para Steam ID: ${steamId}, App ID: ${appId}`);
    
    const url = `/api/steam/inventory/${steamId}/${appId}`;
    console.log(`[STEAM AUTH] URL da requisição: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[STEAM AUTH] Erro HTTP ao buscar inventário: ${response.status}`);
      return [];
    }
    
    // Verificar Content-Type antes de tentar fazer parse
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[STEAM AUTH] Content-Type inválido: ${contentType}`);
      return [];
    }
    
    // Ler o texto da resposta primeiro
    const responseText = await response.text();
    
    // Verificar se a resposta está vazia
    if (!responseText || responseText.trim() === '') {
      console.error(`[STEAM AUTH] Resposta vazia do servidor`);
      return [];
    }
    
    // Tentar fazer parse do JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[STEAM AUTH] Erro ao fazer parse do JSON:`, parseError as Error);
      console.error(`[STEAM AUTH] Resposta completa:`, responseText);
      return [];
    }
    
    if (!data) {
      console.error('[STEAM AUTH] Resposta vazia da API');
      throw new Error('Resposta vazia da API');
    }
    
    if (data.success && data.descriptions && data.assets) {
      console.log(`[STEAM AUTH] Inventário carregado: ${data.descriptions.length} itens`);
      return processInventoryData(data);
    }
    
    // Se não há sucesso, verificar se há mensagem específica
    if (data.message) {
      console.warn(`[STEAM AUTH] ${data.message}`);
      
      // Se for inventário privado, mostrar mensagem específica
      if (data.message.includes('privado')) {
        alert('⚠️ Seu inventário da Steam está privado!\n\nPara usar suas skins, você precisa:\n1. Ir para seu perfil Steam\n2. Clicar em "Editar Perfil"\n3. Ir em "Configurações de Privacidade"\n4. Mudar "Inventário" para "Público"\n5. Salvar as alterações');
      }
    }
    
    // Retornar array vazio em vez de erro
    console.warn('[STEAM AUTH] Inventário não encontrado ou privado para Steam ID:', steamId);
    return [];
  } catch (error) {
    console.error('[STEAM AUTH] Erro ao buscar inventário Steam:', error as Error);
    
    // Mostrar mensagem específica para o usuário
    if ((error as Error).message.includes('400')) {
      alert('⚠️ Erro ao acessar inventário!\n\nPossíveis causas:\n• Inventário privado\n• Perfil não encontrado\n• Steam ID inválido\n\nVerifique as configurações de privacidade do seu perfil Steam.');
    }
    
    // Retornar array vazio em vez de lançar erro
    return [];
  }
};

// Cache para preços do mercado (evitar rate limiting)
const priceCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Rate limiting para preços
let lastPriceRequestTime = 0;
const MIN_PRICE_REQUEST_INTERVAL = 1000; // 1 segundo entre requisições

// Função para aguardar entre requisições de preço
const waitForPriceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastPriceRequestTime;
  
  if (timeSinceLastRequest < MIN_PRICE_REQUEST_INTERVAL) {
    const waitTime = MIN_PRICE_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastPriceRequestTime = Date.now();
};

// Função para buscar preços do mercado via API do servidor (OTIMIZADA)
export const getSteamMarketPrice = async (marketHashName: string) => {
  try {
    // Verificar cache primeiro
    const cached = priceCache.get(marketHashName);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[PRICE] Cache hit para: ${marketHashName}`);
      return cached.data;
    }

    // Aguardar rate limit
    await waitForPriceRateLimit();
    
    console.log(`[PRICE] Buscando preço para: ${marketHashName}`);
    
    const url = `/api/steam/market/${encodeURIComponent(marketHashName)}`;
    console.log(`[PRICE] URL da requisição: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`[PRICE] Rate limit atingido para: ${marketHashName}`);
        // Retornar preço padrão em caso de rate limit
        return {
          lowest_price: null,
          volume: 0,
          median_price: null
        };
      }
      console.error(`[PRICE] Erro HTTP: ${response.status} para ${marketHashName}`);
      return {
        lowest_price: null,
        volume: 0,
        median_price: null
      };
    }
    
    // Verificar Content-Type antes de tentar fazer parse
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[PRICE] Content-Type inválido: ${contentType} para ${marketHashName}`);
      return {
        lowest_price: null,
        volume: 0,
        median_price: null
      };
    }
    
    // Ler o texto da resposta primeiro
    const responseText = await response.text();
    
    // Verificar se a resposta está vazia
    if (!responseText || responseText.trim() === '') {
      console.warn(`[PRICE] Resposta vazia para: ${marketHashName}`);
      return {
        lowest_price: null,
        volume: 0,
        median_price: null
      };
    }
    
    // Tentar fazer parse do JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[PRICE] Erro ao fazer parse do JSON para ${marketHashName}:`, parseError as Error);
      console.error(`[PRICE] Resposta completa:`, responseText);
      return {
        lowest_price: null,
        volume: 0,
        median_price: null
      };
    }
    
    if (!data) {
      console.warn(`[PRICE] Resposta vazia para: ${marketHashName}`);
      return {
        price: null,
        volume: 0,
        median_price: null
      };
    }

    // Tratamento melhorado de preços (SOLUÇÃO 5)
    let price = null;
    let medianPrice = null;
    
    if (data.success && data.lowest_price) {
      price = data.lowest_price.replace("R$", "").trim();
      // Verificar se é um número válido
      if (isNaN(parseFloat(price.replace(',', '.')))) {
        price = null;
      }
    }
    
    if (data.median_price) {
      medianPrice = data.median_price.replace("R$", "").trim();
      if (isNaN(parseFloat(medianPrice.replace(',', '.')))) {
        medianPrice = null;
      }
    }
    
    const priceData = {
      price: price,
      volume: parseInt(data.volume) || 0,
      median_price: medianPrice
    };

    // Salvar no cache
    priceCache.set(marketHashName, {
      data: priceData,
      timestamp: Date.now()
    });

    console.log(`[PRICE] Preço encontrado para ${marketHashName}: ${price || 'Sem preço'}`);
    return priceData;
  } catch (error) {
    console.error(`[PRICE] Erro ao buscar preço para ${marketHashName}:`, error as Error);
    return {
      price: null,
      volume: 0,
      median_price: null
    };
  }
};

// Função para processar dados do inventário
const processInventoryData = (inventoryData: any) => {
  const { descriptions, assets } = inventoryData;
  
  console.log(`[STEAM AUTH] Processando ${descriptions.length} descrições e ${assets.length} assets`);
  
  // Criar mapa de descrições por classid
  const descriptionsMap = new Map();
  descriptions.forEach((desc: any) => {
    descriptionsMap.set(desc.classid, desc);
  });
  
  // Processar assets
  const processedItems = assets.map((asset: any) => {
    const description = descriptionsMap.get(asset.classid);
    if (!description) return null;
    
    // Extrair raridade das tags
    const rarity = getRarityFromTags(description.tags);
    
    // Extrair inspect link se disponível
    let inspectLink = null;
    if (description.actions && description.actions.length > 0) {
      const action = description.actions.find((a: any) => a.link && a.link.includes('steam://rungame'));
      if (action) {
        // Extrair o inspect link do formato steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198088038105A45310676789D1894567890123456789
        const match = action.link.match(/\+csgo_econ_action_preview%20(.+)/);
        if (match) {
          inspectLink = match[1];
        }
      }
    }
    
    return {
      assetid: asset.assetid,
      classid: asset.classid,
      instanceid: asset.instanceid,
      name: description.name || 'Item sem nome',
      market_hash_name: description.market_hash_name,
      image: description.icon_url_large || description.icon_url || '',
      icon_url: description.icon_url,
      icon_url_large: description.icon_url_large,
      type: description.type,
      rarity: rarity,
      condition: getConditionFromTags(description.tags),
      tradable: description.tradable === 1,
      marketable: description.marketable === 1,
      market_tradable_restriction: description.market_tradable_restriction || 0,
      inspectLink: inspectLink, // Adicionar inspect link
      // Dados adicionais para a interface
      wear: 0, // Será calculado se necessário
      steamPrice: 0, // Será buscado se necessário
      game: 'cs2' // Padrão para CS2
    };
  }).filter(Boolean);
  
  console.log(`[STEAM AUTH] Processados ${processedItems.length} itens`);
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
    const marketUrl = `/api/steam/market/${encodeURIComponent(marketHashName)}`;
    console.log(`[SKIN DATA] URL da requisição market: ${marketUrl}`);
    
    const marketResponse = await fetch(marketUrl);
    
    if (!marketResponse.ok) {
      console.error(`[SKIN DATA] Erro HTTP market: ${marketResponse.status}`);
      return null;
    }
    
    // Verificar Content-Type antes de tentar fazer parse
    const marketContentType = marketResponse.headers.get('content-type');
    if (!marketContentType || !marketContentType.includes('application/json')) {
      console.error(`[SKIN DATA] Content-Type inválido market: ${marketContentType}`);
      return null;
    }
    
    const marketText = await marketResponse.text();
    if (!marketText || marketText.trim() === '') {
      console.error(`[SKIN DATA] Resposta vazia market`);
      return null;
    }
    
    let marketData;
    try {
      marketData = JSON.parse(marketText);
    } catch (parseError) {
      console.error(`[SKIN DATA] Erro ao fazer parse do JSON market:`, parseError as Error);
      return null;
    }
    
    // Buscar informações detalhadas da skin
    const skinUrl = `/api/steam/skin/${encodeURIComponent(marketHashName)}`;
    console.log(`[SKIN DATA] URL da requisição skin: ${skinUrl}`);
    
    const skinResponse = await fetch(skinUrl);
    
    if (!skinResponse.ok) {
      console.error(`[SKIN DATA] Erro HTTP skin: ${skinResponse.status}`);
      return null;
    }
    
    // Verificar Content-Type antes de tentar fazer parse
    const skinContentType = skinResponse.headers.get('content-type');
    if (!skinContentType || !skinContentType.includes('application/json')) {
      console.error(`[SKIN DATA] Content-Type inválido skin: ${skinContentType}`);
      return null;
    }
    
    const skinText = await skinResponse.text();
    if (!skinText || skinText.trim() === '') {
      console.error(`[SKIN DATA] Resposta vazia skin`);
      return null;
    }
    
    let skinData;
    try {
      skinData = JSON.parse(skinText);
    } catch (parseError) {
      console.error(`[SKIN DATA] Erro ao fazer parse do JSON skin:`, parseError as Error);
      return null;
    }
    
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
    console.error('Erro ao buscar dados da skin:', error as Error);
    return null;
  }
};

// Função para verificar se o item é válido (apenas armas, facas, luvas, personagens)
const tiposValidos = ['Rifle', 'Pistol', 'SMG', 'Sniper Rifle', 'Shotgun', 'Knife', 'Gloves', 'Agent'];

const itemEhValido = (description: any) => {
  const tipo = description.tags?.find((tag: any) => tag.category === 'Type')?.name;
  return tiposValidos.includes(tipo);
};

// Função para verificar se o preço é válido (acima de R$10,00)
const precoEhValido = (preco: string | null): boolean => {
  if (!preco) return false;
  
  // Remove R$ e converte vírgula para ponto
  const precoLimpo = preco.replace('R$', '').replace(',', '.').trim();
  const precoNumerico = parseFloat(precoLimpo);
  
  return !isNaN(precoNumerico) && precoNumerico >= 10.0;
};

// Função para buscar inventário real do usuário e criar eventos
export const getRealSteamInventoryForEvents = async (steamId: string): Promise<any[]> => {
  try {
    console.log(`[INVENTORY] Buscando inventário para Steam ID: ${steamId}`);
    
    const url = `/api/steam/inventory/${steamId}`;
    console.log(`[INVENTORY] URL da requisição: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[INVENTORY] Erro HTTP ao buscar inventário: ${response.status}`);
      return [];
    }
    
    // Verificar Content-Type antes de tentar fazer parse
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[INVENTORY] Content-Type inválido: ${contentType}`);
      console.error(`[INVENTORY] Esperado: application/json, Recebido: ${contentType}`);
      return [];
    }
    
    // Ler o texto da resposta primeiro
    const responseText = await response.text();
    console.log(`[INVENTORY] Resposta bruta (primeiros 200 chars): ${responseText.substring(0, 200)}`);
    
    // Verificar se a resposta está vazia
    if (!responseText || responseText.trim() === '') {
      console.error(`[INVENTORY] Resposta vazia do servidor`);
      return [];
    }
    
    // Tentar fazer parse do JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[INVENTORY] Erro ao fazer parse do JSON:`, parseError as Error);
      console.error(`[INVENTORY] Resposta completa:`, responseText);
      return [];
    }
    
    if (!data.success || !data.descriptions || data.descriptions.length === 0) {
      console.log(`[INVENTORY] Inventário vazio ou não encontrado para Steam ID: ${steamId}`);
      return [];
    }
    
    console.log(`[INVENTORY] Inventário carregado: ${data.descriptions.length} itens`);
    
    // REMOVIDO FILTRO RESTRITIVO - Retornar todos os itens do inventário
    const allItems = data.descriptions;
    console.log(`[INVENTORY] Processando todos os ${allItems.length} itens (sem filtro restritivo)`);
    
    // Limitar a 50 itens para evitar sobrecarga (aumentado de 30 para 50)
    const maxItemsToProcess = 50;
    const itemsToProcess = allItems.slice(0, maxItemsToProcess);
    
    console.log(`[INVENTORY] Processando ${itemsToProcess.length} itens para preços`);
    
    // Usar p-limit para controlar concorrência
    const limit = pLimit(3);
    
    const processedItems = await Promise.allSettled(
             itemsToProcess.map((item: any) => 
         limit(async () => {
          try {
            const marketHashName = item.market_hash_name;
            if (!marketHashName) return null;
            
            // Buscar preço do mercado
            const priceData = await getSteamMarketPrice(marketHashName);
            
            // REMOVIDO FILTRO DE PREÇO - Aceitar todos os itens, mesmo sem preço
            if (!priceData || !priceData.lowest_price) {
              console.log(`[INVENTORY] Item ${marketHashName} sem preço - será exibido como "Sem preço"`);
            }
            
            // Extrair inspect link se disponível
            const inspectLink = item.actions?.[0]?.link || null;
            
            return {
              id: item.classid,
              name: item.name,
              market_hash_name: marketHashName,
              icon_url: item.icon_url,
              market_price: priceData?.lowest_price || 'Sem preço',
              volume: priceData?.volume || 0,
              median_price: priceData?.median_price || 'Sem preço',
              inspectLink: inspectLink,
              type: item.tags?.find((tag: any) => tag.category === 'Type')?.name || 'Unknown',
              rarity: item.tags?.find((tag: any) => tag.category === 'Rarity')?.name || 'Unknown'
            };
                     } catch (error) {
             console.error(`[INVENTORY] Erro ao processar item:`, error as Error);
             return null;
           }
        })
      )
    );
    
    // Aceitar todos os itens processados com sucesso (removido filtro restritivo)
    const validItems = processedItems
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);
    
    console.log(`[INVENTORY] Itens processados com sucesso: ${validItems.length}`);
    
    // Adicionar itens restantes sem preços (para mostrar que há mais itens)
    const remainingItems = allItems.slice(maxItemsToProcess);
    if (remainingItems.length > 0) {
      console.log(`[INVENTORY] ${remainingItems.length} itens adicionais disponíveis (não processados)`);
    }
    
    return validItems;
    
  } catch (error) {
    console.error('[INVENTORY] Erro ao buscar inventário:', error);
    return [];
  }
};

// Função para buscar detalhes de um item via inspect link
export const getItemDetails = async (inspectLink: string) => {
  try {
    if (!inspectLink) {
      console.warn('[ITEM DETAILS] Inspect link não fornecido');
      return null;
    }
    
    const url = `/api/steam/item-details/${encodeURIComponent(inspectLink)}`;
    console.log(`[ITEM DETAILS] URL da requisição: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[ITEM DETAILS] Erro HTTP: ${response.status}`);
      return null;
    }
    
    // Verificar Content-Type antes de tentar fazer parse
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[ITEM DETAILS] Content-Type inválido: ${contentType}`);
      return null;
    }
    
    // Ler o texto da resposta primeiro
    const responseText = await response.text();
    
    // Verificar se a resposta está vazia
    if (!responseText || responseText.trim() === '') {
      console.error(`[ITEM DETAILS] Resposta vazia do servidor`);
      return null;
    }
    
    // Tentar fazer parse do JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[ITEM DETAILS] Erro ao fazer parse do JSON:`, parseError as Error);
      console.error(`[ITEM DETAILS] Resposta completa:`, responseText);
      return null;
    }
    
    if (!data || !data.success) {
      console.warn('[ITEM DETAILS] Falha ao buscar detalhes do item');
      return null;
    }
    
    console.log(`[ITEM DETAILS] Detalhes encontrados: float=${data.float}, stickers=${data.stickers?.length || 0}`);
    return data;
    
  } catch (error) {
    console.error('[ITEM DETAILS] Erro ao buscar detalhes do item:', error as Error);
    return null;
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