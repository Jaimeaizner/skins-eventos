import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const { isAdmin, adminUser, createEvent, updateEvent, deleteEvent, isLoading, error } = useAdmin();
  const { events } = useEvents();
  const { steamUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Estados para criação de eventos
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    price: 0,
    totalTickets: 100,
    game: 'cs2',
    category: 'rifle',
    endDate: '',
    image: '/image/CS2card.png'
  });

  // Verificar se usuário é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black mb-4">Acesso Negado</h1>
          <p className="text-gray-300 mb-6">Você não tem permissões de administrador.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-black mb-2">Carregando Painel Admin...</h1>
          <p className="text-gray-300">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const handleCreateEvent = async () => {
    const success = await createEvent({
      ...newEvent,
      endDate: new Date(newEvent.endDate),
      status: 'active'
    });
    
    if (success) {
      setShowCreateEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        price: 0,
        totalTickets: 100,
        game: 'cs2',
        category: 'rifle',
        endDate: '',
        image: '/image/CS2card.png'
      });
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent) return;
    
    const success = await updateEvent(selectedEvent.id, selectedEvent);
    if (success) {
      setShowEditEventModal(false);
      setSelectedEvent(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este evento?')) {
      const success = await deleteEvent(eventId);
      if (success) {
        // Evento deletado com sucesso
        console.log('Evento deletado');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400">
              PAINEL ADMINISTRATIVO
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Bem-vindo, {adminUser?.steamName || steamUser?.personaname}!
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
              {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
            <span className="text-gray-400 text-sm">
              Steam ID: {steamUser?.steamid}
            </span>
            <span className="text-gray-400 text-sm">
              Permissões: {adminUser?.permissions.length || 0}
            </span>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'events', label: 'Gerenciar Eventos', icon: '🎯' },
            { id: 'users', label: 'Usuários', icon: '👥' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'payments', label: 'Pagamentos', icon: '💳' },
            { id: 'settings', label: 'Configurações', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Tabs */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Visão Geral</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2">{events.length}</div>
                  <div className="text-white font-semibold">Total de Eventos</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
                  <div className="text-3xl font-black text-green-400 mb-2">
                    {events.filter(e => e.status === 'active').length}
                  </div>
                  <div className="text-white font-semibold">Eventos Ativos</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
                  <div className="text-3xl font-black text-blue-400 mb-2">
                    {events.filter(e => e.status === 'completed').length}
                  </div>
                  <div className="text-white font-semibold">Eventos Concluídos</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Gerenciar Eventos</h2>
                <button
                  onClick={() => setShowCreateEventModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  + Criar Novo Evento
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="text-left py-3 px-4">Evento</th>
                      <th className="text-left py-3 px-4">Preço</th>
                      <th className="text-left py-3 px-4">Bilhetes</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-white border-opacity-10">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img src={event.image} alt={event.title} className="w-12 h-12 rounded-lg" />
                            <div>
                              <div className="font-semibold">{event.title}</div>
                              <div className="text-gray-400 text-sm">{event.game}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">R$ {event.price}</td>
                        <td className="py-3 px-4">{event.soldTickets}/{event.totalTickets}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            event.status === 'active' ? 'bg-green-500 text-white' :
                            event.status === 'completed' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {event.status === 'active' ? 'Ativo' :
                             event.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowEditEventModal(true);
                              }}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                            >
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Gerenciar Usuários</h2>
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">Painel de usuários em desenvolvimento</p>
                <p className="text-gray-400 text-sm mt-2">Funcionalidade será implementada em breve</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">Painel de analytics em desenvolvimento</p>
                <p className="text-gray-400 text-sm mt-2">Funcionalidade será implementada em breve</p>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Gerenciar Pagamentos</h2>
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">Painel de pagamentos em desenvolvimento</p>
                <p className="text-gray-400 text-sm mt-2">Funcionalidade será implementada em breve</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Configurações do Sistema</h2>
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">Configurações do sistema em desenvolvimento</p>
                <p className="text-gray-400 text-sm mt-2">Funcionalidade será implementada em breve</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação de Evento */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowCreateEventModal(false)}></div>
          
          <div className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl shadow-2xl p-6 border border-white/20">
            <button 
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-pink-400 transition-colors"
              onClick={() => setShowCreateEventModal(false)}
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Criar Novo Evento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">Título do Evento</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Ex: AK-47 | Fire Serpent"
                />
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Preço por Bilhete</label>
                <input
                  type="number"
                  value={newEvent.price}
                  onChange={(e) => setNewEvent({...newEvent, price: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="15"
                />
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Total de Bilhetes</label>
                <input
                  type="number"
                  value={newEvent.totalTickets}
                  onChange={(e) => setNewEvent({...newEvent, totalTickets: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Data de Encerramento</label>
                <input
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Descrição</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="Descreva o evento..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">Jogo</label>
                <select
                  value={newEvent.game}
                  onChange={(e) => setNewEvent({...newEvent, game: e.target.value})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="cs2">CS2</option>
                  <option value="dota2">Dota 2</option>
                  <option value="rust">Rust</option>
                  <option value="tf2">Team Fortress 2</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Categoria</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="rifle">Rifle</option>
                  <option value="sniper">Sniper</option>
                  <option value="pistol">Pistola</option>
                  <option value="knife">Faca</option>
                  <option value="gloves">Luvas</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleCreateEvent}
              disabled={!newEvent.title || !newEvent.description || newEvent.price <= 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Criar Evento
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição de Evento */}
      {showEditEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowEditEventModal(false)}></div>
          
          <div className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl shadow-2xl p-6 border border-white/20">
            <button 
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-pink-400 transition-colors"
              onClick={() => setShowEditEventModal(false)}
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Editar Evento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">Título do Evento</label>
                <input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Preço por Bilhete</label>
                <input
                  type="number"
                  value={selectedEvent.price}
                  onChange={(e) => setSelectedEvent({...selectedEvent, price: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Descrição</label>
              <textarea
                value={selectedEvent.description}
                onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <button
              onClick={handleEditEvent}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
