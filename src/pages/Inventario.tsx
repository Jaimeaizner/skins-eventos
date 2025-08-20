import React, { useState, useEffect } from 'react';
import { getRealSteamInventoryForEvents, getItemDetails } from '../services/steamAuth';
import { useAuth } from '../contexts/AuthContext';

interface SteamItem {
  assetid: string;
  name: string;
  icon_url: string;
  market_price: string | null;
  steamPrice: number;
  ticketPrice: number;
  inspectLink?: string;
  rarity?: string;
  type?: string;
  marketable?: boolean;
  tradable?: boolean;
}

const Inventario: React.FC = () => {
  const { currentUser, steamUser } = useAuth();
  const [steamInventory, setSteamInventory] = useState<SteamItem[]>([]);
  const [siteInventory, setSiteInventory] = useState<SteamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SteamItem | null>(null);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      if (!steamUser?.steamid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('[INVENTARIO] Carregando inventário Steam...');
        const realInventory = await getRealSteamInventoryForEvents(steamUser!.steamid);
        setSteamInventory(realInventory);
        console.log('[INVENTARIO] Inventário carregado:', realInventory.length, 'itens');
      } catch (error) {
        console.error('[INVENTARIO] Erro ao carregar inventário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [steamUser]);

  const handleItemClick = async (item: SteamItem) => {
    setSelectedItem(item);
    setItemDetails(null);
    
    // SOLUÇÃO 3: Carregar detalhes apenas no clique (lazy loading)
    if (item.inspectLink) {
      setLoadingDetails(true);
      try {
        console.log('[INVENTARIO] Carregando detalhes para:', item.name);
        const details = await getItemDetails(item.inspectLink);
        setItemDetails(details);
        console.log('[INVENTARIO] Detalhes carregados:', details);
      } catch (error) {
        console.error('[INVENTARIO] Erro ao carregar detalhes:', error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleTransferToSite = (item: SteamItem) => {
    if (!siteInventory.find(i => i.assetid === item.assetid)) {
      setSiteInventory([...siteInventory, item]);
      setSteamInventory(steamInventory.filter(i => i.assetid !== item.assetid));
    }
  };

  const handleTransferToSteam = (item: SteamItem) => {
    if (!steamInventory.find(i => i.assetid === item.assetid)) {
      setSteamInventory([...steamInventory, item]);
      setSiteInventory(siteInventory.filter(i => i.assetid !== item.assetid));
    }
  };

  // SOLUÇÃO 1: Função para usar proxy de imagens
  const getImageUrl = (iconUrl: string) => {
    if (!iconUrl) return '/fallback-item.png';
    
    // Se a URL já é do nosso proxy, usar diretamente
    if (iconUrl.startsWith('/api/steam-image')) {
      return iconUrl;
    }
    
    // Usar proxy para evitar CORS
    return `/api/steam-image?url=${encodeURIComponent(iconUrl)}`;
  };

  // FILTROS VISUAIS - Definir quais itens são elegíveis para rifas/leilões
  const tiposPermitidos = ['Rifle', 'Pistol', 'SMG', 'Sniper Rifle', 'Shotgun', 'Knife', 'Gloves', 'Agent'];
  
  const isElegivel = (item: SteamItem) => {
    const tipo = item.type || 'Unknown';
    const preco = item.market_price;
    
    // Verificar se o tipo é permitido
    const tipoPermitido = tiposPermitidos.includes(tipo);
    
    // Verificar se tem preço válido (acima de R$10,00)
    let precoValido = false;
    if (preco && preco !== 'Sem preço') {
      const precoNumerico = parseFloat(preco.replace('R$', '').replace(',', '.').trim());
      precoValido = !isNaN(precoNumerico) && precoNumerico >= 10.0;
    }
    
    return tipoPermitido && precoValido;
  };
  
  const getElegibilidadeTooltip = (item: SteamItem) => {
    const tipo = item.type || 'Unknown';
    const preco = item.market_price;
    
    if (!tiposPermitidos.includes(tipo)) {
      return `Tipo não permitido: ${tipo}`;
    }
    
    if (!preco || preco === 'Sem preço') {
      return 'Item sem preço de mercado';
    }
    
    const precoNumerico = parseFloat(preco.replace('R$', '').replace(',', '.').trim());
    if (isNaN(precoNumerico) || precoNumerico < 10.0) {
      return 'Valor abaixo de R$ 10,00';
    }
    
    return 'Item elegível para rifas/leilões';
  };

  // SOLUÇÃO 1: Função para fallback de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/fallback-item.png';
    target.onerror = null; // Evitar loop infinito
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p>Você precisa estar logado para acessar o inventário.</p>
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
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Carregando inventário...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[600px] overflow-y-auto">
                {steamInventory.map((item, index) => {
                  const elegivel = isElegivel(item);
                  const tooltip = getElegibilidadeTooltip(item);
                  
                  return (
                    <div 
                      key={index} 
                      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-2 border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                        elegivel 
                          ? 'border-purple-500 border-opacity-50 hover:border-purple-400' 
                          : 'border-red-500 border-opacity-30 grayscale opacity-50'
                      }`}
                      onClick={() => handleItemClick(item)}
                      title={tooltip}
                    >
                    {/* Container da imagem com lazy loading */}
                    <div className="relative w-full h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                      {/* SOLUÇÃO 1: Imagem com lazy loading e proxy */}
                      <img
                        src={getImageUrl(item.icon_url)}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </div>

                    {/* Informações do item - SOLUÇÃO 2: Apenas nome e preço */}
                    <div className="text-center">
                      <h3 className="text-white text-xs font-semibold truncate mb-1" title={item.name}>{item.name}</h3>
                      {/* SOLUÇÃO 5: Melhor tratamento de preços */}
                      {item.market_price ? (
                        <div className="text-green-400 text-xs font-bold">
                          {item.market_price}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">
                          Sem preço
                        </div>
                      )}
                    </div>
                    
                    {/* Indicador visual de elegibilidade */}
                    {!elegivel && (
                      <div className="absolute top-1 right-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            )}

            {steamInventory.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="text-gray-400">Nenhum item encontrado no inventário Steam</div>
              </div>
            )}
          </div>

          {/* Inventário do Site - Lado Direito */}
          <div className="bg-black bg-opacity-30 rounded-xl p-6 border border-purple-500 border-opacity-50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Inventário do Site ({siteInventory.length} itens)
            </h2>
            
            {siteInventory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">Nenhum item transferido para o site</div>
                <div className="text-gray-500 text-sm">Clique em um item do inventário Steam para transferi-lo</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[600px] overflow-y-auto">
                {siteInventory.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-2 border border-green-500 border-opacity-50 hover:border-green-400 transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => handleTransferToSteam(item)}
                  >
                    <div className="relative w-full h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src={getImageUrl(item.icon_url)}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </div>

                    <div className="text-center">
                      <h3 className="text-white text-xs font-semibold truncate mb-1" title={item.name}>{item.name}</h3>
                      {item.market_price ? (
                        <div className="text-green-400 text-xs font-bold">
                          {item.market_price}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">
                          Sem preço
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalhes do item - SOLUÇÃO 3: Lazy loading de detalhes */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white text-lg font-bold">{selectedItem.name}</h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex space-x-4">
              {/* Imagem do item */}
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(selectedItem.icon_url)}
                  alt={selectedItem.name}
                  className="w-32 h-24 object-contain bg-gray-700 rounded-lg"
                  onError={handleImageError}
                />
              </div>

              {/* Detalhes do item */}
              <div className="flex-1">
                <div className="text-white mb-4">
                  <h4 className="font-semibold mb-2">Detalhes do Item</h4>
                  
                  {loadingDetails ? (
                    <div className="text-gray-400 text-sm">Carregando detalhes...</div>
                  ) : itemDetails ? (
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-400">Float:</span> {itemDetails.float?.toFixed(6) || 'N/A'}</div>
                      <div><span className="text-gray-400">Raridade:</span> {itemDetails.rarity || 'N/A'}</div>
                      <div><span className="text-gray-400">Exterior:</span> {itemDetails.exterior || 'N/A'}</div>
                      {itemDetails.stickers && itemDetails.stickers.length > 0 && (
                        <div><span className="text-gray-400">Stickers:</span> {itemDetails.stickers.length}</div>
                      )}
                      {itemDetails.statTrak && (
                        <div className="text-orange-400">StatTrak</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Detalhes não disponíveis</div>
                  )}
                </div>

                {/* Preço do mercado */}
                <div className="text-white mb-4">
                  <h4 className="font-semibold mb-2">Mercado da Comunidade</h4>
                  <div className="text-green-400">
                    A partir de: {selectedItem.market_price || 'Sem preço'}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleTransferToSite(selectedItem)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Transferir para o Site
                  </button>
                  
                  <button
                    onClick={() => {/* Implementar promoção */}}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Fazer Promoção
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario; 