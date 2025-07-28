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

    // 5. Redirecionar para o frontend com o token
    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${PORT}`;
    const redirectUrl = `${frontendUrl}/auth/steam/callback?token=${token}`;
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
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

// API para inventário
app.get('/api/steam/inventory/:steamId/:appId', async (req, res) => {
  try {
    const { steamId, appId } = req.params;
    const response = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/${appId}/2?l=portuguese&count=5000`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar inventário:', error);
    res.status(500).json({ error: 'Erro ao buscar inventário' });
  }
});

// API para preços do mercado
app.get('/api/steam/market/:marketHashName', async (req, res) => {
  try {
    const { marketHashName } = req.params;
    const response = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encodeURIComponent(marketHashName)}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({ error: 'Erro ao buscar preços' });
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