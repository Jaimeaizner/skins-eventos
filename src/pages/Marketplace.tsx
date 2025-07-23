import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MarketItem {
  id: string;
  name: string;
  image: string;
  price: number;
  seller: string;
  rarity: 'legendary' | 'mythical' | 'divine' | 'rare' | 'common';
  wear: number;
  isFavorited: boolean;
  stickers?: string[];
}

export default function Marketplace() {
  const { currentUser, steamUser, balance, updateBalance } = useAuth();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [filterRarity, setFilterRarity] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    {
      id: '1',
      name: 'AK-47 | Fire Serpent',
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teXI8oThxgfkqRBqNW30cIeTIFU3NAnZ-Fnsleq6gJW6uJXOmHQwuXR0sXfZmhepwUYblYdNWxM',
      price: 1500,
      seller: 'Player123',
      rarity: 'legendary',
      wear: 0.15,
      isFavorited: false
    },
    {
      id: '2',
      name: 'M4A4 | Howl',
      image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ',
      price: 2500,
      seller: 'CS2Trader',
      rarity: 'mythical',
      wear: 0.08,
      isFavorited: false
    },
    {
      id: '3',
      name: 'AWP | Dragon Lore',
      image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f',
      price: 5000,
      seller: 'SkinMaster',
      rarity: 'divine',
      wear: 0.12,
      isFavorited: false
    },
    {
      id: '4',
      name: 'Karambit | Fade',
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8/360fx360f',
      price: 3200,
      seller: 'KnifeCollector',
      rarity: 'legendary',
      wear: 0.03,
      isFavorited: false
    },
    {
      id: '5',
      name: 'Desert Eagle | Golden Koi',
      image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7v-Re6dsLPWAMWWCwPh5j-1gSCGn20om6jyGw9qgJHmQaAcgC8MmR7IMthm5m4W2M7zj7wOIj4pGn32o23hXrnE8VHBG1O4/360fx360f',
      price: 180,
      seller: 'PistolPro',
      rarity: 'rare',
      wear: 0.25,
      isFavorited: false
    },
    {
      id: '6',
      name: 'AK-47 | Redline',
      image: 'https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA/360fx360f',
      price: 45,
      seller: 'BudgetBuyer',
      rarity: 'rare',
      wear: 0.18,
      isFavorited: false
    }
  ]);

  // Filtrar e ordenar itens
  const filteredAndSortedItems = marketItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
      return matchesSearch && matchesRarity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { 'divine': 0, 'mythical': 1, 'legendary': 2, 'rare': 3, 'common': 4 };
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        default:
          return 0;
      }
    });

  // Função para comprar item
  const handleBuy = (item: MarketItem) => {
    if (!currentUser && !steamUser) {
      setNotification({ message: 'Você precisa estar logado para comprar!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (balance < item.price) {
      setNotification({ message: 'Saldo insuficiente para comprar este item!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Deduzir do saldo
    updateBalance(-item.price);

    // Remover item do marketplace
    setMarketItems(prevItems => prevItems.filter(i => i.id !== item.id));

    setNotification({ 
      message: `Item ${item.name} comprado por R$ ${item.price.toLocaleString()}!`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    setShowModal(false);
  };

  // Função para favoritar/desfavoritar
  const handleToggleFavorite = (itemId: string) => {
    setMarketItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId
          ? { ...item, isFavorited: !item.isFavorited }
          : item
      )
    );
  };

  // Função para abrir modal
  const handleCardClick = (item: MarketItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              MARKETPLACE
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Compre e venda skins do CS2
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl backdrop-blur-md border border-white border-opacity-20 transition-all duration-300 transform ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          }`}>
            <div className="flex items-center space-x-3">
              {notification.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-semibold">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
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
            
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-4 py-3 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todas as raridades</option>
              <option value="divine">Divine</option>
              <option value="mythical">Mythical</option>
              <option value="legendary">Legendary</option>
              <option value="rare">Rare</option>
              <option value="common">Common</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="price-low">Preço: Menor</option>
              <option value="price-high">Preço: Maior</option>
              <option value="name">Nome</option>
              <option value="rarity">Raridade</option>
            </select>
          </div>
        </div>

        {/* Grid de Itens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 overflow-hidden hover:transform hover:scale-105 transition-all duration-500 cursor-pointer shadow-2xl"
              onClick={() => handleCardClick(item)}
            >
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Preço */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border border-white border-opacity-20">
                  R$ {item.price.toLocaleString()}
                </div>
                
                {/* Raridade */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.rarity === 'legendary' ? 'bg-orange-500 text-white' :
                    item.rarity === 'mythical' ? 'bg-yellow-500 text-black' :
                    item.rarity === 'divine' ? 'bg-red-600 text-white' :
                    item.rarity === 'rare' ? 'bg-purple-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {item.rarity.toUpperCase()}
                  </span>
                </div>

                {/* Wear */}
                <div className="absolute bottom-4 left-4 bg-blue-500 bg-opacity-80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                  {(item.wear * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="p-6 relative">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                  {item.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Vendedor:</span>
                    <span className="text-white font-semibold">{item.seller}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Wear:</span>
                    <span className="text-blue-400 font-bold">{(item.wear * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(item);
                    }}
                  >
                    COMPRAR
                  </button>
                  <button 
                    className={`px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white border-opacity-20 ${
                      item.isFavorited 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-white bg-opacity-10 hover:bg-white hover:bg-opacity-20 text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item.id);
                    }}
                  >
                    <svg className="w-5 h-5" fill={item.isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalhes */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">{selectedItem.name}</h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Preço:</span>
                  <span className="text-green-400 font-bold">R$ {selectedItem.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Vendedor:</span>
                  <span className="text-white font-semibold">{selectedItem.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Raridade:</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedItem.rarity === 'legendary' ? 'bg-orange-500 text-white' :
                    selectedItem.rarity === 'mythical' ? 'bg-yellow-500 text-black' :
                    selectedItem.rarity === 'divine' ? 'bg-red-600 text-white' :
                    selectedItem.rarity === 'rare' ? 'bg-purple-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {selectedItem.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Wear:</span>
                  <span className="text-blue-400 font-bold">{(selectedItem.wear * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300"
                  onClick={() => handleBuy(selectedItem)}
                >
                  COMPRAR AGORA
                </button>
                <button 
                  className={`px-4 py-3 rounded-xl transition-all duration-300 border border-white border-opacity-20 ${
                    selectedItem.isFavorited 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-white bg-opacity-10 hover:bg-white hover:bg-opacity-20 text-white'
                  }`}
                  onClick={() => {
                    handleToggleFavorite(selectedItem.id);
                    handleCloseModal();
                  }}
                >
                  <svg className="w-5 h-5" fill={selectedItem.isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 