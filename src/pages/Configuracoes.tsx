import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';

export default function Configuracoes() {
  const { currentUser, steamUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estados dos formulários
  const [steamApiKey, setSteamApiKey] = useState('');
  const [tradeLink, setTradeLink] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleSave = () => {
    // Aqui você salvaria as configurações no Firebase
    localStorage.setItem('steamApiKey', steamApiKey);
    localStorage.setItem('tradeLink', tradeLink);
    localStorage.setItem('notifications', notifications.toString());
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('twoFactorAuth', twoFactorAuth.toString());
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文 (Simplificado)', flag: '🇨🇳' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-400">
            Gerencie suas configurações de conta e preferências
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 font-semibold">{t('settings.saved')}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações da Conta */}
          <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{t('settings.account')}</span>
            </h2>

            <div className="space-y-6">
              {/* Informações do Usuário */}
              <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {steamUser ? (
                    <img 
                      src={steamUser.avatarfull} 
                      alt={steamUser.personaname}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {currentUser?.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {steamUser ? steamUser.personaname : currentUser?.email}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {steamUser ? 'Conta Steam' : 'Conta Email'}
                  </div>
                </div>
              </div>

              {/* API da Steam */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  {t('settings.api')} Key
                </label>
                <input
                  type="password"
                  value={steamApiKey}
                  onChange={(e) => setSteamApiKey(e.target.value)}
                  placeholder="Digite sua Steam API Key"
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Sua API Key é necessária para sincronizar seu inventário da Steam
                </p>
              </div>

              {/* Trade Link */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  {t('settings.trade_link')}
                </label>
                <input
                  type="url"
                  value={tradeLink}
                  onChange={(e) => setTradeLink(e.target.value)}
                  placeholder="https://steamcommunity.com/tradeoffer/new/..."
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Seu Trade Link é necessário para receber skins ganhas
                </p>
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Preferências</span>
            </h2>

            <div className="space-y-6">
              {/* Idioma */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  {t('settings.language')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        language === lang.code
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white'
                          : 'bg-white bg-opacity-10 border-white border-opacity-20 text-gray-300 hover:bg-white hover:bg-opacity-20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notificações */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 006.73 3H11v5.27a4 4 0 001.73 2.54l5.08 5.08a4 4 0 002.54 1.73V19h5.27a4 4 0 001.73-2.54l-5.08-5.08a4 4 0 00-2.54-1.73H6.73a4 4 0 00-2.54 1.73z" />
                    </svg>
                    <div>
                      <div className="text-white font-semibold">Notificações Push</div>
                      <div className="text-gray-400 text-sm">Receber notificações no navegador</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-white font-semibold">Notificações por Email</div>
                      <div className="text-gray-400 text-sm">Receber notificações por email</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <div className="text-white font-semibold">Autenticação em 2 Fatores</div>
                      <div className="text-gray-400 text-sm">Adicionar camada extra de segurança</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
} 