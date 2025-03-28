'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import TopNavbar from '@/components/sidebar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CRYPTO_COLORS = {
  BTC: '#f7931a',
  ETH: '#627eea',
  SOL: '#14f195',
  DOGE: '#ba9f33',
  USDT: '#26a17b'
};

export default function ServersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [serverData, setServerData] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [selectedServer, setSelectedServer] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = Cookies.get('isAuthenticated');
    const storedUsername = Cookies.get('username');

    if (isAuthenticated !== 'true') {
      router.push('/');
    } else {
      setUsername(storedUsername || 'Admin');
      fetchServerData();
    }
  }, [router]);

  const fetchServerData = async () => {
    try {
      const response = await fetch('/api/servers');
      const { data, cryptoPrices } = await response.json();

      if (data) {
        setServerData(data);
      }

      if (cryptoPrices) {
        setCryptoPrices(cryptoPrices);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching server data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('username');
    router.push('/');
  };

  const handleServerClick = (server) => {
    setSelectedServer(server);
  };

  const handleBackClick = () => {
    setSelectedServer(null);
  };

  // Format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Data formatting for the pie chart (crypto distribution)
  const getWalletPieData = (server) => {
    if (!server || !server.cryptoValues) return [];

    return Object.entries(server.cryptoValues).map(([crypto, data]) => ({
      name: crypto,
      value: data.valueUSD
    }));
  };

  // Server pie data by profit
  const serverPieData = serverData.slice(0, 5).map(server => ({
    name: server.serverName,
    value: server.totalProfitUSD
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <TopNavbar username={username} />

      <main className="pt-20 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {selectedServer ? (
            // Server detail view
            <div>
              <button 
                onClick={handleBackClick}
                className="mb-6 flex items-center text-purple-400 hover:text-purple-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Servers
              </button>

              <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a] mb-6">
                <h2 className="text-2xl font-semibold mb-4">{selectedServer.serverName}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-[#222222] rounded-lg p-4 border border-[#2a2a2a]">
                      <h3 className="text-lg font-medium mb-2">Server Information</h3>
                      <p className="text-gray-300">ID: {selectedServer.serverId}</p>
                      <p className="text-gray-300">Members: {selectedServer.memberCount}</p>
                      <p className="text-gray-300">Transactions: {selectedServer.transactions?.length}</p>
                      <p className="text-gray-300">Total Volume: ${formatCurrency(selectedServer.totalVolumeUSD)}</p>
                      <p className="text-gray-300">Profit: ${formatCurrency(selectedServer.totalProfitUSD)}</p>
                    </div>

                    <div className="bg-[#222222] rounded-lg p-4 border border-[#2a2a2a]">
                      <h3 className="text-lg font-medium mb-2">Crypto Wallets</h3>
                      {Object.entries(selectedServer.cryptoValues).map(([crypto, data]) => (
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

                  <div className="bg-[#222222] rounded-lg p-4 border border-[#2a2a2a] flex flex-col h-full">
                    <h3 className="text-lg font-medium mb-2">Wallet Distribution</h3>
                    <div className="flex-1 min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getWalletPieData(selectedServer)}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({name}) => name}
                          >
                            {getWalletPieData(selectedServer).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CRYPTO_COLORS[entry.name] || '#888'} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`$${formatCurrency(value)}`, 'Value']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {selectedServer?.transactions && selectedServer.transactions.length > 0 && (
                <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a]">
                  <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-[#2a2a2a]">
                      <thead className="bg-[#222222]">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#1a1a1a] divide-y divide-[#2a2a2a]">
                        {selectedServer?.transactions?.slice(0, 5).map((tx, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(tx.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tx.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tx.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${formatCurrency(tx.amountUSD)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${tx.status === 'completed' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Server list view
            <div>
              <h1 className="text-2xl font-semibold mb-6">Servers Overview</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a]">
                  <h2 className="text-lg font-medium mb-4">Total Servers</h2>
                  <p className="text-3xl font-semibold">{serverData?.length || 0}</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a]">
                  <h2 className="text-lg font-medium mb-4">Total Volume</h2>
                  <p className="text-3xl font-semibold">
                    ${formatCurrency(serverData?.reduce((sum, server) => sum + server.totalVolumeUSD, 0) || 0)}
                  </p>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a]">
                  <h2 className="text-lg font-medium mb-4">Total Profit</h2>
                  <p className="text-3xl font-semibold">
                    ${formatCurrency(serverData?.reduce((sum, server) => sum + server.totalProfitUSD, 0) || 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a]">
                    <h2 className="text-lg font-medium mb-4">Server List</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full divide-y divide-[#2a2a2a]">
                        <thead className="bg-[#222222]">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Members</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Volume</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profit</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#1a1a1a] divide-y divide-[#2a2a2a]">
                          {serverData?.map((server) => (
                            <tr key={server.serverId}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{server.serverName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{server.memberCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${formatCurrency(server.totalVolumeUSD)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${formatCurrency(server.totalProfitUSD)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleServerClick(server)}
                                  className="text-purple-400 hover:text-purple-300"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#2a2a2a]">
                  <h2 className="text-lg font-medium mb-4">Top 5 Servers by Profit</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serverPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({name}) => name}
                        >
                          {serverPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${formatCurrency(value)}`, 'Profit']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {serverPieData.map((server, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                          ></div>
                          <span className="text-sm text-gray-300">{server.name}</span>
                        </div>
                        <span className="text-sm text-gray-300">${formatCurrency(server.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}