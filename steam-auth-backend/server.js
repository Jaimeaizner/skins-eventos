const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const app = express();
app.use(cors());

const STEAM_OPENID = 'https://steamcommunity.com/openid';

// Endpoint para iniciar login Steam
app.get('/auth/steam', (req, res) => {
  const returnTo = 'https://skins-eventos-krps-3bzf63tlv-jaimeaizners-projects.vercel.app/auth/steam/callback';
  res.redirect(
    `${STEAM_OPENID}/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnTo)}&openid.realm=${encodeURIComponent('https://skins-eventos-krps-3bzf63tlv-jaimeaizners-projects.vercel.app/')}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`
  );
});

// Endpoint de callback do Steam
app.get('/auth/steam/callback', async (req, res) => {
  const claimedId = req.query['openid.claimed_id'];
  const match = claimedId && claimedId.match(/\/(\d{17,})$/);
  const steamId = match ? match[1] : null;
  if (!steamId) return res.status(400).send('SteamID inválido');

  // Gera custom token do Firebase
  const customToken = await admin.auth().createCustomToken(steamId, { steamId });

  // Redireciona para o frontend com o token
  res.redirect(`https://skins-eventos-krps-3bzf63tlv-jaimeaizners-projects.vercel.app/auth/steam/callback?token=${customToken}`);
});

app.listen(3001, () => {
  console.log('Backend Steam Auth rodando na porta 3001');
}); 