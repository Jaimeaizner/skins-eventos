import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import FiltersSidebar from '../components/FiltersSidebar';
import { getRealSteamInventoryForEvents, getSteamSkinData, getStickerImageUrl, getPendantImageUrl } from '../services/steamAuth';

interface EventoPromocional {
  id: string;
  name: string;
  price: number;
  image: string;
  participants: number;
  maxParticipants: number;
  rarity: 'consumer' | 'industrial' | 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'contraband';
  isFavorited: boolean;

  wear: number;
  steamPrice: number; // Valor da skin segundo a API da Steam
  ticketPrice: number; // Valor por ticket/participação
  isHighlighted: boolean; // Se o evento está destacado
  creator: {
    steamId: string;
    nickname: string;
    avatar: string;
    totalRaffles: number;
  };
  participantsList: Array<{
    steamId: string;
    nickname: string;
    avatar: string;
    tickets: number;
  }>;
  game: 'cs2' | 'dota2' | 'rust' | 'teamfortress2';
  
  // Novos campos para dados reais da Steam
  marketHashName?: string;
  stickers?: Array<{
    id: string;
    name: string;
    image_url: string;
  }>;
  nameTag?: string;
  condition?: string;
  pendant?: {
    id: string;
    name: string;
    image_url: string;
  };
}

export default function Rifas() {
  const navigate = useNavigate();
  const { currentUser, steamUser, balance, updateBalance } = useAuth();
  const { selectedGame } = useGame();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<EventoPromocional | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Carregar dados reais da Steam quando o componente montar
  useEffect(() => {
    const loadRealData = async () => {
      if (currentUser?.uid) {
        try {
          setLoading(true);
          const realSkins = await getRealSteamInventoryForEvents(currentUser.uid);
          
          // Converter skins reais para eventos
          const realEventos = realSkins.slice(0, 10).map((skin, index) => ({
            id: `real-${index}`,
            name: skin.name,
            price: skin.steamPrice,
            image: skin.icon_url,
            participants: Math.floor(Math.random() * 50) + 10,
            maxParticipants: 100,
            rarity: skin.rarity,
            isFavorited: false,
            wear: skin.wear || 0.15,
            steamPrice: skin.steamPrice,
            ticketPrice: skin.ticketPrice,
            isHighlighted: index < 3,
            creator: {
              steamId: currentUser.uid,
              nickname: steamUser?.personaname || 'Usuário Steam',
              avatar: steamUser?.avatarfull || '',
              totalRaffles: Math.floor(Math.random() * 100) + 10
            },
            participantsList: [],
            game: 'cs2' as const,
            marketHashName: skin.market_hash_name,
            stickers: skin.stickers || [],
            nameTag: skin.name_tag,
            condition: skin.condition
          }));
          
          setEventos(realEventos);
        } catch (error) {
          console.error('Erro ao carregar dados reais:', error);
          // Fallback para dados mock se falhar
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadRealData();
  }, [currentUser, steamUser]);

  // Dados mock como fallback
  const [eventos, setEventos] = useState<EventoPromocional[]>([
    {
      id: '1',
      name: 'AK-47 | Fire Serpent',
      price: 1500,
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM',
      participants: 45,
      maxParticipants: 100,
      rarity: 'covert',
      isFavorited: false,
      
      wear: 0.15,
      steamPrice: 2500, // Valor da skin na Steam
      ticketPrice: 15, // Valor por ticket
      isHighlighted: true, // Evento destacado
      creator: {
        steamId: '76561198012345678',
        nickname: 'CS2Master',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/12/1234567890abcdef.jpg',
        totalRaffles: 156
      },
      participantsList: [
        { steamId: '76561198011111111', nickname: 'Player1', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/11/1111111111111111.jpg', tickets: 5 },
        { steamId: '76561198022222222', nickname: 'Player2', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/22/2222222222222222.jpg', tickets: 3 },
        { steamId: '76561198033333333', nickname: 'Player3', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/33/3333333333333333.jpg', tickets: 2 },
        { steamId: '76561198044444444', nickname: 'Player4', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/44/4444444444444444.jpg', tickets: 1 },
        { steamId: '76561198055555555', nickname: 'Player5', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/55/5555555555555555.jpg', tickets: 1 }
      ],
      game: 'cs2'
    },
    {
      id: '2',
      name: 'M4A4 | Howl',
      price: 2500,
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ',
      participants: 78,
      maxParticipants: 100,
      rarity: 'contraband',
      isFavorited: false,
      
      wear: 0.08,
      steamPrice: 4500,
      ticketPrice: 25,
      isHighlighted: false,
      creator: {
        steamId: '76561198087654321',
        nickname: 'SkinHunter',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/87/876543210fedcba.jpg',
        totalRaffles: 89
      },
      participantsList: [
        { steamId: '76561198066666666', nickname: 'Player6', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/66/6666666666666666.jpg', tickets: 8 },
        { steamId: '76561198077777777', nickname: 'Player7', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/77/7777777777777777.jpg', tickets: 6 },
        { steamId: '76561198088888888', nickname: 'Player8', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/88/8888888888888888.jpg', tickets: 4 }
      ],
      game: 'cs2'
    },
    {
      id: '3',
      name: 'AWP | Dragon Lore',
      price: 5000,
      image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f',
      participants: 23,
      maxParticipants: 50,
      rarity: 'contraband',
      isFavorited: false,
      
      wear: 0.12,
      steamPrice: 8000,
      ticketPrice: 100,
      isHighlighted: true,
      creator: {
        steamId: '76561198099999999',
        nickname: 'DragonSlayer',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/99/9999999999999999.jpg',
        totalRaffles: 234
      },
      participantsList: [
        { steamId: '765611980aaaaaaaa', nickname: 'Player9', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/aa/aaaaaaaaaaaaaaaa.jpg', tickets: 12 },
        { steamId: '765611980bbbbbbbb', nickname: 'Player10', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/bb/bbbbbbbbbbbbbbbb.jpg', tickets: 7 },
        { steamId: '765611980cccccccc', nickname: 'Player11', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/cc/cccccccccccccccc.jpg', tickets: 4 }
      ],
      game: 'cs2'
    },
    {
      id: '4',
      name: 'Karambit | Fade',
      price: 3200,
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8/360fx360f',
      participants: 67,
      maxParticipants: 80,
      rarity: 'covert',
      isFavorited: false,
      
      wear: 0.03,
      steamPrice: 3800,
      ticketPrice: 40,
      isHighlighted: false,
      creator: {
        steamId: '765611980dddddddd',
        nickname: 'KnifeCollector',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/dd/dddddddddddddddd.jpg',
        totalRaffles: 67
      },
      participantsList: [
        { steamId: '765611980eeeeeeee', nickname: 'Player12', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ee/eeeeeeeeeeeeeeee.jpg', tickets: 15 },
        { steamId: '765611980ffffffff', nickname: 'Player13', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ff/ffffffffffffffff.jpg', tickets: 9 },
        { steamId: '765611980gggggggg', nickname: 'Player14', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/gg/gggggggggggggggg.jpg', tickets: 6 }
      ],
      game: 'cs2'
    },
    {
      id: '5',
      name: 'Desert Eagle | Golden Koi',
      price: 180,
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7v-Re6dsLPWAMWWCwPh5j-1gSCGn20om6jyGw9qgJHmQaAcgC8MmR7IMthm5m4W2M7zj7wOIj4pGn32o23hXrnE8VHBG1O4/360fx360f',
      participants: 89,
      maxParticipants: 120,
      rarity: 'restricted',
      isFavorited: false,
      
      wear: 0.25,
      steamPrice: 220,
      ticketPrice: 1.5,
      isHighlighted: false,
      creator: {
        steamId: '765611980hhhhhhhh',
        nickname: 'PistolPro',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/hh/hhhhhhhhhhhhhhhh.jpg',
        totalRaffles: 45
      },
      participantsList: [
        { steamId: '765611980iiiiiiii', nickname: 'Player15', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ii/iiiiiiiiiiiiiiii.jpg', tickets: 20 },
        { steamId: '765611980jjjjjjjj', nickname: 'Player16', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/jj/jjjjjjjjjjjjjjjj.jpg', tickets: 12 },
        { steamId: '765611980kkkkkkkk', nickname: 'Player17', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/kk/kkkkkkkkkkkkkkkk.jpg', tickets: 8 }
      ],
      game: 'cs2'
    },
    {
      id: '6',
      name: 'AK-47 | Redline',
      price: 45,
      image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA/360fx360f',
      participants: 156,
      maxParticipants: 200,
      rarity: 'mil-spec',
      isFavorited: false,
      
      wear: 0.18,
      steamPrice: 55,
      ticketPrice: 0.25,
      isHighlighted: false,
      creator: {
        steamId: '765611980llllllll',
        nickname: 'BudgetGamer',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ll/llllllllllllllll.jpg',
        totalRaffles: 123
      },
      participantsList: [
        { steamId: '765611980mmmmmmmm', nickname: 'Player18', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/mm/mmmmmmmmmmmmmmmm.jpg', tickets: 25 },
        { steamId: '765611980nnnnnnnn', nickname: 'Player19', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/nn/nnnnnnnnnnnnnnnn.jpg', tickets: 18 },
        { steamId: '765611980oooooooo', nickname: 'Player20', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/oo/oooooooooooooooo.jpg', tickets: 14 }
      ],
      game: 'cs2'
    }
  ]);

  // Filtrar eventos pelo jogo selecionado
  const eventosFiltrados = eventos.filter(e => e.game === selectedGame);

  // Função para participar de um evento
  const handleParticipate = (eventoId: string, tickets: number) => {
    if (!currentUser && !steamUser) {
      setNotification({ message: 'Você precisa estar logado para participar!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const evento = eventos.find(e => e.id === eventoId);
    if (!evento) return;

    const totalCost = evento.ticketPrice * tickets;

    if (balance < totalCost) {
      setNotification({ message: 'Saldo insuficiente para comprar estes tickets!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (evento.participants + tickets > evento.maxParticipants) {
      setNotification({ message: 'Não há tickets suficientes disponíveis!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Deduzir o valor dos tickets do saldo
    updateBalance(-totalCost);
    // Acúmulo de pontos: 1 ponto a cada R$10 gastos
    const pontosGanhos = Math.floor(totalCost / 10);
    if (pontosGanhos > 0) {
      // Remover 'updatePoints(pontosGanhos);' se não usado
    }

    setEventos(prevEventos => 
      prevEventos.map(e => 
        e.id === eventoId && e.participants + tickets <= e.maxParticipants
          ? { ...e, participants: e.participants + tickets }
          : e
      )
    );

    setNotification({ 
      message: `Você comprou ${tickets} ticket(s) do evento ${evento.name} por R$ ${totalCost.toLocaleString()}! Boa sorte!`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    setShowModal(false);
    setTicketQuantity(1);
  };

  // Função para favoritar/desfavoritar um evento
  const handleToggleFavorite = (eventoId: string) => {
    setEventos(prevEventos => 
      prevEventos.map(evento => 
        evento.id === eventoId
          ? { ...evento, isFavorited: !evento.isFavorited }
          : evento
      )
    );
  };

  // Função para abrir modal com detalhes
  const handleCardClick = (evento: EventoPromocional) => {
    setSelectedEvento(evento);
    setShowModal(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvento(null);
    setTicketQuantity(1);
  };

  // Função para filtrar os eventos conforme os filtros ativos
  function filterEventos() {
    return eventosFiltrados.filter((evento) => {
      // Filtro por raridade
      if (activeFilters.rarity && activeFilters.rarity.length > 0 && !activeFilters.rarity.includes(evento.rarity)) {
        return false;
      }
      // Filtro por preço (ticketPrice)
      if (activeFilters.price && Array.isArray(activeFilters.price)) {
        const [min, max] = activeFilters.price;
        if (evento.ticketPrice < (min ?? 0) || evento.ticketPrice > (max ?? Infinity)) {
          return false;
        }
      }
      // Filtro por participantes
      if (activeFilters.participants && Array.isArray(activeFilters.participants)) {
        const [min, max] = activeFilters.participants;
        if (evento.participants < (min ?? 0) || evento.participants > (max ?? Infinity)) {
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
        const exteriorMatch = wearMap.find(ext => activeFilters.exterior.includes(ext.id) && evento.wear >= ext.min && evento.wear < ext.max);
        if (!exteriorMatch && !activeFilters.exterior.includes('any')) {
          return false;
        }
      }
      // Filtro por status (exemplo: disponível, lotada)
      if (activeFilters.status && activeFilters.status.length > 0) {
        if (activeFilters.status.includes('available') && evento.participants >= evento.maxParticipants) return false;
        if (activeFilters.status.includes('full') && evento.participants < evento.maxParticipants) return false;
      }
      // Filtro por tipo de arma (não implementado no mock, mas pode ser adicionado)
      // ...
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
                    EVENTOS
                  </span>
                </h1>
                <p className="text-gray-300 text-lg">
                  Participe dos melhores eventos promocionais de skins do CS2
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

          {/* Header com título e informações do usuário */}
          <div className="w-full flex justify-center mb-6 mt-2">
            <img src="/image/Rifas.png" alt="Evento Promocional" className="max-h-32 md:max-h-40 object-contain drop-shadow-lg" />
          </div>
          
          {/* Informações do usuário */}
          {steamUser && (
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2 border border-white/20">
                <img 
                  src={steamUser.avatarfull} 
                  alt={steamUser.personaname}
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                />
                <span className="text-white font-semibold">{steamUser.personaname}</span>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Carregando skins da Steam...</p>
              </div>
            </div>
          )}

          {/* Cards de Eventos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filterEventos().map((evento) => (
              <div
                key={evento.id}
                className={getCardStyle(evento.rarity, evento.isHighlighted)}
                onClick={() => handleCardClick(evento)}
              >
                {/* Efeito de Fogo para Eventos Destacados */}
                {evento.isHighlighted && (
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
                  <div className="w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={evento.image}
                      alt={evento.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Adesivos - posicionados no canto inferior esquerdo */}
                    {evento.stickers && evento.stickers.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-20">
                        {evento.stickers.slice(0, 4).map((sticker, index) => (
                          <img
                            key={index}
                            src={sticker.image_url}
                            alt={sticker.name}
                            className="w-4 h-4 rounded-sm border border-white/20"
                            title={sticker.name}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Pingente - posicionado no canto superior esquerdo */}
                    {evento.pendant && (
                      <div className="absolute top-2 left-2">
                        <img
                          src={evento.pendant.image_url}
                          alt={evento.pendant.name}
                          className="w-6 h-6 rounded-full border border-white/20"
                          title={evento.pendant.name}
                        />
                      </div>
                    )}
                    
                    {/* Name Tag - indicador visual */}
                    {evento.nameTag && (
                      <div className="absolute top-2 right-12 bg-blue-500 bg-opacity-80 text-white px-1 py-0.5 rounded text-xs font-bold">
                        NT
                      </div>
                    )}
                  </div>
                  
                  {/* Valor do Ticket no topo direito */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold border border-white border-opacity-20 flex items-center justify-center min-w-[48px]">
                    R$ {evento.ticketPrice.toLocaleString()}
                  </div>
                  
                  {/* Raridade e Tags - reduzido 50% */}
                  <div className="absolute top-3 left-3 flex flex-col gap-[2px]">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      evento.rarity === 'covert' ? 'bg-orange-500 text-white' :
                      evento.rarity === 'contraband' ? 'bg-yellow-500 text-black' :
                      evento.rarity === 'classified' ? 'bg-purple-500 text-white' :
                      evento.rarity === 'restricted' ? 'bg-pink-500 text-white' :
                      evento.rarity === 'mil-spec' ? 'bg-blue-500 text-white' :
                      evento.rarity === 'industrial' ? 'bg-cyan-500 text-black' :
                      evento.rarity === 'consumer' ? 'bg-gray-500 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {evento.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 relative">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {evento.name}
                  </h3>
                  
                  {/* Informações de Preço */}
                  <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Valor da Skin:</span>
                      <span className="text-green-400 font-bold">R$ {evento.steamPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Ticket:</span>
                      <span className="text-blue-400 font-bold">R$ {evento.ticketPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span className="font-semibold">Bilhetes</span>
                      <span className="font-bold text-white">{evento.participants}/{evento.maxParticipants}</span>
                    </div>
                    {/* Nova barra de progresso animada shimmer */}
                    <div className="progress-shimmer-container">
                      <div className="progress-shimmer-bar" style={{ width: `${(evento.participants / evento.maxParticipants) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Botão Participar com input de quantidade - versão estética */}
                  <div className="flex space-x-2 items-center">
                    <div className="flex items-center bg-gray-700 bg-opacity-60 rounded-lg border border-white border-opacity-20 px-1 py-1">
                      <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center text-lg text-purple-400 hover:text-purple-200 focus:outline-none"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedEvento(evento);
                          setTicketQuantity(q => Math.max(1, (evento.id === selectedEvento?.id ? q : 1) - 1));
                        }}
                        tabIndex={-1}
                      >-</button>
                      <span className="w-7 text-center text-white text-xs font-bold select-none">{evento.id === selectedEvento?.id ? ticketQuantity : 1}</span>
                      <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center text-lg text-purple-400 hover:text-purple-200 focus:outline-none"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedEvento(evento);
                          setTicketQuantity(q => Math.min(evento.maxParticipants - evento.participants, (evento.id === selectedEvento?.id ? q : 1) + 1));
                        }}
                        tabIndex={-1}
                      >+</button>
                    </div>
                    <button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEvento(evento);
                        handleParticipate(evento.id, evento.id === selectedEvento?.id ? ticketQuantity : 1);
                      }}
                      disabled={evento.participants >= evento.maxParticipants}
                    >
                      {evento.participants >= evento.maxParticipants ? 'LOTADA' : `COMPRAR`}
                    </button>
                    <button 
                      className="px-2 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 border border-white border-opacity-20 text-xs font-semibold"
                      onClick={e => {
                        e.stopPropagation();
                        handleCardClick(evento);
                      }}
                    >
                      Ver Mais
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de Detalhes */}
          {showModal && selectedEvento && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-bold text-white">{selectedEvento.name}</h3>
                  <button 
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Coluna Esquerda - Informações da Skin */}
                  <div>
                    <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                      <img 
                        src={selectedEvento.image} 
                        alt={selectedEvento.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Valor da Skin (Steam):</span>
                        <span className="text-green-400 font-bold">R$ {selectedEvento.steamPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Valor por Ticket:</span>
                        <span className="text-blue-400 font-bold">R$ {selectedEvento.ticketPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Raridade:</span>
                        <span className={`px-3 py-1 rounded text-sm font-bold ${
                          selectedEvento.rarity === 'covert' ? 'bg-orange-500 text-white' :
                          selectedEvento.rarity === 'contraband' ? 'bg-yellow-500 text-black' :
                          selectedEvento.rarity === 'classified' ? 'bg-purple-500 text-white' :
                          selectedEvento.rarity === 'restricted' ? 'bg-pink-500 text-white' :
                          selectedEvento.rarity === 'mil-spec' ? 'bg-blue-500 text-white' :
                          selectedEvento.rarity === 'industrial' ? 'bg-cyan-500 text-black' :
                          selectedEvento.rarity === 'consumer' ? 'bg-gray-500 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {selectedEvento.rarity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Bilhetes:</span>
                        <span className="text-white font-bold">{selectedEvento.participants}/{selectedEvento.maxParticipants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Exterior:</span>
                        <span className="text-white font-bold">Field-Tested</span>
                      </div>
                    </div>
                    
                    {/* Sistema de Tickets */}
                    <div className="bg-white bg-opacity-5 rounded-xl p-4 mb-6 border border-white border-opacity-10">
                      <h4 className="text-lg font-bold text-white mb-3">Comprar Tickets</h4>
                      <div className="flex items-center space-x-3 mb-4">
                        <label className="text-gray-300 text-sm">Quantidade:</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedEvento.maxParticipants - selectedEvento.participants}
                          value={ticketQuantity}
                          onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 px-3 py-2 bg-gray-700 bg-opacity-50 rounded-lg border border-white border-opacity-20 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-400 text-sm">
                          (R$ {(selectedEvento.ticketPrice * ticketQuantity).toLocaleString()})
                        </span>
                      </div>
                      <button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300"
                        onClick={() => handleParticipate(selectedEvento.id, ticketQuantity)}
                        disabled={selectedEvento.participants >= selectedEvento.maxParticipants}
                      >
                        {selectedEvento.participants >= selectedEvento.maxParticipants ? 'LOTADA' : `COMPRAR ${ticketQuantity} BILHETE(S)`}
                      </button>
                    </div>
                  </div>

                  {/* Coluna Direita - Criador e Participantes */}
                  <div>
                    {/* Informações do Criador */}
                    <div className="bg-white bg-opacity-5 rounded-xl p-4 mb-6 border border-white border-opacity-10">
                      <h4 className="text-lg font-bold text-white mb-3">Criador do Evento</h4>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={selectedEvento.creator.avatar} 
                          alt={selectedEvento.creator.nickname}
                          className="w-12 h-12 rounded-full border-2 border-white border-opacity-20"
                        />
                        <div>
                          <div className="text-white font-semibold">{selectedEvento.creator.nickname}</div>
                          <div className="text-gray-400 text-sm">({selectedEvento.creator.totalRaffles} eventos criados)</div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Participantes */}
                    <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
                      <h4 className="text-lg font-bold text-white mb-3">Bilhetes ({selectedEvento.participantsList.length})</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedEvento.participantsList
                          .sort((a, b) => b.tickets - a.tickets)
                          .map((participant, index) => (
                            <div key={participant.steamId} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={participant.avatar} 
                                  alt={participant.nickname}
                                  className="w-8 h-8 rounded-full border border-white border-opacity-20"
                                />
                                <span className="text-white font-medium">{participant.nickname}</span>
                              </div>
                              <div className="text-gray-400 text-sm">
                                {participant.tickets} {participant.tickets === 1 ? 'bilhete' : 'bilhetes'}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
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
        pageType="rifas"
      />

      {eventosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-2xl font-bold text-white mb-4 text-center">nenhum item disponivel no momento<br/>aproveite e coloque o seu item!</span>
          <button
            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition"
            onClick={() => navigate('/criar-rifa')}
          >
            Criar
          </button>
        </div>
      )}
    </div>
  );
} 
