import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRealSteamInventoryForEvents } from '../services/steamAuth';

export default function Inventario() {
  const { steamUser } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealInventory() {
      try {
        setLoading(true);
        const realInventory = await getRealSteamInventoryForEvents(steamUser!.steamid);
        setInventoryItems(realInventory);
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
        {/* Grid de itens */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {inventoryItems.map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-purple-500 border-opacity-50 hover:border-purple-400 transition-all duration-300">
              {/* Container da imagem com stickers e pendant */}
              <div className="relative w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                {/* Imagem principal */}
                <img
                  src={getSkinImageUrl(item.icon_url)}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Stickers (lado esquerdo) */}
                {item.stickers && item.stickers.length > 0 && (
                  <div className="absolute left-1 top-1 flex flex-col space-y-1">
                    {item.stickers.slice(0, 4).map((sticker: any, stickerIndex: number) => (
                      <img
                        key={stickerIndex}
                        src={getStickerImageUrl(sticker.icon_url)}
                        alt="Sticker"
                        className="w-6 h-6 object-contain"
                      />
                    ))}
                  </div>
                )}
                
                {/* Pendant (sobre a imagem) */}
                {item.pendant && (
                  <img
                    src={getPendantImageUrl(item.pendant.icon_url)}
                    alt="Pendant"
                    className="absolute top-1 right-1 w-8 h-8 object-contain"
                  />
                )}
                
                {/* Indicador de Name Tag */}
                {item.name_tag && (
                  <div className="absolute bottom-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
                    NT
                  </div>
                )}
              </div>

              {/* Informações do item */}
              <div className="text-center">
                <h3 className="text-white text-sm font-semibold truncate mb-1">{item.name}</h3>
                <div className="text-gray-300 text-xs mb-1">
                  {item.rarity && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.rarity === 'covert' ? 'bg-red-600 text-white' :
                      item.rarity === 'classified' ? 'bg-purple-600 text-white' :
                      item.rarity === 'restricted' ? 'bg-blue-600 text-white' :
                      item.rarity === 'mil-spec' ? 'bg-green-600 text-white' :
                      item.rarity === 'industrial' ? 'bg-gray-600 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {item.rarity.toUpperCase()}
                    </span>
                  )}
                </div>
                {item.wear && (
                  <div className="text-gray-400 text-xs mb-1">
                    Wear: {item.wear.toFixed(4)}
                  </div>
                )}
                {item.market_price && (
                  <div className="text-green-400 text-sm font-bold">
                    R$ {parseFloat(item.market_price).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {inventoryItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg">Nenhum item encontrado no inventário</div>
          </div>
        )}
      </div>
    </div>
  );
} 