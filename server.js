import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Firebase Admin initialization
function getFirebaseApp() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApps()[0];
}

// Steam Auth Callback
app.get('/api/auth/steam/callback', async (req, res) => {
  try {
    console.log('[STEAM CALLBACK] Função executada! Query:', req.query);
    const params = req.query;

    // 1. Validar resposta com a Steam
    const steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
    const body = new URLSearchParams({
      ...params,
      'openid.mode': 'check_authentication',
    });
    
    const steamRes = await fetch(steamOpenIdUrl, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    const steamText = await steamRes.text();
    console.log('[STEAM CALLBACK] Resposta da Steam:', steamText);
    
    if (!/is_valid:true/.test(steamText)) {
      console.error('[STEAM CALLBACK] OpenID validation failed');
      return res.status(401).send('OpenID validation failed');
    }

    // 2. Extrair SteamID
    const claimedId = params['openid.claimed_id'];
    const steamIdMatch = claimedId && claimedId.match(/\/(\d{17,})$/);
    const steamId = steamIdMatch ? steamIdMatch[1] : null;
    
    if (!steamId) {
      console.error('[STEAM CALLBACK] SteamID not found');
      return res.status(400).send('SteamID not found');
    }
    console.log('[STEAM CALLBACK] SteamID extraído:', steamId);

    // 3. Criar/Autenticar usuário no Firebase
    getFirebaseApp();
    const firebaseAuth = getAuth();
    let user;
    
    try {
      user = await firebaseAuth.getUser(steamId);
      console.log('[STEAM CALLBACK] Usuário já existe no Firebase:', user.uid);
    } catch {
      user = await firebaseAuth.createUser({
        uid: steamId,
        displayName: `Steam:${steamId}`,
      });
      console.log('[STEAM CALLBACK] Usuário criado no Firebase:', user.uid);
    }

    // 4. Gerar token customizado do Firebase
    const token = await firebaseAuth.createCustomToken(steamId);
    console.log('[STEAM CALLBACK] Token customizado gerado');

    // 5. Redirecionar para o frontend com o token e steamId
    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${PORT}`;
    const redirectUrl = `${frontendUrl}/auth/steam/callback?token=${token}&steamId=${steamId}`;
    console.log('[STEAM CALLBACK] Redirecionando para:', redirectUrl);
    return res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('[STEAM CALLBACK] Erro geral:', error);
    return res.status(500).send('Erro interno na autenticação Steam.');
  }
});

// Cache para inventários (evitar requisições repetidas)
const inventoryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Rate limiting para evitar 429
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre requisições

// Função para aguardar entre requisições
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`[INVENTORY] Aguardando ${waitTime}ms para respeitar rate limit`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

// API para inventário - VERSÃO CORRIGIDA baseada na análise do ChatGPT
app.get('/api/steam/inventory/:steamId/:appId', async (req, res) => {
  try {
    const { steamId, appId } = req.params;
    
    console.log(`[INVENTORY] Buscando inventário para Steam ID: ${steamId}, App ID: ${appId}`);
    
    // URL CORRETA conforme ChatGPT: https://steamcommunity.com/inventory/{steamid}/{appid}/{contextid}
    const correctUrl = `https://steamcommunity.com/inventory/${steamId}/${appId}/2`;
    
    console.log(`[INVENTORY] Usando URL correta: ${correctUrl}`);
    
    const response = await fetch(correctUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    });
    
    console.log(`[INVENTORY] Status da resposta: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[INVENTORY] Erro HTTP: ${response.status}`);
      
      if (response.status === 403) {
        console.log(`[INVENTORY] Inventário privado detectado (403)`);
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Inventário privado. Torne seu inventário público nas configurações do Steam.'
        });
      }
      
      if (response.status === 429) {
        console.log(`[INVENTORY] Rate limit atingido (429)`);
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Muitas requisições. Tente novamente em alguns minutos.'
        });
      }
      
      return res.status(200).json({ 
        success: true,
        descriptions: [],
        assets: [],
        message: `Erro HTTP ${response.status}. Verifique se seu perfil Steam está público.`
      });
    }
    
    const responseText = await response.text();
    console.log(`[INVENTORY] Resposta recebida (primeiros 500 chars): ${responseText.substring(0, 500)}`);
    
    try {
      const data = JSON.parse(responseText);
      
      if (!data) {
        console.log(`[INVENTORY] Resposta vazia`);
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Resposta vazia da Steam. Verifique se seu inventário está público.'
        });
      }
      
      // Verificar se tem assets e descriptions
      if (!data.assets || !data.descriptions) {
        console.log(`[INVENTORY] Resposta sem assets ou descriptions:`, JSON.stringify(data, null, 2));
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Inventário vazio ou não encontrado. Verifique se você tem itens no CS2.'
        });
      }
      
      console.log(`[INVENTORY] Sucesso! ${data.descriptions.length} descrições, ${data.assets.length} assets`);
      
      res.json({
        success: true,
        descriptions: data.descriptions,
        assets: data.assets
      });
      
    } catch (parseError) {
      console.error(`[INVENTORY] Erro ao fazer parse JSON:`, parseError);
      console.log(`[INVENTORY] Resposta que causou erro:`, responseText);
      return res.status(200).json({ 
        success: true,
        descriptions: [],
        assets: [],
        message: 'Erro ao processar resposta da Steam. Verifique se seu inventário está público.'
      });
    }
    
  } catch (error) {
    console.error('[INVENTORY] Erro:', error);
    res.status(200).json({ 
      success: true,
      descriptions: [],
      assets: [],
      message: 'Erro interno ao carregar inventário'
    });
  }
});

// API para inventário (sem appId) - ROTA QUE ESTAVA FALTANDO
app.get('/api/steam/inventory/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    
    console.log(`[INVENTORY] Buscando inventário para Steam ID: ${steamId} (sem appId)`);
    
    // Usar appId padrão 730 (CS2) e contextId 2
    const correctUrl = `https://steamcommunity.com/inventory/${steamId}/730/2`;
    
    console.log(`[INVENTORY] Usando URL correta: ${correctUrl}`);
    
    const response = await fetch(correctUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    });
    
    console.log(`[INVENTORY] Status da resposta: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[INVENTORY] Erro HTTP: ${response.status}`);
      
      if (response.status === 403) {
        console.log(`[INVENTORY] Inventário privado detectado (403)`);
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Inventário privado. Torne seu inventário público nas configurações do Steam.'
        });
      }
      
      if (response.status === 429) {
        console.log(`[INVENTORY] Rate limit atingido (429)`);
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Muitas requisições. Tente novamente em alguns minutos.'
        });
      }
      
      return res.status(200).json({ 
        success: true,
        descriptions: [],
        assets: [],
        message: `Erro HTTP ${response.status}. Verifique se seu perfil Steam está público.`
      });
    }
    
    const responseText = await response.text();
    console.log(`[INVENTORY] Resposta recebida (primeiros 500 chars): ${responseText.substring(0, 500)}`);
    
    try {
      const data = JSON.parse(responseText);
      
      if (!data) {
        console.log(`[INVENTORY] Resposta vazia`);
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Resposta vazia da Steam. Verifique se seu inventário está público.'
        });
      }
      
      // Verificar se tem assets e descriptions
      if (!data.assets || !data.descriptions) {
        console.log(`[INVENTORY] Resposta sem assets ou descriptions:`, JSON.stringify(data, null, 2));
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Inventário vazio ou não encontrado. Verifique se você tem itens no CS2.'
        });
      }
      
      console.log(`[INVENTORY] Sucesso! ${data.descriptions.length} descrições, ${data.assets.length} assets`);
      
      res.json({
        success: true,
        descriptions: data.descriptions,
        assets: data.assets
      });
      
    } catch (parseError) {
      console.error(`[INVENTORY] Erro ao fazer parse JSON:`, parseError);
      console.log(`[INVENTORY] Resposta que causou erro:`, responseText);
      return res.status(200).json({ 
        success: true,
        descriptions: [],
        assets: [],
        message: 'Erro ao processar resposta da Steam. Verifique se seu inventário está público.'
      });
    }
    
  } catch (error) {
    console.error('[INVENTORY] Erro:', error);
    res.status(200).json({ 
      success: true,
      descriptions: [],
      assets: [],
      message: 'Erro interno ao carregar inventário'
    });
  }
});

// API para dados do usuário Steam
app.get('/api/steam/user/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    
    // Se não temos STEAM_API_KEY, usar a API pública do Steam Community
    if (!process.env.STEAM_API_KEY) {
      console.log('STEAM_API_KEY não configurada, usando API pública do Steam Community');
      
      // Usar a API pública do Steam Community para obter dados básicos
      const response = await fetch(
        `https://steamcommunity.com/profiles/${steamId}/?xml=1`
      );
      
      if (!response.ok) {
        console.error(`Erro HTTP ao buscar perfil: ${response.status}`);
        return res.status(response.status).json({ 
          error: `Erro HTTP: ${response.status}`,
          success: false 
        });
      }
      
      const xmlText = await response.text();
      
      // Extrair dados básicos do XML
      const avatarMatch = xmlText.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
      const nameMatch = xmlText.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
      const realNameMatch = xmlText.match(/<realname><!\[CDATA\[(.*?)\]\]><\/realname>/);
      
      const userData = {
        response: {
          players: [{
            steamid: steamId,
            personaname: nameMatch ? nameMatch[1] : `Steam:${steamId}`,
            realname: realNameMatch ? realNameMatch[1] : '',
            avatarfull: avatarMatch ? avatarMatch[1] : 'https://steamcommunity-a.akamaihd.net/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
            avatarmedium: avatarMatch ? avatarMatch[1].replace('_full.jpg', '_medium.jpg') : 'https://steamcommunity-a.akamaihd.net/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
            avatar: avatarMatch ? avatarMatch[1].replace('_full.jpg', '.jpg') : 'https://steamcommunity-a.akamaihd.net/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg',
            personastate: 1,
            profileurl: `https://steamcommunity.com/profiles/${steamId}/`,
            timecreated: 0,
            lastlogoff: 0,
            commentpermission: 1,
            gameextrainfo: '',
            gameid: '',
            loccountrycode: '',
            locstatecode: '',
            loccityid: 0
          }]
        }
      };
      
      return res.json(userData);
    }
    
    // Se temos STEAM_API_KEY, usar a API oficial
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      console.error(`Erro HTTP: ${response.status}`);
      return res.status(response.status).json({ 
        error: `Erro HTTP: ${response.status}`,
        success: false 
      });
    }
    
    const data = await response.json();
    
    if (!data || !data.response) {
      console.error('Resposta inválida da API Steam');
      return res.status(500).json({ 
        error: 'Resposta inválida da API Steam',
        success: false 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar dados do usuário',
      success: false 
    });
  }
});

// Cache para preços do mercado (evitar rate limiting)
const marketPriceCache = new Map();
const MARKET_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Rate limiting para preços do mercado
let lastMarketRequestTime = 0;
const MIN_MARKET_REQUEST_INTERVAL = 2000; // 2 segundos entre requisições

// Função para aguardar entre requisições de preço do mercado
const waitForMarketRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastMarketRequestTime;
  
  if (timeSinceLastRequest < MIN_MARKET_REQUEST_INTERVAL) {
    const waitTime = MIN_MARKET_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastMarketRequestTime = Date.now();
};

// API para preços do mercado - CORRIGIDA conforme ChatGPT
app.get('/api/steam/market/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params;
    
    // Verificar cache primeiro
    const cached = marketPriceCache.get(marketHashName);
    if (cached && Date.now() - cached.timestamp < MARKET_CACHE_DURATION) {
      console.log(`[MARKET] Cache hit para: ${marketHashName}`);
      return res.json(cached.data);
    }

    // Aguardar rate limit
    await waitForMarketRateLimit();
    
    console.log(`[MARKET] Buscando preço para: ${marketHashName}`);
    
    // URL CORRETA conforme ChatGPT
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encodeURIComponent(marketHashName)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`[MARKET] Rate limit atingido para: ${marketHashName}`);
        // Retornar preço padrão em caso de rate limit
        const defaultData = {
          success: false,
          lowest_price: 'R$ 0,00',
          volume: '0',
          median_price: 'R$ 0,00'
        };
        
        // Salvar no cache mesmo sendo erro
        marketPriceCache.set(marketHashName, {
          data: defaultData,
          timestamp: Date.now()
        });
        
        return res.json(defaultData);
      }
      
      console.error(`[MARKET] Erro HTTP ao buscar preços: ${response.status}`);
      return res.status(response.status).json({ 
        success: false,
        lowest_price: 'R$ 0,00',
        volume: '0',
        median_price: 'R$ 0,00',
        error: `Erro HTTP: ${response.status}`
      });
    }
    
    const data = await response.json();
    
    if (!data) {
      console.error('[MARKET] Resposta vazia do mercado Steam');
      return res.status(500).json({ 
        success: false,
        lowest_price: 'R$ 0,00',
        volume: '0',
        median_price: 'R$ 0,00',
        error: 'Resposta vazia do mercado Steam'
      });
    }
    
    // Garantir que os campos existam
    const priceData = {
      success: data.success || false,
      lowest_price: data.lowest_price || 'R$ 0,00',
      volume: data.volume || '0',
      median_price: data.median_price || 'R$ 0,00'
    };
    
    // Salvar no cache
    marketPriceCache.set(marketHashName, {
      data: priceData,
      timestamp: Date.now()
    });
    
    console.log(`[MARKET] Preço encontrado para ${marketHashName}: ${priceData.lowest_price}`);
    res.json(priceData);
    
  } catch (error) {
    console.error('[MARKET] Erro ao buscar preços:', error);
    
    // Retornar preço padrão em caso de erro
    const errorData = {
      success: false,
      lowest_price: 'R$ 0,00',
      volume: '0',
      median_price: 'R$ 0,00',
      error: 'Erro ao buscar preços'
    };
    
    res.json(errorData);
  }
});

// API para dados detalhados de itens via inspect link (CSFloat)
app.get('/api/steam/item-details/:inspectLink', async (req, res) => {
  try {
    const { inspectLink } = req.params;
    
    console.log(`[ITEM DETAILS] Buscando detalhes para inspect link: ${inspectLink}`);
    
    // Usar a API do CSFloat para obter dados detalhados
    const response = await fetch(`https://api.csgofloat.com/?url=${encodeURIComponent(inspectLink)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    if (!response.ok) {
      console.error(`[ITEM DETAILS] Erro HTTP: ${response.status}`);
      return res.status(response.status).json({
        success: false,
        error: `Erro HTTP: ${response.status}`
      });
    }
    
    const data = await response.json();
    
    if (!data || !data.iteminfo) {
      console.error('[ITEM DETAILS] Resposta inválida da API CSFloat');
      return res.status(500).json({
        success: false,
        error: 'Resposta inválida da API CSFloat'
      });
    }
    
    // Extrair dados relevantes
    const itemDetails = {
      success: true,
      float: data.iteminfo.floatvalue || 0,
      paintSeed: data.iteminfo.paintseed || 0,
      paintIndex: data.iteminfo.paintindex || 0,
      rarity: data.iteminfo.rarity || 'Common',
      stickers: data.iteminfo.stickers || [],
      nameTag: data.iteminfo.nametag || null,
      statTrak: data.iteminfo.stat_trak || false,
      souvenir: data.iteminfo.souvenir || false,
      exterior: data.iteminfo.exterior || 'Factory New',
      wear: data.iteminfo.wear || 0
    };
    
    console.log(`[ITEM DETAILS] Detalhes encontrados para ${inspectLink}: float=${itemDetails.float}`);
    res.json(itemDetails);
    
  } catch (error) {
    console.error('[ITEM DETAILS] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar detalhes do item'
    });
  }
});

// API para dados detalhados de skins
app.get('/api/steam/skin/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params;
    
    // Buscar dados da skin no mercado Steam
    const marketResponse = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encodeURIComponent(marketHashName)}`
    );
    const marketData = await marketResponse.json();
    
    // Buscar informações detalhadas da skin
    const skinResponse = await fetch(
      `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}`
    );
    const skinHtml = await skinResponse.text();
    
    // Extrair dados da página HTML (simplificado)
    const skinData = {
      market_hash_name: marketHashName,
      icon_url: extractIconUrl(skinHtml),
      stickers: extractStickers(skinHtml),
      name_tag: extractNameTag(skinHtml),
      wear: extractWear(skinHtml),
      rarity: extractRarity(skinHtml),
      condition: extractCondition(skinHtml)
    };
    
    res.json(skinData);
  } catch (error) {
    console.error('Erro ao buscar dados da skin:', error);
    res.status(500).json({ error: 'Erro ao buscar dados da skin' });
  }
});

// Funções auxiliares para extrair dados da página HTML
function extractIconUrl(html) {
  const match = html.match(/g_rgAssets\[730\]\[2\]\[(\d+)\]/);
  if (match) {
    return `https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/${match[1]}.png`;
  }
  return '';
}

function extractStickers(html) {
  const stickers = [];
  const stickerMatches = html.match(/g_rgAssets\[730\]\[2\]\[(\d+)\]/g);
  if (stickerMatches) {
    stickerMatches.forEach(match => {
      const id = match.match(/\d+/)[0];
      stickers.push({
        id,
        image_url: `https://steamcdn-a.akamaihd.net/apps/730/icons/econ/stickers/${id}.png`
      });
    });
  }
  return stickers;
}

function extractNameTag(html) {
  const match = html.match(/Name Tag: ([^<]+)/);
  return match ? match[1] : null;
}

function extractWear(html) {
  const match = html.match(/Exterior: ([^<]+)/);
  if (match) {
    const condition = match[1].toLowerCase();
    const wearMap = {
      'factory new': 0.01,
      'minimal wear': 0.07,
      'field-tested': 0.15,
      'well-worn': 0.38,
      'battle-scarred': 0.45
    };
    return wearMap[condition] || 0.15;
  }
  return 0.15;
}

function extractRarity(html) {
  const match = html.match(/Rarity: ([^<]+)/);
  if (match) {
    const rarity = match[1].toLowerCase();
    const rarityMap = {
      'consumer grade': 'consumer',
      'industrial grade': 'industrial',
      'mil-spec grade': 'mil-spec',
      'restricted': 'restricted',
      'classified': 'classified',
      'covert': 'covert',
      'contraband': 'contraband'
    };
    return rarityMap[rarity] || 'mil-spec';
  }
  return 'mil-spec';
}

function extractCondition(html) {
  const match = html.match(/Exterior: ([^<]+)/);
  return match ? match[1] : 'Field-Tested';
}

// API para testar se o inventário está público (sugestão do ChatGPT)
app.get('/api/steam/test-inventory/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    
    console.log(`[TEST] Testando inventário para Steam ID: ${steamId}`);
    
    // Testar a URL direta conforme ChatGPT
    const testUrl = `https://steamcommunity.com/inventory/${steamId}/730/2`;
    
    console.log(`[TEST] Testando URL: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log(`[TEST] Status da resposta: ${response.status}`);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log(`[TEST] Resposta recebida (primeiros 300 chars): ${responseText.substring(0, 300)}`);
      
      try {
        const data = JSON.parse(responseText);
        
        if (data && data.assets && data.descriptions) {
          console.log(`[TEST] Inventário público encontrado! ${data.assets.length} assets, ${data.descriptions.length} descriptions`);
          res.json({
            success: true,
            isPublic: true,
            assetsCount: data.assets.length,
            descriptionsCount: data.descriptions.length,
            message: 'Inventário está público e acessível!'
          });
        } else {
          console.log(`[TEST] Inventário vazio ou sem dados`);
          res.json({
            success: true,
            isPublic: true,
            assetsCount: 0,
            descriptionsCount: 0,
            message: 'Inventário está público mas vazio.'
          });
        }
      } catch (parseError) {
        console.error(`[TEST] Erro ao fazer parse JSON:`, parseError);
        res.json({
          success: false,
          isPublic: false,
          message: 'Erro ao processar resposta da Steam.'
        });
      }
    } else {
      console.log(`[TEST] Inventário não acessível (HTTP ${response.status})`);
      res.json({
        success: false,
        isPublic: false,
        status: response.status,
        message: response.status === 403 ? 'Inventário privado' : `Erro HTTP ${response.status}`
      });
    }
    
  } catch (error) {
    console.error('[TEST] Erro:', error);
    res.json({
      success: false,
      isPublic: false,
      message: 'Erro ao testar inventário'
    });
  }
});

// API para proxy de imagens da Steam (evitar CORS)
app.get('/api/steam-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }
    
    // Validar URL da Steam
    if (!url.includes('steamstatic.com') && !url.includes('steamcdn-a.akamaihd.net')) {
      return res.status(400).json({ error: 'URL inválida' });
    }
    
    console.log(`[STEAM IMAGE] Buscando imagem: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Referer': 'https://steamcommunity.com/',
        'Origin': 'https://steamcommunity.com'
      },
      timeout: 15000
    });
    
    if (!response.ok) {
      console.warn(`[STEAM IMAGE] Erro HTTP: ${response.status} para ${url}`);
      return res.status(response.status).json({ error: 'Imagem não encontrada' });
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.warn(`[STEAM IMAGE] Content-Type inválido: ${contentType} para ${url}`);
      return res.status(400).json({ error: 'URL não é uma imagem válida' });
    }
    
    const buffer = await response.arrayBuffer();
    
    // Headers para cache e CORS
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('[STEAM IMAGE] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar imagem' });
  }
});

// SPA fallback - todas as outras rotas vão para o index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
}); 