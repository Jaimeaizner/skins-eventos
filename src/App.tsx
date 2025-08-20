import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModalProvider } from './contexts/ModalContext';
import { GameProvider } from './contexts/GameContext';
import { EventProvider } from './contexts/EventContext';
import { AdminProvider } from './contexts/AdminContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Eventos from './pages/Eventos';
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
import AdminPanel from './pages/AdminPanel';
import AdminGuard from './components/AdminGuard';
import FirstLoginModal from './components/FirstLoginModal';
import { useEffect, useState } from 'react';
import Footer from './components/Footer';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';
import { SteamCallbackHandler } from './pages/LandingPage';
import FeatureGuard from './components/FeatureGuard';
import { FEATURES } from './config/features';
import FeatureDemo from './components/FeatureDemo';

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
            aceitouTermos: false,
            aceitouPrivacidade: false,
            aceitouInventario: false,
            onboardingCompleto: false
          });
          data = { 
            nome: '', 
            sobrenome: '', 
            nascimento: '', 
            aceitouTermos: false,
            aceitouPrivacidade: false,
            aceitouInventario: false,
            onboardingCompleto: false
          };
        }
        
        // Verifica se o onboarding foi completado
        const onboardingCompleto = data.onboardingCompleto && 
          data.aceitouTermos && 
          data.aceitouPrivacidade && 
          data.aceitouInventario;
        
        setShowFirstLogin(!onboardingCompleto);
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
          <Route path="/dashboard" element={<FeatureGuard feature="DASHBOARD"><Dashboard /></FeatureGuard>} />
                            <Route path="/eventos" element={<FeatureGuard feature="RIFFAS"><Eventos /></FeatureGuard>} />
          <Route path="/leiloes" element={<FeatureGuard feature="LEILOES"><Leiloes /></FeatureGuard>} />
          <Route path="/criar-rifa" element={<FeatureGuard feature="RIFFAS"><CriarRifa /></FeatureGuard>} />
          <Route path="/criar-leilao" element={<FeatureGuard feature="LEILOES"><CriarLeilao /></FeatureGuard>} />
          <Route path="/inventario" element={<FeatureGuard feature="INVENTARIO"><Inventario /></FeatureGuard>} />
          <Route path="/meus-bilhetes" element={<FeatureGuard feature="MEUS_BILHETES"><MeusBilhetes /></FeatureGuard>} />
          <Route path="/carteira" element={<FeatureGuard feature="CARTEIRA"><Carteira /></FeatureGuard>} />
          <Route path="/configuracoes" element={<FeatureGuard feature="DASHBOARD"><Configuracoes /></FeatureGuard>} />
          <Route path="/transacoes" element={<FeatureGuard feature="TRANSACOES"><Transacoes /></FeatureGuard>} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/termos-de-uso" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
                            <Route path="/admin" element={<FeatureGuard feature="ADMIN"><Admin /></FeatureGuard>} />
                  <Route path="/admin-panel" element={
                    <AdminGuard requiredPermission="create_events">
                      <AdminPanel />
                    </AdminGuard>
                  } />
          <Route path="/feature-demo" element={<FeatureDemo />} />
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
          <EventProvider>
            <AdminProvider>
              <ModalProvider>
                <Router>
                  <div className="App">
                    <Routes>
                      <Route path="/auth/steam/callback" element={<SteamCallbackHandler />} />
                      <Route path="*" element={<AppContent />} />
                    </Routes>
                  </div>
                </Router>
              </ModalProvider>
            </AdminProvider>
          </EventProvider>
        </LanguageProvider>
      </AuthProvider>
    </GameProvider>
  );
}

export default App;
