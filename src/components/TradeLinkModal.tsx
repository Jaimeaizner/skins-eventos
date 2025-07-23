import { useState } from 'react';

interface TradeLinkModalProps {
  onClose: () => void;
  onSave: (tradeLink: string) => void;
}

export default function TradeLinkModal({ onClose, onSave }: TradeLinkModalProps) {
  const [tradeLink, setTradeLink] = useState('');

  const handleSave = () => {
    if (tradeLink.trim()) {
      onSave(tradeLink.trim());
      onClose();
    }
  };

  const openTradeLinkHelp = () => {
    window.open('https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Adicione Seu Trade Link
          </h2>
          <p className="text-gray-300">
            Para poder negociar, precisamos que você adicione seu Trade Link da Steam.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trade Link da Steam
            </label>
            <input
              type="url"
              value={tradeLink}
              onChange={(e) => setTradeLink(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              placeholder="https://steamcommunity.com/tradeoffer/new/..."
              required
            />
          </div>

          <div className="text-center">
            <button
              onClick={openTradeLinkHelp}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm underline"
            >
              Como encontrar meu Trade Link?
            </button>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            Pular
          </button>
          <button
            onClick={handleSave}
            disabled={!tradeLink.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Trade Link
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 