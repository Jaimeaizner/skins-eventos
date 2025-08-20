import React from 'react';
import { useFeature, useFeatures } from './FeatureGuard';
import { getActiveFeatures, getHiddenFeatures } from '../config/features';

export default function FeatureDemo() {
  // Exemplos de uso dos hooks
  const showRiffas = useFeature('RIFFAS');
  const showLeiloes = useFeature('LEILOES');
  const showInventario = useFeature('INVENTARIO');
  const showAdvancedFeatures = useFeatures(['INVENTARIO', 'LEILOES']);

  // Listas de features
  const activeFeatures = getActiveFeatures();
  const hiddenFeatures = getHiddenFeatures();

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">🔧 Demonstração do Sistema de Feature Flags</h2>
      
      {/* Status das Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Features Ativas */}
        <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-500">
          <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Features Ativas</h3>
          <div className="space-y-2">
            {activeFeatures.map(feature => (
              <div key={feature} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Escondidas */}
        <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border border-red-500">
          <h3 className="text-lg font-semibold text-red-400 mb-3">🔒 Features Escondidas</h3>
          <div className="space-y-2">
            {hiddenFeatures.map(feature => (
              <div key={feature} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exemplos de Uso */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">🎯 Exemplos de Uso:</h3>
        
        {/* Feature Individual */}
        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-500">
          <h4 className="text-md font-semibold text-blue-400 mb-2">useFeature('RIFFAS'):</h4>
          <div className="text-white">
            {showRiffas ? (
              <span className="text-green-400">✅ RIFFAS está ATIVA</span>
            ) : (
              <span className="text-red-400">🔒 RIFFAS está ESCONDIDA</span>
            )}
          </div>
        </div>

        {/* Feature Individual */}
        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-500">
          <h4 className="text-md font-semibold text-blue-400 mb-2">useFeature('LEILOES'):</h4>
          <div className="text-white">
            {showLeiloes ? (
              <span className="text-green-400">✅ LEILOES está ATIVA</span>
            ) : (
              <span className="text-red-400">🔒 LEILOES está ESCONDIDA</span>
            )}
          </div>
        </div>

        {/* Feature Individual */}
        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-500">
          <h4 className="text-md font-semibold text-blue-400 mb-2">useFeature('INVENTARIO'):</h4>
          <div className="text-white">
            {showInventario ? (
              <span className="text-green-400">✅ INVENTARIO está ATIVO</span>
            ) : (
              <span className="text-red-400">🔒 INVENTARIO está ESCONDIDO</span>
            )}
          </div>
        </div>

        {/* Múltiplas Features */}
        <div className="bg-purple-900 bg-opacity-30 p-4 rounded-lg border border-purple-500">
          <h4 className="text-md font-semibold text-purple-400 mb-2">useFeatures(['INVENTARIO', 'LEILOES']):</h4>
          <div className="text-white">
            {showAdvancedFeatures ? (
              <span className="text-green-400">✅ Todas as features estão ATIVAS</span>
            ) : (
              <span className="text-red-400">🔒 Algumas features estão ESCONDIDAS</span>
            )}
          </div>
        </div>
      </div>

      {/* Como Alterar */}
      <div className="mt-8 p-4 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-500">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">🔄 Como Alterar Features:</h3>
        <div className="text-white text-sm space-y-2">
          <p>1. Abra o arquivo <code className="bg-gray-700 px-2 py-1 rounded">src/config/features.ts</code></p>
          <p>2. Mude o valor de <code className="bg-gray-700 px-2 py-1 rounded">false</code> para <code className="bg-gray-700 px-2 py-1 rounded">true</code></p>
          <p>3. Salve o arquivo e recarregue a página</p>
          <p>4. A funcionalidade aparecerá automaticamente! 🎉</p>
        </div>
      </div>

      {/* Exemplo de Código */}
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">💻 Exemplo de Código:</h3>
        <pre className="text-green-400 text-sm overflow-x-auto">
{`// Para esconder uma funcionalidade:
{useFeature('LEILOES') && (
  <Link to="/leiloes">Leilões</Link>
)}

// Para mostrar uma funcionalidade:
{useFeature('RIFFAS') && (
  <button>Criar Evento</button>
)}

// Para múltiplas features:
{useFeatures(['INVENTARIO', 'LEILOES']) && (
  <div>Funcionalidades Avançadas</div>
)}`}
        </pre>
      </div>
    </div>
  );
}
