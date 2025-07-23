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
import { initiateSteamLogin, processSteamCallback, type SteamUser } from '../services/steamAuth';
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
    const db = getFirestore();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      setPoints(data.points || 0);
    }
  }

  function updatePoints(amount: number) {
    setPoints(prev => {
      const newPoints = prev + amount;
      // Persistir no Firestore
      const db = getFirestore();
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        updateDoc(userRef, { points: newPoints });
      }
      return newPoints;
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Removido: processamento de callback Steam e criação de usuário anônimo

    if (currentUser) {
      fetchUserPoints(currentUser.uid);
    }

    return unsubscribe;
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