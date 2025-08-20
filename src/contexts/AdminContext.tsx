import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useEvents } from './EventContext';
import { isUserAdmin, getUserPermissions } from '../config/admin';

// Tipos
interface AdminUser {
  steamId: string;
  steamName: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  createdAt: Date;
}

interface AdminContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Funcionalidades administrativas
  createEvent: (eventData: any) => Promise<boolean>;
  updateEvent: (eventId: string, eventData: any) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  manageUsers: () => void;
  viewAnalytics: () => void;
  managePayments: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Lista de administradores (em produção, isso viria do banco de dados)
// IMPORTANTE: Substitua pelos seus Steam IDs reais!
const ADMIN_STEAM_IDS = [
  '76561198088038105', // Xuxa Lanches - Admin Principal
  // Adicione mais Steam IDs conforme necessário
];

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { steamUser, currentUser } = useAuth();
  const { events } = useEvents();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        if (!steamUser) {
          setIsAdmin(false);
          setAdminUser(null);
          return;
        }

        // Verificar se o Steam ID está na lista de admins
        const userIsAdmin = isUserAdmin(steamUser.steamid);
        
        if (userIsAdmin) {
          setIsAdmin(true);
          // Criar usuário admin com permissões reais
          const permissions = getUserPermissions(steamUser.steamid);
          const adminUserData: AdminUser = {
            steamId: steamUser.steamid,
            steamName: steamUser.personaname,
            role: permissions.includes('manage_admins') ? 'super_admin' : 'admin',
            permissions,
            createdAt: new Date()
          };
          setAdminUser(adminUserData);
        } else {
          setIsAdmin(false);
          setAdminUser(null);
        }
        
      } catch (err) {
        setError('Erro ao verificar permissões de administrador');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [steamUser]);

  // Criar evento
  const createEvent = async (eventData: any): Promise<boolean> => {
    if (!isAdmin) {
      setError('Acesso negado: permissões insuficientes');
      return false;
    }

    try {
      // Aqui você implementaria a lógica real de criação
      // Por enquanto, simulamos
      console.log('Criando evento:', eventData);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em produção, aqui você salvaria no banco de dados
      // e atualizaria o estado global dos eventos
      
      return true;
    } catch (err) {
      setError('Erro ao criar evento');
      return false;
    }
  };

  // Atualizar evento
  const updateEvent = async (eventId: string, eventData: any): Promise<boolean> => {
    if (!isAdmin) {
      setError('Acesso negado: permissões insuficientes');
      return false;
    }

    try {
      console.log('Atualizando evento:', eventId, eventData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (err) {
      setError('Erro ao atualizar evento');
      return false;
    }
  };

  // Deletar evento
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!isAdmin) {
      setError('Acesso negado: permissões insuficientes');
      return false;
    }

    try {
      console.log('Deletando evento:', eventId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (err) {
      setError('Erro ao deletar evento');
      return false;
    }
  };

  // Gerenciar usuários
  const manageUsers = () => {
    if (!isAdmin) return;
    console.log('Abrindo painel de gerenciamento de usuários');
    // Implementar navegação para painel de usuários
  };

  // Visualizar analytics
  const viewAnalytics = () => {
    if (!isAdmin) return;
    console.log('Abrindo painel de analytics');
    // Implementar navegação para analytics
  };

  // Gerenciar pagamentos
  const managePayments = () => {
    if (!isAdmin) return;
    console.log('Abrindo painel de pagamentos');
    // Implementar navegação para pagamentos
  };

  const value: AdminContextType = {
    isAdmin,
    adminUser,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    manageUsers,
    viewAnalytics,
    managePayments
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
