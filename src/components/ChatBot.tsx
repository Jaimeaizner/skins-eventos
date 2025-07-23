import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaRobot, FaUser } from 'react-icons/fa';
import Fuse from 'fuse.js';
import { useLocation } from 'react-router-dom';

const FAQ = [
  {
    question: 'Como participo de uma rifa?',
    answer: 'Para participar, basta escolher a rifa desejada, selecionar a quantidade de bilhetes e clicar em COMPRAR. O valor será descontado do seu saldo.'
  },
  {
    question: 'Como participo de um leilão?',
    answer: 'Nos leilões, você pode dar lances usando seu saldo. O maior lance ao final do tempo vence.'
  },
  {
    question: 'Como ganho pontos?',
    answer: 'Você ganha 1 ponto a cada R$10 gastos em rifas pagas e 1 ponto a cada R$5 de lucro gerado ao criar uma rifa (após conclusão bem-sucedida).'
  },
  {
    question: 'Para que servem os pontos?',
    answer: 'Os pontos podem ser usados para participar de rifas grátis criadas pela administração do site.'
  },
  {
    question: 'Posso criar eventos grátis?',
    answer: 'Não. Apenas a administração pode criar eventos grátis.'
  },
  {
    question: 'Como funciona o saldo bloqueado?',
    answer: 'O saldo bloqueado representa valores temporariamente indisponíveis, geralmente por participação em rifas/leilões em andamento.'
  },
  {
    question: 'É seguro usar o site?',
    answer: 'Sim! Utilizamos autenticação via Steam, pagamentos seguros e todas as transações são registradas no Firestore.'
  },
  {
    question: 'Como recebo minha skin?',
    answer: 'Ao vencer uma rifa ou leilão, você receberá uma oferta de troca na Steam para retirar sua skin.'
  },
  {
    question: 'O que acontece se eu não aceitar a oferta?',
    answer: 'Se não aceitar a oferta em até 7 dias, a skin pode ser re-sorteada ou devolvida ao site.'
  },
  {
    question: 'Como funciona a carência de 7 dias?',
    answer: 'Após enviar uma skin para o site, ela fica bloqueada por 7 dias antes de poder ser usada em rifas/leilões, conforme regras da Steam.'
  },
  {
    question: 'Quais taxas o site cobra?',
    answer: 'O site cobra uma taxa sobre o lucro das rifas e leilões. O valor exato é informado no momento da criação.'
  },
  {
    question: 'Como posso entrar em contato com o suporte?',
    answer: 'Se sua dúvida não foi respondida, clique em "Falar com o suporte" no final deste chat.'
  }
];

const fuse = new Fuse(FAQ, { keys: ['question'], threshold: 0.4 });

const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Olá! Sou o bot de dúvidas do Skins Rifas. Pergunte algo ou escolha uma dúvida frequente abaixo.' }
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Zerar chat ao trocar de página
  useEffect(() => {
    setMessages([
      { from: 'bot', text: 'Olá! Sou o bot de dúvidas do Skins Rifas. Pergunte algo ou escolha uma dúvida frequente abaixo.' }
    ]);
    setInput('');
  }, [location.pathname]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text }]);
    // Buscar resposta
    const result = fuse.search(text);
    if (result.length > 0) {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { from: 'bot', text: result[0].item.answer }]);
      }, 500);
    } else {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { from: 'bot', text: 'Desculpe, não entendi sua dúvida. Tente reformular ou clique em "Falar com o suporte".' }]);
      }, 500);
    }
    setInput('');
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        className="fixed bottom-2 right-2 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chat de dúvidas"
      >
        <FaComments className="w-7 h-7" />
      </button>
      {/* Janela do chat */}
      {open && (
        <div className="fixed bottom-20 right-2 z-50 w-full max-w-lg max-h-[52rem] bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col animate-fade-in" style={{minWidth: '26rem'}}>
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FaRobot className="text-blue-400 w-6 h-6" />
              <span className="text-white font-bold text-lg">Dúvidas?</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white text-2xl font-bold hover:text-pink-400">×</button>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '28rem' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`rounded-xl px-4 py-2 max-w-[80%] shadow text-sm ${msg.from === 'bot' ? 'bg-blue-800 bg-opacity-70 text-white' : 'bg-pink-600 text-white'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/10 bg-black bg-opacity-20 rounded-b-2xl">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                className="flex-1 rounded-lg px-3 py-2 bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Digite sua dúvida..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-bold">Enviar</button>
            </form>
            <div className="mt-2 max-h-48 overflow-y-auto flex flex-wrap gap-2">
              {FAQ.map((item, i) => (
                <button
                  key={i}
                  className="bg-white bg-opacity-10 hover:bg-opacity-20 text-blue-200 rounded-lg px-3 py-1 text-xs font-semibold"
                  onClick={() => handleSend(item.question)}
                >
                  {item.question}
                </button>
              ))}
            </div>
            <div className="mt-3 text-center">
              <button className="text-xs text-pink-300 underline hover:text-pink-400">Falar com o suporte</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot; 