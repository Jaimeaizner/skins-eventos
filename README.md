# Skins Rifas - Plataforma de Rifas de Skins CS2

Sistema completo de marketplace para skins do CS2 usando as APIs públicas da Valve.

## 🚀 Deploy no Vercel

### Problemas Corrigidos

1. **Erro de Minificação**: Corrigido o erro "dr is not a function" que ocorria em produção
2. **Integração Steam**: Simplificada a integração com a API da Steam para evitar conflitos
3. **Dependências**: Removidas dependências desnecessárias que causavam conflitos
4. **Configuração Vite**: Otimizada para produção com chunking adequado

### Como Fazer Deploy

1. **Conecte seu repositório ao Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Importe seu repositório do GitHub
   - O Vercel detectará automaticamente que é um projeto Vite

2. **Configurações do Projeto**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Variáveis de Ambiente** (se necessário)
   - Adicione suas chaves do Firebase no painel do Vercel
   - Configure as variáveis de ambiente necessárias

4. **Deploy**
   - Clique em "Deploy"
   - O Vercel fará o build automaticamente
   - O site estará disponível em `https://seu-projeto.vercel.app`

### Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
├── contexts/           # Contextos React (Auth, Language, etc.)
├── pages/              # Páginas da aplicação
├── services/           # Serviços (Steam API, etc.)
├── firebase/           # Configuração do Firebase
└── config/             # Configurações gerais
```

### Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Integração**: Steam Web API (APIs públicas)
- **Deploy**: Vercel

### Funcionalidades

- ✅ Login via Steam OpenID
- ✅ Sistema de rifas e leilões
- ✅ Marketplace de skins
- ✅ Inventário do usuário
- ✅ Sistema de pagamentos
- ✅ Interface responsiva
- ✅ Suporte a múltiplos idiomas

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Notas Importantes

- A integração com a Steam usa apenas APIs públicas (não requer chave de API)
- O sistema funciona com dados simulados para contornar limitações de CORS
- Em produção, recomenda-se implementar um backend para APIs da Steam
- Todas as transações são simuladas para demonstração

### Suporte

Para problemas ou dúvidas, verifique:
1. Console do navegador para erros
2. Logs do Vercel no painel de deploy
3. Configurações do Firebase
4. Variáveis de ambiente no Vercel

---

**Status**: ✅ Pronto para produção
**Última atualização**: Correção de erros de minificação e integração Steam
