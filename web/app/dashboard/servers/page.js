
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Sidebar from '@/components/sidebar';

const COLORS = ['#5f6cff', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar username={username} onLogout={handleLogout} />
      <main className="p-6">

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto responsive-container">
          {selectedServer ? (
            // Server detail view
            <div className="centered-container">
              <button 
                onClick={handleBackClick}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-700 self-start"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Servers
              </button>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6 w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">{selectedServer.serverName}</h2>
                <div className="text-lg mb-6 text-center">
                  Total Profit: <span className="font-semibold text-blue-600">${formatCurrency(selectedServer.totalProfitUSD)}</span>
                </div>
                
                {/* Crypto Wallet Distribution */}
                {Object.keys(selectedServer.cryptoValues || {}).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-semibold mb-4 text-center">Wallet Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getWalletPieData(selectedServer)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {getWalletPieData(selectedServer).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CRYPTO_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Crypto Wallet Details */}
              {Object.keys(selectedServer.cryptoValues || {}).length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6 w-full">
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
                      {Object.entries(selectedServer.cryptoValues || {}).map(([crypto, data], index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: (CRYPTO_COLORS[crypto] || COLORS[index % COLORS.length]) + '20' }}>
                                <span className="font-bold text-xs" style={{ color: CRYPTO_COLORS[crypto] || COLORS[index % COLORS.length] }}>{crypto}</span>
                              </div>
                              <div className="ml-4 font-medium">{crypto}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{data.amount.toFixed(6)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">${formatCurrency(data.priceUSD)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">${formatCurrency(data.valueUSD)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-bold" colSpan="3">Total Value (USD)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">${formatCurrency(selectedServer.totalProfitUSD)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Server Details */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 w-full">
                <h3 className="text-lg font-semibold mb-4 text-center">Server Details</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Server Name</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">{selectedServer.serverName}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Total Value (USD)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">${formatCurrency(selectedServer.totalProfitUSD)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Giveaway Channel</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">{selectedServer.giveawayChannel || 'None'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Whitelisted Channels</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">{selectedServer.whitelist && selectedServer.whitelist.length > 0 ? selectedServer.whitelist.join(', ') : 'None'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Status</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left w-1/2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Servers overview
            <div className="w-full flex flex-col items-center">
              {/* Current Crypto Prices Card */}
              <div className="w-full bg-white rounded-lg p-6 shadow-sm mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Current Cryptocurrency Prices</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(cryptoPrices).map(([crypto, price], index) => (
                    <div key={index} className="p-3 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: (CRYPTO_COLORS[crypto.toUpperCase()] || COLORS[index % COLORS.length]) + '10' }}>
                      <div className="text-xs uppercase font-semibold" style={{ color: CRYPTO_COLORS[crypto.toUpperCase()] || COLORS[index % COLORS.length] }}>{crypto.toUpperCase()}</div>
                      <div className="text-lg font-bold">${formatCurrency(price)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {serverData.slice(0, 4).map((server, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100" onClick={() => handleServerClick(server)}>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: COLORS[index % COLORS.length] }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg font-semibold text-gray-900">{server.serverName}</h2>
                        <p className="text-sm text-gray-500">${formatCurrency(server.totalProfitUSD)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                {/* Top 5 Profitable Servers */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold mb-4">Top 5 Profitable Servers</h2>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrencies</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {serverData
                          .filter(server => server.totalProfitUSD > 0)
                          .sort((a, b) => b.totalProfitUSD - a.totalProfitUSD)
                          .slice(0, 5)
                          .map((server, index) => (
                            <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleServerClick(server)}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: COLORS[index % COLORS.length] }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                                    </svg>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{server.serverName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">${formatCurrency(server.totalProfitUSD)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                <div className="flex justify-end space-x-1">
                                  {Object.keys(server.cryptoValues || {}).map((crypto, i) => (
                                    <div key={i} className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: (CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length]) + '20' }}>
                                      <span className="text-xs font-bold" style={{ color: CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length] }}>{crypto.charAt(0)}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Unprofitable Servers */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold mb-4">Unprofitable Servers</h2>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrencies</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {serverData
                          .filter(server => server.totalProfitUSD <= 0)
                          .sort((a, b) => a.totalProfitUSD - b.totalProfitUSD)
                          .map((server, index) => (
                            <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleServerClick(server)}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ff404020' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: '#ff4040' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                                    </svg>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{server.serverName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-500">${formatCurrency(server.totalProfitUSD)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                <div className="flex justify-end space-x-1">
                                  {Object.keys(server.cryptoValues || {}).map((crypto, i) => (
                                    <div key={i} className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: (CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length]) + '20' }}>
                                      <span className="text-xs font-bold" style={{ color: CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length] }}>{crypto.charAt(0)}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">All Servers</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Add Server
                  </button>
                </div>
                <div className="servers-table-container overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrencies</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serverData.map((server, index) => (
                        <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleServerClick(server)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: COLORS[index % COLORS.length] }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{server.serverName}</div>
                                <div className="text-sm text-gray-500">Region: US-East</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${formatCurrency(server.totalProfitUSD)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            <div className="flex justify-end space-x-1">
                              {Object.keys(server.cryptoValues || {}).map((crypto, i) => (
                                <div key={i} className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: (CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length]) + '20' }}>
                                  <span className="text-xs font-bold" style={{ color: CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length] }}>{crypto.charAt(0)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{Math.floor(server.totalProfitUSD * 3)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </main>
    </div>
  );
}
