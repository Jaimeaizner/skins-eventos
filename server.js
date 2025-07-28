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

// API para inventário
app.get('/api/steam/inventory/:steamId/:appId', async (req, res) => {
  try {
    const { steamId, appId } = req.params;
    
    console.log(`[INVENTORY] Buscando inventário para Steam ID: ${steamId}, App ID: ${appId}`);
    
    const response = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/${appId}/2?l=portuguese&count=5000`
    );
    
    if (!response.ok) {
      console.error(`[INVENTORY] Erro HTTP ao buscar inventário: ${response.status}`);
      
      // Se for erro 400, provavelmente é inventário privado
      if (response.status === 400) {
        return res.status(200).json({ 
          success: true,
          descriptions: [],
          assets: [],
          message: 'Inventário privado ou não encontrado'
        });
      }
      
      return res.status(response.status).json({ 
        error: `Erro HTTP: ${response.status}`,
        success: false 
      });
    }
    
    const data = await response.json();
    
    if (!data) {
      console.error('[INVENTORY] Resposta vazia do inventário Steam');
      return res.status(200).json({ 
        success: true,
        descriptions: [],
        assets: [],
        message: 'Inventário vazio'
      });
    }
    
    // Verificar se o inventário está vazio
    if (!data.descriptions || !data.assets || data.descriptions.length === 0 || data.assets.length === 0) {
      console.log('[INVENTORY] Inventário vazio para Steam ID:', steamId);
      return res.status(200).json({ 
        success: true,
        descriptions: [],
        assets: [],
        message: 'Inventário vazio'
      });
    }
    
    console.log(`[INVENTORY] Inventário carregado com sucesso: ${data.descriptions.length} descrições, ${data.assets.length} assets`);
    
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('[INVENTORY] Erro ao buscar inventário:', error);
    res.status(200).json({ 
      success: true,
      descriptions: [],
      assets: [],
      message: 'Erro ao carregar inventário'
    });
  }
});

// API para preços do mercado
app.get('/api/steam/market/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params;
    const response = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encodeURIComponent(marketHashName)}`
    );
    
    if (!response.ok) {
      console.error(`Erro HTTP ao buscar preços: ${response.status}`);
      return res.status(response.status).json({ 
        error: `Erro HTTP: ${response.status}`,
        success: false 
      });
    }
    
    const data = await response.json();
    
    if (!data) {
      console.error('Resposta vazia do mercado Steam');
      return res.status(500).json({ 
        error: 'Resposta vazia do mercado Steam',
        success: false 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar preços',
      success: false 
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

// SPA fallback - todas as outras rotas vão para o index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
}); 