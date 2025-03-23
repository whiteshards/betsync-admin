
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Dynamic imports for charts to reduce initial load time
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
import Sidebar from '@/components/sidebar';

const COLORS = ['#5f6cff', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export default function ServersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [serverData, setServerData] = useState([]);
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
      const response = await fetch('/api/server-profit');
      const { data } = await response.json();

      if (data) {
        setServerData(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching server profit data:', error);
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

  // Data formatting for the pie chart
  const serverPieData = serverData.slice(0, 5).map(server => ({
    name: server.serverName,
    value: server.totalProfitUSD
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex">
      <Sidebar username={username} onLogout={handleLogout} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {selectedServer ? (
            // Server detail view
            <div>
              <button 
                onClick={handleBackClick}
                className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Servers
              </button>
              
              <h2 className="text-xl font-semibold mb-2">{selectedServer.serverName}</h2>
              <div className="text-lg mb-4">
                Total Profit: <span className="font-semibold text-blue-600">${selectedServer.totalProfitUSD.toFixed(2)}</span>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                <h3 className="text-lg font-semibold mb-4">Daily Profit</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedServer.records}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          color: 'black'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="profitUSD" name="Profit (USD)" fill="#5f6cff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-4">Profit Records</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit (USD)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit (Tokens)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedServer.records.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${record.profitUSD.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.profit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Servers overview
            <>
              <h2 className="text-xl mb-6">Server Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="text-gray-600 text-sm mb-1">Total Servers</div>
                  <div className="text-lg font-bold">{serverData.length}</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="text-gray-600 text-sm mb-1">Top Server</div>
                  <div className="text-lg font-bold">
                    {serverData.length > 0 ? serverData[0].serverName : 'N/A'}
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="text-gray-600 text-sm mb-1">Total Revenue (USD)</div>
                  <div className="text-lg font-bold">
                    ${serverData.reduce((sum, server) => sum + server.totalProfitUSD, 0).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
                <h3 className="text-lg font-semibold text-black mb-4">Top Servers by Revenue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serverPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          dataKey="value"
                          nameKey="name"
                        >
                          {serverPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e0e0e0',
                            color: 'black'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <ul className="space-y-3">
                      {serverData.slice(0, 5).map((server, index) => (
                        <li 
                          key={server.serverId} 
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => handleServerClick(server)}
                        >
                          <div className="flex items-center">
                            <span 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></span>
                            <span>{server.serverName}</span>
                          </div>
                          <span className="font-semibold text-black">${server.totalProfitUSD.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-black mb-4">All Servers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Profit (USD)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serverData.map((server) => (
                        <tr key={server.serverId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{server.serverName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{server.serverId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${server.totalProfitUSD.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{server.records.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={() => handleServerClick(server)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
