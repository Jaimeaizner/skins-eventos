import { useState } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaQuestionCircle } from 'react-icons/fa';
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

export default function FirstLoginModal({ open }: { open: boolean }) {
  const { currentUser } = useAuth();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [tradeLink, setTradeLink] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [pais, setPais] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function calcularIdade(data: string) {
    if (!data) return 0;
    const hoje = new Date();
    const nasc = new Date(data);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  }

  const handleSalvar = async () => {
    setErro('');
    if (!nome.trim() || !sobrenome.trim() || !nascimento || !aceitou) {
      setErro('Preencha todos os campos obrigatórios e aceite os Termos.');
      return;
    }
    if (calcularIdade(nascimento) < 18) {
      setErro('Você precisa ser maior de 18 anos para usar o site.');
      return;
    }
    setSalvando(true);
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        nome,
        sobrenome,
        email,
        tradeLink,
        nascimento,
        pais,
        aceitouTermos: true
      });
      window.location.reload();
    }
    setSalvando(false);
  };

  const openTradeLinkHelp = () => {
    window.open('https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url', '_blank');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Complete seu cadastro</h2>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSalvar(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-1">Nome *</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">Sobrenome *</label>
              <input type="text" value={sobrenome} onChange={e => setSobrenome(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-1">Data de Nascimento *</label>
              <input type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1">País</label>
              <select value={pais} onChange={e => setPais(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Selecione</option>
                {countries.map(c => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name} / {c.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-white font-semibold mb-1 flex items-center gap-1">
                Trade Link Steam
                <span className="relative group ml-1">
                  <FaQuestionCircle className="inline-block text-blue-300 w-3 h-3 cursor-pointer" />
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 hidden group-hover:block bg-black bg-opacity-90 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap min-w-[180px] text-center">
                    Seu Trade Link é necessário para que o site envie skins para sua conta Steam automaticamente.
                  </span>
                </span>
              </label>
              <div className="flex items-center gap-1 w-full">
                <input
                  type="url"
                  value={tradeLink}
                  onChange={e => setTradeLink(e.target.value)}
                  className="w-full min-w-0 px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://steamcommunity.com/tradeoffer/new/..."
                />
                <button
                  type="button"
                  onClick={openTradeLinkHelp}
                  className="flex items-center gap-1 px-1 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold shadow transition-all duration-200 whitespace-nowrap"
                  title="Como encontrar meu Trade Link?"
                  style={{ flexShrink: 0 }}
                >
                  <FaSearch className="w-2.5 h-2.5" />
                  Achar
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={aceitou} onChange={e => setAceitou(e.target.checked)} required className="w-5 h-5 rounded" />
            <span className="text-white text-sm">Li e concordo com os <Link to="/termos" className="text-pink-400 underline" target="_blank">Termos e Condições</Link> *</span>
          </div>
          {erro && <div className="text-red-400 text-sm mt-2">{erro}</div>}
          <button type="submit" disabled={salvando} className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
            {salvando ? 'Salvando...' : 'Salvar e Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
} 