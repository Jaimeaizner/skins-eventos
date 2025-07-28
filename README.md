# 🎮 Skins Rifas - Marketplace de Skins CS2

Sistema completo de marketplace para skins do CS2 usando as APIs públicas da Valve.

## 🚀 Deploy Rápido no Railway (RECOMENDADO)

### 1. Prepare o projeto
```bash
npm install
npm run build
```

### 2. Configure as variáveis de ambiente no Railway
- `FIREBASE_SERVICE_ACCOUNT`: Cole todo o conteúdo do seu `serviceAccountKey.json`
- `STEAM_API_KEY`: Sua chave da API Steam (opcional)
- `FRONTEND_URL`: URL do seu domínio (ex: https://seu-site.railway.app)

### 3. Deploy no Railway
1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Selecione este projeto
4. Configure as variáveis de ambiente
5. Deploy automático!

## 🔧 Desenvolvimento Local

### Instalação
```bash
npm install
```

### Configuração
1. Copie `env.example` para `.env`
2. Configure suas variáveis de ambiente
3. Cole o conteúdo do `serviceAccountKey.json` em `FIREBASE_SERVICE_ACCOUNT`

### Executar
```bash
# Desenvolvimento
npm run dev

# Produção local
npm run build
npm start
```

## 🌐 Funcionalidades

- ✅ Login com Steam (OpenID)
- ✅ Busca de inventário real
- ✅ Preços do mercado Steam
- ✅ Sistema de rifas
- ✅ Sistema de leilões
- ✅ Carteira virtual
- ✅ Interface responsiva

## 🔐 Segurança

- Autenticação via Firebase
- Validação OpenID com Steam
- APIs públicas da Valve
- Sem dados sensíveis no código

## 📱 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Banco**: Firebase Firestore
- **Auth**: Firebase Auth + Steam OpenID
- **Styling**: TailwindCSS
- **Deploy**: Railway

## 🎯 APIs Utilizadas

- **Steam OpenID**: Autenticação
- **Steam Community API**: Inventário
- **Steam Market API**: Preços
- **Steam Web API**: Dados do usuário

---

**Status**: ✅ Pronto para produção
**Última atualização**: Janeiro 2025
