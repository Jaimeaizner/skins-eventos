import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getSteamMarketPrice } from '../services/steamAuth';
import { useAuth } from '../contexts/AuthContext';

export default function CriarRifa() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { currentUser, updatePoints } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steamPrice: '',
    ticketPrice: '',
    maxParticipants: '',
    endDate: '',
    endTime: '',
    rarity: 'consumer',
    exterior: 'field-tested',
    image: null as File | null,
    imagePreview: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [steamMarketPrice, setSteamMarketPrice] = useState<number | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [priceValid, setPriceValid] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      if (formData.name && formData.exterior) {
        setIsFetchingPrice(true);
        const marketHashName = formData.name + (formData.exterior ? ` (${formData.exterior.replace(/-/g, ' ')})` : '');
        const price = await getSteamMarketPrice(marketHashName);
        setSteamMarketPrice(price > 0 ? price : null);
        setIsFetchingPrice(false);
      } else {
        setSteamMarketPrice(null);
      }
    }
    fetchPrice();
  }, [formData.name, formData.exterior]);

  useEffect(() => {
    if (steamMarketPrice && formData.steamPrice) {
      const userPrice = parseFloat(formData.steamPrice);
      setPriceValid(userPrice <= steamMarketPrice * 1.3 && userPrice >= steamMarketPrice * 0.7);
    } else {
      setPriceValid(true);
    }
  }, [steamMarketPrice, formData.steamPrice]);

  // Função para ser chamada ao concluir o evento promocional com sucesso
  async function contabilizarPontosCriador(lucroSite: number) {
    const pontos = Math.floor(lucroSite / 5);
    if (pontos > 0) {
      updatePoints(pontos);
    }
  }

  // Cálculo da taxa e lucro líquido
  const taxa = Math.max(Number(formData.ticketPrice) * Number(formData.maxParticipants) * 0.2, 2);
  const arrecadacao = Number(formData.ticketPrice) * Number(formData.maxParticipants);
  const lucroLiquido = arrecadacao - taxa;

  const rarities = [
    { value: 'consumer', label: 'Consumer Grade', color: 'from-gray-400 to-gray-500' },
    { value: 'industrial', label: 'Industrial Grade', color: 'from-blue-400 to-blue-500' },
    { value: 'mil-spec', label: 'Mil-Spec Grade', color: 'from-purple-400 to-purple-500' },
    { value: 'restricted', label: 'Restricted', color: 'from-pink-400 to-pink-500' },
    { value: 'classified', label: 'Classified', color: 'from-purple-500 to-purple-600' },
    { value: 'covert', label: 'Covert', color: 'from-red-400 to-red-500' },
    { value: 'contraband', label: 'Contraband', color: 'from-yellow-400 to-orange-500' }
  ];

  const exteriors = [
    { value: 'factory-new', label: 'Factory New' },
    { value: 'minimal-wear', label: 'Minimal Wear' },
    { value: 'field-tested', label: 'Field-Tested' },
    { value: 'well-worn', label: 'Well-Worn' },
    { value: 'battle-scarred', label: 'Battle-Scarred' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.steamPrice || parseFloat(formData.steamPrice) <= 0) {
      newErrors.steamPrice = 'Preço Steam deve ser maior que 0';
    }

    if (!formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0) {
      newErrors.ticketPrice = 'Preço do bilhete deve ser maior que 0';
    }

    if (!formData.maxParticipants || parseInt(formData.maxParticipants) < 2) {
      newErrors.maxParticipants = 'Mínimo de 2 participantes';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de término é obrigatória';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Horário de término é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Validação de preço Steam
      const marketHashName = formData.name + (formData.exterior ? ` (${formData.exterior.replace(/-/g, ' ')})` : '');
      const steamMarketPrice = await getSteamMarketPrice(marketHashName);
      if (steamMarketPrice > 0) {
        const userPrice = parseFloat(formData.steamPrice);
        if (userPrice > steamMarketPrice * 1.3 || userPrice < steamMarketPrice * 0.7) {
          setErrors(prev => ({ ...prev, steamPrice: `O preço informado está muito diferente do valor mínimo da Steam (R$ ${steamMarketPrice.toFixed(2)}). Informe um valor entre R$ ${(steamMarketPrice*0.7).toFixed(2)} e R$ ${(steamMarketPrice*1.3).toFixed(2)}.` }));
          setIsSubmitting(false);
          return;
        }
      }
      
      // Simular criação do evento promocional
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você faria a chamada para a API
      console.log('Evento promocional criado:', formData);
      
      // Redirecionar para a página de eventos
      navigate('/eventos');
    } catch (error) {
      console.error('Erro ao criar evento promocional:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const rarityObj = rarities.find(r => r.value === rarity);
    return rarityObj ? rarityObj.color : 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      {/* Header com imagem */}
      <div className="relative bg-black bg-opacity-40 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/image/Rifas.png" alt="Criar Evento Promocional" className="max-h-16 object-contain drop-shadow-lg" />
              <div>
                <h1 className="text-3xl font-bold text-white">Criar Novo Evento Promocional</h1>
                <p className="text-gray-300">Preencha os dados do seu evento promocional</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/eventos')}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition-all duration-300"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Dados do Evento Promocional</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-white font-semibold mb-2">Nome da Skin</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                    errors.name ? 'border-red-500' : 'border-white border-opacity-20'
                  }`}
                  placeholder="Ex: AK-47 | Fire Serpent"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-white font-semibold mb-2">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                    errors.description ? 'border-red-500' : 'border-white border-opacity-20'
                  }`}
                  placeholder="Descreva a skin e suas características..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Preços */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                    Preço Steam (R$)
                    {isFetchingPrice && <span className="ml-2 animate-pulse text-xs text-blue-300">Buscando preço...</span>}
                    {steamMarketPrice && !isFetchingPrice && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-white bg-opacity-20 text-green-300 text-xs font-bold border border-green-400">
                        Mín. Steam: R$ {steamMarketPrice.toFixed(2)}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    name="steamPrice"
                    value={formData.steamPrice}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.steamPrice ? 'border-red-500' : priceValid ? 'border-green-400 focus:ring-green-500' : 'border-yellow-400 focus:ring-yellow-500'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    disabled={isFetchingPrice}
                  />
                  {!priceValid && steamMarketPrice && (
                    <div className="mt-2 flex items-center gap-2 bg-yellow-900 bg-opacity-60 border border-yellow-400 rounded-lg px-3 py-2 text-yellow-200 text-sm shadow">
                      <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      O preço informado está fora do intervalo permitido (R$ {(steamMarketPrice*0.7).toFixed(2)} a R$ {(steamMarketPrice*1.3).toFixed(2)}).
                    </div>
                  )}
                  {errors.steamPrice && <p className="text-red-400 text-sm mt-1">{errors.steamPrice}</p>}
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Preço do Bilhete (R$)</label>
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                      errors.ticketPrice ? 'border-red-500' : 'border-white border-opacity-20'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                  />
                  {errors.ticketPrice && <p className="text-red-400 text-sm mt-1">{errors.ticketPrice}</p>}
                </div>
              </div>

              {/* Participantes e Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Máximo de Participantes</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                      errors.maxParticipants ? 'border-red-500' : 'border-white border-opacity-20'
                    }`}
                    placeholder="100"
                    min="2"
                  />
                  {errors.maxParticipants && <p className="text-red-400 text-sm mt-1">{errors.maxParticipants}</p>}
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Data de Término</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                      errors.endDate ? 'border-red-500' : 'border-white border-opacity-20'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {/* Horário */}
              <div>
                <label className="block text-white font-semibold mb-2">Horário de Término</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                    errors.endTime ? 'border-red-500' : 'border-white border-opacity-20'
                  }`}
                />
                {errors.endTime && <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>}
              </div>

              {/* Raridade e Exterior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Raridade</label>
                  <select
                    name="rarity"
                    value={formData.rarity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  >
                    {rarities.map(rarity => (
                      <option key={rarity.value} value={rarity.value}>
                        {rarity.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Exterior</label>
                  <select
                    name="exterior"
                    value={formData.exterior}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  >
                    {exteriors.map(exterior => (
                      <option key={exterior.value} value={exterior.value}>
                        {exterior.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-white font-semibold mb-2">Imagem da Skin</label>
                <div className="border-2 border-dashed border-white border-opacity-20 rounded-lg p-6 text-center hover:border-purple-500 transition-all duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-300">Clique para selecionar uma imagem</p>
                    <p className="text-gray-500 text-sm">PNG, JPG até 5MB</p>
                  </label>
                </div>
              </div>

              {/* Taxa e Lucro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                    Taxa do site
                    <span className="ml-1 text-xs text-blue-300 cursor-pointer" title="O site cobra 20% do valor arrecadado, com mínimo de R$2.">?</span>
                  </label>
                  <div className="bg-blue-900 bg-opacity-60 border border-blue-400 rounded-lg px-4 py-2 text-blue-200 font-bold text-lg">
                    R$ {taxa.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Lucro líquido</label>
                  <div className="bg-green-900 bg-opacity-60 border border-green-400 rounded-lg px-4 py-2 text-green-200 font-bold text-lg">
                    R$ {lucroLiquido.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !priceValid || isFetchingPrice}
              >
                {isSubmitting ? 'Criando...' : 'Criar Evento Promocional'}
              </button>
            </form>
          </div>

          {/* Preview do Card */}
          <div className="flex items-center justify-center">
            <div className="group relative bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-white border-opacity-20 w-full max-w-xs">
              <div className="relative">
                <div className="w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} alt={formData.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-gray-400">Prévia da imagem</span>
                  )}
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-[2px]">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    formData.rarity === 'covert' ? 'bg-orange-500 text-white' :
                    formData.rarity === 'classified' ? 'bg-purple-500 text-white' :
                    formData.rarity === 'restricted' ? 'bg-pink-500 text-white' :
                    formData.rarity === 'mil-spec' ? 'bg-blue-500 text-white' :
                    formData.rarity === 'industrial' ? 'bg-blue-300 text-white' :
                    formData.rarity === 'consumer' ? 'bg-gray-400 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {formData.rarity?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-4 relative">
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                  {formData.name || 'Nome da Skin'}
                </h3>
                <div className="mb-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Valor da Skin:</span>
                    <span className="text-green-400 font-bold">R$ {formData.steamPrice || '0,00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Bilhete:</span>
                    <span className="text-blue-400 font-bold">R$ {formData.ticketPrice || '0,00'}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span className="font-semibold">Total de bilhetes</span>
                  <span className="font-bold text-white">{formData.maxParticipants || 0}</span>
                </div>
                <div className="mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-300 mb-1">Termina em</div>
                    <div className="text-lg font-bold text-green-400">
                      {formData.endDate && formData.endTime ? `${formData.endDate} ${formData.endTime}` : '---'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-200">Taxa do site</span>
                    <span className="text-blue-300 font-bold">R$ {taxa.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-200">Lucro líquido</span>
                    <span className="text-green-300 font-bold">R$ {lucroLiquido.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 