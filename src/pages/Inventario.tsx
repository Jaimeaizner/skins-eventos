import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRealSteamInventoryForEvents } from '../services/steamAuth';

interface ItemDetail {
  name: string;
  icon_url: string;
  market_hash_name: string;
  market_price?: string;
  wear?: number;
  rarity?: string;
  stickers?: any[];
  pendant?: any;
  name_tag?: string;
  stat_trak?: boolean;
  paint_seed?: number;
  exterior?: string;
}

export default function Inventario() {
  const { steamUser } = useAuth();
  const [steamInventory, setSteamInventory] = useState<any[]>([]);
  const [siteInventory, setSiteInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    async function loadRealInventory() {
      try {
        setLoading(true);
        const realInventory = await getRealSteamInventoryForEvents(steamUser!.steamid);
        setSteamInventory(realInventory);
        // Por enquanto, o inventário do site está vazio (sem bots)
        setSiteInventory([]);
      } catch (error) {
        console.error('Erro ao carregar inventário:', error);
      } finally {
        setLoading(false);
      }
    }

    if (steamUser?.steamid) {
      loadRealInventory();
    }
  }, [steamUser?.steamid]);

  const getSkinImageUrl = (marketHashName: string) => {
    return `https://community.cloudflare.steamstatic.com/economy/image/${marketHashName}`;
  };

  const getStickerImageUrl = (stickerName: string) => {
    return `https://community.cloudflare.steamstatic.com/economy/image/${stickerName}`;
  };

  const getPendantImageUrl = (pendantName: string) => {
    return `https://community.cloudflare.steamstatic.com/economy/image/${pendantName}`;
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'covert': return 'bg-red-600 text-white';
      case 'classified': return 'bg-purple-600 text-white';
      case 'restricted': return 'bg-blue-600 text-white';
      case 'mil-spec': return 'bg-green-600 text-white';
      case 'industrial': return 'bg-gray-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getExteriorText = (wear: number) => {
    if (wear <= 0.07) return 'Nova de Fábrica';
    if (wear <= 0.15) return 'Pouco Usada';
    if (wear <= 0.38) return 'Testada em Campo';
    if (wear <= 0.45) return 'Bem Desgastada';
    return 'Batalhada';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando inventário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header com informações do usuário */}
      <div className="bg-black bg-opacity-50 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <img
              src={steamUser?.avatarfull}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-purple-500"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{steamUser?.personaname}</h1>
              <p className="text-gray-300">Inventário Steam</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventário Steam - Lado Esquerdo */}
          <div className="bg-black bg-opacity-30 rounded-xl p-6 border border-purple-500 border-opacity-50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Inventário Steam ({steamInventory.length} itens)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {steamInventory.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border border-purple-500 border-opacity-50 hover:border-purple-400 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Container da imagem com stickers e pendant */}
                  <div className="relative w-full h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                    {/* Imagem principal */}
                    <img
                      src={getSkinImageUrl(item.icon_url)}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                    
                    {/* Stickers (lado esquerdo) */}
                    {item.stickers && item.stickers.length > 0 && (
                      <div className="absolute left-1 top-1 flex flex-col space-y-1">
                        {item.stickers.slice(0, 3).map((sticker: any, stickerIndex: number) => (
                          <img
                            key={stickerIndex}
                            src={getStickerImageUrl(sticker.icon_url)}
                            alt="Sticker"
                            className="w-4 h-4 object-contain"
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Pendant (sobre a imagem) */}
                    {item.pendant && (
                      <img
                        src={getPendantImageUrl(item.pendant.icon_url)}
                        alt="Pendant"
                        className="absolute top-1 right-1 w-6 h-6 object-contain"
                      />
                    )}
                    
                    {/* Indicador de Name Tag */}
                    {item.name_tag && (
                      <div className="absolute bottom-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
                        NT
                      </div>
                    )}

                    {/* StatTrak */}
                    {item.stat_trak && (
                      <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 rounded font-bold">
                        ST
                      </div>
                    )}
                  </div>

                  {/* Informações do item */}
                  <div className="text-center">
                    <h3 className="text-white text-xs font-semibold truncate mb-1">{item.name}</h3>
                    {item.market_price && (
                      <div className="text-green-400 text-xs font-bold">
                        R$ {parseFloat(item.market_price).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {steamInventory.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400">Nenhum item encontrado no inventário Steam</div>
              </div>
            )}
          </div>

          {/* Inventário do Site - Lado Direito */}
          <div className="bg-black bg-opacity-30 rounded-xl p-6 border border-purple-500 border-opacity-50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Inventário do Site ({siteInventory.length} itens)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {siteInventory.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border border-purple-500 border-opacity-50">
                  <div className="relative w-full h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                    <img
                      src={getSkinImageUrl(item.icon_url)}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-white text-xs font-semibold truncate mb-1">{item.name}</h3>
                    <div className="text-purple-400 text-xs font-bold">
                      Transferido
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {siteInventory.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">Nenhum item transferido para o site</div>
                <div className="text-gray-500 text-sm">
                  Clique em um item do inventário Steam para transferi-lo
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detalhado do Item */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lado Esquerdo - Imagem e Informações Básicas */}
              <div>
                <div className="relative w-full h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center overflow-hidden mb-6">
                  <img
                    src={getSkinImageUrl(selectedItem.icon_url)}
                    alt={selectedItem.name}
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Stickers */}
                  {selectedItem.stickers && selectedItem.stickers.length > 0 && (
                    <div className="absolute left-2 top-2 flex flex-col space-y-2">
                      {selectedItem.stickers.map((sticker: any, index: number) => (
                        <div key={index} className="bg-black bg-opacity-50 rounded p-1">
                          <img
                            src={getStickerImageUrl(sticker.icon_url)}
                            alt="Sticker"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pendant */}
                  {selectedItem.pendant && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded p-1">
                      <img
                        src={getPendantImageUrl(selectedItem.pendant.icon_url)}
                        alt="Pendant"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Informações do Mercado */}
                <div className="bg-black bg-opacity-30 rounded-xl p-4 mb-4">
                  <h3 className="text-lg font-bold text-white mb-3">Mercado da Comunidade</h3>
                  {selectedItem.market_price ? (
                    <div className="text-green-400 text-2xl font-bold">
                      A partir de: R$ {parseFloat(selectedItem.market_price).toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-gray-400">Preço não disponível</div>
                  )}
                </div>
              </div>

              {/* Lado Direito - Detalhes e Ações */}
              <div>
                {/* Detalhes do Item */}
                <div className="bg-black bg-opacity-30 rounded-xl p-4 mb-4">
                  <h3 className="text-lg font-bold text-white mb-3">Detalhes do Item</h3>
                  <div className="space-y-2 text-sm">
                    {selectedItem.wear && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Float:</span>
                        <span className="text-white font-mono">{selectedItem.wear.toFixed(6)}</span>
                      </div>
                    )}
                    {selectedItem.paint_seed && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Paint Seed:</span>
                        <span className="text-white font-mono">{selectedItem.paint_seed}</span>
                      </div>
                    )}
                    {selectedItem.exterior && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Exterior:</span>
                        <span className="text-white">{selectedItem.exterior}</span>
                      </div>
                    )}
                    {selectedItem.rarity && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Raridade:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getRarityColor(selectedItem.rarity)}`}>
                          {selectedItem.rarity.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {selectedItem.stat_trak && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">StatTrak:</span>
                        <span className="text-orange-400 font-bold">✓</span>
                      </div>
                    )}
                    {selectedItem.name_tag && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Name Tag:</span>
                        <span className="text-yellow-400">"{selectedItem.name_tag}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // Navegar para criar evento com dados pré-preenchidos
                      window.location.href = `/criar-rifa?item=${encodeURIComponent(JSON.stringify(selectedItem))}`;
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    🎯 Fazer Promoção
                  </button>
                  
                  <button
                    onClick={() => {
                      // Navegar para criar leilão com dados pré-preenchidos
                      window.location.href = `/criar-leilao?item=${encodeURIComponent(JSON.stringify(selectedItem))}`;
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    📈 Fazer Leilão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 