import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFeature } from '../components/FeatureGuard';

export default function Dashboard() {
  const { currentUser, steamUser, balance } = useAuth();
  const { userTokens, userActiveEvents, getActiveEvents, getUserEventHistory } = useEvents();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Simular carregamento de dados reais
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Aqui seria uma chamada real para a API
        // Por enquanto, simulamos um delay para mostrar o loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados reais seriam carregados aqui
        // setDashboardData(realData);
        
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Verificar se usuário está logado
  if (!currentUser && !steamUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-black mb-4">Acesso Negado</h1>
          <p className="text-gray-300 mb-6">Você precisa fazer login via Steam para acessar o dashboard.</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-black mb-2">Carregando Dashboard...</h1>
          <p className="text-gray-300">Buscando seus dados...</p>
        </div>
      </div>
    );
  }

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
                <div className="text-3xl font-black text-white mb-2">R$ {balance ? balance.toLocaleString() : '0'}</div>
                <div className="text-white text-sm font-bold">Saldo Disponível</div>
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
                <div className="text-3xl font-black text-white mb-2">{getUserEventHistory().length}</div>
                <div className="text-white text-sm font-bold">Eventos Participados</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </button>

          {/* Card vermelho - Rifas Ativas (valor investido) */}
          <button className="bg-gradient-to-br from-red-500 from-opacity-20 to-pink-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-red-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white mb-2">R$ {userActiveEvents.reduce((sum, event) => sum + (event.price * 2), 0)}</div>
                <div className="text-white text-sm font-bold">Rifas Ativas</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </button>

          {/* Card azul - Tokens (a cada R$ 20 gastos = 1 token) */}
          <button className="bg-gradient-to-br from-blue-500 from-opacity-20 to-cyan-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-blue-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white mb-2">{userTokens}</div>
                <div className="text-white text-sm font-bold">Tokens</div>
                <div className="text-white text-xs opacity-80">R$ 20 = 1 token</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </button>

          {useFeature('LEILOES') && (
            <button onClick={() => navigate('/meus-bilhetes?tab=auctions')} className="bg-gradient-to-br from-cyan-500 from-opacity-20 to-blue-500 to-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl hover:shadow-cyan-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105 text-left focus:outline-none">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-white mb-2">-</div>
                  <div className="text-white text-sm font-bold">Leilões Participados</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </button>
          )}

          
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Eventos Ativos */}
          {useFeature('RIFFAS') && (
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Eventos Promocionais Ativos</h2>
                <button 
                  onClick={() => navigate('/eventos')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
                >
                  Ver Todos
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">Nenhum evento ativo no momento</p>
                <p className="text-gray-400 text-sm mt-2">Fique atento aos próximos eventos promocionais!</p>
              </div>
            </div>
          )}

          {/* Atividade Recente */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Atividade Recente</h2>
            </div>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">Nenhuma atividade recente</p>
              <p className="text-gray-400 text-sm mt-2">Suas ações aparecerão aqui</p>
            </div>
          </div>
        </div>

        {/* Seção de Estatísticas Gerais */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">Estatísticas da Plataforma</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-purple-400 mb-2">-</div>
              <div className="text-white text-sm font-bold">Eventos Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-400 mb-2">-</div>
              <div className="text-white text-sm font-bold">Em Prêmios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-blue-400 mb-2">-</div>
              <div className="text-white text-sm font-bold">Participantes</div>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-sm">
              Estatísticas serão atualizadas conforme a plataforma cresce
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 