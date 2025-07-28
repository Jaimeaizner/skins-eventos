import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getSteamInventory, getSkinImageUrl } from '../services/steamAuth';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: 'consumer' | 'industrial' | 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'contraband';
  price: number;
  image: string;
  isTradable: boolean;
  isSelected: boolean;
  wear: number;
  stickers?: string[];
  isWonFromRaffle: boolean;
}

export default function Inventario() {
  const { currentUser } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'AK-47 | Fire Serpent',
      type: 'Rifle',
      rarity: 'covert',
      price: 1500,
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM',
      isTradable: true,
      isSelected: false,
      wear: 0.15,
      isWonFromRaffle: true
    },
    {
      id: '2',
      name: 'M4A4 | Howl',
      type: 'Rifle',
      rarity: 'contraband',
      price: 2500,
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ',
      isTradable: true,
      isSelected: false,
      wear: 0.08,
      isWonFromRaffle: false
    },
    {
      id: '3',
      name: 'AWP | Dragon Lore',
      type: 'Sniper',
      rarity: 'contraband',
      price: 5000,
      image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f',
      isTradable: false,
      isSelected: false,
      wear: 0.12,
      isWonFromRaffle: true
    },
    {
      id: '4',
      name: 'Karambit | Fade',
      type: 'Knife',
      rarity: 'covert',
      price: 3200,
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8/360fx360f',
      isTradable: true,
      isSelected: false,
      wear: 0.03,
      isWonFromRaffle: false
    },
    {
      id: '5',
      name: 'Desert Eagle | Golden Koi',
      type: 'Pistol',
      rarity: 'restricted',
      price: 180,
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7v-Re6dsLPWAMWWCwPh5j-1gSCGn20om6jyGw9qgJHmQaAcgC8MmR7IMthm5m4W2M7zj7wOIj4pGn32o23hXrnE8VHBG1O4/360fx360f',
      isTradable: true,
      isSelected: false,
      wear: 0.25,
      isWonFromRaffle: false
    }
  ]);

  // Filtrar itens baseado nos filtros
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTradable = onlyTradable ? item.isTradable : true;
    return matchesSearch && matchesTradable;
  });

  // Função para selecionar/deselecionar item
  const handleItemSelect = (item: InventoryItem) => {
    if (item.isSelected) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
      setInventoryItems(prev => prev.map(i => i.id === item.id ? { ...i, isSelected: false } : i));
    } else {
      setSelectedItems(prev => [...prev, item]);
      setInventoryItems(prev => prev.map(i => i.id === item.id ? { ...i, isSelected: true } : i));
    }
  };

  // Função para selecionar todos
  const handleSelectAll = () => {
    const tradableItems = filteredItems.filter(item => item.isTradable);
    if (selectedItems.length === tradableItems.length) {
      setSelectedItems([]);
      setInventoryItems(prev => prev.map(item => ({ ...item, isSelected: false })));
    } else {
      setSelectedItems(tradableItems);
      setInventoryItems(prev => prev.map(item => 
        tradableItems.some(ti => ti.id === item.id) ? { ...item, isSelected: true } : item
      ));
    }
  };

  // Função para venda rápida (apenas para itens ganhos em rifas)
  const handleQuickSell = () => {
    const raffleWonItems = selectedItems.filter(item => item.isWonFromRaffle);
    if (raffleWonItems.length === 0) {
      alert('Apenas itens ganhos em eventos promocionais podem ser vendidos rapidamente!');
      return;
    }
    
    const totalValue = raffleWonItems.reduce((sum, item) => sum + item.price, 0);
    const quickSellValue = totalValue * 0.85; // 85% do valor para venda rápida
    
    if (confirm(`Vender ${raffleWonItems.length} item(s) por R$ ${quickSellValue.toLocaleString()}? (85% do valor)`)) {
      // Implementar lógica de venda rápida
      console.log('Venda rápida:', raffleWonItems, 'Valor:', quickSellValue);
    }
  };

  // Calcular valores
  const totalValue = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalFee = totalValue * 0.05; // 5% de taxa

  // Substituir o useEffect para buscar inventário real:
  useEffect(() => {
    async function fetchRealInventory() {
      const steamId = localStorage.getItem('steamId');
      if (!steamId) return;
      try {
        const data = await getSteamInventory(steamId);
        // data.assets = lista de itens, data.descriptions = detalhes
        const items = data.assets.map((asset: any) => {
          const desc = data.descriptions.find((d: any) => d.classid === asset.classid && d.instanceid === asset.instanceid);
          return {
            id: asset.assetid,
            name: desc?.market_hash_name || desc?.market_name || 'Unknown',
            image: getSkinImageUrl(desc?.icon_url || ''),
            exterior: desc?.type || '',
          };
        });
        setInventoryItems(items);
      } catch (e) {
        setInventoryItems([]);
      }
    }
    fetchRealInventory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              INVENTÁRIO
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Gerencie seus itens do CS2
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-white font-bold text-lg">CS2</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'steam', label: 'Inventário Steam', active: activeTab === 'steam' },
              { id: 'bitskins', label: 'Inventário BitSkins', active: activeTab === 'bitskins' },
              { id: 'selling', label: 'Vendendo', active: activeTab === 'selling' },
              { id: 'queued', label: 'Na Fila', active: activeTab === 'queued' },
              { id: 'withdrawn', label: 'Retirados', active: activeTab === 'withdrawn' },
              { id: 'favorites', label: 'Favoritos', active: activeTab === 'favorites' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  tab.active
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4">Seu Inventário Steam</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Buscar itens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={onlyTradable}
                      onChange={(e) => setOnlyTradable(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-white bg-opacity-10 border-white border-opacity-20 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm">Apenas itens negociáveis</span>
                  </label>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="default">Ordenação padrão</option>
                    <option value="price-high">Preço: Maior</option>
                    <option value="price-low">Preço: Menor</option>
                    <option value="name">Nome</option>
                    <option value="rarity">Raridade</option>
                  </select>
                  
                  <button
                    onClick={() => setIsLoading(true)}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-white text-xl font-semibold mb-2">Carregando seu inventário</div>
              <div className="text-gray-400 text-sm">Isso pode demorar um pouco</div>
            </div>
          )}

          {/* Grid de Itens */}
          {!isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    item.isSelected ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'
                  }`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border border-white border-opacity-20">
                    <div className="relative">
                      <div className="w-full h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      {/* Indicador de seleção */}
                      {item.isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Raridade */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                              item.rarity === 'covert' ? 'bg-orange-500 text-white' :
                    item.rarity === 'contraband' ? 'bg-yellow-500 text-black' :
                    item.rarity === 'classified' ? 'bg-purple-500 text-white' :
                    item.rarity === 'restricted' ? 'bg-pink-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {item.rarity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold truncate mb-1">{item.name}</div>
                      <div className="text-green-400 text-sm font-bold">R$ {item.price.toLocaleString()}</div>
                      {!item.isTradable && (
                        <div className="text-red-400 text-xs mt-1">Não negociável</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Aviso sobre mudanças da Steam */}
          <div className="mt-6 p-4 bg-blue-500 bg-opacity-20 backdrop-blur-md rounded-lg border border-blue-500 border-opacity-30">
            <div className="text-blue-300 text-sm">
              <strong>Atenção:</strong> Devido às recentes mudanças da Steam, os itens se tornam visíveis 10 dias após a troca.
            </div>
          </div>
        </div>

        {/* Painel de Itens Selecionados */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Itens Selecionados [{selectedItems.length}]</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-300 text-sm">Público</span>
              </div>
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 bg-white bg-opacity-10 border-white border-opacity-20 rounded focus:ring-purple-500"
                />
                <span className="text-sm">Agrupar por nome</span>
              </label>
            </div>
          </div>

          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-white bg-opacity-5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-gray-400 text-lg">Selecione itens do seu inventário</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {selectedItems.map((item) => (
                <div key={item.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border border-purple-500 border-opacity-50">
                  <div className="w-full h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-white text-sm font-semibold truncate mb-1">{item.name}</div>
                    <div className="text-green-400 text-sm font-bold">R$ {item.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barra de Ações */}
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-md border-t border-white border-opacity-20 p-4 z-40">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>ADICIONAR {selectedItems.length} ITENS À VENDA</span>
              </button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-white text-sm">Ganhos:</div>
                <div className="text-green-400 font-bold">R$ {totalValue.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-white text-sm">Taxa total:</div>
                <div className="text-red-400 font-bold">R$ {totalFee.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleQuickSell}
                disabled={selectedItems.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-bold transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>VENDA RÁPIDA ({selectedItems.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 