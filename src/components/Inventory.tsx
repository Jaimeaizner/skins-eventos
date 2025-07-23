import React, { useState, useEffect } from 'react';
import { getSteamInventory } from '../services/steamAuth';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: 'legendary' | 'mythical' | 'divine' | 'rare' | 'common';
  image: string;
  marketValue: number;
}

interface InventoryProps {
  steamId: string;
  onClose: () => void;
}

export default function Inventory({ steamId, onClose }: InventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSteamInventory(steamId).then((items) => {
      setInventory(items);
      setLoading(false);
    });
  }, [steamId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Meu Inventário Steam</h2>
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

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative mb-3">
                    <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.rarity === 'legendary' ? 'bg-orange-500 text-white' :
                        item.rarity === 'mythical' ? 'bg-yellow-500 text-black' :
                        item.rarity === 'divine' ? 'bg-red-600 text-white' :
                        item.rarity === 'rare' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {item.name}
                  </h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{item.type}</span>
                    <span className="text-green-400 font-bold">R$ {item.marketValue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 