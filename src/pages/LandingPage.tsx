import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extractSteamIdFromClaimedId } from '../services/steamAuth';
import { useEffect } from 'react';
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

// CSS para esconder scrollbar
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export function SteamCallbackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[STEAM CALLBACK] Componente montado!');
    console.log('[STEAM CALLBACK] URL completa:', window.location.href);
    console.log('[STEAM CALLBACK] Search params:', location.search);
    
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const steamId = params.get('steamId');
    
    console.log('[STEAM CALLBACK] Token encontrado:', token ? 'SIM' : 'NÃO');
    console.log('[STEAM CALLBACK] Steam ID encontrado:', steamId ? 'SIM' : 'NÃO');
    
    if (token && steamId) {
      console.log('[STEAM CALLBACK] Salvando Steam ID no localStorage:', steamId);
      localStorage.setItem('steamId', steamId);
      
      console.log('[STEAM CALLBACK] Tentando autenticar com token...');
      
      signInWithCustomToken(auth, token)
        .then((userCredential) => {
          console.log('[STEAM CALLBACK] SignInWithCustomToken sucesso:', userCredential);
          
          // Aguarda o onAuthStateChanged
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('[STEAM CALLBACK] onAuthStateChanged chamado:', user);
            if (user) {
              console.log('[STEAM CALLBACK] Usuário autenticado, redirecionando...');
              setLoading(false);
              navigate('/dashboard');
              unsubscribe();
            }
          });
        })
        .catch((err) => {
          console.error('[STEAM CALLBACK] Erro no signInWithCustomToken:', err);
          alert('Erro ao autenticar: ' + err.message);
          setLoading(false);
          navigate('/');
        });
    } else {
      console.log('[STEAM CALLBACK] Token ou Steam ID não encontrados, redirecionando...');
      setLoading(false);
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Processando login Steam...</p>
        <p className="text-sm text-gray-400 mt-2">Aguarde um momento...</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { loginWithSteam } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);

  // Auto-scroll carousel with continuous rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCenterIndex((prev) => (prev + 1) % 6); // 6 cards total
    }, 3000); // Muda a cada 3 segundos para movimento mais fluido e suave

    return () => clearInterval(interval);
  }, []);

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

  // Função para calcular o estilo do card baseado na posição na FILA REAL
  const getCardStyle = (index: number) => {
    // Calcula a posição na fila real (0 = centro, 1 = direita, 2 = extrema direita, etc.)
    let relativePosition = (index - currentCenterIndex) % 6;
    if (relativePosition < 0) relativePosition += 6;
    
    // FILA REAL: Esquerda → Centro → Direita (como uma linha de produção)
    // Posição 0 = Centro (100% - maior)
    // Posição 1 = Direita (67% - médio)
    // Posição 2 = Extrema direita (33% - pequeno)
    // Posição 3 = Extrema esquerda (33% - pequeno)
    // Posição 4 = Esquerda (67% - médio)
    // Posição 5 = Esquerda (67% - médio)
    
    // Calcula o offset horizontal para criar o efeito de FILA REAL
    const horizontalOffset = (relativePosition - 2.5) * 200; // Mais espaçamento para fila real
    
    // Calcula a escala baseada na posição na FILA REAL
    let scale, opacity, zIndex, filter, boxShadow;
    
    if (relativePosition === 0) {
      // CENTRO da fila - tamanho completo (100%)
      scale = 1.0;
      opacity = 1;
      zIndex = 10;
      filter = 'brightness(1.2)';
      boxShadow = '0 20px 40px -10px rgba(255, 255, 255, 0.3)';
    } else if (relativePosition === 1) {
      // DIREITA da fila - tamanho médio (75%)
      scale = 0.75;
      opacity = 0.9;
      zIndex = 5;
      filter = 'brightness(0.95)';
      boxShadow = '0 10px 20px -5px rgba(255, 255, 255, 0.2)';
    } else if (relativePosition === 2) {
      // EXTREMA DIREITA da fila - tamanho pequeno (50%)
      scale = 0.5;
      opacity = 0.7;
      zIndex = 3;
      filter = 'brightness(0.8)';
      boxShadow = '0 5px 10px -3px rgba(255, 255, 255, 0.1)';
    } else if (relativePosition === 3) {
      // EXTREMA ESQUERDA da fila - tamanho pequeno (50%)
      scale = 0.5;
      opacity = 0.7;
      zIndex = 3;
      filter = 'brightness(0.8)';
      boxShadow = '0 5px 10px -3px rgba(255, 255, 255, 0.1)';
    } else if (relativePosition === 4 || relativePosition === 5) {
      // ESQUERDA da fila - tamanho médio (75%)
      scale = 0.75;
      opacity = 0.9;
      zIndex = 5;
      filter = 'brightness(0.95)';
      boxShadow = '0 10px 20px -5px rgba(255, 255, 255, 0.2)';
    }
    
    return {
      transform: `translateX(${horizontalOffset}px) scale(${scale})`,
      opacity,
      zIndex,
      filter,
      boxShadow
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <style>{scrollbarHideStyles}</style>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-20">
          {/* Logo e texto centralizados como um elemento único */}
          <div className="flex items-center justify-center mb-12">
            {/* Logo */}
            <div className="flex-shrink-0 mr-8">
                             <img 
                 src="/LogoEpicsTrade.png" 
                 alt="Epics Trade Logo" 
                 className="w-64 h-64 object-contain"
               />
            </div>
            {/* Texto */}
            <div className="flex-shrink-0">
                                                           <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                   MELHOR FORMA
                 </span>{' '}
                 <br />
                 <span className="text-white">DE ADQUIRIR SKINS </span>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">EPICAS</span>
               </h2>
            </div>
          </div>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Participe dos eventos, compre seus tickets, concorra a skins epicas e tambem a diversos eventos gratis! 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-bold">
              {' '}Sua chance de montar seu inventario épico gastando pouco!
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={handleSteamLogin}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <img src="/image/Steamlogo.png" alt="Steam" className="w-6 h-6 mr-2" />
                  <span>PARTICIPAR 🔥</span>
                </>
              )}
            </button>
            <div className="text-gray-400 text-base">
              <span className="font-semibold text-white">100% Seguro</span> • Login via Steam
            </div>
          </div>
          
          {/* Aviso Legal e Links */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400 mb-4">
              Este site é destinado a maiores de 18 anos. Não se trata de jogo de azar. 
              A participação está vinculada a promoções e regras definidas nos Termos de Uso.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="/termos" className="text-blue-400 hover:text-blue-300 underline">Termos de Uso</a>
              <a href="/privacidade" className="text-blue-400 hover:text-blue-300 underline">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Skins FILA - Linha de Produção */}
      <section className="container mx-auto px-4 py-1">
         <div className="relative">
                                   {/* Wheel Carousel Container */}
             <div className="flex justify-center items-center py-24 overflow-hidden">
               <div className="flex items-center justify-center relative" style={{ width: '100%', height: '600px' }}>
                               {/* Card 1 - AK-47 Fire Serpent */}
                <div 
                  className="group absolute bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-yellow-500 border-opacity-50 overflow-hidden transition-all duration-2500 ease-in-out cursor-pointer"
                  style={{ 
                    width: '350px',
                    ...getCardStyle(0)
                  }}
                  onClick={() => setCurrentCenterIndex(0)}
                >
                 <div className="relative">
                   <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                     <img
                       src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM"
                       alt="AK-47 Fire Serpent"
                       className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                     HOT
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-2xl font-bold text-white mb-2">AK-47 | Fire Serpent</h3>
                   <p className="text-gray-300 mb-4">Evento promocional do site - Entrega assegurada conforme regulamento</p>
                   <div className="text-yellow-400 font-bold text-lg">R$ 15*</div>
                 </div>
               </div>

                                               {/* Card 2 - M4A4 Howl */}
                 <div 
                   className="group absolute bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-purple-500 border-opacity-50 overflow-hidden transition-all duration-2500 ease-in-out cursor-pointer"
                   style={{ 
                     width: '350px',
                     ...getCardStyle(1)
                   }}
                   onClick={() => setCurrentCenterIndex(1)}
                 >
                 <div className="relative">
                   <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                     <img
                       src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ"
                       alt="M4A4 Howl"
                       className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                     RARE
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-2xl font-bold text-white mb-2">M4A4 | Howl</h3>
                   <p className="text-gray-300 mb-4">Evento promocional do site - Entrega assegurada conforme regulamento</p>
                   <div className="text-purple-400 font-bold text-lg">R$ 25*</div>
                 </div>
               </div>

                                               {/* Card 3 - AWP Dragon Lore */}
                 <div 
                   className="group absolute bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-red-600 border-opacity-50 overflow-hidden transition-all duration-2500 ease-in-out cursor-pointer"
                   style={{ 
                     width: '350px',
                     ...getCardStyle(2)
                   }}
                   onClick={() => setCurrentCenterIndex(2)}
                 >
                 <div className="relative">
                   <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                     <img
                       src="https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f"
                       alt="AWP Dragon Lore"
                       className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                     LEGENDARY
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-2xl font-bold text-white mb-2">AWP | Dragon Lore</h3>
                   <p className="text-gray-300 mb-4">Evento promocional do site - Entrega assegurada conforme regulamento</p>
                   <div className="text-red-400 font-bold text-lg">R$ 50*</div>
                 </div>
               </div>

                                               {/* Card 4 - AK-47 Redline */}
                 <div 
                   className="group absolute bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-blue-500 border-opacity-50 overflow-hidden transition-all duration-2500 ease-in-out cursor-pointer"
                   style={{ 
                     width: '350px',
                     ...getCardStyle(3)
                   }}
                   onClick={() => setCurrentCenterIndex(3)}
                 >
                 <div className="relative">
                   <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                     <img
                       src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM"
                       alt="AK-47 Redline"
                       className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                     POPULAR
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-2xl font-bold text-white mb-2">AK-47 | Redline</h3>
                   <p className="text-gray-300 mb-4">Evento promocional do site - Entrega assegurada conforme regulamento</p>
                   <div className="text-blue-400 font-bold text-lg">R$ 8*</div>
                 </div>
               </div>

                                               {/* Card 5 - M4A4 Desolate Space */}
                 <div 
                   className="group absolute bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-green-500 border-opacity-50 overflow-hidden transition-all duration-2500 ease-in-out cursor-pointer"
                   style={{ 
                     width: '350px',
                     ...getCardStyle(4)
                   }}
                   onClick={() => setCurrentCenterIndex(4)}
                 >
                 <div className="relative">
                   <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                     <img
                       src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ"
                       alt="M4A4 Desolate Space"
                       className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                     NEW
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-2xl font-bold text-white mb-2">M4A4 | Desolate Space</h3>
                   <p className="text-gray-300 mb-4">Evento promocional do site - Entrega assegurada conforme regulamento</p>
                   <div className="text-green-400 font-bold text-lg">R$ 12*</div>
                 </div>
               </div>

                                               {/* Card 6 - AWP Hyper Beast */}
                 <div 
                   className="group absolute bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border-2 border-pink-500 border-opacity-50 overflow-hidden transition-all duration-2500 ease-in-out cursor-pointer"
                   style={{ 
                     width: '350px',
                     ...getCardStyle(5)
                   }}
                   onClick={() => setCurrentCenterIndex(5)}
                 >
                 <div className="relative">
                   <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                     <img
                       src="https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f"
                       alt="AWP Hyper Beast"
                       className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                     LIMITED
                   </div>
                 </div>
                 <div className="p-6">
                   <h3 className="text-2xl font-bold text-white mb-2">AWP | Hyper Beast</h3>
                   <p className="text-gray-300 mb-4">Evento promocional do site - Entrega assegurada conforme regulamento</p>
                   <div className="text-pink-400 font-bold text-lg">R$ 18*</div>
                 </div>
               </div>
             </div>
           </div>

           {/* Navigation Dots */}
           <div className="flex justify-center mt-8 space-x-3">
             {[0, 1, 2, 3, 4, 5].map((index) => (
               <button
                 key={index}
                 onClick={() => setCurrentCenterIndex(index)}
                 className={`w-4 h-4 rounded-full transition-all duration-300 ${
                   currentCenterIndex === index 
                     ? 'bg-white scale-125' 
                     : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                 }`}
               />
             ))}
           </div>

           {/* Letras miúdas */}
           <div className="text-center mt-4">
             <p className="text-xs text-gray-400">
               *Valor correspondente a apenas 1 ticket da promoção
             </p>
           </div>
         </div>

        {/* Custom Image Section */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-purple-500 from-opacity-20 to-pink-500 to-opacity-20 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <h3 className="text-3xl font-black text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  EPICS TRADE
                </span>{' '}
                <span className="text-white">- A MELHOR PLATAFORMA</span>
              </h3>
              <div className="max-w-4xl mx-auto">
                <img
                  src="/image/Cttrmoney.png"
                  alt="Epics Trade - Plataforma Premium"
                  className="w-full h-auto rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-500"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-gray-300 text-lg mt-6 max-w-2xl mx-auto">
                Nossa plataforma oferece as melhores skins do CS2 em eventos seguros e transparentes. 
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
            <div className="text-5xl font-black text-white mb-3">+12.000</div>
            <div className="text-gray-300 text-lg font-semibold">Jogadores Ativos</div>
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
            <h3 className="text-xl font-bold text-white mb-2">Entrega Automática</h3>
            <p className="text-gray-300">Skins entregues automaticamente após evento promocional</p>
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
              PRONTO PARA PARTICIPAR?
            </span>
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de jogadores que já participaram de nossos eventos promocionais exclusivos!
          </p>
          <button 
            onClick={handleSteamLogin}
            disabled={isLoading}
            className="px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-xl rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl"
          >
            {isLoading ? 'Conectando...' : 'PARTICIPAR AGORA! 🔥'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-40 backdrop-blur-md border-t border-white border-opacity-20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="text-lg">&copy; 2024 Epics Trade. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Feito com ❤️ para a comunidade gamer</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
