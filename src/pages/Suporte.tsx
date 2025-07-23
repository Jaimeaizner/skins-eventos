import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export default function Suporte() {
  const { currentUser } = useAuth();
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTickets() {
      if (!currentUser) return;
      const q = query(collection(db, 'tickets'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchTickets();
  }, [currentUser]);

  async function enviarTicket(e: any) {
    e.preventDefault();
    if (!assunto || !mensagem) return;
    await addDoc(collection(db, 'tickets'), {
      userId: currentUser.uid,
      assunto,
      mensagem,
      status: 'aberto',
      data: new Date().toISOString()
    });
    setAssunto('');
    setMensagem('');
    // Atualizar lista
    const q = query(collection(db, 'tickets'), where('userId', '==', currentUser.uid));
    const snap = await getDocs(q);
    setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">Suporte</h1>
        <form onSubmit={enviarTicket} className="bg-white bg-opacity-10 rounded-xl p-6 mb-8 flex flex-col gap-4">
          <input type="text" placeholder="Assunto" value={assunto} onChange={e => setAssunto(e.target.value)} className="rounded-lg px-4 py-2 bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          <textarea placeholder="Descreva seu problema ou dúvida..." value={mensagem} onChange={e => setMensagem(e.target.value)} className="rounded-lg px-4 py-2 bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400" rows={4} />
          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-6 py-2 font-bold self-end">Enviar Ticket</button>
        </form>
        <h2 className="text-xl font-bold text-white mb-4">Meus Tickets</h2>
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-black bg-opacity-30 rounded-lg p-4 border border-white/10">
              <div className="font-bold text-pink-300">{ticket.assunto}</div>
              <div className="text-gray-200 mb-2">{ticket.mensagem}</div>
              <div className="text-xs text-gray-400">Status: {ticket.status} | {new Date(ticket.data).toLocaleString('pt-BR')}</div>
            </div>
          ))}
          {tickets.length === 0 && <div className="text-gray-400">Nenhum ticket aberto.</div>}
        </div>
      </div>
    </div>
  );
} 