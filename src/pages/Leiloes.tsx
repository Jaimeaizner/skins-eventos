import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRealSteamInventoryForEvents } from '../services/steamAuth';
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

  useEffect(() => {
    async function loadRealData() {
      try {
        setLoading(true);
        
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
                setLoading(false);
              }
            }, 1000);
            return;
          }
          setAuctions([]);
          setLoading(false);
          return;
        }
        
        console.log('[LEILOES] Buscando inventário para Steam ID:', steamUser.steamid);
        const realSkins = await getRealSteamInventoryForEvents(steamUser.steamid);
        
        console.log('[LEILOES] Skins encontradas:', realSkins.length);
        
        if (!realSkins || realSkins.length === 0) {
          console.warn('[LEILOES] Nenhuma skin encontrada');
          setAuctions([]);
          return;
        }
        
        // Converter skins reais em objetos Auction
        const auctionData: Auction[] = realSkins.map((skin: any, index: number) => ({
          id: `auction-${index}`,
          name: skin.name,
          price: parseFloat(skin.market_price) || 100,
          image: skin.icon_url,
          participants: Math.floor(Math.random() * 50) + 1,
          currentBid: parseFloat(skin.market_price) * 0.8 || 80,
          minBid: parseFloat(skin.market_price) * 0.1 || 10,
          endTime: new Date(Date.now() + Math.random() * 86400000 + 3600000), // 1-24 horas
          rarity: skin.rarity || 'mil-spec',
          isFavorited: false,
          wear: skin.wear || 0.15,
          steamPrice: parseFloat(skin.market_price) || 100,
          isHighlighted: Math.random() > 0.8,
          creator: {
            steamId: steamUser!.steamid,
            nickname: steamUser!.personaname,
            avatar: steamUser!.avatarfull,
            totalAuctions: Math.floor(Math.random() * 20) + 1
          },
          biddersList: [
            {
              steamId: steamUser!.steamid,
              nickname: steamUser!.personaname,
              avatar: steamUser!.avatarfull,
              bid: parseFloat(skin.market_price) * 0.8 || 80,
              timestamp: new Date(Date.now() - Math.random() * 3600000)
            }
          ],
          game: 'cs2',
          marketHashName: skin.market_hash_name,
          stickers: skin.stickers,
          nameTag: skin.name_tag,
          condition: skin.condition,
          pendant: skin.pendant
        }));

        console.log('[LEILOES] Leilões criados:', auctionData.length);
        setAuctions(auctionData);
      } catch (error) {
        console.error('[LEILOES] Erro ao carregar dados reais:', error);
        setAuctions([]);
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
        const price = auction.currentBid;
        return price >= min && (max ? price <= max : true);
      });
    }

    switch (activeFilters.sortBy) {
      case 'ending':
        filtered.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.currentBid - a.currentBid);
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
        default:
          baseStyle += ' border-gray-500 border-opacity-50';
      }
    }
    
    return baseStyle;
  };

  const getTimeLeftColor = (timeLeft: string) => {
    if (timeLeft.includes('hora') && parseInt(timeLeft) < 2) return 'text-red-400';
    if (timeLeft.includes('minuto') && parseInt(timeLeft) < 30) return 'text-orange-400';
    return 'text-green-400';
  };

  function getDynamicTimeColor(time: string) {
    const hours = parseInt(time.split('h')[0]);
    const minutes = parseInt(time.split('h')[1]?.split('m')[0] || '0');
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes < 30) return 'text-red-400';
    if (totalMinutes < 120) return 'text-orange-400';
    return 'text-green-400';
  }

  const getSkinImageUrl = (marketHashName: string) => {
    return `https://community.cloudflare.steamstatic.com/economy/image/${marketHashName}`;
  };

  const getStickerImageUrl = (stickerName: string) => {
    return `https://community.cloudflare.steamstatic.com/economy/image/${stickerName}`;
  };

  const getPendantImageUrl = (pendantName: string) => {
    return `https://community.cloudflare.steamstatic.com/economy/image/${pendantName}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando leilões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header com informações do usuário */}
      <div className="bg-black bg-opacity-50 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <img
              src={steamUser?.avatarfull}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-purple-500"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{steamUser?.personaname}</h1>
              <p className="text-gray-300">Leilões Ativos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header com filtros */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-white">Leilões</h2>
            <span className="text-gray-400">({auctionsFiltered.length} itens)</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Filtros
            </button>
            <button
              onClick={() => navigate('/historico-leiloes')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
            >
              Histórico
            </button>
            <button
              onClick={() => navigate('/criar-leilao')}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
            >
              Criar Leilão
            </button>
          </div>
        </div>

        {/* Grid de leilões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctionsFiltered.map((auction) => (
            <div
              key={auction.id}
              className={getCardStyle(auction.rarity, auction.isHighlighted)}
              onClick={() => handleCardClick(auction)}
            >
              {/* Container da imagem com stickers e pendant */}
              <div className="relative w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {/* Imagem principal */}
                <img
                  src={getSkinImageUrl(auction.image)}
                  alt={auction.name}
                  className="max-w-full max-h-full object-contain"
                />
                
                                 {/* Stickers (lado esquerdo) */}
                 {auction.stickers && auction.stickers.length > 0 && (
                   <div className="absolute left-2 top-2 flex flex-col space-y-1">
                     {auction.stickers.slice(0, 4).map((sticker: any, stickerIndex: number) => (
                       <img
                         key={stickerIndex}
                         src={getStickerImageUrl(sticker.icon_url || sticker)}
                         alt="Sticker"
                         className="w-8 h-8 object-contain"
                       />
                     ))}
                   </div>
                 )}
                
                {/* Pendant (sobre a imagem) */}
                {auction.pendant && (
                  <img
                    src={getPendantImageUrl(auction.pendant.icon_url)}
                    alt="Pendant"
                    className="absolute top-2 right-2 w-10 h-10 object-contain"
                  />
                )}
                
                {/* Indicador de Name Tag */}
                {auction.nameTag && (
                  <div className="absolute bottom-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">
                    NT
                  </div>
                )}

                {/* Raridade */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    auction.rarity === 'covert' ? 'bg-red-600 text-white' :
                    auction.rarity === 'classified' ? 'bg-purple-600 text-white' :
                    auction.rarity === 'restricted' ? 'bg-blue-600 text-white' :
                    auction.rarity === 'mil-spec' ? 'bg-green-600 text-white' :
                    auction.rarity === 'industrial' ? 'bg-gray-600 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {auction.rarity.toUpperCase()}
                  </span>
                </div>

                {/* Highlight */}
                {auction.isHighlighted && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">
                    DESTAQUE
                  </div>
                )}
              </div>

              {/* Informações do leilão */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold truncate">{auction.name}</h3>
                
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-sm">
                    {auction.participants} participantes
                  </div>
                  <div className="text-green-400 font-bold">
                    R$ {auction.currentBid.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-sm">
                    Lance mínimo: R$ {auction.minBid.toLocaleString()}
                  </div>
                  <div className={`text-sm font-semibold ${getDynamicTimeColor(
                    Math.floor((auction.endTime.getTime() - Date.now()) / (1000 * 60)).toString()
                  )}`}>
                    {Math.floor((auction.endTime.getTime() - Date.now()) / (1000 * 60))}m restantes
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBid(auction.id, auction.currentBid + auction.minBid);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Dar Lance
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de detalhes do leilão */}
        {selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedAuction.name}</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Imagem e informações básicas */}
                <div>
                  <div className="relative w-full h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                    <img
                      src={getSkinImageUrl(selectedAuction.image)}
                      alt={selectedAuction.name}
                      className="max-w-full max-h-full object-contain"
                    />
                    
                                         {/* Stickers */}
                     {selectedAuction.stickers && selectedAuction.stickers.length > 0 && (
                       <div className="absolute left-2 top-2 flex flex-col space-y-1">
                         {selectedAuction.stickers.slice(0, 4).map((sticker: any, stickerIndex: number) => (
                           <img
                             key={stickerIndex}
                             src={getStickerImageUrl(sticker.icon_url || sticker)}
                             alt="Sticker"
                             className="w-8 h-8 object-contain"
                           />
                         ))}
                       </div>
                     )}
                    
                    {/* Pendant */}
                    {selectedAuction.pendant && (
                      <img
                        src={getPendantImageUrl(selectedAuction.pendant.icon_url)}
                        alt="Pendant"
                        className="absolute top-2 right-2 w-10 h-10 object-contain"
                      />
                    )}
                    
                    {/* Name Tag */}
                    {selectedAuction.nameTag && (
                      <div className="absolute bottom-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">
                        NT
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raridade:</span>
                      <span className="text-white font-semibold">{selectedAuction.rarity.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wear:</span>
                      <span className="text-white">{selectedAuction.wear.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Preço Steam:</span>
                      <span className="text-green-400 font-bold">R$ {selectedAuction.steamPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Informações do leilão */}
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Informações do Leilão</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lance atual:</span>
                        <span className="text-green-400 font-bold">R$ {selectedAuction.currentBid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lance mínimo:</span>
                        <span className="text-white">R$ {selectedAuction.minBid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Participantes:</span>
                        <span className="text-white">{selectedAuction.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Termina em:</span>
                        <span className="text-red-400 font-semibold">
                          {Math.floor((selectedAuction.endTime.getTime() - Date.now()) / (1000 * 60))} minutos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de lance */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Fazer Lance</h3>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBid(selectedAuction.id, selectedAuction.currentBid + selectedAuction.minBid)}
                          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                        >
                          Lance Mínimo (R$ {(selectedAuction.currentBid + selectedAuction.minBid).toLocaleString()})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de lances */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Últimos Lances</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedAuction.biddersList.slice(-5).reverse().map((bidder, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={bidder.avatar}
                              alt="Avatar"
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-white font-medium">{bidder.nickname}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-400 font-bold">R$ {bidder.bid.toLocaleString()}</div>
                            <div className="text-gray-400 text-xs">
                              {Math.floor((Date.now() - bidder.timestamp.getTime()) / (1000 * 60))}m atrás
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat do Leilão */}
              {selectedAuction && (
                <div className="bg-gray-700 rounded-lg p-4 mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Chat do Leilão</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                    {(auctionChats[selectedAuction.id] || []).map((c, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="text-purple-400 font-bold">{c.user}:</span>
                        <span className="text-white">{c.msg}</span>
                        <span className="text-xs text-gray-400">{new Date(c.time).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={60}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-600 rounded-lg border border-gray-500 text-white focus:outline-none"
                      placeholder="Digite sua mensagem (máx 60 caracteres)"
                      disabled={
                        !selectedAuction.biddersList.some(b => (steamUser?.steamid || currentUser?.uid) === b.steamId) ||
                        !!(lastMsgTime[selectedAuction.id] && Date.now() - lastMsgTime[selectedAuction.id] < 15000)
                      }
                    />
                    <button
                      onClick={() => handleSendChat(selectedAuction.id)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                      disabled={
                        !selectedAuction.biddersList.some(b => (steamUser?.steamid || currentUser?.uid) === b.steamId) ||
                        !chatInput.trim() ||
                        !!(lastMsgTime[selectedAuction.id] && Date.now() - lastMsgTime[selectedAuction.id] < 15000)
                      }
                    >
                      Enviar
                    </button>
                  </div>
                  {!selectedAuction.biddersList.some(b => (steamUser?.steamid || currentUser?.uid) === b.steamId) && (
                    <div className="text-xs text-yellow-400 mt-1">Apenas usuários que deram lance podem enviar mensagens.</div>
                  )}
                  {lastMsgTime[selectedAuction.id] && Date.now() - lastMsgTime[selectedAuction.id] < 15000 && selectedAuction.biddersList.some(b => (steamUser?.steamid || currentUser?.uid) === b.steamId) && (
                    <div className="text-xs text-red-400 mt-1">Aguarde 15 segundos para enviar outra mensagem.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters Sidebar */}
      <FiltersSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onFilterChange={setActiveFilters}
        pageType="leiloes"
      />

      {auctionsFiltered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-2xl font-bold text-white mb-4 text-center">
            nenhum item disponivel no momento<br/>aproveite e coloque o seu item!
          </span>
          <button
            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition"
            onClick={() => navigate('/criar-leilao')}
          >
            Criar
          </button>
        </div>
      )}

      {/* Modal de Aviso sobre Bloqueio de Dinheiro */}
      <BidWarningModal
        open={showBidWarning}
        onClose={() => {
          setShowBidWarning(false);
          setPendingBid(null);
        }}
        onConfirm={handleConfirmBid}
        bidAmount={pendingBid?.amount || 0}
      />
    </div>
  );
} 