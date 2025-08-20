import React, { useState } from 'react';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Eventos() {
  const { events, purchaseTickets, userTokens, isLoading, error } = useEvents();
  const { balance } = useAuth();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const activeEvents = events.filter(event => event.status === 'active');

  const handlePurchase = async () => {
    if (!selectedEvent) return;
    
    const success = await purchaseTickets(selectedEvent, ticketQuantity);
    if (success) {
      setShowPurchaseModal(false);
      setSelectedEvent(null);
      setTicketQuantity(1);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateProgress = (sold: number, total: number) => {
    return (sold / total) * 100;
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Encerrado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-black mb-2">Carregando Eventos...</h1>
          <p className="text-gray-300">Buscando eventos promocionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              EVENTOS PROMOCIONAIS
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Participe dos eventos e concorra a skins épicas!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
            <div className="text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">{activeEvents.length}</div>
              <div className="text-white text-sm font-bold">Eventos Ativos</div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
            <div className="text-center">
              <div className="text-3xl font-black text-green-400 mb-2">{userTokens}</div>
              <div className="text-white text-sm font-bold">Seus Tokens</div>
              <div className="text-gray-400 text-xs">R$ 20 = 1 token</div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
            <div className="text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">R$ {balance ? balance.toLocaleString() : '0'}</div>
              <div className="text-white text-sm font-bold">Saldo Disponível</div>
            </div>
          </div>
        </div>

        {/* Eventos */}
        {activeEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Nenhum Evento Ativo</h2>
            <p className="text-gray-400 text-lg">Fique atento aos próximos eventos promocionais!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeEvents.map((event) => (
              <div key={event.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl overflow-hidden hover:shadow-purple-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105">
                {/* Imagem do evento */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {event.game.toUpperCase()}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{event.description}</p>
                  
                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Progresso</span>
                      <span className="text-white font-bold">{event.soldTickets}/{event.totalTickets}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(event.soldTickets, event.totalTickets)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">R$ {event.price}</div>
                      <div className="text-gray-400 text-xs">Por Bilhete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-400">{getTimeRemaining(event.endDate)}</div>
                      <div className="text-gray-400 text-xs">Restante</div>
                    </div>
                  </div>

                  {/* Botão de compra */}
                  <button
                    onClick={() => {
                      setSelectedEvent(event.id);
                      setShowPurchaseModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Comprar Bilhetes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Compra */}
      {showPurchaseModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowPurchaseModal(false)}></div>
          
          <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl shadow-2xl p-6 border border-white/20">
            <button 
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-pink-400 transition-colors"
              onClick={() => setShowPurchaseModal(false)}
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Comprar Bilhetes</h2>
            
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Quantidade de Bilhetes</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  className="w-10 h-10 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-300"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-white min-w-[3rem] text-center">{ticketQuantity}</span>
                <button
                  onClick={() => setTicketQuantity(ticketQuantity + 1)}
                  className="w-10 h-10 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-300"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-white mb-2">
                <span>Preço por bilhete:</span>
                <span>R$ {events.find(e => e.id === selectedEvent)?.price}</span>
              </div>
              <div className="flex justify-between text-white mb-2">
                <span>Quantidade:</span>
                <span>{ticketQuantity}</span>
              </div>
              <div className="border-t border-white border-opacity-20 pt-2">
                <div className="flex justify-between text-white font-bold">
                  <span>Total:</span>
                  <span>R$ {(events.find(e => e.id === selectedEvent)?.price || 0) * ticketQuantity}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              {isLoading ? 'Processando...' : 'Confirmar Compra'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
