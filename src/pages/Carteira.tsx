import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Carteira() {
  const { balance, lockedBalance, updateBalance } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [showLockedInfo, setShowLockedInfo] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      updateBalance(amount);
      setDepositAmount('');
      // Aqui você implementaria a integração com gateway de pagamento
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= balance - lockedBalance) {
      updateBalance(-amount);
      setWithdrawAmount('');
      // Aqui você implementaria a integração com gateway de pagamento
    }
  };

  const paymentMethods = [
    { id: 'pix', name: 'PIX', icon: '💳', color: 'from-green-500 to-emerald-500' },
    { id: 'card', name: 'Cartão de Crédito', icon: '💳', color: 'from-blue-500 to-indigo-500' },
    { id: 'transfer', name: 'Transferência Bancária', icon: '🏦', color: 'from-purple-500 to-pink-500' },
    { id: 'crypto', name: 'Criptomoedas', icon: '₿', color: 'from-yellow-500 to-orange-500' },
  ];

  const cryptoOptions = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: 'Ł' },
    { id: 'usdt', name: 'USDT', symbol: 'USDT', icon: '💎' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            {t('page.wallet')}
          </h1>
          <p className="text-gray-400">
            Gerencie seu saldo e faça transações
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Saldos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Saldo Total */}
            <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>{t('wallet.balance')}</span>
              </h2>
              <div className="text-3xl font-black text-green-400 mb-2">
                R$ {balance.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">
                Saldo disponível para uso
              </p>
            </div>

            {/* Saldo Bloqueado */}
            <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{t('wallet.locked')}</span>
                <button
                  onClick={() => setShowLockedInfo(!showLockedInfo)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </h2>
              <div className="text-3xl font-black text-red-400 mb-2">
                R$ {lockedBalance.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">
                Reservado para lances ativos
              </p>
            </div>

            {/* Histórico de Transações */}
            <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{t('wallet.transaction_history')}</span>
              </h2>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300">
                Ver Histórico
              </button>
            </div>
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-2">
            <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl border border-white border-opacity-20 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white border-opacity-20">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                    activeTab === 'deposit'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {t('wallet.deposit')}
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                    activeTab === 'withdraw'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {t('wallet.withdraw')}
                </button>
              </div>

              {/* Conteúdo dos Tabs */}
              <div className="p-6">
                {activeTab === 'deposit' ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {t('wallet.deposit')} com Métodos de Pagamento
                    </h3>
                    
                    {/* Métodos de Pagamento */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          className={`p-4 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition-all duration-300 ${
                            method.color.includes('gradient') 
                              ? `bg-gradient-to-r ${method.color}` 
                              : 'bg-white bg-opacity-10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{method.icon}</span>
                            <span className="text-white font-semibold">{method.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Criptomoedas */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Criptomoedas
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {cryptoOptions.map((crypto) => (
                          <button
                            key={crypto.id}
                            className="p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg hover:border-opacity-40 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{crypto.icon}</span>
                              <div className="text-left">
                                <div className="text-white font-semibold">{crypto.name}</div>
                                <div className="text-gray-400 text-sm">{crypto.symbol}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Valor do Depósito */}
                    <div className="mt-6">
                      <label className="block text-white font-semibold mb-2">
                        Valor do Depósito
                      </label>
                      <div className="flex space-x-4">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0,00"
                          className="flex-1 px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleDeposit}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300"
                        >
                          Depositar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {t('wallet.withdraw')} Fundos
                    </h3>
                    
                    <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-yellow-400 font-semibold">
                          Saldo disponível para saque: R$ {(balance - lockedBalance).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Métodos de Saque */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {paymentMethods.slice(0, 3).map((method) => (
                        <button
                          key={method.id}
                          className="p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg hover:border-opacity-40 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{method.icon}</span>
                            <span className="text-white font-semibold">{method.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Valor do Saque */}
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Valor do Saque
                      </label>
                      <div className="flex space-x-4">
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0,00"
                          max={balance - lockedBalance}
                          className="flex-1 px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleWithdraw}
                          disabled={parseFloat(withdrawAmount) > balance - lockedBalance}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300"
                        >
                          Sacar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Informações sobre Dinheiro Bloqueado */}
        {showLockedInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-black bg-opacity-90 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xl font-bold text-white">Dinheiro Bloqueado</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {t('wallet.locked_explanation')}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLockedInfo(false)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 