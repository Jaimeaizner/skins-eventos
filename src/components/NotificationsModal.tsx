import { useState } from 'react';

const mockNotifications = {
  participations: [
    // Notificações de progresso de rifa/leilão
    { type: 'progress', color: 'bg-blue-500', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' vendeu 50% dos bilhetes." },
    { type: 'progress', color: 'bg-yellow-400', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' vendeu 75% dos bilhetes." },
    { type: 'progress', color: 'bg-green-500', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' atingiu o mínimo para ser executada!" },
    { type: 'progress', color: 'bg-pink-500', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' vendeu 90% dos bilhetes." },
    { type: 'final', color: 'bg-purple-600', icon: '🏆', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' foi finalizada! O vencedor foi User_12345." },
    // Notificação de vitória
    { type: 'win', color: 'bg-gradient-to-r from-yellow-400 to-pink-500', icon: '🥳', message: "Parabéns! Você venceu a rifa da arma 'AWP | Dragon Lore'!" },
    // Notificação de lance coberto
    { type: 'bid-over', color: 'bg-red-500', icon: '💸', message: "Sua oferta de R$ 500 no leilão da arma 'M4A4 | Howl' foi coberta por outro usuário. Seu saldo foi liberado." },
    // Notificações de tempo restante (para quem está ganhando)
    { type: 'time-warning', color: 'bg-red-600', icon: '⏰', message: "Seu leilão termina em menos de 5 minutos!" },
    { type: 'time-warning', color: 'bg-orange-400', icon: '⏰', message: "Seu leilão termina em menos de 1 hora!" },
  ],
  created: [
    // Notificações para criador
    { type: 'creator-progress', color: 'bg-blue-400', icon: '🛠️', message: "Sua rifa 'Desert Eagle | Golden Koi' atingiu 50% dos bilhetes!" },
    { type: 'creator-progress', color: 'bg-green-600', icon: '🛠️', message: "Sua rifa 'Desert Eagle | Golden Koi' atingiu 75% dos bilhetes!" },
    { type: 'creator-final', color: 'bg-purple-700', icon: '🛠️', message: "Seu leilão 'Karambit | Fade' foi finalizado! O vencedor foi User_67890." },
    { type: 'creator-bid', color: 'bg-green-600', icon: '💰', message: "Novo lance de R$ 800 no seu leilão 'Karambit | Fade'." },
    { type: 'creator-bid', color: 'bg-yellow-500', icon: '💰', message: "Novo lance de R$ 1200 no seu leilão 'Karambit | Fade'." },
    { type: 'creator-time', color: 'bg-orange-500', icon: '⏰', message: "Seu leilão 'Karambit | Fade' termina em 2 horas!" },
  ]
};

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'participations' | 'created'>('participations');
  
  if (!open) return null;
  
  const currentNotifications = mockNotifications[activeTab];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl shadow-2xl p-6 border border-white/20">
        <button className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-pink-400 transition-colors" onClick={onClose}>×</button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Notificações</h2>
        
        {/* Botões de navegação */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('participations')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'participations'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            Eu Participo
          </button>
          <button
            onClick={() => setActiveTab('created')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'created'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            Que Criei
          </button>
        </div>
        
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {currentNotifications.map((notif, i) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl p-4 shadow ${notif.color} bg-opacity-80`}>
              <span className="text-2xl">{notif.icon}</span>
              <span className="text-white font-semibold text-sm">{notif.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal; 