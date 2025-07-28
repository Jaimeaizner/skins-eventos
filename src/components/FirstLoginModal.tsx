import { useState } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaQuestionCircle, FaCheck, FaArrowRight, FaArrowLeft, FaShieldAlt, FaUser, FaLink, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const countries = [
  { code: 'BR', name: 'Brasil', en: 'Brazil', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', en: 'United States', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', en: 'Portugal', flag: '🇵🇹' },
  { code: 'AR', name: 'Argentina', en: 'Argentina', flag: '🇦🇷' },
  { code: 'ES', name: 'Espanha', en: 'Spain', flag: '🇪🇸' },
  { code: 'FR', name: 'França', en: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', en: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', en: 'Italy', flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', en: 'United Kingdom', flag: '🇬🇧' },
  { code: 'RU', name: 'Rússia', en: 'Russia', flag: '🇷🇺' },
  { code: 'CN', name: 'China', en: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japão', en: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'Coreia do Sul', en: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'Índia', en: 'India', flag: '🇮🇳' },
  { code: 'CA', name: 'Canadá', en: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'México', en: 'Mexico', flag: '🇲🇽' },
  { code: 'CL', name: 'Chile', en: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', en: 'Colombia', flag: '🇨🇴' },
  { code: 'AU', name: 'Austrália', en: 'Australia', flag: '🇦🇺' },
  { code: 'ZA', name: 'África do Sul', en: 'South Africa', flag: '🇿🇦' },
  { code: 'TR', name: 'Turquia', en: 'Turkey', flag: '🇹🇷' },
  { code: 'PL', name: 'Polônia', en: 'Poland', flag: '🇵🇱' },
  { code: 'NL', name: 'Holanda', en: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Suécia', en: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', en: 'Norway', flag: '🇳🇴' },
  { code: 'FI', name: 'Finlândia', en: 'Finland', flag: '🇫🇮' },
  { code: 'DK', name: 'Dinamarca', en: 'Denmark', flag: '🇩🇰' },
  { code: 'BE', name: 'Bélgica', en: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', en: 'Switzerland', flag: '🇨🇭' },
  { code: 'UA', name: 'Ucrânia', en: 'Ukraine', flag: '🇺🇦' },
  { code: 'RO', name: 'Romênia', en: 'Romania', flag: '🇷🇴' },
  { code: 'GR', name: 'Grécia', en: 'Greece', flag: '🇬🇷' },
  { code: 'IL', name: 'Israel', en: 'Israel', flag: '🇮🇱' },
  { code: 'EG', name: 'Egito', en: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', name: 'Arábia Saudita', en: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'NZ', name: 'Nova Zelândia', en: 'New Zealand', flag: '🇳🇿' },
  { code: 'SG', name: 'Singapura', en: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Tailândia', en: 'Thailand', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonésia', en: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Filipinas', en: 'Philippines', flag: '🇵🇭' },
  { code: 'CZ', name: 'Tchéquia', en: 'Czechia', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungria', en: 'Hungary', flag: '🇭🇺' },
  { code: 'AT', name: 'Áustria', en: 'Austria', flag: '🇦🇹' },
  { code: 'IE', name: 'Irlanda', en: 'Ireland', flag: '🇮🇪' },
  { code: 'SK', name: 'Eslováquia', en: 'Slovakia', flag: '🇸🇰' },
  { code: 'HR', name: 'Croácia', en: 'Croatia', flag: '🇭🇷' },
  { code: 'BG', name: 'Bulgária', en: 'Bulgaria', flag: '🇧🇬' },
  { code: 'OUTRO', name: 'Outro...', en: 'Other...', flag: '🌎' },
];

type TabType = 'terms' | 'data' | 'trade' | 'done';

export default function FirstLoginModal({ open }: { open: boolean }) {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('terms');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [tradeLink, setTradeLink] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [pais, setPais] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [aceitouInventario, setAceitouInventario] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const tabs = [
    { 
      id: 'terms', 
      label: 'Termos', 
      icon: FaShieldAlt,
      required: true,
      description: 'Aceite os termos para continuar'
    },
    { 
      id: 'data', 
      label: 'Dados', 
      icon: FaUser,
      required: false,
      description: 'Informações opcionais'
    },
    { 
      id: 'trade', 
      label: 'Trade Link', 
      icon: FaLink,
      required: true,
      description: 'Configure seu Trade Link'
    },
    { 
      id: 'done', 
      label: 'Concluído', 
      icon: FaCheckCircle,
      required: false,
      description: 'Cadastro finalizado'
    }
  ];

  const canProceed = () => {
    switch (currentTab) {
      case 'terms':
        return aceitouTermos && aceitouPrivacidade && aceitouInventario;
      case 'data':
        return true; // Opcional
      case 'trade':
        return tradeLink.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      setErro('Complete os campos obrigatórios para continuar.');
      return;
    }
    setErro('');
    
    const tabIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (tabIndex < tabs.length - 1) {
      setCurrentTab(tabs[tabIndex + 1].id as TabType);
    }
  };

  const handleBack = () => {
    const tabIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (tabIndex > 0) {
      setCurrentTab(tabs[tabIndex - 1].id as TabType);
    }
  };

  const handleFinish = async () => {
    setSalvando(true);
    try {
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          nome,
          sobrenome,
          email,
          tradeLink,
          nascimento,
          pais,
          aceitouTermos: true,
          aceitouPrivacidade: true,
          aceitouInventario: true
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro('Erro ao salvar dados. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const openTradeLinkHelp = () => {
    window.open('https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url', '_blank');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md p-4">
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-pink-800 to-purple-800 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">Onboard</h2>
            <p className="text-purple-200 text-lg">Required for Buying, Selling, Deposits, and Withdrawals</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-8">
          <div className="flex items-center justify-between mb-8">
            {tabs.map((tab, index) => {
              const isActive = currentTab === tab.id;
              const isCompleted = tabs.findIndex(t => t.id === currentTab) > index;
              const isRequired = tab.required;
              const IconComponent = tab.icon;
              
              return (
                <div key={tab.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 text-white shadow-lg shadow-purple-500/50' 
                        : isCompleted 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-600 text-white shadow-lg shadow-green-500/50'
                          : 'bg-transparent border-gray-500 text-gray-400'
                    }`}>
                      {isCompleted ? <FaCheck className="w-6 h-6" /> : <IconComponent className="w-6 h-6" />}
                    </div>
                    <span className={`mt-2 text-sm font-semibold transition-all duration-300 ${
                      isActive ? 'text-purple-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {tab.label}
                      {isRequired && <span className="text-red-400 ml-1">*</span>}
                    </span>
                    <span className={`text-xs mt-1 transition-all duration-300 ${
                      isActive ? 'text-purple-300' : 'text-gray-500'
                    }`}>
                      {tab.description}
                    </span>
                  </div>
                  {index < tabs.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {currentTab === 'terms' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-3">Termos e Condições</h3>
                <p className="text-gray-300 text-lg">Para continuar, você precisa aceitar nossos termos</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white bg-opacity-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <input 
                    type="checkbox" 
                    checked={aceitouTermos} 
                    onChange={e => setAceitouTermos(e.target.checked)}
                    className="w-6 h-6 mt-1 rounded border-gray-400 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <label className="text-white font-semibold text-lg cursor-pointer">
                      Li e concordo com os <Link to="/termos-de-uso" className="text-purple-400 underline hover:text-purple-300 transition-colors" target="_blank">Termos de Serviço</Link>
                    </label>
                    <p className="text-gray-400 mt-1">Concordar com nossos termos de uso é obrigatório para usar a plataforma</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white bg-opacity-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <input 
                    type="checkbox" 
                    checked={aceitouPrivacidade} 
                    onChange={e => setAceitouPrivacidade(e.target.checked)}
                    className="w-6 h-6 mt-1 rounded border-gray-400 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <label className="text-white font-semibold text-lg cursor-pointer">
                      Li e entendo a <Link to="/privacidade" className="text-purple-400 underline hover:text-purple-300 transition-colors" target="_blank">Política de Privacidade</Link>
                    </label>
                    <p className="text-gray-400 mt-1">Entender como seus dados são tratados é fundamental para sua segurança</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white bg-opacity-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <input 
                    type="checkbox" 
                    checked={aceitouInventario} 
                    onChange={e => setAceitouInventario(e.target.checked)}
                    className="w-6 h-6 mt-1 rounded border-gray-400 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <label className="text-white font-semibold text-lg cursor-pointer">
                      Manterei meu inventário Steam público enquanto usar ativamente a plataforma
                    </label>
                    <p className="text-gray-400 mt-1">Isso permite que o sistema acesse seus itens para rifas e leilões</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'data' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-3">Dados Pessoais</h3>
                <p className="text-gray-300 text-lg">Esses dados são opcionais e podem ser preenchidos depois</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">Nome</label>
                  <input 
                    type="text" 
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    className="w-full px-4 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 text-lg transition-all duration-200"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">Sobrenome</label>
                  <input 
                    type="text" 
                    value={sobrenome} 
                    onChange={e => setSobrenome(e.target.value)} 
                    className="w-full px-4 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 text-lg transition-all duration-200"
                    placeholder="Seu sobrenome"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">Data de Nascimento</label>
                  <input 
                    type="date" 
                    value={nascimento} 
                    onChange={e => setNascimento(e.target.value)} 
                    className="w-full px-4 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">País</label>
                  <select 
                    value={pais} 
                    onChange={e => setPais(e.target.value)} 
                    className="w-full px-4 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all duration-200"
                  >
                    <option value="">Selecione um país</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-3 text-lg">E-mail</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full px-4 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 text-lg transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'trade' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-3">Trade Link Steam</h3>
                <p className="text-gray-300 text-lg">Necessário para envio automático de skins</p>
              </div>
              
              <div className="bg-blue-900 bg-opacity-20 border border-blue-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <FaQuestionCircle className="text-blue-400 w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-2">Por que o Trade Link é importante?</h4>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      O Steam Trade Link é crucial para trocas na plataforma Steam porque permite que jogadores troquem itens sem a necessidade de adicionar a pessoa como amigo, agilizando o processo. Além disso, oferece uma camada adicional de segurança, pois você pode verificar os detalhes da troca antes de confirmar, alem disso, o site só pode enviar e receber seus itens apenas apos o Trade Link preenchido, não alterando nada na sua conta e aumentando ainda mais sua proteção e expreciencia de troca de itens
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-3 text-lg flex items-center gap-2">
                  Trade Link Steam *
                  <span className="relative group">
                    <FaQuestionCircle className="text-blue-300 w-5 h-5 cursor-pointer" />
                    <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 hidden group-hover:block bg-black bg-opacity-90 text-white text-sm rounded-lg px-3 py-2 shadow-xl whitespace-nowrap min-w-[300px] text-center">
                      Clique em "Achar" para abrir o tutorial da Steam
                    </span>
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={tradeLink}
                    onChange={e => setTradeLink(e.target.value)}
                    className="flex-1 px-4 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 text-lg transition-all duration-200"
                    placeholder="https://steamcommunity.com/tradeoffer/new/..."
                  />
                  <button
                    type="button"
                    onClick={openTradeLinkHelp}
                    className="flex items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-xl"
                    title="Como encontrar meu Trade Link?"
                  >
                    <FaSearch className="w-5 h-5" />
                    Achar
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'done' && (
            <div className="text-center space-y-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50">
                <FaCheckCircle className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Cadastro Concluído!</h3>
                <p className="text-gray-300 text-lg">Seu perfil foi configurado com sucesso. Você já pode usar todas as funcionalidades do site.</p>
              </div>
              <div className="bg-green-900 bg-opacity-20 border border-green-500/30 rounded-xl p-6">
                <h4 className="text-green-300 font-semibold mb-2">Próximos passos:</h4>
                <ul className="text-green-200 text-sm space-y-1 text-left">
                  <li>• Explore as rifas disponíveis</li>
                  <li>• Participe de leilões</li>
                  <li>• Configure suas preferências</li>
                  <li>• Adicione saldo à sua carteira</li>
                </ul>
              </div>
            </div>
          )}

          {erro && (
            <div className="mt-6 p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-xl">
              <p className="text-red-300 text-center">{erro}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleBack}
              disabled={currentTab === 'terms'}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <FaArrowLeft className="w-5 h-5" />
              Voltar
            </button>

            {currentTab === 'done' ? (
              <button
                onClick={handleFinish}
                disabled={salvando}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {salvando ? 'Salvando...' : 'Finalizar'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Próximo
                <FaArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 