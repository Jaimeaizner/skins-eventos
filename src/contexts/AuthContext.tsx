import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { initiateSteamLogin, processSteamCallback, getSteamUserData, type SteamUser } from '../services/steamAuth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  steamUser: SteamUser | null;
  balance: number;
  lockedBalance: number;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  loginWithSteam: () => void;
  logout: () => Promise<void>;
  updateBalance: (amount: number) => void;
  updateLockedBalance: (amount: number) => void;
  loading: boolean;
  points: number;
  updatePoints: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [balance, setBalance] = useState<number>(1000); // Saldo inicial de R$ 1000
  const [lockedBalance, setLockedBalance] = useState<number>(0); // Saldo bloqueado inicial
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<number>(0); // Pontos iniciais

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function loginWithSteam() {
    initiateSteamLogin();
  }

  function logout() {
    setSteamUser(null);
    setBalance(1000); // Reset do saldo ao fazer logout
    return signOut(auth);
  }

  function updateBalance(amount: number) {
    setBalance(prev => prev + amount);
  }

  function updateLockedBalance(amount: number) {
    setLockedBalance(prev => prev + amount);
  }

  async function fetchUserPoints(uid: string) {
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setPoints(data.points || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar pontos do usuário:', error);
    }
  }

  function updatePoints(amount: number) {
    setPoints(prev => {
      const newPoints = prev + amount;
      // Persistir no Firestore
      try {
        const db = getFirestore();
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          updateDoc(userRef, { points: newPoints });
        }
      } catch (error) {
        console.error('Erro ao atualizar pontos:', error);
      }
      return newPoints;
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AUTH CONTEXT] onAuthStateChanged:', user);
      setCurrentUser(user);
      
      // Se o usuário está logado, verificar se há dados do Steam
      if (user) {
        try {
          // Verificar se há Steam ID salvo no localStorage
          const steamId = localStorage.getItem('steamId');
          if (steamId) {
            console.log('[AUTH CONTEXT] Carregando dados do Steam para ID:', steamId);
            const steamUserData = await getSteamUserData(steamId);
            if (steamUserData) {
              console.log('[AUTH CONTEXT] Dados do Steam carregados:', steamUserData);
              setSteamUser(steamUserData);
            } else {
              console.warn('[AUTH CONTEXT] Não foi possível carregar dados do Steam');
              setSteamUser(null);
            }
          } else {
            console.log('[AUTH CONTEXT] Nenhum Steam ID encontrado no localStorage');
            setSteamUser(null);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do Steam:', error);
          setSteamUser(null);
        }
      } else {
        setSteamUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserPoints(currentUser.uid);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    steamUser,
    login,
    signup,
    loginWithSteam,
    logout,
    loading,
    balance,
    lockedBalance,
    updateBalance,
    updateLockedBalance,
    points,
    updatePoints,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 