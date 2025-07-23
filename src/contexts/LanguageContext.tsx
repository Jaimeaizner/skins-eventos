import createContext, { useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Navegação
    'nav.dashboard': 'Dashboard',
    'nav.raffles': 'Rifas',
    'nav.auctions': 'Leilões',
    'nav.inventory': 'Inventário',
    'nav.my_tickets': 'Meus Bilhetes',
    
    // Dropdown do usuário
    'user.inventory': 'Inventário',
    'user.wallet': 'Carteira',
    'user.transactions': 'Transações',
    'user.settings': 'Configurações',
    'user.support': 'Suporte',
    'user.logout': 'Sair',
    'user.user': 'Usuário',
    
    // Carteira
    'wallet.balance': 'Saldo',
    'wallet.locked': 'Bloqueado',
    'wallet.deposit': 'Depositar',
    'wallet.withdraw': 'Sacar',
    'wallet.transaction_history': 'Histórico de Transações',
    'wallet.locked_explanation': 'O dinheiro bloqueado é reservado para lances em leilões ativos. Este valor é liberado automaticamente quando o leilão termina.',
    
    // Configurações
    'settings.title': 'Configurações',
    'settings.account': 'Conta',
    'settings.api': 'API da Steam',
    'settings.trade_link': 'Trade Link',
    'settings.language': 'Idioma',
    'settings.save': 'Salvar',
    'settings.saved': 'Configurações salvas!',
    
    // Páginas
    'page.dashboard': 'Dashboard',
    'page.raffles': 'Rifas',
    'page.auctions': 'Leilões',
    'page.inventory': 'Inventário',
    'page.my_tickets': 'Meus Bilhetes',
    'page.settings': 'Configurações',
    'page.wallet': 'Carteira',
    
    // Geral
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.close': 'Fechar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.save': 'Salvar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.raffles': 'Raffles',
    'nav.auctions': 'Auctions',
    'nav.inventory': 'Inventory',
    'nav.my_tickets': 'My Tickets',
    
    // User dropdown
    'user.inventory': 'Inventory',
    'user.wallet': 'Wallet',
    'user.transactions': 'Transactions',
    'user.settings': 'Settings',
    'user.support': 'Support',
    'user.logout': 'Logout',
    'user.user': 'User',
    
    // Wallet
    'wallet.balance': 'Balance',
    'wallet.locked': 'Locked',
    'wallet.deposit': 'Deposit',
    'wallet.withdraw': 'Withdraw',
    'wallet.transaction_history': 'Transaction History',
    'wallet.locked_explanation': 'Locked money is reserved for active auction bids. This amount is automatically released when the auction ends.',
    
    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.api': 'Steam API',
    'settings.trade_link': 'Trade Link',
    'settings.language': 'Language',
    'settings.save': 'Save',
    'settings.saved': 'Settings saved!',
    
    // Pages
    'page.dashboard': 'Dashboard',
    'page.raffles': 'Raffles',
    'page.auctions': 'Auctions',
    'page.inventory': 'Inventory',
    'page.my_tickets': 'My Tickets',
    'page.settings': 'Settings',
    'page.wallet': 'Wallet',
    
    // General
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  es: {
    // Navegación
    'nav.dashboard': 'Panel',
    'nav.raffles': 'Rifas',
    'nav.auctions': 'Subastas',
    'nav.inventory': 'Inventario',
    'nav.my_tickets': 'Mis Boletos',
    
    // Dropdown del usuario
    'user.inventory': 'Inventario',
    'user.wallet': 'Billetera',
    'user.transactions': 'Transacciones',
    'user.settings': 'Configuración',
    'user.support': 'Soporte',
    'user.logout': 'Cerrar Sesión',
    'user.user': 'Usuario',
    
    // Billetera
    'wallet.balance': 'Saldo',
    'wallet.locked': 'Bloqueado',
    'wallet.deposit': 'Depositar',
    'wallet.withdraw': 'Retirar',
    'wallet.transaction_history': 'Historial de Transacciones',
    'wallet.locked_explanation': 'El dinero bloqueado está reservado para pujas en subastas activas. Esta cantidad se libera automáticamente cuando termina la subasta.',
    
    // Configuración
    'settings.title': 'Configuración',
    'settings.account': 'Cuenta',
    'settings.api': 'API de Steam',
    'settings.trade_link': 'Trade Link',
    'settings.language': 'Idioma',
    'settings.save': 'Guardar',
    'settings.saved': '¡Configuración guardada!',
    
    // Páginas
    'page.dashboard': 'Panel',
    'page.raffles': 'Rifas',
    'page.auctions': 'Subastas',
    'page.inventory': 'Inventario',
    'page.my_tickets': 'Mis Boletos',
    'page.settings': 'Configuración',
    'page.wallet': 'Billetera',
    
    // General
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.save': 'Guardar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
  },
  zh: {
    // 导航
    'nav.dashboard': '仪表板',
    'nav.raffles': '抽奖',
    'nav.auctions': '拍卖',
    'nav.inventory': '库存',
    'nav.my_tickets': '我的票券',
    
    // 用户下拉菜单
    'user.inventory': '库存',
    'user.wallet': '钱包',
    'user.transactions': '交易',
    'user.settings': '设置',
    'user.support': '支持',
    'user.logout': '登出',
    'user.user': '用户',
    
    // 钱包
    'wallet.balance': '余额',
    'wallet.locked': '锁定',
    'wallet.deposit': '存款',
    'wallet.withdraw': '提款',
    'wallet.transaction_history': '交易历史',
    'wallet.locked_explanation': '锁定的资金是为活跃拍卖的出价保留的。拍卖结束时，此金额会自动释放。',
    
    // 设置
    'settings.title': '设置',
    'settings.account': '账户',
    'settings.api': 'Steam API',
    'settings.trade_link': '交易链接',
    'settings.language': '语言',
    'settings.save': '保存',
    'settings.saved': '设置已保存！',
    
    // 页面
    'page.dashboard': '仪表板',
    'page.raffles': '抽奖',
    'page.auctions': '拍卖',
    'page.inventory': '库存',
    'page.my_tickets': '我的票券',
    'page.settings': '设置',
    'page.wallet': '钱包',
    
    // 通用
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.close': '关闭',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.save': '保存',
    'common.back': '返回',
    'common.next': '下一个',
    'common.previous': '上一个',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['pt', 'en', 'es', 'zh'].includes(savedLanguage)) {
      setLang(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem('language', lang);
    // Removido window.location.reload();
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
} 