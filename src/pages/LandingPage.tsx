import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extractSteamIdFromClaimedId } from '../services/steamAuth';
import { useEffect } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase/config';

export function SteamCallbackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      signInWithCustomToken(auth, token).then(() => {
        navigate('/dashboard');
      });
    }
  }, [location, navigate]);
  return <div className="text-white p-8">Processando login Steam...</div>;
}

export default function LandingPage() {
  const { loginWithSteam } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSteamLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithSteam();
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black bg-opacity-40 backdrop-blur-md border-b border-white border-opacity-20 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <img src="/image/Steamlogo.png" alt="Steam Logo" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-3xl font-black text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                  SKINS
                </span>{' '}
                <span className="text-white">RIFAS</span>
              </h1>
            </div>
            <button 
              onClick={handleSteamLogin}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Entrar com Steam</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h2 className="text-7xl font-black text-white mb-8 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              AS MELHORES
            </span>{' '}
            <br />
            <span className="text-white">SKINS EM RIFAS</span>
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            Participe de rifas exclusivas com as skins mais raras e valiosas do CS2. 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-bold">
              {' '}Cada número pode ser o seu!
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={handleSteamLogin}
              disabled={isLoading}
              className="px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-xl rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl flex items-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>COMEÇAR AGORA!</span>
                </>
              )}
            </button>
            <div className="text-gray-400 text-lg">
              <span className="font-semibold text-white">100% Seguro</span> • Login via Steam
            </div>
          </div>
        </div>

        {/* Featured Skins */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-yellow-500 border-opacity-50 overflow-hidden hover:transform hover:scale-105 transition-all duration-500 shadow-2xl">
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                <img
                  src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM"
                  alt="AK-47 Fire Serpent"
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">AK-47 | Fire Serpent</h3>
              <p className="text-gray-300 mb-4">Evento promocional do site - Garantia de entrega</p>
              <div className="text-yellow-400 font-bold text-lg">R$ 1.500</div>
            </div>
          </div>

          <div className="group relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-purple-500 border-opacity-50 overflow-hidden hover:transform hover:scale-105 transition-all duration-500 shadow-2xl">
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                <img
                  src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ"
                  alt="M4A4 Howl"
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">M4A4 | Howl</h3>
              <p className="text-gray-300 mb-4">Evento promocional do site - Garantia de entrega</p>
              <div className="text-purple-400 font-bold text-lg">R$ 2.500</div>
            </div>
          </div>

          <div className="group relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-red-600 border-opacity-50 overflow-hidden hover:transform hover:scale-105 transition-all duration-500 shadow-2xl">
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                <img
                  src="https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f"
                  alt="AWP Dragon Lore"
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">AWP | Dragon Lore</h3>
              <p className="text-gray-300 mb-4">Evento promocional do site - Garantia de entrega</p>
              <div className="text-red-400 font-bold text-lg">R$ 5.000</div>
            </div>
          </div>
        </div>

        {/* Custom Image Section */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-purple-500 from-opacity-20 to-pink-500 to-opacity-20 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <h3 className="text-3xl font-black text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  SKINS RIFAS
                </span>{' '}
                <span className="text-white">- A MELHOR PLATAFORMA</span>
              </h3>
              <div className="max-w-4xl mx-auto">
                <img
                  src="/image/Cttrmoney.png"
                  alt="Skins Rifas - Plataforma Premium"
                  className="w-full h-auto rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-500"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-gray-300 text-lg mt-6 max-w-2xl mx-auto">
                Nossa plataforma oferece as melhores skins do CS2 em rifas seguras e transparentes. 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-bold">
                  {' '}Junte-se a milhares de jogadores!
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gradient-to-br from-purple-500 from-opacity-20 to-pink-500 to-opacity-20 backdrop-blur-md rounded-2xl p-8 text-center border border-white border-opacity-20 shadow-2xl hover:shadow-purple-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105">
            <div className="text-5xl font-black text-white mb-3">1,234</div>
            <div className="text-gray-300 text-lg font-semibold">Eventos Promocionais Realizados</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 from-opacity-20 to-red-500 to-opacity-20 backdrop-blur-md rounded-2xl p-8 text-center border border-white border-opacity-20 shadow-2xl hover:shadow-pink-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105">
            <div className="text-5xl font-black text-white mb-3">R$ 2.5M</div>
            <div className="text-gray-300 text-lg font-semibold">Em Prêmios</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 from-opacity-20 to-blue-500 to-opacity-20 backdrop-blur-md rounded-2xl p-8 text-center border border-white border-opacity-20 shadow-2xl hover:shadow-green-500 hover:shadow-opacity-25 transition-all duration-300 transform hover:scale-105">
            <div className="text-5xl font-black text-white mb-3">15,678</div>
            <div className="text-gray-300 text-lg font-semibold">Participantes</div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Seguro</h3>
            <p className="text-gray-300">Login via Steam, sem necessidade de senhas</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pagamento Seguro</h3>
            <p className="text-gray-300">Transações protegidas e transparentes</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Entrega Instantânea</h3>
            <p className="text-gray-300">Skins entregues automaticamente após sorteio</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Suporte 24/7</h3>
            <p className="text-gray-300">Atendimento especializado sempre disponível</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 from-opacity-20 to-pink-600 to-opacity-20 backdrop-blur-md rounded-3xl p-12 border border-white border-opacity-20 shadow-2xl">
          <h3 className="text-4xl font-black text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              PRONTO PARA GANHAR?
            </span>
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de jogadores que já ganharam skins incríveis em nossos eventos promocionais!
          </p>
          <button 
            onClick={handleSteamLogin}
            disabled={isLoading}
            className="px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-xl rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl"
          >
            {isLoading ? 'Conectando...' : 'COMEÇAR AGORA!'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-40 backdrop-blur-md border-t border-white border-opacity-20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="text-lg">&copy; 2024 Skins Rifas. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Feito com ❤️ para a comunidade gamer</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
