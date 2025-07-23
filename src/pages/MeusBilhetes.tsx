import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Ticket {
  id: string;
  type: 'evento' | 'auction';
  title: string;
  image: string;
  price: number;
  steamPrice: number;
  rarity: string;
  exterior: string;
  tickets: number;
  totalTickets: number;
  myBid?: number;
  currentBid?: number;
  endTime: string;

  isFeatured: boolean;
  creator: {
    name: string;
    avatar: string;
    steamId: string;
  };
  participants: Array<{
    name: string;
    avatar: string;
    tickets?: number;
    bid?: number;
  }>;
}

export default function MeusBilhetes() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'eventos' | 'auctions'>('eventos');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { points, updatePoints } = useAuth();

  // Dados simulados - em produção viriam do Firebase
  const myTickets: Ticket[] = [
    {
      id: '1',
      type: 'evento',
      title: 'AWP | Dragon Lore',
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZv7rzOrzZgiVQuJxw3QbEupP13w3h_0VqYGD7J4eUcQY5YQhQ_1W7yO-5lJ-7vZqdwJQj3nZxVH7Pw',
      price: 8000,
      steamPrice: 8500,
      rarity: 'CONTRABAND',
      exterior: 'Factory New',
      tickets: 5,
      totalTickets: 100,
      endTime: '2024-01-15T20:00:00Z',
      
      isFeatured: true,
      creator: {
        name: 'SteamUser_123',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg',
        steamId: '76561198012345678'
      },
      participants: [
        { name: 'Player1', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', tickets: 15 },
        { name: 'Player2', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', tickets: 12 },
        { name: 'Player3', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', tickets: 8 },
        { name: 'Player4', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', tickets: 6 },
        { name: 'Player5', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', tickets: 4 },
      ]
    },
    {
      id: '2',
      type: 'auction',
      title: 'Karambit | Fade',
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZv7rzOrzZgiVQuJxw3QbEupP13w3h_0VqYGD7J4eUcQY5YQhQ_1W7yO-5lJ-7vZqdwJQj3nZxVH7Pw',
      price: 12000,
      steamPrice: 12500,
      rarity: 'COVERT',
      exterior: 'Factory New',
      tickets: 0,
      totalTickets: 0,
      myBid: 12000,
      currentBid: 12500,
      endTime: '2024-01-20T18:00:00Z',
      
      isFeatured: false,
      creator: {
        name: 'Trader_456',
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg',
        steamId: '76561198087654321'
      },
      participants: [
        { name: 'Bidder1', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', bid: 12500 },
        { name: 'Bidder2', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', bid: 12000 },
        { name: 'Bidder3', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', bid: 11800 },
        { name: 'Bidder4', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', bid: 11500 },
        { name: 'Bidder5', avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/default.jpg', bid: 11200 },
      ]
    }
  ];

  const eventos = myTickets.filter(ticket => ticket.type === 'evento');
  const auctions = myTickets.filter(ticket => ticket.type === 'auction');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'CONTRABAND': return 'from-yellow-400 to-yellow-600';
      case 'COVERT': return 'from-red-500 to-red-700';
      case 'CLASSIFIED': return 'from-purple-500 to-purple-700';
      case 'RESTRICTED': return 'from-blue-500 to-blue-700';
      case 'MIL-SPEC': return 'from-gray-500 to-gray-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Encerrado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <div className="group relative bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden hover:scale-105 transition-all duration-500 cursor-pointer shadow-2xl border border-white border-opacity-20">
      <div className="relative">
        <div className="w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
          <img src={ticket.image} alt={ticket.title} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        {/* Raridade e Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-[2px]">
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            ticket.rarity === 'COVERT' ? 'bg-orange-500 text-white' :
            ticket.rarity === 'CONTRABAND' ? 'bg-yellow-500 text-black' :
            ticket.rarity === 'CLASSIFIED' ? 'bg-purple-500 text-white' :
            ticket.rarity === 'RESTRICTED' ? 'bg-pink-500 text-white' :
            ticket.rarity === 'MIL-SPEC' ? 'bg-blue-500 text-white' :
            ticket.rarity === 'INDUSTRIAL' ? 'bg-cyan-500 text-black' :
            ticket.rarity === 'CONSUMER' ? 'bg-gray-500 text-white' :
            'bg-red-600 text-white'
          }`}>
            {ticket.rarity}
          </span>
        </div>
      </div>
      
      <div className="p-4 relative">
        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
          {ticket.title}
        </h3>
        
        {/* Informações de Preço */}
        <div className="mb-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Valor da Skin:</span>
            <span className="text-green-400 font-bold">R$ {ticket.steamPrice.toLocaleString()}</span>
          </div>
          {ticket.type === 'evento' ? (
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Seus bilhetes:</span>
              <span className="text-blue-400 font-bold">{ticket.tickets}</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Seu lance:</span>
              <span className="text-blue-400 font-bold">R$ {ticket.myBid?.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span className="font-semibold">{ticket.type === 'evento' ? 'Total de bilhetes' : 'Lance atual'}</span>
            <span className="font-bold text-white">{ticket.type === 'evento' ? ticket.totalTickets : `R$ ${ticket.currentBid?.toLocaleString()}`}</span>
          </div>
        </div>

        {/* Tempo Restante com cor dinâmica */}
        <div className="mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-1">Tempo Restante</div>
            <div className={`text-lg font-bold ${formatTimeLeft(ticket.endTime) === 'Encerrado' ? 'text-red-400' : 'text-green-400'}`}>
              {formatTimeLeft(ticket.endTime)}
            </div>
          </div>
        </div>

        <div className="flex">
          <button 
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(ticket);
            }}
          >
            VER DETALHES
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              MEUS BILHETES
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Acompanhe suas participações em eventos promocionais e leilões
          </p>
        </div>
        {/* Imagem topo Meus Bilhetes */}
        <div className="w-full flex justify-center mb-6 mt-2">
          <img src="/image/Meusbilhetes.png" alt="Meus Bilhetes" className="max-h-32 md:max-h-40 object-contain drop-shadow-lg" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('eventos')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'eventos'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white bg-opacity-10 text-gray-300 hover:text-white hover:bg-opacity-20'
            }`}
          >
            Eventos ({eventos.length})
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'auctions'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white bg-opacity-10 text-gray-300 hover:text-white hover:bg-opacity-20'
            }`}
          >
            Leilões ({auctions.length})
          </button>
        </div>

        {/* Lista de Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'eventos' ? eventos : auctions).map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {/* Mensagem quando não há tickets */}
        {(activeTab === 'eventos' ? eventos : auctions).length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-2xl font-bold text-white mb-4 text-center">nenhum item disponivel no momento<br/>aproveite e participe de eventos e leilões!</span>
            <button className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition">
              Ver {activeTab === 'eventos' ? 'Eventos' : 'Leilões'}
            </button>
          </div>
        )}

        {/* Modal de Detalhes */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-black bg-opacity-95 backdrop-blur-md rounded-2xl border border-white border-opacity-20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header do Modal */}
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">{selectedTicket.title}</h2>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações da Skin */}
                  <div>
                    <img 
                      src={selectedTicket.image} 
                      alt={selectedTicket.title}
                      className="w-full rounded-lg mb-4"
                    />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Valor da Steam:</span>
                        <span className="text-white font-bold">R$ {selectedTicket.steamPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Valor da Skin:</span>
                        <span className="text-white font-bold">R$ {selectedTicket.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Raridade:</span>
                        <span className={`font-bold bg-gradient-to-r ${getRarityColor(selectedTicket.rarity)} bg-clip-text text-transparent`}>
                          {selectedTicket.rarity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Exterior:</span>
                        <span className="text-white font-bold">{selectedTicket.exterior}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações do Criador e Participantes */}
                  <div className="space-y-6">
                    {/* Criador */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Criador</h3>
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-5 rounded-lg">
                        <img 
                          src={selectedTicket.creator.avatar} 
                          alt={selectedTicket.creator.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="text-white font-semibold">{selectedTicket.creator.name}</div>
                          <div className="text-gray-400 text-sm">Steam ID: {selectedTicket.creator.steamId}</div>
                        </div>
                      </div>
                    </div>

                    {/* Participantes */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">
                        {selectedTicket.type === 'evento' ? 'Bilhetes' : 'Lances'}
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedTicket.participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white bg-opacity-5 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={participant.avatar} 
                                alt={participant.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="text-white font-medium">{participant.name}</span>
                            </div>
                            <div className="text-right">
                              {selectedTicket.type === 'evento' ? (
                                <span className="text-green-400 font-bold">{participant.tickets} bilhetes</span>
                              ) : (
                                <span className="text-red-400 font-bold">R$ {participant.bid?.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
