import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isFeatureEnabled } from '../config/features';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function FeatureGuard({ 
  feature, 
  children, 
  fallback,
  redirectTo = '/'
}: FeatureGuardProps) {
  const navigate = useNavigate();
  
  // Verifica se a funcionalidade está habilitada
  if (!isFeatureEnabled(feature as keyof typeof import('../config/features').FEATURES)) {
    // Se redirecionar, faz isso
    if (redirectTo) {
      React.useEffect(() => {
        navigate(redirectTo, { replace: true });
      }, [navigate, redirectTo]);
    }
    
    // Retorna fallback ou mensagem padrão
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black mb-4">Funcionalidade Indisponível</h1>
          <p className="text-gray-300 mb-6">
            Esta funcionalidade está temporariamente indisponível.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Estamos trabalhando para disponibilizá-la em breve!
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }
  
  // Se a funcionalidade está habilitada, renderiza normalmente
  return <>{children}</>;
}

// Componente de hook para verificar features
export const useFeature = (feature: string): boolean => {
  return isFeatureEnabled(feature as keyof typeof import('../config/features').FEATURES);
};

// Componente de hook para múltiplas features
export const useFeatures = (features: string[]): boolean => {
  return features.every(feature => 
    isFeatureEnabled(feature as keyof typeof import('../config/features').FEATURES)
  );
};
