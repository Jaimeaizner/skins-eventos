import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getFirebaseApp() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
}

export default async function handler(req, res) {
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
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/steam/callback?token=${token}`;
    console.log('[STEAM CALLBACK] Redirecionando para:', redirectUrl);
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('[STEAM CALLBACK] Erro geral:', error);
    return res.status(500).send('Erro interno na autenticação Steam.');
  }
} 