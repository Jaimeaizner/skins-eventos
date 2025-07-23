import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaTicketAlt, FaGavel, FaUsers, FaExclamationTriangle, FaClipboardList, FaLock } from 'react-icons/fa';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc, query, where, orderBy, addDoc } from 'firebase/firestore';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { key: 'eventos', label: 'Eventos', icon: <FaTicketAlt /> },
  { key: 'leiloes', label: 'Leilões', icon: <FaGavel /> },
  { key: 'usuarios', label: 'Usuários', icon: <FaUsers /> },
  { key: 'denuncias', label: 'Denúncias', icon: <FaExclamationTriangle /> },
  { key: 'logs', label: 'Logs', icon: <FaClipboardList /> },
];

export default function Admin() {
  const [section, setSection] = useState('dashboard');
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<any[]>([]);
  const [leiloes, setLeiloes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  // Exemplo de proteção (substituir por lógica real de permissão)
  const isAdmin = true;
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FaLock className="text-5xl text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">Acesso restrito</h2>
        <p className="text-gray-300">Você não tem permissão para acessar esta página.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold">Voltar</button>
      </div>
    );
  }

  useEffect(() => {
    async function fetchData() {
      // Eventos
      const eventosSnap = await getDocs(collection(db, 'eventos'));
      setEventos(eventosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Leilões
      const leiloesSnap = await getDocs(collection(db, 'leiloes'));
      setLeiloes(leiloesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Usuários
      const usuariosSnap = await getDocs(collection(db, 'users'));
      setUsuarios(usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Denúncias
      const denunciasSnap = await getDocs(collection(db, 'denuncias'));
      setDenuncias(denunciasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Logs
      const logsSnap = await getDocs(query(collection(db, 'logs'), orderBy('date', 'desc')));
      setLogs(logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Tickets de suporte
      const ticketsSnap = await getDocs(collection(db, 'tickets'));
      setTickets(ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchData();
  }, []);

  // Função auxiliar para registrar log no Firestore
  async function registrarLog(action: string, details: string) {
    await addDoc(collection(db, 'logs'), {
      date: new Date().toISOString(),
      action,
      user: 'admin', // Substituir pelo admin real logado
      details
    });
  }

  // Funções administrativas (exemplo)
  async function banirUsuario(uid: string, motivo: string) {
    await updateDoc(doc(db, 'users', uid), { status: 'banido', motivoBan: motivo });
    setLogs((logs: any[]) => [{ date: new Date().toISOString(), action: 'Usuário banido', user: 'admin', details: `Motivo: ${motivo}` }, ...logs]);
    await registrarLog('Usuário banido', `Usuário: ${uid}, Motivo: ${motivo}`);
  }
  async function aprovarEvento(id: string) {
    await updateDoc(doc(db, 'eventos', id), { status: 'aprovado' });
    setLogs((logs: any[]) => [{ date: new Date().toISOString(), action: 'Evento aprovado', user: 'admin', details: `Evento: ${id}` }, ...logs]);
    await registrarLog('Evento aprovado', `Evento: ${id}`);
  }
  async function bloquearEvento(id: string) {
    await updateDoc(doc(db, 'eventos', id), { status: 'bloqueada' });
    setLogs((logs: any[]) => [{ date: new Date().toISOString(), action: 'Evento bloqueada', user: 'admin', details: `Evento: ${id}` }, ...logs]);
    await registrarLog('Evento bloqueada', `Evento: ${id}`);
  }
  async function finalizarEvento(id: string) {
    await updateDoc(doc(db, 'eventos', id), { status: 'finalizada' });
    setLogs((logs: any[]) => [{ date: new Date().toISOString(), action: 'Evento finalizada', user: 'admin', details: `Evento: ${id}` }, ...logs]);
    await registrarLog('Evento finalizada', `Evento: ${id}`);
  }
  async function resolverDenuncia(id: string) {
    await updateDoc(doc(db, 'denuncias', id), { status: 'resolvida' });
    setLogs((logs: any[]) => [{ date: new Date().toISOString(), action: 'Denúncia resolvida', user: 'admin', details: `Denúncia: ${id}` }, ...logs]);
    await registrarLog('Denúncia resolvida', `Denúncia: ${id}`);
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      {/* Sidebar */}
      <aside className="w-56 bg-black bg-opacity-40 backdrop-blur-md border-r border-white/10 flex flex-col p-4 gap-2">
        <h1 className="text-2xl font-bold text-white mb-6">Painel Admin</h1>
        {SECTIONS.map(s => (
          <button
            key={s.key}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-left ${section === s.key ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'}`}
            onClick={() => setSection(s.key)}
          >
            <span className="text-lg">{s.icon}</span>
            {s.label}
          </button>
        ))}
        <button onClick={() => navigate('/')} className="mt-auto px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-bold">Voltar ao site</button>
      </aside>
      {/* Conteúdo principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {section === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Visão Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
              <div className="bg-gradient-to-br from-purple-700 to-pink-700 rounded-xl p-6 shadow-xl flex flex-col items-center">
                <FaTicketAlt className="text-3xl text-white mb-2" />
                <span className="text-2xl font-bold text-white">{eventos.length}</span>
                <span className="text-gray-200">Eventos ativos</span>
              </div>
              <div className="bg-gradient-to-br from-pink-700 to-yellow-500 rounded-xl p-6 shadow-xl flex flex-col items-center">
                <FaGavel className="text-3xl text-white mb-2" />
                <span className="text-2xl font-bold text-white">{leiloes.length}</span>
                <span className="text-gray-200">Leilões ativos</span>
              </div>
              <div className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-xl p-6 shadow-xl flex flex-col items-center">
                <FaUsers className="text-3xl text-white mb-2" />
                <span className="text-2xl font-bold text-white">{usuarios.length}</span>
                <span className="text-gray-200">Usuários</span>
              </div>
              <div className="bg-gradient-to-br from-yellow-600 to-red-600 rounded-xl p-6 shadow-xl flex flex-col items-center">
                <FaExclamationTriangle className="text-3xl text-white mb-2" />
                <span className="text-2xl font-bold text-white">{denuncias.length}</span>
                <span className="text-gray-200">Denúncias</span>
              </div>
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 shadow-xl flex flex-col items-center">
                <FaClipboardList className="text-3xl text-white mb-2" />
                <span className="text-2xl font-bold text-white">{logs.length}</span>
                <span className="text-gray-200">Logs</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Últimas ações</h3>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow border border-white/10">
              <table className="w-full text-left text-white text-sm">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Ação</th>
                    <th className="py-2 px-3">Usuário</th>
                    <th className="py-2 px-3">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border-b border-white/10 last:border-0">
                      <td className="py-2 px-3 whitespace-nowrap">{log.date}</td>
                      <td className="py-2 px-3">{log.action}</td>
                      <td className="py-2 px-3">{log.user}</td>
                      <td className="py-2 px-3">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'eventos' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Eventos</h2>
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Buscar Evento..."
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <select
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="ativa">Ativa</option>
                <option value="finalizada">Finalizada</option>
                <option value="bloqueada">Bloqueada</option>
                <option value="aprovada">Aprovada</option>
              </select>
            </div>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow border border-white/10">
              <table className="w-full text-left text-white text-sm">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Título</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Participantes</th>
                    <th className="py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos
                    .filter(evento =>
                      evento.titulo.toLowerCase().includes(busca.toLowerCase()) &&
                      (filtroStatus === '' || evento.status === filtroStatus)
                    )
                    .map((evento, i) => (
                      <tr key={i} className="border-b border-white/10 last:border-0">
                        <td className="py-2 px-3">{evento.id}</td>
                        <td className="py-2 px-3">{evento.titulo}</td>
                        <td className="py-2 px-3">{evento.status}</td>
                        <td className="py-2 px-3">{evento.participantes || 0}</td>
                        <td className="py-2 px-3">
                          <button className="text-pink-400 underline mr-2">Ver</button>
                          {evento.status === 'ativa' && (
                            <>
                              <button onClick={() => bloquearEvento(evento.id)} className="text-red-400 underline mr-2">Bloquear</button>
                              <button onClick={() => finalizarEvento(evento.id)} className="text-yellow-400 underline mr-2">Finalizar</button>
                            </>
                          )}
                          {evento.status === 'bloqueada' && (
                            <button onClick={() => aprovarEvento(evento.id)} className="text-green-400 underline">Aprovar</button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'leiloes' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Leilões</h2>
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Buscar Leilão..."
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <select
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow border border-white/10">
              <table className="w-full text-left text-white text-sm">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Título</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Lances</th>
                    <th className="py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leiloes
                    .filter(leilao =>
                      leilao.titulo.toLowerCase().includes(busca.toLowerCase()) &&
                      (filtroStatus === '' || leilao.status === filtroStatus)
                    )
                    .map((leilao, i) => (
                      <tr key={i} className="border-b border-white/10 last:border-0">
                        <td className="py-2 px-3">{leilao.id}</td>
                        <td className="py-2 px-3">{leilao.titulo}</td>
                        <td className="py-2 px-3">{leilao.status}</td>
                        <td className="py-2 px-3">{leilao.lances || 0}</td>
                        <td className="py-2 px-3">
                          <button className="text-pink-400 underline mr-2">Ver</button>
                          {leilao.status === 'ativo' && (
                            <button className="text-yellow-400 underline">Finalizar</button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'usuarios' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Usuários</h2>
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Buscar Usuário..."
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <select
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="banido">Banido</option>
              </select>
            </div>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow border border-white/10">
              <table className="w-full text-left text-white text-sm">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Nome</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios
                    .filter(usuario =>
                      usuario.displayName.toLowerCase().includes(busca.toLowerCase()) &&
                      (filtroStatus === '' || usuario.status === filtroStatus)
                    )
                    .map((usuario, i) => (
                      <tr key={i} className="border-b border-white/10 last:border-0">
                        <td className="py-2 px-3">{usuario.id}</td>
                        <td className="py-2 px-3">{usuario.displayName}</td>
                        <td className="py-2 px-3">{usuario.status}</td>
                        <td className="py-2 px-3">
                          <button className="text-pink-400 underline mr-2">Ver</button>
                          {usuario.status === 'banido' && (
                            <button onClick={() => banirUsuario(usuario.id, 'Re-banido')} className="text-green-400 underline">Re-banir</button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'denuncias' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Denúncias / Suporte</h2>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow border border-white/10 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Tickets de Suporte</h3>
              <table className="w-full text-left text-white text-sm">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Usuário</th>
                    <th className="py-2 px-3">Assunto</th>
                    <th className="py-2 px-3">Mensagem</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="border-b border-white/10 last:border-0">
                      <td className="py-2 px-3">{ticket.id}</td>
                      <td className="py-2 px-3">{ticket.userId}</td>
                      <td className="py-2 px-3">{ticket.assunto}</td>
                      <td className="py-2 px-3">{ticket.mensagem}</td>
                      <td className="py-2 px-3">{ticket.status}</td>
                      <td className="py-2 px-3">
                        {ticket.status !== 'resolvido' && (
                          <button onClick={async () => { await updateDoc(doc(db, 'tickets', ticket.id), { status: 'resolvido' }); setTickets(tickets.map(t => t.id === ticket.id ? { ...t, status: 'resolvido' } : t)); }} className="text-green-400 underline">Marcar como resolvido</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6">Denúncias</h2>
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Buscar Denúncia..."
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <select
                className="p-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="aberta">Aberta</option>
                <option value="resolvida">Resolvida</option>
              </select>
            </div>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow border border-white/10">
              <table className="w-full text-left text-white text-sm">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Tipo</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {denuncias
                    .filter(denuncia =>
                      denuncia.tipo.toLowerCase().includes(busca.toLowerCase()) &&
                      (filtroStatus === '' || denuncia.status === filtroStatus)
                    )
                    .map((denuncia, i) => (
                      <tr key={i} className="border-b border-white/10 last:border-0">
                        <td className="py-2 px-3">{denuncia.id}</td>
                        <td className="py-2 px-3">{denuncia.tipo}</td>
                        <td className="py-2 px-3">{denuncia.status}</td>
                        <td className="py-2 px-3">
                          <button className="text-pink-400 underline mr-2">Ver</button>
                          {denuncia.status === 'aberta' && (
                            <button onClick={() => resolverDenuncia(denuncia.id)} className="text-green-400 underline">Resolver</button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'logs' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Logs de Auditoria</h2>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 shadow border border-white/10">
              <table className="w-full text-left text-white text-sm">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Ação</th>
                    <th className="py-2 px-3">Usuário</th>
                    <th className="py-2 px-3">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border-b border-white/10 last:border-0">
                      <td className="py-2 px-3 whitespace-nowrap">{log.date}</td>
                      <td className="py-2 px-3">{log.action}</td>
                      <td className="py-2 px-3">{log.user}</td>
                      <td className="py-2 px-3">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 