# 🎯 Sistema de Administração - Epics Trade

## 📋 **Visão Geral**

O sistema de administração permite que usuários autorizados gerenciem eventos, usuários e configurações da plataforma através de um painel dedicado.

## 🔐 **Como Funciona**

### **1. Autenticação via Steam**
- Usa o mesmo login Steam dos usuários normais
- Verifica se o Steam ID está na lista de administradores
- Não requer senhas extras ou login duplo

### **2. Sistema de Permissões**
- **Super Admin**: Acesso total ao sistema
- **Admin**: Acesso limitado a funcionalidades básicas

## ⚙️ **Configuração**

### **1. Adicionar Administradores**

Edite o arquivo `src/config/admin.ts`:

```typescript
export const ADMIN_CONFIG = {
  STEAM_IDS: [
    '76561198088038105', // Xuxa Lanches - Admin Principal
    // Adicione mais Steam IDs conforme necessário
  ],
  // ... resto da configuração
};
```

### **2. Como Obter seu Steam ID**

1. Acesse: https://steamidfinder.com/
2. Digite seu nome de usuário Steam
3. Copie o Steam ID (formato: 76561198XXXXXXXXX)

## 🚀 **Funcionalidades Disponíveis**

### **Dashboard**
- Visão geral dos eventos
- Estatísticas da plataforma
- Contadores de eventos ativos/concluídos

### **Gerenciar Eventos**
- ✅ Criar novos eventos
- ✅ Editar eventos existentes
- ✅ Deletar eventos
- ✅ Visualizar progresso de vendas

### **Usuários** (Em desenvolvimento)
- Gerenciar perfis de usuários
- Visualizar histórico de atividades
- Gerenciar permissões

### **Analytics** (Em desenvolvimento)
- Relatórios de vendas
- Métricas de usuários
- Análise de performance

### **Pagamentos** (Em desenvolvimento)
- Histórico de transações
- Gerenciar reembolsos
- Relatórios financeiros

### **Configurações** (Em desenvolvimento)
- Configurações do sistema
- Gerenciar feature flags
- Configurações de segurança

## 🛡️ **Segurança**

### **Proteções Implementadas**
- ✅ Verificação de Steam ID na lista de admins
- ✅ Sistema de permissões por funcionalidade
- ✅ Proteção de rotas com AdminGuard
- ✅ Validação de dados em formulários

### **Boas Práticas**
- 🔒 Nunca compartilhe seu Steam ID
- 🔒 Use apenas em dispositivos seguros
- 🔒 Monitore atividades administrativas
- 🔒 Faça logout ao terminar

## 📱 **Como Acessar**

### **1. Login Normal**
1. Faça login via Steam normalmente
2. Se você for admin, aparecerá "Painel Admin" no menu do usuário

### **2. Navegação**
- Clique no seu avatar no cabeçalho
- Selecione "Painel Admin" no menu dropdown
- Você será redirecionado para `/admin-panel`

## 🎨 **Interface**

### **Design Responsivo**
- ✅ Funciona em desktop, tablet e mobile
- ✅ Tabs organizadas por funcionalidade
- ✅ Modais para criação/edição
- ✅ Feedback visual para todas as ações

### **Tema**
- Gradientes roxo/rosa
- Ícones intuitivos
- Animações suaves
- Loading states

## 🔧 **Desenvolvimento**

### **Estrutura de Arquivos**
```
src/
├── components/
│   ├── AdminGuard.tsx          # Proteção de rotas
│   └── ...
├── config/
│   └── admin.ts                # Configuração de admins
├── contexts/
│   └── AdminContext.tsx        # Contexto de admin
└── pages/
    └── AdminPanel.tsx          # Painel principal
```

### **Contextos Utilizados**
- `AdminContext`: Estado e funcionalidades admin
- `EventContext`: Gerenciamento de eventos
- `AuthContext`: Autenticação do usuário

## 🚨 **Troubleshooting**

### **Problema: Não consigo acessar o painel admin**
**Solução:**
1. Verifique se seu Steam ID está em `src/config/admin.ts`
2. Confirme que fez login via Steam
3. Verifique o console do navegador para erros

### **Problema: Funcionalidades não aparecem**
**Solução:**
1. Verifique se tem as permissões necessárias
2. Recarregue a página
3. Verifique se o AdminContext está carregando

### **Problema: Erro ao criar eventos**
**Solução:**
1. Verifique se todos os campos estão preenchidos
2. Confirme que o preço está dentro dos limites
3. Verifique o console para mensagens de erro

## 📈 **Próximos Passos**

### **Funcionalidades Planejadas**
- [ ] Sistema de logs de atividades
- [ ] Backup automático de dados
- [ ] Notificações em tempo real
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Dashboard com gráficos interativos

### **Melhorias de Segurança**
- [ ] Autenticação de dois fatores
- [ ] Logs de auditoria
- [ ] Rate limiting para ações críticas
- [ ] Criptografia de dados sensíveis

## 📞 **Suporte**

### **Em Caso de Problemas**
1. Verifique esta documentação
2. Consulte o console do navegador
3. Entre em contato com o time de desenvolvimento

### **Contatos**
- **Email**: suporte@epicstrade.com
- **Discord**: [Link do servidor]
- **Documentação**: Este arquivo

---

**⚠️ IMPORTANTE: Mantenha esta documentação atualizada conforme o sistema evolui!**
