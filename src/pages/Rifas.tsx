import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import FiltersSidebar from '../components/FiltersSidebar';

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
  steamPrice: number;
  ticketPrice: number;
  isHighlighted: boolean;
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
  const { currentUser, steamUser, balance } = useAuth();
  const { selectedGame } = useGame();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<EventoPromocional | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [eventos, setEventos] = useState<EventoPromocional[]>([]);

  const eventosFiltered = eventos.filter(e => e.game === selectedGame);

  // Parar o loading quando o componente montar
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleParticipate = (eventoId: string, tickets: number) => {
    if (!currentUser && !steamUser) {
      setNotification({ message: 'Voce precisa estar logado para participar!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setNotification({ 
      message: `Funcionalidade em desenvolvimento! Em breve você poderá participar de eventos.`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    setShowModal(false);
    setTicketQuantity(1);
  };

  const handleCardClick = (evento: EventoPromocional) => {
    setSelectedEvento(evento);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvento(null);
    setTicketQuantity(1);
  };

  function filterEventos() {
    return eventosFiltered.filter((evento) => {
      if (activeFilters.rarity && activeFilters.rarity.length > 0 && !activeFilters.rarity.includes(evento.rarity)) {
        return false;
      }
      if (activeFilters.price && Array.isArray(activeFilters.price)) {
        const [min, max] = activeFilters.price;
        if (evento.ticketPrice < (min ?? 0) || evento.ticketPrice > (max ?? Infinity)) {
          return false;
        }
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
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
              <p className="text-gray-300">Eventos Ativos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-white">Eventos</h2>
            <span className="text-gray-400">({eventosFiltered.length} itens)</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Filtros
            </button>

          </div>
        </div>

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

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Carregando eventos...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Eventos serão carregados aqui quando implementados */}
        </div>

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
              
              <div className="text-center py-8">
                <div className="text-white text-lg mb-4">
                  Funcionalidade em desenvolvimento!
                </div>
                <div className="text-gray-300">
                  Em breve você poderá ver detalhes completos dos eventos e participar deles.
                </div>
              </div>
            </div>
          </div>
        )}

        {eventos.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-2xl font-bold text-white mb-4 text-center">
              Nenhum evento disponível no momento<br/>
              Aproveite e coloque o seu item!
            </span>

          </div>
        )}

        <FiltersSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onFilterChange={setActiveFilters}
          pageType="rifas"
        />
      </div>
    </div>
  );
} 
