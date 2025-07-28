import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import FiltersSidebar from '../components/FiltersSidebar';
import BidWarningModal from '../components/BidWarningModal';

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
  steamPrice: number; // Valor da skin segundo a API da Steam
  isHighlighted: boolean; // Se o leilão está destacado
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
  game: 'cs2' | 'dota2' | 'rust' | 'teamfortress2'; // Adicionado campo game
}

export default function Leiloes() {
  const navigate = useNavigate();
  const { currentUser, steamUser, balance, updateBalance } = useAuth();
  const { selectedGame } = useGame();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [auctionChats, setAuctionChats] = useState<{ [auctionId: string]: { user: string; msg: string; time: number }[] }>({});
  const [chatInput, setChatInput] = useState('');
  const [lastMsgTime, setLastMsgTime] = useState<{ [auctionId: string]: number }>({});
  const [showBidWarning, setShowBidWarning] = useState(false);
  const [pendingBid, setPendingBid] = useState<{ auctionId: string; amount: number } | null>(null);

  const [auctions, setAuctions] = useState<Auction[]>([
    {
      id: '1',
      name: 'AK-47 | Fire Serpent',
      price: 1500,
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM',
      participants: 12,
      currentBid: 1800,
      minBid: 100,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
      rarity: 'covert',
      isFavorited: false,
      wear: 0.15,
      steamPrice: 2500,
      isHighlighted: true,
      creator: {
        steamId: '76561198012345678',
        nickname: 'CS2Master',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/12/1234567890abcdef.jpg',
        totalAuctions: 89
      },
      biddersList: [
        { steamId: '76561198011111111', nickname: 'Player1', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/11/1111111111111111.jpg', bid: 1800, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        { steamId: '76561198022222222', nickname: 'Player2', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/22/2222222222222222.jpg', bid: 1700, timestamp: new Date(Date.now() - 45 * 60 * 1000) },
        { steamId: '76561198033333333', nickname: 'Player3', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/33/3333333333333333.jpg', bid: 1600, timestamp: new Date(Date.now() - 60 * 60 * 1000) }
      ],
      game: 'cs2'
    },
    {
      id: '2',
      name: 'M4A4 | Howl',
      price: 2500,
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ',
      participants: 8,
      currentBid: 3200,
      minBid: 150,
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 horas
      rarity: 'contraband',
      isFavorited: false,
      wear: 0.08,
      steamPrice: 4500,
      isHighlighted: false,
      creator: {
        steamId: '76561198087654321',
        nickname: 'SkinHunter',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/87/876543210fedcba.jpg',
        totalAuctions: 156
      },
      biddersList: [
        { steamId: '76561198044444444', nickname: 'Player4', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/44/4444444444444444.jpg', bid: 3200, timestamp: new Date(Date.now() - 15 * 60 * 1000) },
        { steamId: '76561198055555555', nickname: 'Player5', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/55/5555555555555555.jpg', bid: 3100, timestamp: new Date(Date.now() - 25 * 60 * 1000) }
      ],
      game: 'cs2'
    },
    {
      id: '3',
      name: 'AWP | Dragon Lore',
      price: 5000,
      image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f',
      participants: 5,
      currentBid: 6500,
      minBid: 200,
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hora
      rarity: 'contraband',
      isFavorited: false,
      wear: 0.12,
      steamPrice: 8000,
      isHighlighted: true,
      creator: {
        steamId: '76561198099999999',
        nickname: 'DragonSlayer',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/99/9999999999999999.jpg',
        totalAuctions: 234
      },
      biddersList: [
        { steamId: '76561198066666666', nickname: 'Player6', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/66/6666666666666666.jpg', bid: 6500, timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { steamId: '76561198077777777', nickname: 'Player7', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/77/7777777777777777.jpg', bid: 6400, timestamp: new Date(Date.now() - 10 * 60 * 1000) }
      ],
      game: 'cs2'
    },
    {
      id: '4',
      name: 'Karambit | Fade',
      price: 3200,
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8/360fx360f',
      participants: 15,
      currentBid: 3800,
      minBid: 100,
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
      rarity: 'covert',
      isFavorited: false,
      wear: 0.03,
      steamPrice: 3800,
      isHighlighted: false,
      creator: {
        steamId: '765611980dddddddd',
        nickname: 'KnifeCollector',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/dd/dddddddddddddddd.jpg',
        totalAuctions: 67
      },
      biddersList: [
        { steamId: '76561198088888888', nickname: 'Player8', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/88/8888888888888888.jpg', bid: 3800, timestamp: new Date(Date.now() - 20 * 60 * 1000) },
        { steamId: '76561198099999999', nickname: 'Player9', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/99/9999999999999999.jpg', bid: 3700, timestamp: new Date(Date.now() - 35 * 60 * 1000) }
      ],
      game: 'cs2'
    },
    {
      id: '5',
      name: 'Desert Eagle | Golden Koi',
      price: 180,
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7v-Re6dsLPWAMWWCwPh5j-1gSCGn20om6jyGw9qgJHmQaAcgC8MmR7IMthm5m4W2M7zj7wOIj4pGn32o23hXrnE8VHBG1O4/360fx360f',
      participants: 25,
      currentBid: 220,
      minBid: 10,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 horas
      rarity: 'restricted',
      isFavorited: false,
      wear: 0.25,
      steamPrice: 220,
      isHighlighted: false,
      creator: {
        steamId: '765611980hhhhhhhh',
        nickname: 'PistolPro',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/hh/hhhhhhhhhhhhhhhh.jpg',
        totalAuctions: 45
      },
      biddersList: [
        { steamId: '765611980aaaaaaaa', nickname: 'Player10', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/aa/aaaaaaaaaaaaaaaa.jpg', bid: 220, timestamp: new Date(Date.now() - 8 * 60 * 1000) },
        { steamId: '765611980bbbbbbbb', nickname: 'Player11', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/bb/bbbbbbbbbbbbbbbb.jpg', bid: 210, timestamp: new Date(Date.now() - 15 * 60 * 1000) }
      ],
      game: 'cs2'
    },
    {
      id: '6',
      name: 'AK-47 | Redline',
      price: 45,
      image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA/360fx360f',
      participants: 42,
      currentBid: 55,
      minBid: 5,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      rarity: 'mil-spec',
      isFavorited: false,
      wear: 0.18,
      steamPrice: 55,
      isHighlighted: false,
      creator: {
        steamId: '765611980llllllll',
        nickname: 'BudgetGamer',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ll/llllllllllllllll.jpg',
        totalAuctions: 123
      },
      biddersList: [
        { steamId: '765611980cccccccc', nickname: 'Player12', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/cc/cccccccccccccccc.jpg', bid: 55, timestamp: new Date(Date.now() - 12 * 60 * 1000) },
        { steamId: '765611980dddddddd', nickname: 'Player13', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/dd/dddddddddddddddd.jpg', bid: 54, timestamp: new Date(Date.now() - 18 * 60 * 1000) }
      ],
      game: 'cs2'
    }
  ]);

  // Filtrar leilões pelo jogo selecionado
  const auctionsFiltered = auctions.filter(a => a.game === selectedGame);

  // Atualizar contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      auctionsFiltered.forEach(auction => {
        const now = new Date().getTime();
        const end = auction.endTime.getTime();
        const diff = end - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (hours > 0) {
            newTimeLeft[auction.id] = `${hours}h ${minutes}m`;
          } else if (minutes > 0) {
            newTimeLeft[auction.id] = `${minutes}m ${seconds}s`;
          } else {
            newTimeLeft[auction.id] = `${seconds}s`;
          }
        } else {
          newTimeLeft[auction.id] = 'Finalizado';
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionsFiltered]);

  // Função para dar lance
  const handleBid = (auctionId: string, amount: number) => {
    if (!currentUser && !steamUser) {
      setNotification({ message: 'Você precisa estar logado para dar lances!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const auction = auctionsFiltered.find(a => a.id === auctionId);
    if (!auction) return;

    if (balance < amount) {
      setNotification({ message: 'Saldo insuficiente para este lance!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (amount <= auction.currentBid) {
      setNotification({ message: 'O lance deve ser maior que o lance atual!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (amount < auction.currentBid + auction.minBid) {
      setNotification({ message: `O lance mínimo é R$ ${(auction.currentBid + auction.minBid).toLocaleString()}!`, type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Verificar se o usuário já escolheu não ver o aviso novamente
    const warningDismissed = localStorage.getItem('bidWarningDismissed');
    
    if (warningDismissed === 'true') {
      // Executar o lance diretamente
      executeBid(auctionId, amount);
    } else {
      // Mostrar o modal de aviso
      setPendingBid({ auctionId, amount });
      setShowBidWarning(true);
    }
  };

  // Função para executar o lance após confirmação
  const executeBid = (auctionId: string, amount: number) => {
    // Deduzir o valor do lance do saldo
    updateBalance(-amount);

    // Atualizar o leilão
    setAuctions(prevAuctions => 
      prevAuctions.map(a => 
        a.id === auctionId
          ? {
              ...a,
              currentBid: amount,
              participants: a.participants + 1,
              biddersList: [
                {
                  steamId: steamUser ? steamUser.steamid : currentUser?.uid || '',
                  nickname: steamUser ? steamUser.personaname : currentUser?.email || '',
                  avatar: steamUser ? steamUser.avatarfull : '',
                  bid: amount,
                  timestamp: new Date()
                },
                ...a.biddersList
              ].slice(0, 10) // Manter apenas os 10 últimos lances
            }
          : a
      )
    );

    setNotification({ 
      message: `Lance de R$ ${amount.toLocaleString()} realizado com sucesso!`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    setShowModal(false);
    setBidAmount(0);
  };

  // Função para confirmar lance após aviso
  const handleConfirmBid = () => {
    if (pendingBid) {
      executeBid(pendingBid.auctionId, pendingBid.amount);
      setPendingBid(null);
      setShowBidWarning(false);
    }
  };

  // Função para abrir modal com detalhes
  const handleCardClick = (auction: Auction) => {
    setSelectedAuction(auction);
    setBidAmount(auction.currentBid + auction.minBid);
    setShowModal(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAuction(null);
    setBidAmount(0);
  };

  // Função para enviar mensagem no chat
  function handleSendChat(auctionId: string) {
    if (!selectedAuction) return;
    const now = Date.now();
    if (lastMsgTime[auctionId] && now - lastMsgTime[auctionId] < 15000) return;
    if (!chatInput.trim() || chatInput.length > 60) return;
    setAuctionChats(prev => ({
      ...prev,
      [auctionId]: [...(prev[auctionId] || []), { user: (steamUser?.personaname || currentUser?.email || 'Você'), msg: chatInput, time: now }].slice(-30)
    }));
    setLastMsgTime(prev => ({ ...prev, [auctionId]: now }));
    setChatInput('');
  }

  // Simular notificação de lances em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const allBids = auctionsFiltered.flatMap(a => a.biddersList.map(b => ({
        msg: `${b.nickname} deu um lance de R$ ${b.bid.toLocaleString()} em ${a.name}`,
        time: b.timestamp.getTime()
      })));
      // Remover variáveis/funções não utilizadas: notifier, getRarityColor, index
    }, 2000);
    return () => clearInterval(interval);
  }, [auctionsFiltered]);

  // Adicionar função para filtrar auctions conforme activeFilters
  function filterAuctions() {
    return auctionsFiltered.filter((auction) => {
      // Filtro por raridade
      if (activeFilters.rarity && activeFilters.rarity.length > 0 && !activeFilters.rarity.includes(auction.rarity)) {
        return false;
      }
      // Filtro por preço (currentBid)
      if (activeFilters.price && Array.isArray(activeFilters.price)) {
        const [min, max] = activeFilters.price;
        if (auction.currentBid < (min ?? 0) || auction.currentBid > (max ?? Infinity)) {
          return false;
        }
      }
      // Filtro por número de lances
      if (activeFilters.bids && Array.isArray(activeFilters.bids)) {
        const [min, max] = activeFilters.bids;
        if (auction.biddersList.length < (min ?? 0) || auction.biddersList.length > (max ?? Infinity)) {
          return false;
        }
      }
      // Filtro por exterior
      if (activeFilters.exterior && activeFilters.exterior.length > 0) {
        // Supondo que wear < 0.07 = Factory New, < 0.15 = Minimal Wear, < 0.38 = Field-Tested, < 0.45 = Well-Worn, >= 0.45 = Battle-Scarred
        const wearMap = [
          { id: 'factory-new', min: 0, max: 0.07 },
          { id: 'minimal-wear', min: 0.07, max: 0.15 },
          { id: 'field-tested', min: 0.15, max: 0.38 },
          { id: 'well-worn', min: 0.38, max: 0.45 },
          { id: 'battle-scarred', min: 0.45, max: 1 }
        ];
        const exteriorMatch = wearMap.find(ext => activeFilters.exterior.includes(ext.id) && auction.wear >= ext.min && auction.wear < ext.max);
        if (!exteriorMatch && !activeFilters.exterior.includes('any')) {
          return false;
        }
      }
      // Filtro por status (exemplo: disponível, finalizado)
      if (activeFilters.status && activeFilters.status.length > 0) {
        if (activeFilters.status.includes('available') && timeLeft[auction.id] === 'Finalizado') return false;
        if (activeFilters.status.includes('finalized') && timeLeft[auction.id] !== 'Finalizado') return false;
      }
      // ... outros filtros se necessário
      return true;
    });
  }

  const getCardStyle = (rarity: string, isHighlighted: boolean) => {
    let baseStyle = 'group relative bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 cursor-pointer shadow-2xl';

    if (isHighlighted) {
      baseStyle += ' border-2 border-orange-500 border-opacity-80 shadow-orange-500 shadow-opacity-50';
    }
    
    switch (rarity) {
      case 'contraband':
        return baseStyle + ' shadow-yellow-500 shadow-opacity-30 hover:shadow-yellow-500 hover:shadow-opacity-50';
      case 'covert':
        return baseStyle + ' shadow-orange-500 shadow-opacity-30 hover:shadow-orange-500 hover:shadow-opacity-50';
      case 'classified':
        return baseStyle + ' shadow-purple-500 shadow-opacity-30 hover:shadow-purple-500 hover:shadow-opacity-50';
      case 'restricted':
        return baseStyle + ' shadow-pink-500 shadow-opacity-30 hover:shadow-pink-500 hover:shadow-opacity-50';
      case 'mil-spec':
        return baseStyle + ' shadow-blue-500 shadow-opacity-30 hover:shadow-blue-500 hover:shadow-opacity-50';
      case 'industrial':
        return baseStyle + ' shadow-cyan-500 shadow-opacity-30 hover:shadow-cyan-500 hover:shadow-opacity-50';
      case 'consumer':
        return baseStyle + ' shadow-gray-500 shadow-opacity-30 hover:shadow-gray-500 hover:shadow-opacity-50';
      default:
        return baseStyle;
    }
  };

  const getTimeLeftColor = (timeLeft: string) => {
    if (timeLeft === 'Finalizado') return 'text-red-400';
    if (timeLeft.includes('h')) return 'text-green-400';
    if (timeLeft.includes('m')) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Função para cor dinâmica do tempo
  function getDynamicTimeColor(time: string) {
    if (!time || time === 'Finalizado') return 'text-red-500';
    if (time.includes('h')) {
      const match = time.match(/(\d+)h\s?(\d+)?m?/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        const totalMinutes = hours * 60 + minutes;
        if (totalMinutes > 300) return 'text-green-400'; // >5h
        if (totalMinutes >= 90 && totalMinutes <= 239) return 'text-yellow-400'; // 1:30-3:59h
        if (totalMinutes >= 30 && totalMinutes < 90) return 'text-orange-400'; // 0:30-1:29h
        if (totalMinutes < 30) return 'text-red-500'; // 0:00-0:29h
      }
    } else if (time.includes('m')) {
      const match = time.match(/(\d+)m/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        if (minutes > 300) return 'text-green-400';
        if (minutes >= 90 && minutes <= 239) return 'text-yellow-400';
        if (minutes >= 30 && minutes < 90) return 'text-orange-400';
        if (minutes < 30) return 'text-red-500';
      }
    }
    return 'text-green-400';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className={`transition-all duration-300 ${showFilters ? 'ml-80' : 'ml-0'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                    LEILÕES
                  </span>
                </h1>
                <p className="text-gray-300 text-lg">
                  Faça lances nas melhores skins do CS2
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span>Filtros</span>
                {Object.keys(activeFilters).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.keys(activeFilters).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl backdrop-blur-md border border-white border-opacity-20 transition-all duration-300 transform ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            }`}>
              <div className="flex items-center space-x-3">
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="font-semibold">{notification.message}</span>
              </div>
            </div>
          )}

          {/* Header com título */}
          <div className="w-full flex justify-center mb-6 mt-2">
            <img src="/image/Leilão.png" alt="Leilão" className="max-h-32 md:max-h-40 object-contain drop-shadow-lg" />
          </div>

          {/* Cards de Leilões */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filterAuctions().map((auction) => (
              <div
                key={auction.id}
                className={getCardStyle(auction.rarity, auction.isHighlighted)}
                onClick={() => handleCardClick(auction)}
              >
                {/* Efeito de Fogo para Leilões Destacados */}
                {auction.isHighlighted && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent animate-pulse"></div>
                    
                    {/* Partículas de Fogo */}
                    <div className="absolute top-2 left-2 w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="absolute top-4 right-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-4 right-2 w-1 h-1 bg-orange-400 rounded-full animate-bounce"></div>
                  </div>
                )}

                <div className="relative">
                  <div className="w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Raridade e Tags */}
                  <div className="absolute top-3 left-3 flex flex-col gap-[2px]">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      auction.rarity === 'covert' ? 'bg-orange-500 text-white' :
                      auction.rarity === 'contraband' ? 'bg-yellow-500 text-black' :
                      auction.rarity === 'classified' ? 'bg-purple-500 text-white' :
                      auction.rarity === 'restricted' ? 'bg-pink-500 text-white' :
                      auction.rarity === 'mil-spec' ? 'bg-blue-500 text-white' :
                      auction.rarity === 'industrial' ? 'bg-cyan-500 text-black' :
                      auction.rarity === 'consumer' ? 'bg-gray-500 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {auction.rarity.toUpperCase()}
                    </span>

                  </div>
                </div>
                
                <div className="p-4 relative">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {auction.name}
                  </h3>
                  
                  {/* Informações de Preço */}
                  <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Valor da Skin:</span>
                      <span className="text-green-400 font-bold">R$ {auction.steamPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Lance Atual:</span>
                      <span className="text-blue-400 font-bold">R$ {auction.currentBid.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Remover barra de progresso e ajustar exibição */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span className="font-semibold">Nº de Lances</span>
                      <span className="font-bold text-white">{auction.biddersList.length}</span>
                    </div>
                  </div>

                  {/* Tempo Restante com cor dinâmica */}
                  <div className="mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-300 mb-1">Tempo Restante</div>
                      <div className={`text-lg font-bold ${getDynamicTimeColor(timeLeft[auction.id] || '')}`}>
                        {timeLeft[auction.id] || 'Carregando...'}
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(auction);
                      }}
                      disabled={timeLeft[auction.id] === 'Finalizado'}
                    >
                      {timeLeft[auction.id] === 'Finalizado' ? 'FINALIZADO' : 'VER LEILÃO'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de Detalhes */}
          {showModal && selectedAuction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-bold text-white">{selectedAuction.name}</h3>
                  <button 
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {selectedAuction && (
                  <div className="bg-black bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-10 p-3 mb-6">
                    <h4 className="text-white text-sm font-bold mb-2">Notificações em tempo real deste leilão</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedAuction.biddersList
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .slice(0, 8)
                        .map((b, i) => (
                          <div key={i} className="text-xs text-gray-200 flex items-center">
                            <span className="mr-2">🔔</span>{b.nickname} deu um lance de R$ {b.bid.toLocaleString()} às {b.timestamp.toLocaleTimeString()}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Coluna Esquerda - Informações da Skin */}
                  <div>
                    <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                      <img 
                        src={selectedAuction.image} 
                        alt={selectedAuction.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Valor da Skin (Steam):</span>
                        <span className="text-green-400 font-bold">R$ {selectedAuction.steamPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Lance Atual:</span>
                        <span className="text-blue-400 font-bold">R$ {selectedAuction.currentBid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Lance Mínimo:</span>
                        <span className="text-yellow-400 font-bold">R$ {selectedAuction.minBid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Raridade:</span>
                        <span className={`px-3 py-1 rounded text-sm font-bold ${
                          selectedAuction.rarity === 'covert' ? 'bg-orange-500 text-white' :
                          selectedAuction.rarity === 'contraband' ? 'bg-yellow-500 text-black' :
                          selectedAuction.rarity === 'classified' ? 'bg-purple-500 text-white' :
                          selectedAuction.rarity === 'restricted' ? 'bg-pink-500 text-white' :
                          selectedAuction.rarity === 'mil-spec' ? 'bg-blue-500 text-white' :
                          selectedAuction.rarity === 'industrial' ? 'bg-cyan-500 text-black' :
                          selectedAuction.rarity === 'consumer' ? 'bg-gray-500 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {selectedAuction.rarity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Participantes:</span>
                        <span className="text-white font-bold">{selectedAuction.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tempo Restante:</span>
                        <span className={`font-bold ${getTimeLeftColor(timeLeft[selectedAuction.id] || '')}`}>
                          {timeLeft[selectedAuction.id] || 'Carregando...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Exterior:</span>
                        <span className="text-white font-bold">Field-Tested</span>
                      </div>
                    </div>
                    
                    {/* Sistema de Lances */}
                    <div className="bg-white bg-opacity-5 rounded-xl p-4 mb-6 border border-white border-opacity-10">
                      <h4 className="text-lg font-bold text-white mb-3">Fazer Lance</h4>
                      <div className="flex items-center space-x-3 mb-4">
                        <label className="text-gray-300 text-sm">Valor:</label>
                        <input
                          type="number"
                          min={selectedAuction.currentBid + selectedAuction.minBid}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Math.max(selectedAuction.currentBid + selectedAuction.minBid, parseInt(e.target.value) || 0))}
                          className="flex-1 px-3 py-2 bg-gray-700 bg-opacity-50 rounded-lg border border-white border-opacity-20 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-400 text-sm">R$</span>
                      </div>
                      <button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300"
                        onClick={() => handleBid(selectedAuction.id, bidAmount)}
                        disabled={timeLeft[selectedAuction.id] === 'Finalizado' || bidAmount < selectedAuction.currentBid + selectedAuction.minBid}
                      >
                        {timeLeft[selectedAuction.id] === 'Finalizado' ? 'LEILÃO FINALIZADO' : `DAR LANCE DE R$ ${bidAmount.toLocaleString()}`}
                      </button>
                    </div>
                  </div>

                  {/* Coluna Direita - Criador e Lances */}
                  <div>
                    {/* Informações do Criador */}
                    <div className="bg-white bg-opacity-5 rounded-xl p-4 mb-6 border border-white border-opacity-10">
                      <h4 className="text-lg font-bold text-white mb-3">Criador do Leilão</h4>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={selectedAuction.creator.avatar} 
                          alt={selectedAuction.creator.nickname}
                          className="w-12 h-12 rounded-full border-2 border-white border-opacity-20"
                        />
                        <div>
                          <div className="text-white font-semibold">{selectedAuction.creator.nickname}</div>
                          <div className="text-gray-400 text-sm">({selectedAuction.creator.totalAuctions} leilões criados)</div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Lances */}
                    <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
                      <h4 className="text-lg font-bold text-white mb-3">Últimos Lances ({selectedAuction.biddersList.length})</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedAuction.biddersList
                          .sort((a, b) => b.bid - a.bid)
                          .map((bidder, index) => (
                            <div key={`${bidder.steamId}-${bidder.timestamp.getTime()}`} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={bidder.avatar} 
                                  alt={bidder.nickname}
                                  className="w-8 h-8 rounded-full border border-white border-opacity-20"
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
                  <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10 mt-6">
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
                        className="flex-1 px-3 py-2 bg-gray-700 bg-opacity-50 rounded-lg border border-white border-opacity-20 text-white focus:outline-none"
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
                      >Enviar</button>
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
          <span className="text-2xl font-bold text-white mb-4 text-center">nenhum item disponivel no momento<br/>aproveite e coloque o seu item!</span>
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
