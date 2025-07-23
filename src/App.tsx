import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModalProvider } from './contexts/ModalContext';
import { GameProvider } from './contexts/GameContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Rifas from './pages/Rifas';
import Leiloes from './pages/Leiloes';
import CriarRifa from './pages/CriarRifa';
import CriarLeilao from './pages/CriarLeilao';
import Inventario from './pages/Inventario';
import MeusBilhetes from './pages/MeusBilhetes';
import Carteira from './pages/Carteira';
import Configuracoes from './pages/Configuracoes';
import Transacoes from './pages/Transacoes';
import Suporte from './pages/Suporte';
import './index.css';
import { db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ChatBot from './components/ChatBot';
import Admin from './pages/Admin';
import FirstLoginModal from './components/FirstLoginModal';
import { useEffect, useState } from 'react';
import Footer from './components/Footer';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';
import { SteamCallbackHandler } from './pages/LandingPage';

function AppContent() {
  const { currentUser, steamUser, loading } = useAuth();
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [checkedProfile, setCheckedProfile] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      if (!currentUser) {
        setCheckedProfile(true);
        return;
      }
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        let data = snap.exists() ? snap.data() : null;
        
        if (!data) {
          // Cria documento do usuário se não existir
          await setDoc(userRef, { 
            nome: '', 
            sobrenome: '', 
            nascimento: '', 
            aceitouTermos: false 
          });
          data = { nome: '', sobrenome: '', nascimento: '', aceitouTermos: false };
        }
        
        const obrigatoriosPreenchidos = data.nome && 
          data.sobrenome && 
          data.nascimento && 
          data.aceitouTermos && 
          (new Date().getFullYear() - new Date(data.nascimento).getFullYear() >= 18);
        
        setShowFirstLogin(!obrigatoriosPreenchidos);
        setCheckedProfile(true);
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
        setCheckedProfile(true);
      }
    }
    
    checkProfile();
  }, [currentUser]);

  // Se ainda está carregando, mostra loading
  if (loading || !checkedProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostra a landing page
  if (!currentUser && !steamUser) {
    return <LandingPage />;
  }

  // Se estiver logado, mostra o app com navegação
  return (
    <>
      <div className={showFirstLogin ? 'pointer-events-none select-none filter blur-sm' : ''}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/eventos" element={<Rifas />} />
          <Route path="/leiloes" element={<Leiloes />} />
          <Route path="/criar-rifa" element={<CriarRifa />} />
          <Route path="/criar-leilao" element={<CriarLeilao />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/meus-bilhetes" element={<MeusBilhetes />} />
          <Route path="/carteira" element={<Carteira />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/termos-de-uso" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth/steam/callback" element={<SteamCallbackHandler />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ChatBot />
        <Footer />
      </div>
      {showFirstLogin && <FirstLoginModal open={true} />}
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <AuthProvider>
        <LanguageProvider>
          <ModalProvider>
            <Router>
              <div className="App">
                <AppContent />
              </div>
            </Router>
          </ModalProvider>
        </LanguageProvider>
      </AuthProvider>
    </GameProvider>
  );
}

export default App;
