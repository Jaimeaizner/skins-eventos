import React, { useState } from 'react';

interface BidWarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bidAmount: number;
}

const BidWarningModal: React.FC<BidWarningModalProps> = ({ open, onClose, onConfirm, bidAmount }) => {
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  
  if (!open) return null;

  const handleConfirm = () => {
    if (neverShowAgain) {
      // Salvar no Firestore que o usuário não quer ver mais este aviso
      // Por enquanto, vamos apenas salvar no localStorage como placeholder
      localStorage.setItem('bidWarningDismissed', 'true');
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-gradient-to-br from-red-900 via-red-800 to-orange-900 rounded-2xl shadow-2xl p-6 border border-red-500/30">
        <button 
          className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-300 transition-colors" 
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Atenção!</h2>
          <p className="text-red-200 text-lg">
            Ao dar um lance de <span className="font-bold text-yellow-400">R$ {bidAmount.toLocaleString()}</span>, 
            este valor será <span className="font-bold text-red-400">BLOQUEADO</span> da sua carteira até que:
          </p>
        </div>
        
        <div className="bg-black bg-opacity-30 rounded-xl p-4 mb-6 border border-red-500/20">
          <ul className="text-white space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Você vença o leilão (o valor será debitado)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Outro usuário dê um lance maior (o valor será liberado)</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-yellow-500 bg-opacity-20 rounded-xl p-4 mb-6 border border-yellow-500/30">
          <p className="text-yellow-200 text-sm">
            <strong>Importante:</strong> O valor bloqueado não pode ser usado em outros leilões ou rifas até ser liberado.
          </p>
        </div>
        
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="neverShowAgain"
            checked={neverShowAgain}
            onChange={(e) => setNeverShowAgain(e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
          />
          <label htmlFor="neverShowAgain" className="ml-2 text-gray-300 text-sm">
            Não mostrar este aviso novamente
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-bold transition-all duration-300"
          >
            Confirmar Lance
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidWarningModal; 