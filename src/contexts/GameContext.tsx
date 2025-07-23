import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type GameKey = 'cs2' | 'dota2' | 'rust' | 'teamfortress2';

interface GameContextType {
  selectedGame: GameKey;
  setSelectedGame: (game: GameKey) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame deve ser usado dentro de GameProvider');
  return context;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [selectedGame, setSelectedGame] = useState<GameKey>('cs2');
  return (
    <GameContext.Provider value={{ selectedGame, setSelectedGame }}>
      {children}
    </GameContext.Provider>
  );
} 