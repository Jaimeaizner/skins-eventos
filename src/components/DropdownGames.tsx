import { useState } from 'react';

const games = [
  {
    key: 'cs2',
    name: 'CS2',
    icon: '/image/CS2.png',
    banner: '/image/CS2card.png',
    available: true,
  },
  {
    key: 'dota2',
    name: 'Dota 2',
    icon: '/image/Dota2.png',
    banner: '/image/Dota2card.png',
    available: false,
  },
  {
    key: 'rust',
    name: 'Rust',
    icon: '/image/Rust.png',
    banner: '/image/Rustcard.png',
    available: false,
  },
  {
    key: 'teamfortress2',
    name: 'Team Fortress 2',
    icon: '/image/TeamFortress2.png',
    banner: '/image/TeamFortress2card.png',
    available: false,
  },
];

export type GameKey = typeof games[number]['key'];

interface DropdownGamesProps {
  selectedGame: GameKey;
  onSelect: (game: GameKey) => void;
}

const DropdownGames: React.FC<DropdownGamesProps> = ({ selectedGame, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = games.find(g => g.key === selectedGame) || games[0];

  return (
    <div className="relative z-50">
      {/* Botão compacto */}
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 shadow-md transition font-bold text-white"
        onClick={() => setOpen(o => !o)}
      >
        <img src={selected.icon} alt={selected.name} className="w-7 h-7 rounded" />
        <span>{selected.name}</span>
        <svg className={`w-4 h-4 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-2 flex gap-4 p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30" style={{ minWidth: 800 }}>
          {games.map(game => (
                         <button
               key={game.key}
               onClick={() => { 
                 if (game.available) {
                   onSelect(game.key); 
                   setOpen(false);
                 }
               }}
               className={`group relative flex flex-col items-center w-44 h-60 rounded-xl overflow-hidden shadow-lg border-2 transition-all duration-200 ${
                 selectedGame === game.key ? 'border-pink-500 scale-105' : 'border-transparent hover:scale-105 hover:border-pink-400'
               } ${!game.available ? 'cursor-not-allowed' : 'cursor-pointer'}`}
             >
              <img src={game.banner} alt={game.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
              
              {/* Overlay de bloqueio para jogos não disponíveis */}
              {!game.available && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  {/* Ícone de cadeado */}
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  {/* Mensagem "Em Breve" */}
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                    Em Breve
                  </div>
                </div>
              )}
              
              <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-6">
                <img src={game.icon} alt={game.name} className="w-12 h-12 mb-2 rounded shadow-lg bg-white/80 p-1" />
                <span className="text-lg font-bold text-white drop-shadow-lg bg-black/40 px-3 py-1 rounded-lg">{game.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownGames; 