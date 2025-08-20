import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';

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
  const { steamUser, currentUser, refreshSteamUser } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eventos' | 'auctions'>('eventos');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    async function loadTickets() {
      console.log('[MEUS BILHETES] Verificando steamUser:', steamUser);
      
      if (!steamUser?.steamid) {
        console.warn('[MEUS BILHETES] Steam User não disponível');
        // Tentar recarregar dados do Steam se o usuário estiver logado
        if (currentUser) {
          console.log('[MEUS BILHETES] Tentando recarregar dados do Steam...');
          await refreshSteamUser();
          // Aguardar um pouco e tentar novamente
          setTimeout(() => {
            if (!steamUser?.steamid) {
              console.warn('[MEUS BILHETES] Ainda sem dados do Steam após tentativa de recarregamento');
              setTickets([]);
              setLoading(false);
            }
          }, 1000);
          return;
        }
        setTickets([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // CORREÇÃO: Não buscar inventário, apenas mostrar estado vazio
        // Os bilhetes serão baseados em compras reais, não no inventário
        console.log('[MEUS BILHETES] Verificando bilhetes comprados...');
        
        // Por enquanto, não há bilhetes comprados no sistema
        // Em uma implementação real, aqui buscaríamos bilhetes do Firestore
        setTickets([]);
        
      } catch (error) {
        console.error('[MEUS BILHETES] Erro ao carregar bilhetes:', error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, [steamUser?.steamid]);

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
        {/* Header com avatar/nickname real */}
        {steamUser && (
          <div className="flex items-center space-x-4 mb-8">
            <img src={steamUser.avatarfull} alt="Avatar Steam" className="w-12 h-12 rounded-full border-2 border-purple-500" />
            <div>
              <div className="text-white font-bold text-lg">{steamUser.personaname}</div>
              <div className="text-gray-300 text-sm">Steam ID: {steamUser.steamid}</div>
        </div>
        </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <div className="text-white text-xl font-semibold mb-2">Carregando seus bilhetes...</div>
            <div className="text-gray-400 text-sm">Isso pode demorar um pouco</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-4">Nenhum Bilhete Comprado</h1>
            <p className="text-gray-300 mb-6">
              Você ainda não comprou bilhetes para nenhum evento.
            </p>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Para participar de eventos, você precisa comprar bilhetes primeiro.
              </p>
              <button 
                onClick={() => navigate('/rifas')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Ver Eventos Disponíveis
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="group relative bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden hover:scale-105 transition-all duration-500 cursor-pointer shadow-2xl border border-white border-opacity-20"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="relative">
                  <div className="w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                    <img src={ticket.image} alt={ticket.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    {/* Stickers */}
                    {ticket.stickers && ticket.stickers.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-20">
                        {ticket.stickers.slice(0, 4).map((sticker: any, index: number) => (
                          <img
                            key={index}
                            src={sticker.image}
                            alt={sticker.name}
                            className="w-4 h-4 object-contain"
                            title={sticker.name}
                          />
                        ))}
                      </div>
                    )}
                    {/* Pendant */}
                    {ticket.pendant && (
                      <div className="absolute top-2 left-2">
                        <img
                          src={ticket.pendant}
                          alt="Pendant"
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                    {/* Name Tag */}
                    {ticket.nameTag && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                        NT
                      </div>
                    )}
                  </div>
                  {/* Raridade e Tags */}
                  <div className="absolute top-3 left-3 flex flex-col gap-[2px]">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.rarity === 'covert' ? 'bg-orange-500 text-white' :
                      ticket.rarity === 'contraband' ? 'bg-yellow-500 text-black' :
                      ticket.rarity === 'classified' ? 'bg-purple-500 text-white' :
                      ticket.rarity === 'restricted' ? 'bg-pink-500 text-white' :
                      ticket.rarity === 'mil-spec' ? 'bg-blue-500 text-white' :
                      ticket.rarity === 'industrial' ? 'bg-cyan-500 text-black' :
                      ticket.rarity === 'consumer' ? 'bg-gray-500 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {ticket.rarity.toUpperCase()}
                    </span>
                        </div>
                      </div>
                <div className="p-4 relative">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {ticket.name}
                      </h3>
                  <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Valor da Skin:</span>
                      <span className="text-green-400 font-bold">R$ {ticket.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
