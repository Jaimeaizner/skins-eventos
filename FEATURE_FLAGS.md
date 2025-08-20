# 🚀 Sistema de Feature Flags - Epics Trade

## 📋 **Visão Geral**

O sistema de feature flags permite **esconder funcionalidades** dos usuários sem deletar o código, mantendo tudo funcional para desenvolvimento futuro.

## ⚙️ **Configuração**

### **Arquivo Principal: `src/config/features.ts`**

```typescript
export const FEATURES = {
  // ✅ FUNCIONALIDADES ATIVAS (VISÍVEIS)
  RIFFAS: true,           // Eventos promocionais próprios do site
  LOGIN_STEAM: true,      // Autenticação via Steam
  DASHBOARD: true,        // Dashboard principal
  CARTEIRA: true,         // Gerenciamento de saldo
  
  // 🔒 FUNCIONALIDADES ESCONDIDAS (NÃO ACESSÍVEIS)
  INVENTARIO: false,      // Inventário Steam
  LEILOES: false,         // Sistema de leilões
  MARKETPLACE: false,     // Marketplace de skins
  OUTROS_JOGOS: false,    // Outros jogos além de CS2
  TRANSACOES: false,      // Histórico de transações
  ADMIN: false,           // Painel administrativo
  MEUS_BILHETES: false,   // Bilhetes comprados
};
```

## 🛡️ **Como Proteger Rotas**

### **1. Usando FeatureGuard no App.tsx**

```typescript
import FeatureGuard from './components/FeatureGuard';

<Route 
  path="/leiloes" 
  element={
    <FeatureGuard feature="LEILOES">
      <Leiloes />
    </FeatureGuard>
  } 
/>
```

### **2. Usando FeatureGuard com Redirecionamento**

```typescript
<Route 
  path="/admin" 
  element={
    <FeatureGuard 
      feature="ADMIN" 
      redirectTo="/dashboard"
    >
      <Admin />
    </FeatureGuard>
  } 
/>
```

## 🎯 **Como Esconder Elementos da UI**

### **1. Usando useFeature Hook**

```typescript
import { useFeature } from '../components/FeatureGuard';

export default function Navigation() {
  const showLeiloes = useFeature('LEILOES');
  
  return (
    <nav>
      {showLeiloes && (
        <Link to="/leiloes">Leilões</Link>
      )}
    </nav>
  );
}
```

### **2. Usando useFeatures para Múltiplas Features**

```typescript
import { useFeatures } from '../components/FeatureGuard';

export default function Dashboard() {
  const showAdvancedFeatures = useFeatures(['INVENTARIO', 'LEILOES']);
  
  return (
    <div>
      {showAdvancedFeatures && (
        <div>Funcionalidades avançadas</div>
      )}
    </div>
  );
}
```

## 🔄 **Como Ativar/Desativar Funcionalidades**

### **Método 1: Editar o arquivo de configuração**

```typescript
// src/config/features.ts
export const FEATURES = {
  RIFFAS: true,           // ✅ ATIVO
  LEILOES: true,          // 🔓 ATIVADO (mudou de false para true)
  INVENTARIO: false,      // 🔒 ESCONDIDO
};
```

### **Método 2: Configuração por ambiente**

```typescript
// src/config/features.ts
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    // Em produção, apenas funcionalidades essenciais
    return {
      ...FEATURES,
      MAINTENANCE_MODE: false,
      BETA_FEATURES: false,
    };
  }
  
  if (env === 'development') {
    // Em desenvolvimento, pode ativar mais funcionalidades
    return {
      ...FEATURES,
      BETA_FEATURES: true,
    };
  }
  
  return FEATURES;
};
```

## 📱 **Exemplos de Uso**

### **1. Esconder Links de Navegação**

```typescript
{useFeature('LEILOES') && (
  <Link to="/leiloes">Leilões</Link>
)}
```

### **2. Esconder Botões**

```typescript
{useFeature('RIFFAS') && (
  <button onClick={createRifa}>
    Criar Evento
  </button>
)}
```

### **3. Esconder Seções Inteiras**

```typescript
{useFeature('INVENTARIO') && (
  <section className="inventory-section">
    <h2>Meu Inventário</h2>
    <Inventory />
  </section>
)}
```

### **4. Esconder Modais**

```typescript
{useFeature('ADMIN') && (
  <AdminModal open={showAdmin} onClose={closeAdmin} />
)}
```

## 🎨 **Estados Visuais**

### **1. Funcionalidade Ativa**
- ✅ Visível para usuários
- 🔗 Links funcionais
- 📱 Componentes renderizados
- 🎯 Rotas acessíveis

### **2. Funcionalidade Escondida**
- 🔒 Não visível para usuários
- 🚫 Links ocultos
- ⚠️ Rotas protegidas
- 📝 Código preservado

## 🚀 **Vantagens do Sistema**

### **✅ Benefícios:**
1. **Código preservado** - Não perde trabalho feito
2. **Ativação rápida** - Muda apenas um boolean
3. **Desenvolvimento flexível** - Pode ativar/desativar facilmente
4. **Testes A/B** - Pode testar funcionalidades
5. **Rollback rápido** - Desativa instantaneamente
6. **Manutenção** - Bugs já conhecidos e corrigidos

### **⚠️ Considerações:**
1. **Bundle size** - Código morto ainda está no bundle
2. **Complexidade** - Mais arquivos para gerenciar
3. **Confusão** - Pode confundir outros desenvolvedores

## 🔧 **Manutenção**

### **Verificar Features Ativas:**
```typescript
import { getActiveFeatures } from '../config/features';

console.log('Features ativas:', getActiveFeatures());
// Output: ['RIFFAS', 'LOGIN_STEAM', 'DASHBOARD', 'CARTEIRA']
```

### **Verificar Features Escondidas:**
```typescript
import { getHiddenFeatures } from '../config/features';

console.log('Features escondidas:', getHiddenFeatures());
// Output: ['INVENTARIO', 'LEILOES', 'MARKETPLACE', ...]
```

## 📝 **Boas Práticas**

1. **Nomes descritivos** - Use nomes claros para as features
2. **Comentários** - Documente o que cada feature faz
3. **Agrupamento** - Agrupe features relacionadas
4. **Testes** - Teste com features ativas e inativas
5. **Documentação** - Mantenha esta documentação atualizada

## 🎯 **Exemplo de Workflow**

### **Para Esconder uma Funcionalidade:**

1. **Editar `src/config/features.ts`**
   ```typescript
   LEILOES: false,  // Mudar de true para false
   ```

2. **Verificar rotas protegidas no `App.tsx`**
   ```typescript
   <Route path="/leiloes" element={
     <FeatureGuard feature="LEILOES">
       <Leiloes />
     </FeatureGuard>
   } />
   ```

3. **Verificar navegação no `Navigation.tsx`**
   ```typescript
   {useFeature('LEILOES') && (
     <Link to="/leiloes">Leilões</Link>
   )}
   ```

4. **Verificar dashboard no `Dashboard.tsx`**
   ```typescript
   {useFeature('LEILOES') && (
     <div>Seção de Leilões</div>
   )}
   ```

### **Para Reativar uma Funcionalidade:**

1. **Editar `src/config/features.ts`**
   ```typescript
   LEILOES: true,  // Mudar de false para true
   ```

2. **Funcionalidade volta a funcionar automaticamente!** 🎉

---

## 🆘 **Precisa de Ajuda?**

Se tiver dúvidas sobre como usar o sistema de feature flags:

1. **Verifique esta documentação**
2. **Consulte os exemplos no código**
3. **Teste com diferentes configurações**
4. **Use o console para debugar features**

**Lembre-se:** O sistema é simples - é só mudar `true` para `false` e vice-versa! 🚀
