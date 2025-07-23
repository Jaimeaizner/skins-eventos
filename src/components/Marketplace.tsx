import { useState, useEffect } from 'react';
import { getSteamInventory, getSteamMarketPrices } from '../services/steamAuth';
import TradeLinkModal from './TradeLinkModal';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: 'legendary' | 'mythical' | 'divine' | 'rare' | 'common';
  image: string | null;
  marketValue: number;
  condition: string;
  tradeable: boolean;
  marketable: boolean;
  market_hash_name?: string;
}

interface MarketplaceProps {
  steamId: string;
  onClose: () => void;
}

export default function Marketplace({ steamId, onClose }: MarketplaceProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showTradeLinkModal, setShowTradeLinkModal] = useState(false);
  const [sortBy, setSortBy] = useState('price-high');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInventory();
  }, [steamId]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getSteamInventory(steamId);
      
      // Obter preços reais da Steam Market
      const marketHashNames = items
        .filter(item => item.market_hash_name)
        .map(item => item.market_hash_name);
      
      if (marketHashNames.length > 0) {
        const prices = await getSteamMarketPrices(marketHashNames);
        
        // Atualizar itens com preços reais
        const itemsWithPrices = items.map(item => ({
          ...item,
          marketValue: item.market_hash_name ? (prices[item.market_hash_name] || 0) : 0
        }));
        
        setInventory(itemsWithPrices);
      } else {
        setInventory(items);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    const tradeableItems = inventory.filter(item => item.tradeable).map(item => item.id);
    setSelectedItems(tradeableItems);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const getTotalValue = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = inventory.find(i => i.id === itemId);
      return total + (item?.marketValue || 0);
    }, 0);
  };

  const filteredAndSortedInventory = inventory
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      item.tradeable
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return (b.marketValue || 0) - (a.marketValue || 0);
        case 'price-low':
          return (a.marketValue || 0) - (b.marketValue || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { divine: 5, mythical: 4, legendary: 3, rare: 2, common: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        default:
          return 0;
      }
    });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'divine': return 'bg-red-600 text-white';
      case 'mythical': return 'bg-yellow-500 text-black';
      case 'legendary': return 'bg-orange-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleTradeLinkSave = (link: string) => {
    // Aqui você salvaria o trade link no backend
    console.log('Trade Link salvo:', link);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="text-white">Carregando inventário...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">Erro ao carregar inventário</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={loadInventory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Marketplace - Vender Itens</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Sua Oferta */}
          <div className="w-80 p-6 border-r border-white/20">
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Sua Oferta</h3>
                <span className="text-green-400 font-bold">R$ {getTotalValue().toFixed(2)}</span>
              </div>
              
              {selectedItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">Vender Itens</div>
                  <div className="text-sm text-gray-500">Selecione os itens que você deseja vender</div>
                  <div className="text-2xl mt-4">↑</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map(itemId => {
                    const item = inventory.find(i => i.id === itemId);
                    if (!item) return null;
                    
                    return (
                      <div key={itemId} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image || 'https://via.placeholder.com/40x40/171a21/ffffff?text=?'}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">{item.name}</div>
                          <div className="text-gray-400 text-xs">{item.condition}</div>
                        </div>
                        <button
                          onClick={() => toggleItemSelection(itemId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedItems.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowTradeLinkModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300"
                >
                  Vender Itens
                </button>
                <button
                  onClick={clearSelection}
                  className="w-full px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Limpar Seleção
                </button>
              </div>
            )}
          </div>

          {/* Main Content - Inventário */}
          <div className="flex-1 p-6 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600/20 px-3 py-1 rounded-lg">
                  <span className="text-blue-400 font-semibold">CS2</span>
                  <span className="text-white ml-2">R$ {inventory.reduce((sum, item) => sum + (item.marketValue || 0), 0).toFixed(2)}</span>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white"
                >
                  <option value="price-high">Preço: Alto</option>
                  <option value="price-low">Preço: Baixo</option>
                  <option value="name">Nome</option>
                  <option value="rarity">Raridade</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
                  />
                  <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <button
                  onClick={selectAllItems}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                >
                  Selecionar Tudo
                </button>
                
                <button
                  onClick={loadInventory}
                  className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[calc(90vh-240px)]">
              {filteredAndSortedInventory.map((item) => (
                <div
                  key={item.id}
                  className={`relative bg-white/5 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                    selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <div className="relative mb-3">
                    <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image || 'https://via.placeholder.com/200x150/171a21/ffffff?text=?'}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    {!item.tradeable && (
                      <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                          Não Negociável
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getRarityColor(item.rarity)}`}>
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
                        {item.condition}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium truncate" title={item.name}>
                      {item.name}
                    </h3>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-bold text-sm">
                        R$ {(item.marketValue || 0).toFixed(2)}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemSelection(item.id);
                        }}
                        className={`p-1 rounded ${
                          selectedItems.includes(item.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Link Modal */}
      {showTradeLinkModal && (
        <TradeLinkModal
          onClose={() => setShowTradeLinkModal(false)}
          onSave={handleTradeLinkSave}
        />
      )}
    </div>
  );
} 