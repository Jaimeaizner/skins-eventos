import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser, steamUser, balance } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header do Dashboard */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              DASHBOARD
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Bem-vindo de volta, {steamUser ? steamUser.personaname : currentUser?.email}!
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <button onClick={() => navigate('/carteira')} className="bg-gradient-to-br from-purple-500 from-opacity-20 to-pink-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-purple-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white mb-2">R$ {balance.toLocaleString()}</div>
                <div className="text-gray-300 text-sm font-semibold">Saldo Disponível</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/meus-bilhetes')} className="bg-gradient-to-br from-green-500 from-opacity-20 to-emerald-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-green-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white mb-2">15</div>
                <div className="text-gray-300 text-sm font-semibold">Eventos Promocionais Participados</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/meus-bilhetes?tab=auctions')} className="bg-gradient-to-br from-cyan-500 from-opacity-20 to-blue-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-cyan-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white mb-2">8</div>
                <div className="text-gray-300 text-sm font-semibold">Leilões Participados</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/inventario')} className="bg-gradient-to-br from-blue-500 from-opacity-20 to-cyan-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-blue-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white mb-2">5</div>
                <div className="text-gray-300 text-sm font-semibold">Itens no Inventário</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/meus-bilhetes')} className="bg-gradient-to-br from-orange-500 from-opacity-20 to-red-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-orange-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white mb-2">2</div>
                <div className="text-gray-300 text-sm font-semibold">Vitórias</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Rifas Ativas */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Eventos Promocionais Ativos</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300">
                Ver Todos
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <img 
                      src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM"
                      alt="AK-47 Fire Serpent"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-white font-semibold">AK-47 | Fire Serpent</div>
                    <div className="text-gray-400 text-sm">78/100 participantes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">R$ 1.500</div>
                  <div className="text-gray-400 text-sm">Termina em 2h</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <img 
                      src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ"
                      alt="M4A4 Howl"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-white font-semibold">M4A4 | Howl</div>
                    <div className="text-gray-400 text-sm">45/100 participantes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">R$ 2.500</div>
                  <div className="text-gray-400 text-sm">Termina em 5h</div>
                </div>
              </div>
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Atividade Recente</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">Participou do evento AK-47 | Fire Serpent</div>
                  <div className="text-gray-400 text-sm">Há 2 horas</div>
                </div>
                <div className="text-green-400 font-bold">-R$ 1.500</div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">Item adicionado ao inventário</div>
                  <div className="text-gray-400 text-sm">Há 1 dia</div>
                </div>
                <div className="text-blue-400 font-bold">+1 item</div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">Ganhou evento M4A4 | Howl</div>
                  <div className="text-gray-400 text-sm">Há 3 dias</div>
                </div>
                <div className="text-orange-400 font-bold">+R$ 2.500</div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Estatísticas Gerais */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Estatísticas Gerais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-purple-400 mb-2">1,234</div>
              <div className="text-gray-300 text-sm font-semibold">Eventos Promocionais Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-400 mb-2">R$ 2.5M</div>
              <div className="text-gray-300 text-sm font-semibold">Em Prêmios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-blue-400 mb-2">15,678</div>
              <div className="text-gray-300 text-sm font-semibold">Participantes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 