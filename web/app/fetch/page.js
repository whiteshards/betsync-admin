
'use client';

import { useState } from 'react';
import Link from 'next/link';

// Define crypto colors
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">BetSync Server Lookup</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">Back to Home</Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              placeholder="Enter server ID"
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchServerData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Server'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {serverData && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">{serverData.serverName}</h2>
            <div className="text-lg mb-6 text-center">
              Total Profit: <span className="font-semibold text-blue-600">${formatCurrency(serverData.totalProfitUSD)}</span>
            </div>
            
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Server ID</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">{serverData.serverId}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Server Name</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">{serverData.serverName}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Total Profit</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">${formatCurrency(serverData.totalProfitUSD)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Server's Cut (30%)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">${formatCurrency(serverData.serverCut)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Region</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">{serverData.region}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Giveaway Channel</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">{serverData.giveawayChannel || 'None'}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Whitelisted Channels</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">
                      {serverData.whitelist && serverData.whitelist.length > 0 
                        ? serverData.whitelist.join(', ') 
                        : 'None'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Status</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {serverData.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Crypto Wallet Details */}
            {Object.keys(serverData.cryptoValues || {}).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-center">Wallet Details</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrency</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (USD)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(serverData.cryptoValues || {}).map(([crypto, data], index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: (CRYPTO_COLORS[crypto] || '#8884d8') + '20' }}>
                              <span className="text-sm font-bold" style={{ color: CRYPTO_COLORS[crypto] || '#8884d8' }}>{crypto}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {crypto === 'BTC' && 'Bitcoin'}
                              {crypto === 'ETH' && 'Ethereum'}
                              {crypto === 'SOL' && 'Solana'}
                              {crypto === 'USDT' && 'Tether'}
                              {crypto === 'LTC' && 'Litecoin'}
                              {crypto === 'DOGE' && 'Dogecoin'}
                              {!['BTC', 'ETH', 'SOL', 'USDT', 'LTC', 'DOGE'].includes(crypto) && crypto}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{data.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">${formatCurrency(data.priceUSD)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">${formatCurrency(data.valueUSD)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
