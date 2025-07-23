import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModalProvider } from './contexts/ModalContext';
import { GameProvider } from './contexts/GameContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
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
import { collection, addDoc, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import ChatBot from './components/ChatBot';
import Admin from './pages/Admin';
import FirstLoginModal from './components/FirstLoginModal';
import { useEffect, useState } from 'react';
import Footer from './components/Footer';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';

function AppContent() {
  const { currentUser, steamUser } = useAuth();
  console.log('currentUser:', currentUser);
  console.log('steamUser:', steamUser);
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [checkedProfile, setCheckedProfile] = useState(false);

  useEffect(() => {
    console.log('Executando checkProfile, currentUser:', currentUser);
    async function checkProfile() {
      if (!currentUser) return;
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      let data = snap.exists() ? snap.data() : null;
      if (!data) {
        // Cria documento do usuário se não existir
        await setDoc(userRef, { nome: '', sobrenome: '', nascimento: '', aceitouTermos: false });
        data = { nome: '', sobrenome: '', nascimento: '', aceitouTermos: false };
      }
      const obrigatoriosPreenchidos = data.nome && data.sobrenome && data.nascimento && data.aceitouTermos && (new Date().getFullYear() - new Date(data.nascimento).getFullYear() >= 18);
      setShowFirstLogin(!obrigatoriosPreenchidos);
      setCheckedProfile(true);
      console.log('FirstLoginModal obrigatórios preenchidos?', obrigatoriosPreenchidos, data);
    }
    checkProfile();
  }, [currentUser]);

  // Teste Firestore: escrita e leitura
  React.useEffect(() => {
    async function testFirestore() {
      try {
        // Escreve um documento de teste
        const docRef = await addDoc(collection(db, 'testes'), {
          mensagem: 'Olá Firestore!',
          timestamp: new Date()
        });
        console.log('Documento adicionado com ID:', docRef.id);

        // Lê todos os documentos da coleção de teste
        const querySnapshot = await getDocs(collection(db, 'testes'));
        querySnapshot.forEach((doc) => {
          console.log('Documento Firestore:', doc.id, doc.data());
        });
      } catch (e) {
        console.error('Erro ao testar Firestore:', e);
      }
    }
    testFirestore();
  }, []);

  // Se não estiver logado, mostra a landing page
  if (!currentUser && !steamUser) {
    return <LandingPage />;
  }

  if (!checkedProfile) {
    return null;
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
