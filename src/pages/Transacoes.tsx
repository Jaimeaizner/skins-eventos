import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Transacoes() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            {t('user.transactions')}
          </h1>
          <p className="text-gray-400">
            Histórico de suas transações
          </p>
        </div>

        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              Página em desenvolvimento
            </div>
            <p className="text-gray-500">
              Em breve você poderá ver todo o histórico de suas transações aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 