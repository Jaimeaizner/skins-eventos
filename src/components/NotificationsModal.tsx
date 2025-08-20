import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  color: string;
  icon: string;
  message: string;
}

const initialNotifications: Notification[] = [
  // Notificações de progresso de rifa/leilão
  { id: '1', type: 'progress', color: 'bg-blue-500', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' vendeu 50% dos bilhetes." },
  { id: '2', type: 'progress', color: 'bg-yellow-400', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' vendeu 75% dos bilhetes." },
  { id: '3', type: 'progress', color: 'bg-green-500', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' atingiu o mínimo para ser executada!" },
  { id: '4', type: 'progress', color: 'bg-pink-500', icon: '🎫', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' vendeu 90% dos bilhetes." },
  { id: '5', type: 'final', color: 'bg-purple-600', icon: '🏆', message: "A rifa que você participa da arma 'AK-47 | Fire Serpent' foi finalizada! O vencedor foi User_12345." },
  // Notificação de vitória
  { id: '6', type: 'win', color: 'bg-gradient-to-r from-yellow-400 to-pink-500', icon: '🥳', message: "Parabéns! Você venceu a rifa da arma 'AWP | Dragon Lore'!" },
  // Notificação de lance coberto
  { id: '7', type: 'bid-over', color: 'bg-red-500', icon: '💸', message: "Sua oferta de R$ 500 no leilão da arma 'M4A4 | Howl' foi coberta por outro usuário. Seu saldo foi liberado." },
  // Notificações de tempo restante (para quem está ganhando)
  { id: '8', type: 'time-warning', color: 'bg-red-600', icon: '⏰', message: "Seu leilão termina em menos de 5 minutos!" },
  { id: '9', type: 'time-warning', color: 'bg-orange-400', icon: '⏰', message: "Seu leilão termina em menos de 1 hora!" },
];

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  
  // Carregar notificações do localStorage ou usar as iniciais
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('epicsTrade_unreadNotifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });
  
  const [readNotifications, setReadNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('epicsTrade_readNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Salvar notificações no localStorage sempre que mudarem
  const saveToStorage = (unread: Notification[], read: Notification[]) => {
    localStorage.setItem('epicsTrade_unreadNotifications', JSON.stringify(unread));
    localStorage.setItem('epicsTrade_readNotifications', JSON.stringify(read));
  };
  
  if (!open) return null;
  
  const currentNotifications = activeTab === 'unread' ? unreadNotifications : readNotifications;
  
  // Marcar uma notificação como lida
  const markAsRead = (notificationId: string) => {
    const notification = unreadNotifications.find(n => n.id === notificationId);
    if (notification) {
      const newUnread = unreadNotifications.filter(n => n.id !== notificationId);
      const newRead = [...readNotifications, notification];
      setUnreadNotifications(newUnread);
      setReadNotifications(newRead);
      saveToStorage(newUnread, newRead);
    }
  };
  
  // Marcar todas como lidas
  const markAllAsRead = () => {
    const newRead = [...readNotifications, ...unreadNotifications];
    setReadNotifications(newRead);
    setUnreadNotifications([]);
    saveToStorage([], newRead);
    setActiveTab('read');
  };
  
  // Limpar todas as notificações lidas
  const clearAllRead = () => {
    setReadNotifications([]);
    saveToStorage(unreadNotifications, []);
  };
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
      {/* Modal */}
      <div className="relative z-[10000] w-full max-w-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl shadow-2xl p-6 border border-white/20">
        <button className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-pink-400 transition-colors" onClick={onClose}>×</button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Notificações</h2>
        
        {/* Botões de navegação */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'unread'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            Notificações
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'read'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            Já Lidas
          </button>
        </div>
        
        {/* Botão "Ler todas as notificações" */}
        {activeTab === 'unread' && unreadNotifications.length > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={markAllAsRead}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-300"
            >
              📖 Ler Todas as Notificações
            </button>
          </div>
        )}
        
        {/* Botão "Limpar todas" para notificações já lidas */}
        {activeTab === 'read' && readNotifications.length > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={clearAllRead}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300"
            >
              🗑️ Limpar Todas
            </button>
          </div>
        )}
        
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {currentNotifications.map((notif) => (
            <div key={notif.id} className={`flex items-center justify-between gap-4 rounded-xl p-4 shadow ${
              activeTab === 'read' ? 'bg-gray-500 bg-opacity-80' : `${notif.color} bg-opacity-80`
            }`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{notif.icon}</span>
                <span className="text-white font-semibold text-sm">{notif.message}</span>
              </div>
              
              {/* Botão para marcar como lida (apenas na aba unread) */}
              {activeTab === 'unread' && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-xs font-semibold transition-all duration-300"
                >
                  ✓ Lida
                </button>
              )}
            </div>
          ))}
          
          {/* Mensagem quando não há notificações */}
          {currentNotifications.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">
                {activeTab === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação lida'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal; 