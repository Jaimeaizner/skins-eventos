import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Navigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

export default function AdminGuard({ 
  children, 
  requiredPermission,
  fallbackPath = '/dashboard'
}: AdminGuardProps) {
  const { isAdmin, adminUser, isLoading } = useAdmin();

  // Se ainda está carregando, mostra loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-black mb-2">Verificando Permissões...</h1>
          <p className="text-gray-300">Aguarde um momento...</p>
        </div>
      </div>
    );
  }

  // Se não é admin, redireciona
  if (!isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Se precisa de permissão específica, verifica
  if (requiredPermission && adminUser) {
    const hasPermission = adminUser.permissions.includes(requiredPermission);
    if (!hasPermission) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Se passou por todas as verificações, renderiza o conteúdo
  return <>{children}</>;
}
