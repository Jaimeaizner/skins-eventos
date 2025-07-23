import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, steamUser } = useAuth();

  if (!currentUser && !steamUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 