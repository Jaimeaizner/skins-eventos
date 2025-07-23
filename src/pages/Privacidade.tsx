export default function Privacidade() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-6 text-center">Política de Privacidade – Skins Rifas</h1>
        <p className="text-white/90 mb-4">Coletamos apenas os dados necessários para o funcionamento seguro e eficiente da plataforma.</p>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">1. Dados que coletamos:</h2>
        <ul className="list-disc list-inside text-white/80 space-y-1 mb-4">
          <li>SteamID, nome e avatar da Steam</li>
          <li>E-mail (caso fornecido)</li>
          <li>Endereço IP (para segurança e prevenção de fraudes)</li>
          <li>Histórico de rifas, leilões, compras e vendas</li>
        </ul>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">2. Finalidade do uso:</h2>
        <ul className="list-disc list-inside text-white/80 space-y-1 mb-4">
          <li>Identificação e autenticação do usuário</li>
          <li>Execução de funcionalidades do site</li>
          <li>Prevenção de fraudes e abuso</li>
        </ul>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">3. Compartilhamento de dados:</h2>
        <p className="text-white/80 mb-4">Não vendemos nem compartilhamos seus dados com terceiros, exceto quando exigido por lei.</p>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">4. Cookies:</h2>
        <p className="text-white/80 mb-4">Utilizamos cookies estritamente para manter sessões ativas e melhorar a experiência do usuário. Não usamos cookies de rastreamento de terceiros.</p>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">5. Seus direitos (LGPD):</h2>
        <ul className="list-disc list-inside text-white/80 space-y-1 mb-4">
          <li>Solicitar acesso, correção ou exclusão de seus dados</li>
          <li>Solicitar encerramento de conta</li>
          <li>Revogar consentimento, salvo para dados essenciais ao uso da plataforma</li>
        </ul>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">6. Segurança:</h2>
        <p className="text-white/80 mb-4">Adotamos medidas de segurança técnica e organizacional para proteger seus dados.</p>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">7. Contato para privacidade:</h2>
        <p className="text-white/80 mb-2">Envie solicitações para: <a href="mailto:privacidade@skinsrifas.com" className="text-blue-300 underline">privacidade@skinsrifas.com</a></p>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">8. Retenção dos dados:</h2>
        <p className="text-white/80 mb-4">Seus dados serão mantidos enquanto sua conta estiver ativa e pelo prazo necessário para cumprimento de obrigações legais ou defesa de direitos.</p>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">9. Transferência internacional:</h2>
        <p className="text-white/80 mb-4">Seus dados podem ser processados em servidores localizados fora do Brasil, respeitando a legislação aplicável.</p>
        <h2 className="text-xl font-bold text-white mt-6 mb-2">10. Atualização desta política:</h2>
        <p className="text-white/80 mb-2">Esta política pode ser alterada a qualquer momento. Notificaremos os usuários em caso de mudanças relevantes.</p>
      </div>
    </div>
  );
} 