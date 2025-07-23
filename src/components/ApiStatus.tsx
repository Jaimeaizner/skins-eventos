import React from 'react';
import { isSteamApiAvailable } from '../config/steam';

export default function ApiStatus() {
  const isApiAvailable = isSteamApiAvailable();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
        isApiAvailable 
          ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
          : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isApiAvailable ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          <span>
            {isApiAvailable ? 'API Steam Ativa' : 'API Steam Simulada'}
          </span>
        </div>
      </div>
    </div>
  );
} 