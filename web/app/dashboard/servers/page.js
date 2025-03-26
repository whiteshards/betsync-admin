
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar username={username} onLogout={handleLogout} />
      
      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto responsive-container">
          {selectedServer ? (
            // Server detail view
            <div>
              <button 
                onClick={handleBackClick}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Servers
              </button>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-semibold mb-2">{selectedServer.serverName}</h2>
                <div className="text-lg mb-4">
                  Total Profit: <span className="font-semibold text-blue-600">${selectedServer.totalProfitUSD.toFixed(2)}</span>
                </div>
                
                <h3 className="text-lg font-semibold mb-4">Daily Profit</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { date: 'Jan 01', profit: selectedServer.totalProfitUSD * 0.7 },
                        { date: 'Jan 02', profit: selectedServer.totalProfitUSD * 0.5 },
                        { date: 'Jan 03', profit: selectedServer.totalProfitUSD * 0.8 },
                        { date: 'Jan 04', profit: selectedServer.totalProfitUSD * 0.6 },
                        { date: 'Jan 05', profit: selectedServer.totalProfitUSD * 0.9 },
                        { date: 'Jan 06', profit: selectedServer.totalProfitUSD * 1.0 },
                        { date: 'Jan 07', profit: selectedServer.totalProfitUSD * 0.8 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="profit" fill="#5f6cff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Server Details</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Server Name</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{selectedServer.serverName}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Profit</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${selectedServer.totalProfitUSD.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Active Users</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.floor(selectedServer.totalProfitUSD * 3)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Region</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">US-East</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Status</td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
            <div>
              <h1 className="text-2xl font-bold mb-6">Server Management</h1>
              
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
                        <p className="text-sm text-gray-500">${server.totalProfitUSD.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold mb-4">Server Profit Distribution</h2>
                  <div className="h-80 max-w-full">
                    <ResponsiveContainer width="99%" height="100%">
                      <PieChart>
                        <Pie
                          data={serverPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {serverPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold mb-4">Top 5 Servers</h2>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {serverData.slice(0, 5).map((server, index) => (
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
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">${server.totalProfitUSD.toFixed(2)}</td>
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">${server.totalProfitUSD.toFixed(2)}</td>
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
    </div>
  );
}
