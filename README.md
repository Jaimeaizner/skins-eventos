# 🔥 Skins Rifas - Marketplace de Skins CS2

Sistema completo de marketplace para skins do CS2 usando as APIs públicas da Valve.

## 🚀 Funcionalidades

### ✅ **Sistema de Autenticação**
- Login via Steam OpenID (sem chave de API)
- Dados reais do usuário (nome, avatar, país)
- Sessão persistente

### ✅ **Marketplace Completo**
- Inventário real do CS2 via Steam Community API
- Preços em tempo real da Steam Market
- Sistema de seleção de itens para venda
- Trade Link para trocas rápidas
- Filtros e ordenação avançados

### ✅ **APIs Públicas da Valve**
- **Steam Web API**: Dados de usuários
- **Steam Community API**: Inventários públicos
- **Steam Market API**: Preços em tempo real
- **CS2 API**: Dados específicos do jogo

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + Glassmorphism
- **APIs**: Steam Web API, Community API, Market API
- **Autenticação**: Steam OpenID

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

### 3. Acessar o Sistema
- Abra: http://localhost:5173
- Clique em "Entrar" → "Entrar com Steam"
- Faça login com sua conta Steam real

## 🎯 Como Usar

### **Login com Steam**
1. Clique em "Entrar" no header
2. Escolha "Entrar com Steam"
3. Faça login com sua conta Steam
4. Veja seu nome real da Steam no header

### **Visualizar Inventário**
1. Clique em "Inventário" no header
2. Veja suas skins reais do CS2
3. Imagens e dados vindos diretamente da Steam

### **Vender Skins**
1. Clique em "Vender Skins" no header
2. Selecione os itens que deseja vender
3. Veja preços em tempo real da Steam Market
4. Adicione seu Trade Link quando necessário

## 🔧 APIs Utilizadas

### **Steam Web API (Pública)**
```javascript
// Dados do usuário
GET https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?steamids=STEAM_ID
```

### **Steam Community API (Pública)**
```javascript
// Inventário do CS2
GET https://steamcommunity.com/profiles/STEAM_ID/inventory/json/730/2
```

### **Steam Market API (Pública)**
```javascript
// Preços em tempo real
GET https://steamcommunity.com/market/priceoverview/?appid=730&currency=23&market_hash_name=ITEM_NAME
```

## 🎨 Características do Design

- **Glassmorphism**: Efeitos de vidro fosco
- **Gradientes**: Cores vibrantes do roxo ao rosa
- **Animações**: Transições suaves e efeitos hover
- **Responsivo**: Funciona em todos os dispositivos
- **Dark Theme**: Interface escura moderna

## 📱 Funcionalidades Avançadas

### **Sistema de Preços**
- Preços em tempo real da Steam Market
- Conversão automática para Real Brasileiro
- Rate limiting para evitar bloqueios

### **Filtros e Ordenação**
- Ordenar por preço (alto/baixo)
- Ordenar por nome
- Ordenar por raridade
- Pesquisa por nome do item

### **Trade Link**
- Modal para adicionar Trade Link
- Link direto para página da Steam
- Validação de URL
- Integração com processo de venda

## 🔒 Segurança

- **APIs Públicas**: Não precisa de chaves de API
- **Rate Limiting**: Proteção contra bloqueios
- **Validação**: Verificação de dados da Steam
- **CORS**: Configurado para APIs da Valve

## 🐛 Solução de Problemas

### **Inventário não carrega**
- Verifique se o perfil é público
- Alguns usuários têm inventários privados
- Aguarde alguns segundos e tente novamente

### **Preços não aparecem**
- Rate limiting da Steam Market
- Aguarde alguns minutos e atualize
- Alguns itens podem não ter preço

### **Login não funciona**
- Verifique sua conexão com a internet
- Certifique-se de que a Steam está online
- Tente novamente em alguns minutos

## 📚 Recursos Adicionais

- [Steam Web API Documentation](https://developer.valvesoftware.com/wiki/Steam_Web_API)
- [Steam Community API](https://developer.valvesoftware.com/wiki/Steam_Community_API)
- [Steam Market API](https://developer.valvesoftware.com/wiki/Steam_Community_Market_API)
- [OpenID Steam](https://steamcommunity.com/dev)

## 🎉 Próximos Passos

1. **Sistema de Pagamentos** - Integração com gateway
2. **Dashboard do Usuário** - Histórico e saldo
3. **Sistema de Notificações** - Alertas em tempo real
4. **Integração com Firestore** - Persistência de dados
5. **Sistema de Rifas** - Funcionalidade principal

---

**Desenvolvido com ❤️ para a comunidade gamer**
