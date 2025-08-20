import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';
import FiltersSidebar from '../components/FiltersSidebar';
import BidWarningModal from '../components/BidWarningModal';
import { FaExclamationTriangle } from 'react-icons/fa';

interface Auction {
  id: string;
  name: string;
  price: number;
  image: string;
  participants: number;
  currentBid: number;
  minBid: number;
  endTime: Date;
  rarity: 'consumer' | 'industrial' | 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'contraband';
  isFavorited: boolean;
  wear: number;
  steamPrice: number;
  isHighlighted: boolean;
  creator: {
    steamId: string;
    nickname: string;
    avatar: string;
    totalAuctions: number;
  };
  biddersList: Array<{
    steamId: string;
    nickname: string;
    avatar: string;
    bid: number;
    timestamp: Date;
  }>;
  game: 'cs2' | 'dota2' | 'rust' | 'teamfortress2';
  marketHashName?: string;
  stickers?: Array<{
    name: string;
    image: string;
    icon_url?: string;
  }>;
  nameTag?: string;
  condition?: string;
  pendant?: {
    id: string;
    name: string;
    icon_url: string;
  };
}

export default function Leiloes() {
  const { steamUser, currentUser, refreshSteamUser } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    rarity: '',
    priceRange: '',
    game: '',
    sortBy: 'ending'
  });
  const [showBidWarning, setShowBidWarning] = useState(false);
  const [pendingBid, setPendingBid] = useState<{ auctionId: string; amount: number } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [auctionChats, setAuctionChats] = useState<Record<string, Array<{ user: string; msg: string; time: number }>>>({});
  const [lastMsgTime, setLastMsgTime] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRealData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[LEILOES] Verificando steamUser:', steamUser);
        
        if (!steamUser?.steamid) {
          console.warn('[LEILOES] Steam User não disponível');
          // Tentar recarregar dados do Steam se o usuário estiver logado
          if (currentUser) {
            console.log('[LEILOES] Tentando recarregar dados do Steam...');
            await refreshSteamUser();
            // Aguardar um pouco e tentar novamente
            setTimeout(() => {
              if (!steamUser?.steamid) {
                console.warn('[LEILOES] Ainda sem dados do Steam após tentativa de recarregamento');
                setAuctions([]);
                setError('Não foi possível carregar dados do Steam. Tente fazer login novamente.');
                setLoading(false);
              }
            }, 1000);
            return;
          }
          setAuctions([]);
          setError('Você precisa estar logado via Steam para ver os leilões.');
          setLoading(false);
          return;
        }
        
        // CORREÇÃO: Não buscar inventário, apenas mostrar estado vazio
        // Os leilões serão criados pelos usuários, não baseados no inventário
        console.log('[LEILOES] Verificando leilões disponíveis...');
        
        // Por enquanto, não há leilões criados no sistema
        // Em uma implementação real, aqui buscaríamos leilões do Firestore
        setAuctions([]);
        
      } catch (error) {
        console.error('[LEILOES] Erro ao carregar dados:', error);
        setAuctions([]);
        setError('Erro ao carregar leilões. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    if (steamUser?.steamid) {
      loadRealData();
    } else {
      console.log('[LEILOES] Steam User não disponível, definindo loading como false');
      setLoading(false);
    }
  }, [steamUser?.steamid]);

  const handleBid = (auctionId: string, amount: number) => {
    setPendingBid({ auctionId, amount });
    setShowBidWarning(true);
  };

  const executeBid = (auctionId: string, amount: number) => {
    setAuctions(prev => prev.map(auction => {
      if (auction.id === auctionId) {
        const newBid = {
          steamId: steamUser!.steamid,
          nickname: steamUser!.personaname,
          avatar: steamUser!.avatarfull,
          bid: amount,
          timestamp: new Date()
        };

        return {
          ...auction,
          currentBid: amount,
          participants: auction.participants + 1,
          biddersList: [...auction.biddersList, newBid]
        };
      }
      return auction;
    }));

    // Adicionar mensagem no chat
    const chatMessage = {
      user: steamUser!.personaname,
      msg: `Lance de R$ ${amount.toLocaleString()}`,
      time: Date.now()
    };

    setAuctionChats(prev => ({
      ...prev,
      [auctionId]: [...(prev[auctionId] || []), chatMessage]
    }));

    setLastMsgTime(prev => ({
      ...prev,
      [auctionId]: Date.now()
    }));
  };

  const handleConfirmBid = () => {
    if (pendingBid) {
      executeBid(pendingBid.auctionId, pendingBid.amount);
      setShowBidWarning(false);
      setPendingBid(null);
    }
  };

  const handleCardClick = (auction: Auction) => {
    setSelectedAuction(auction);
  };

  const handleCloseModal = () => {
    setSelectedAuction(null);
  };

  function handleSendChat(auctionId: string) {
    if (!chatInput.trim()) return;

    const chatMessage = {
      user: steamUser!.personaname,
      msg: chatInput.trim(),
      time: Date.now()
    };

    setAuctionChats(prev => ({
      ...prev,
      [auctionId]: [...(prev[auctionId] || []), chatMessage]
    }));

    setLastMsgTime(prev => ({
      ...prev,
      [auctionId]: Date.now()
    }));

    setChatInput('');
  }

  function filterAuctions() {
    let filtered = [...auctions];

    if (activeFilters.rarity) {
      filtered = filtered.filter(auction => auction.rarity === activeFilters.rarity);
    }

    if (activeFilters.game) {
      filtered = filtered.filter(auction => auction.game === activeFilters.game);
    }

    if (activeFilters.priceRange) {
      const [min, max] = activeFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(auction => {
        const price = auction.currentBid || auction.price;
        return price >= min && (max ? price <= max : true);
      });
    }

    switch (activeFilters.sortBy) {
      case 'ending':
        filtered.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.currentBid || a.price) - (b.currentBid || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.currentBid || b.price) - (a.currentBid || a.price));
        break;
      case 'participants':
        filtered.sort((a, b) => b.participants - a.participants);
        break;
    }

    return filtered;
  }

  const auctionsFiltered = filterAuctions();

  const getCardStyle = (rarity: string, isHighlighted: boolean) => {
    let baseStyle = 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border transition-all duration-300 hover:scale-105 cursor-pointer';
    
    if (isHighlighted) {
      baseStyle += ' border-yellow-500 border-opacity-70 shadow-lg shadow-yellow-500/20';
    } else {
      switch (rarity) {
        case 'covert':
          baseStyle += ' border-red-500 border-opacity-50';
          break;
        case 'classified':
          baseStyle += ' border-purple-500 border-opacity-50';
          break;
        case 'restricted':
          baseStyle += ' border-blue-500 border-opacity-50';
          break;
        case 'mil-spec':
          baseStyle += ' border-green-500 border-opacity-50';
          break;
        case 'industrial':
          baseStyle += ' border-gray-500 border-opacity-50';
          break;
        case 'consumer':
          baseStyle += ' border-white border-opacity-30';
          break;
        default:
          baseStyle += ' border-gray-500 border-opacity-30';
      }
    }
    
    return baseStyle;
  };

  // Verificar se usuário está logado
  if (!currentUser && !steamUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-black mb-4">Acesso Negado</h1>
          <p className="text-gray-300 mb-6">Você precisa fazer login via Steam para acessar os leilões.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // Estado de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-black mb-2">Carregando Leilões...</h1>
          <p className="text-gray-300">Buscando itens do seu inventário...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black mb-2">Erro ao Carregar</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Sem leilões disponíveis
  if (auctions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-3xl font-black mb-4">Nenhum Leilão Disponível</h1>
            <p className="text-gray-300 mb-6">
              Não há leilões ativos no momento.
            </p>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Os leilões são criados pelos usuários da plataforma. Fique atento aos próximos!
              </p>
              <button 
                onClick={() => navigate('/inventario')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Ver Meu Inventário
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                  LEILÕES
                </span>
              </h1>
              <p className="text-gray-300">Leilões ativos da plataforma</p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        {showFilters && (
          <FiltersSidebar
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Grid de Leilões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctionsFiltered.map((auction) => (
            <div
              key={auction.id}
              className={getCardStyle(auction.rarity, auction.isHighlighted)}
              onClick={() => handleCardClick(auction)}
            >
              {/* Imagem do item */}
              <div className="relative mb-4">
                <img
                  src={auction.image}
                  alt={auction.name}
                  className="w-full h-32 object-contain bg-gray-700 rounded-lg"
                />
                
                {/* Indicadores */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  {auction.isHighlighted && (
                    <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                      DESTAQUE
                    </div>
                  )}
                  {auction.isFavorited && (
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      ♥
                    </div>
                  )}
                </div>
              </div>

              {/* Informações do item */}
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm truncate" title={auction.name}>
                  {auction.name}
                </h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">
                    {auction.rarity.toUpperCase()}
                  </span>
                  <span className="text-green-400 text-xs font-bold">
                    R$ {auction.steamPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">
                    {auction.participants} participantes
                  </span>
                  <span className="text-blue-400 text-xs">
                    {auction.currentBid > 0 ? `R$ ${auction.currentBid.toLocaleString()}` : 'Sem lances'}
                  </span>
                </div>

                <div className="text-gray-400 text-xs">
                  Termina em: {auction.endTime.toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há leilões filtrados */}
        {auctionsFiltered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Nenhum leilão encontrado com os filtros aplicados</p>
            <button 
              onClick={() => setActiveFilters({ rarity: '', priceRange: '', game: '', sortBy: 'ending' })}
              className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalhes do leilão */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white text-xl font-bold">{selectedAuction.name}</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Imagem e detalhes básicos */}
              <div>
                <img
                  src={selectedAuction.image}
                  alt={selectedAuction.name}
                  className="w-full h-48 object-contain bg-gray-700 rounded-lg mb-4"
                />
                
                <div className="space-y-2 text-white">
                  <div><span className="text-gray-400">Raridade:</span> {selectedAuction.rarity.toUpperCase()}</div>
                  <div><span className="text-gray-400">Preço Steam:</span> R$ {selectedAuction.steamPrice.toLocaleString()}</div>
                  <div><span className="text-gray-400">Lance mínimo:</span> R$ {selectedAuction.minBid.toLocaleString()}</div>
                  <div><span className="text-gray-400">Termina em:</span> {selectedAuction.endTime.toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Chat e lances */}
              <div>
                <h4 className="text-white font-semibold mb-3">Chat do Leilão</h4>
                
                {/* Lista de lances */}
                <div className="bg-gray-700 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
                  {selectedAuction.biddersList.length > 0 ? (
                    selectedAuction.biddersList.map((bid, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <img
                          src={bid.avatar}
                          alt={bid.nickname}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-white text-sm">{bid.nickname}</span>
                        <span className="text-green-400 text-sm font-bold">
                          R$ {bid.bid.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Nenhum lance ainda</p>
                  )}
                </div>

                {/* Input do chat */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat(selectedAuction.id)}
                  />
                  <button
                    onClick={() => handleSendChat(selectedAuction.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Enviar
                  </button>
                </div>

                {/* Botão de lance */}
                <button
                  onClick={() => handleBid(selectedAuction.id, selectedAuction.minBid)}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Fazer Lance de R$ {selectedAuction.minBid.toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de lance */}
      {showBidWarning && (
        <BidWarningModal
          isOpen={showBidWarning}
          onClose={() => setShowBidWarning(false)}
          onConfirm={handleConfirmBid}
          bidAmount={pendingBid?.amount || 0}
        />
      )}
    </div>
  );
} 