import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';

interface FilterOption {
  id: string;
  label: string;
  color?: string;
  icon?: string;
}

interface FilterCategory {
  id: string;
  label: string;
  options?: FilterOption[];
  hasCheckbox?: boolean;
  checkboxLabel?: string;
  hasSlider?: boolean;
  sliderMin?: number;
  sliderMax?: number;
  hasInputs?: boolean;
  inputLabels?: string[];
}

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: any) => void;
  pageType: 'rifas' | 'leiloes';
}

export default function FiltersSidebar({ isOpen, onClose, onFilterChange, pageType }: FiltersSidebarProps) {
  const { selectedGame } = useGame();
  const [selectedFilters, setSelectedFilters] = useState<any>({});

  // Filtros dinâmicos por jogo
  const FILTERS = {
    cs2: [
      { key: 'rarity', label: 'Raridade', options: ['consumer', 'industrial', 'mil-spec', 'restricted', 'classified', 'covert', 'contraband'] },
      { key: 'type', label: 'Tipo', options: ['Rifle', 'Pistola', 'Faca', 'Luvas', 'SMG', 'Sniper', 'Shotgun', 'Heavy'] },
      { key: 'wear', label: 'Exterior', options: ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'] },
      { key: 'price', label: 'Preço', type: 'range' },
    ],
    dota2: [
      { key: 'type', label: 'Tipo', options: ['Arcana', 'Immortal', 'Mythical', 'Couriers', 'Skins', 'Loading Screens', 'Taunt', 'Bundle'] },
      { key: 'rarity', label: 'Raridade', options: ['Immortal', 'Arcana', 'Legendary', 'Mythical', 'Rare', 'Uncommon', 'Common'] },
      { key: 'quality', label: 'Qualidade', options: ['Standard', 'Genuine', 'Inscribed', 'Autographed', 'Elder', 'Exalted', 'Frozen', 'Corrupted'] },
      { key: 'slot', label: 'Slot', options: ['Head', 'Weapon', 'Back', 'Taunt', 'Shoulder', 'Arms', 'Neck', 'Belt', 'Legs', 'Misc'] },
      { key: 'price', label: 'Preço', type: 'range' },
    ],
    rust: [
      { key: 'type', label: 'Tipo', options: ['Weapon', 'Clothing', 'Tools', 'Building', 'Misc'] },
      { key: 'category', label: 'Categoria', options: ['AK-47', 'Thompson', 'Door', 'Metal Facemask', 'Hoodie', 'Pants', 'Chestplate', 'Hatchet', 'Pickaxe'] },
      { key: 'rarity', label: 'Raridade', options: ['Common', 'Uncommon', 'Rare', 'Very Rare'] },
      { key: 'price', label: 'Preço', type: 'range' },
    ],
    teamfortress2: [
      { key: 'type', label: 'Tipo', options: ['Weapon', 'Cosmetic', 'Taunt', 'Tool', 'Crate'] },
      { key: 'class', label: 'Classe', options: ['Scout', 'Soldier', 'Pyro', 'Demoman', 'Heavy', 'Engineer', 'Medic', 'Sniper', 'Spy'] },
      { key: 'quality', label: 'Qualidade', options: ['Unique', 'Strange', 'Unusual', 'Vintage', 'Genuine', 'Haunted', 'Collector'] },
      { key: 'slot', label: 'Slot', options: ['Primary', 'Secondary', 'Melee', 'Head', 'Misc'] },
      { key: 'price', label: 'Preço', type: 'range' },
    ],
  };

  const activeFilters = FILTERS[selectedGame];

  const handleFilterChange = (categoryId: string, optionId: string, value?: any) => {
    const newFilters = { ...selectedFilters };
    
    if (!newFilters[categoryId]) {
      newFilters[categoryId] = [];
    }
    
    if (value !== undefined) {
      // Para checkboxes e sliders
      newFilters[categoryId] = value;
    } else {
      // Para opções múltiplas
      const index = newFilters[categoryId].indexOf(optionId);
      if (index > -1) {
        newFilters[categoryId].splice(index, 1);
      } else {
        newFilters[categoryId].push(optionId);
      }
    }
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop escuro */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
          {/* Painel lateral */}
          <aside className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 bg-opacity-95 backdrop-blur-md border-r border-white border-opacity-20 shadow-2xl z-50 flex flex-col p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Filtros</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="flex flex-col gap-6">
              {activeFilters.map(filter => (
                filter.type === 'range' ? (
                  <div key={filter.key} className="flex flex-col gap-2 mb-2">
                    <label className="text-white font-semibold mb-1">{filter.label}</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Mín"
                        className="w-20 px-2 py-1 rounded bg-white/10 text-white"
                        value={selectedFilters[`${filter.key}Min`] || ''}
                        onChange={e => handleFilterChange(`${filter.key}Min`, '', Number(e.target.value))}
                      />
                      <span className="text-white">-</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        className="w-20 px-2 py-1 rounded bg-white/10 text-white"
                        value={selectedFilters[`${filter.key}Max`] || ''}
                        onChange={e => handleFilterChange(`${filter.key}Max`, '', Number(e.target.value))}
                      />
                    </div>
                  </div>
                ) : (
                  <div key={filter.key} className="flex flex-col gap-2 mb-2">
                    <label className="text-white font-semibold mb-1">{filter.label}</label>
                    <select
                      className="px-2 py-1 rounded bg-white/10 text-white"
                      value={selectedFilters[filter.key] || ''}
                      onChange={e => handleFilterChange(filter.key, '', e.target.value)}
                    >
                      <option value="">Todos</option>
                      {filter.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )
              ))}
            </form>
          </aside>
        </>
      )}
    </>
  );
} 