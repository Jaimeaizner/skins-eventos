import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useModal } from '../contexts/ModalContext';
import DropdownGames from './DropdownGames';
import { useGame } from '../contexts/GameContext';
import NotificationsModal from './NotificationsModal';
import { FaWallet, FaLock, FaMedal } from 'react-icons/fa';
import { useFeature } from './FeatureGuard';

const LANGUAGES = [
  { code: 'pt', abbr: 'BR', flag: '🇧🇷' },
  { code: 'en', abbr: 'EN', flag: '🇺🇸' },
  { code: 'es', abbr: 'ES', flag: '🇪🇸' },
  { code: 'zh', abbr: 'ZH', flag: '🇨🇳' },
];

export default function Navigation() {
  const { currentUser, steamUser, balance, lockedBalance, points, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const { t, language, setLanguage } = useLanguage();
  const { setIsModalOpen } = useModal();
  const { selectedGame, setSelectedGame } = useGame();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showLockedInfo, setShowLockedInfo] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Calcular posição do menu do usuário
  const updateMenuPosition = () => {
    if (userMenuRef.current) {
      const rect = userMenuRef.current.getBoundingClientRect();
      // 256px = largura do menu (w-64)
      // setMenuPosition({
      //   top: rect.bottom + window.scrollY + 8,
      //   left: rect.right - 256
      // });
    }
  };
  // Calcular posição do menu de idioma
  const updateLangMenuPosition = () => {
    if (langMenuRef.current) {
      const rect = langMenuRef.current.getBoundingClientRect();
      // setLangMenuPosition({
      //   top: rect.bottom + window.scrollY + 8,
      //   left: rect.left
      // });
    }
  };

  // Fechar menus quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fechar modal de criação com ESC
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowCreateModal(false);
        setIsModalOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setIsModalOpen]);

  // Atualizar posição quando o menu abrir
  useEffect(() => {
    if (showUserMenu) updateMenuPosition();
  }, [showUserMenu]);
  useEffect(() => {
    if (showLangMenu) updateLangMenuPosition();
  }, [showLangMenu]);

  return (
    <header className="relative z-50 bg-black bg-opacity-40 backdrop-blur-md border-b border-white border-opacity-20 shadow-2xl">
      <div className="container mx-auto px-0 py-4">
        <div className="flex items-center w-full justify-between gap-x-12">
          {/* Esquerda: Logo + Dropdown de Jogos */}
          <div className="flex items-center gap-x-10 flex-shrink-0 min-w-[320px]">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/LogoEpicsTrade.png" 
                alt="Epics Trade Logo" 
                className="w-16 h-16 object-contain"
              />
                                                <h1 className="text-3xl font-black whitespace-nowrap">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-purple-500 drop-shadow-lg">
                      Epics
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-purple-500 drop-shadow-lg ml-2">
                      Trade
                    </span>
                  </h1>
            </Link>
            <div className="min-w-[160px] max-w-[200px]">
              <DropdownGames selectedGame={selectedGame} onSelect={setSelectedGame} />
            </div>
          </div>

          {/* Centro: Menu de navegação + Botão Criar */}
          <nav className="flex-1 flex items-center justify-center gap-x-6">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  isActive('/dashboard') 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Dashboard
              </Link>
              {useFeature('RIFFAS') && (
                <Link
                  to="/eventos"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/eventos')
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Eventos
                </Link>
              )}
              {useFeature('LEILOES') && (
                <Link
                  to="/leiloes"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/leiloes') 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Leilões
                </Link>
              )}
              {useFeature('MEUS_BILHETES') && (
                <Link
                  to="/meus-bilhetes"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/meus-bilhetes') 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {t('nav.my_tickets')}
                </Link>
              )}

          </nav>

          {/* Direita: Carteira, Notificação, Usuário, Idioma */}
          <div className="flex items-center gap-x-4 flex-shrink-0 min-w-[420px] justify-end">
            {/* Saldo real */}
            <div className="flex items-center gap-2 bg-green-900 bg-opacity-60 px-3 py-1 rounded-lg shadow border border-green-400">
              <FaWallet className="text-green-400" />
              <span className="text-white font-bold text-sm">R$ {balance.toLocaleString()}</span>
            </div>
            {/* Saldo bloqueado */}
            <div className="flex items-center gap-2 bg-red-900 bg-opacity-60 px-3 py-1 rounded-lg shadow border border-red-400">
              <FaLock className="text-red-400" />
              <span className="text-white font-bold text-sm">R$ {lockedBalance.toLocaleString()}</span>
                </div>
            {/* Pontos */}
            <div className="flex items-center gap-2 bg-blue-900 bg-opacity-60 px-3 py-1 rounded-lg shadow border border-blue-400">
              <FaMedal className="text-blue-400" />
              <span className="text-blue-200 font-bold text-sm">{points}</span>
              </div>
            {/* Notificação */}
            <div className="ml-2 relative">
              <button 
                className="focus:outline-none group" 
                onClick={() => {
                  console.log('🔔 Botão de notificação clicado!');
                  console.log('Estado atual:', showNotifications);
                  setShowNotifications(true);
                  console.log('Novo estado:', true);
                }}
              >
                <svg className="w-7 h-7 text-white group-hover:text-pink-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Badge de notificação ao vivo (exemplo) */}
                {/* <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full px-1 animate-pulse">1</span> */}
              </button>
            </div>
            {/* Usuário */}
            <div className="ml-2">
            {currentUser || steamUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                    onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {steamUser ? (
                      <img 
                        src={steamUser.avatarfull} 
                        alt={steamUser.personaname}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {currentUser?.email?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-white font-semibold text-sm">
                      {steamUser ? steamUser.personaname : currentUser?.email}
                    </div>
                    <div className="text-gray-400 text-xs">{t('user.user')}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40 bg-black bg-opacity-40" onClick={() => setShowUserMenu(false)}></div>
                      <div className="absolute right-0 mt-2 w-64 z-50 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-white/10 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl"
                        style={{ top: '100%' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-white border-opacity-20">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              {steamUser ? (
                                <img src={steamUser.avatarfull} alt={steamUser.personaname} className="w-10 h-10 rounded-full" />
                              ) : (
                                <span className="text-white font-bold">{currentUser?.email?.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{steamUser ? steamUser.personaname : currentUser?.email}</div>
                              <div className="text-gray-400 text-sm">{t('user.user')}</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                          {/* Botão Admin (apenas para admins) */}
                          {isAdmin && (
                            <button 
                              onClick={() => { navigate('/admin-panel'); setShowUserMenu(false); }} 
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500 hover:bg-opacity-20 transition-all duration-300 w-full border border-yellow-500 border-opacity-30"
                            >
                              <span className="text-xl">🎯</span>
                              <span className="font-bold drop-shadow text-white">Painel Admin</span>
                            </button>
                          )}
                          
                          {useFeature('INVENTARIO') && (
                            <button onClick={() => { navigate('/inventario'); setShowUserMenu(false); }} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300 w-full">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                              <span className="font-bold drop-shadow text-white">{t('user.inventory')}</span>
                            </button>
                          )}
                          <div className="border-t border-white border-opacity-20 my-2"></div>
                          <button onClick={() => { navigate('/carteira'); setShowUserMenu(false); }} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300 w-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                            <span className="font-bold drop-shadow text-white">{t('user.wallet')}</span>
                          </button>
                          {useFeature('TRANSACOES') && (
                            <button onClick={() => { navigate('/transacoes'); setShowUserMenu(false); }} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300 w-full">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                              <span className="font-bold drop-shadow text-white">{t('user.transactions')}</span>
                            </button>
                          )}
                          <div className="border-t border-white border-opacity-20 my-2"></div>
                          <button onClick={() => { navigate('/configuracoes'); setShowUserMenu(false); }} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300 w-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="font-bold drop-shadow text-white">{t('user.settings')}</span>
                          </button>
                          <button onClick={() => { navigate('/suporte'); setShowUserMenu(false); }} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300 w-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" /></svg>
                            <span className="font-bold drop-shadow text-white">{t('user.support')}</span>
                          </button>
                          <div className="border-t border-white border-opacity-20 my-2"></div>
                          <button onClick={async () => { await logout(); navigate('/'); setShowUserMenu(false); }} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 transition-all duration-300 w-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span className="font-bold drop-shadow">{t('user.logout')}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
              </div>
            ) : (
              <Link
                to="/"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Entrar
              </Link>
            )}
            </div>
            {/* Idioma */}
            <div className="ml-2 relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu((v) => !v)}
                className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300"
              >
                <span className="text-xl">
                  {LANGUAGES.find(l => l.code === language)?.flag}
                </span>
                <span className="text-white font-semibold text-sm hidden md:block">
                  {LANGUAGES.find(l => l.code === language)?.abbr}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40 bg-black bg-opacity-40" onClick={() => setShowLangMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 z-50 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-white/10 bg-white bg-opacity-10 backdrop-blur-md rounded-xl border border-white border-opacity-20 shadow-2xl"
                    style={{ top: '100%' }}
                    onClick={e => e.stopPropagation()}>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code as any); setShowLangMenu(false); }}
                        className={`flex items-center space-x-3 px-4 py-3 w-full text-left text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200 ${language === lang.code ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-semibold">{lang.abbr}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

              {/* Modal de Criação */}
        {showCreateModal && createPortal(
          <div className="modal-backdrop" onClick={() => { setShowCreateModal(false); setIsModalOpen(false); }}>
            <div className="modal-content p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">O que você quer criar?</h3>
              <p className="text-gray-300">Escolha o tipo de criação</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">


              {/* Botão Criar Leilão */}
              {useFeature('LEILOES') && (
                <button
                  onClick={() => { navigate('/criar-leilao'); setShowCreateModal(false); setIsModalOpen(false); }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex flex-col items-center space-y-2 group"
                >
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Criar Leilão</span>
                  <span className="text-xs opacity-80">Sistema de lances</span>
                </button>
              )}
            </div>

            {/* Botão Fechar */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setIsModalOpen(false); }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
          document.body
        )}

      {/* Renderizar os dropdowns fora da hierarquia normal */}
        {showLockedInfo && createPortal(
          <div className="modal-backdrop">
            <div className="modal-content p-6 max-w-md w-full bg-black bg-opacity-95">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold text-white">Dinheiro Bloqueado</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('wallet.locked_explanation')}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowLockedInfo(false)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>,
          document.body
      )}
      {/* Modal de Notificações */}
      {showNotifications && (
        <>
          {console.log('🎯 Renderizando modal de notificações!')}
          <NotificationsModal open={showNotifications} onClose={() => setShowNotifications(false)} />
        </>
      )}
    </header>
  );
} 