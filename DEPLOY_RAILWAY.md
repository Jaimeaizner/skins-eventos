# 🚀 Deploy no Railway - Guia Completo

## ✅ Status: PRONTO PARA DEPLOY

O projeto está configurado e testado localmente. Agora vamos fazer o deploy no Railway para ter um site 100% funcional!

## 📋 Pré-requisitos

1. **Conta no Railway**: [railway.app](https://railway.app)
2. **Conta no GitHub**: Para conectar o repositório
3. **Chave do Firebase**: Seu `serviceAccountKey.json`

## 🎯 Passo a Passo

### 1. Prepare o Repositório
```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Preparado para deploy no Railway"
git push origin main
```

### 2. Conecte ao Railway
1. Acesse [railway.app](https://railway.app)
2. Clique em "Start a New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte sua conta GitHub
5. Selecione o repositório `skins-eventos`

### 3. Configure as Variáveis de Ambiente
No Railway, vá em **Variables** e adicione:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"SEU_PROJECT_ID","private_key_id":"SEU_PRIVATE_KEY_ID","private_key":"-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@SEU_PROJECT.iam.gserviceaccount.com","client_id":"SEU_CLIENT_ID","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40SEU_PROJECT.iam.gserviceaccount.com"}

STEAM_API_KEY=sua_chave_steam_api_aqui

FRONTEND_URL=https://seu-dominio.railway.app
```

### 4. Deploy Automático
- O Railway detectará automaticamente que é um projeto Node.js
- Fará o build usando `npm run build`
- Iniciará o servidor com `npm start`
- Seu site estará disponível em `https://seu-projeto.railway.app`

## 🔧 Configuração do Domínio

### Domínio Personalizado (Opcional)
1. No Railway, vá em **Settings**
2. Clique em **Domains**
3. Adicione seu domínio personalizado
4. Configure os registros DNS conforme instruído

## ✅ Teste Final

Após o deploy, teste:

1. **Página inicial**: Deve carregar normalmente
2. **Login Steam**: Clique em "Entrar com Steam"
3. **Redirecionamento**: Deve ir para a Steam e voltar logado
4. **Dashboard**: Deve mostrar dados do usuário
5. **Inventário**: Deve buscar skins reais

## 🐛 Solução de Problemas

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme que o TypeScript está configurado corretamente

### Erro de Autenticação
- Verifique se `FIREBASE_SERVICE_ACCOUNT` está correto
- Confirme se a chave do Firebase é válida

### Erro de API Steam
- Verifique se `STEAM_API_KEY` está configurada (opcional)
- Confirme se `FRONTEND_URL` está correto

## 📊 Monitoramento

No Railway você pode:
- Ver logs em tempo real
- Monitorar uso de recursos
- Configurar alertas
- Fazer rollback se necessário

## 🎉 Resultado Final

Após seguir estes passos, você terá:
- ✅ Site 100% funcional
- ✅ Login Steam real
- ✅ APIs da Steam funcionando
- ✅ Banco de dados Firebase
- ✅ Deploy automático
- ✅ Domínio HTTPS

---

**Tempo estimado**: 10-15 minutos
**Custo**: Railway tem plano gratuito generoso
**Suporte**: Logs detalhados no painel do Railway 