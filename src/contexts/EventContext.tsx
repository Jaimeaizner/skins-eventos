import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Tipos
interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  game: string;
  category: string;
}

interface Transaction {
  id: string;
  eventId: string;
  eventTitle: string;
  amount: number;
  tickets: number;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
  type: 'purchase' | 'refund' | 'token_redeem';
}

interface EventContextType {
  events: Event[];
  userTransactions: Transaction[];
  userTokens: number;
  userActiveEvents: Event[];
  isLoading: boolean;
  error: string | null;
  
  // Ações
  purchaseTickets: (eventId: string, tickets: number) => Promise<boolean>;
  getUserTokens: () => number;
  calculateTokensFromSpending: (totalSpent: number) => number;
  getActiveEvents: () => Event[];
  getUserEventHistory: () => Transaction[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Dados mockados para desenvolvimento
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'AK-47 | Fire Serpent',
    description: 'Rifle lendário com design exclusivo de serpente de fogo',
    image: '/image/CS2card.png',
    price: 15,
    totalTickets: 100,
    soldTickets: 45,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    status: 'active',
    game: 'cs2',
    category: 'rifle'
  },
  {
    id: '2',
    title: 'AWP | Dragon Lore',
    description: 'Sniper épico com design de dragão dourado',
    image: '/image/CS2card.png',
    price: 25,
    totalTickets: 50,
    soldTickets: 12,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
    status: 'active',
    game: 'cs2',
    category: 'sniper'
  },
  {
    id: '3',
    title: 'M4A4 | Howl',
    description: 'Rifle raro com acabamento premium',
    image: '/image/CS2card.png',
    price: 20,
    totalTickets: 75,
    soldTickets: 38,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
    status: 'active',
    game: 'cs2',
    category: 'rifle'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'AK-47 | Fire Serpent',
    amount: 30,
    tickets: 2,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'purchase'
  },
  {
    id: '2',
    eventId: '2',
    eventTitle: 'AWP | Dragon Lore',
    amount: 50,
    tickets: 2,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'completed',
    type: 'purchase'
  }
];

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, steamUser, balance } = useAuth();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular tokens baseado no total gasto
  const calculateTokensFromSpending = (totalSpent: number): number => {
    return Math.floor(totalSpent / 20);
  };

  // Obter tokens do usuário
  const getUserTokens = (): number => {
    const totalSpent = userTransactions
      .filter(t => t.status === 'completed' && t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return calculateTokensFromSpending(totalSpent);
  };

  // Obter eventos ativos do usuário
  const getUserActiveEvents = (): Event[] => {
    const userEventIds = userTransactions
      .filter(t => t.status === 'completed' && t.type === 'purchase')
      .map(t => t.eventId);
    
    return events.filter(event => 
      userEventIds.includes(event.id) && event.status === 'active'
    );
  };

  // Obter histórico de eventos do usuário
  const getUserEventHistory = (): Transaction[] => {
    return userTransactions
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Comprar bilhetes
  const purchaseTickets = async (eventId: string, tickets: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const event = events.find(e => e.id === eventId);
      if (!event) {
        setError('Evento não encontrado');
        return false;
      }

      const totalCost = event.price * tickets;
      
      // Verificar se usuário tem saldo suficiente
      if (balance && balance < totalCost) {
        setError('Saldo insuficiente');
        return false;
      }

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Criar nova transação
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        eventId,
        eventTitle: event.title,
        amount: totalCost,
        tickets,
        date: new Date(),
        status: 'completed',
        type: 'purchase'
      };

      // Atualizar eventos (aumentar bilhetes vendidos)
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, soldTickets: e.soldTickets + tickets }
          : e
      ));

      // Adicionar transação
      setUserTransactions(prev => [newTransaction, ...prev]);

      return true;
    } catch (err) {
      setError('Erro ao processar compra');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: EventContextType = {
    events,
    userTransactions,
    userTokens: getUserTokens(),
    userActiveEvents: getUserActiveEvents(),
    isLoading,
    error,
    purchaseTickets,
    getUserTokens,
    calculateTokensFromSpending,
    getActiveEvents: () => events.filter(e => e.status === 'active'),
    getUserEventHistory
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
