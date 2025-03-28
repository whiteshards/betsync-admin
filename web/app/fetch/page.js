'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNavbar from '@/components/sidebar';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const CRYPTO_COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#00FFA3',
  USDT: '#26A17B',
  LTC: '#BFBBBB',
  DOGE: '#C2A633'
};

export default function FetchPage() {
  const [serverId, setServerId] = useState('');
  const [serverData, setServerData] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const username = Cookies.get('username') || 'Admin';

  const fetchServerData = async () => {
    if (!serverId.trim()) {
      setError('Please enter a server ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fetch?id=${encodeURIComponent(serverId)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch server data');
      }

      setServerData(result.data);
      setCryptoPrices(result.cryptoPrices);
    } catch (err) {
      setError(err.message);
      setServerData(null);
    } finally {
      setLoading(false);
    }
  };

  // Format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <TopNavbar username={username} />

      <div className="pt-20 px-6 pb-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">BetSync Server Lookup</h1>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a] mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              placeholder="Enter server ID"
              className="flex-1 bg-[#2a2a2a] border border-[#333333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            />
            <button
              onClick={fetchServerData}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Server'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {serverData && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a]">
            <h2 className="text-xl font-semibold mb-4">{serverData.serverName}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-[#222222] rounded-lg p-4 border border-[#2a2a2a]">
                  <h3 className="text-lg font-medium mb-2">Server Information</h3>
                  <p className="text-gray-300">ID: {serverData.serverId}</p>
                  <p className="text-gray-300">Members: {serverData.memberCount}</p>
                  <p className="text-gray-300">Transactions: {serverData.transactions.length}</p>
                  <p className="text-gray-300">Total Volume: ${formatCurrency(serverData.totalVolumeUSD)}</p>
                  <p className="text-gray-300">Profit: ${formatCurrency(serverData.totalProfitUSD)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#222222] rounded-lg p-4 border border-[#2a2a2a]">
                  <h3 className="text-lg font-medium mb-2">Crypto Wallets</h3>
                  {Object.entries(serverData.cryptoValues).map(([crypto, data]) => (
                    <div key={crypto} className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: CRYPTO_COLORS[crypto] || '#888' }}
                        ></div>
                        <span>{crypto}</span>
                      </div>
                      <span>${formatCurrency(data.valueUSD)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}