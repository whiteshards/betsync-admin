'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '../../../components/sidebar';

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
      const response = await fetch('/api/servers');
      const { data } = await response.json();

      if (data) {
        setServerData(data);
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

      <main className="flex-1 md:ml-64 p-6 flex justify-center">
        <div className="max-w-2xl w-full">
          {selectedServer ? (
            // Server detail view
            <div className="w-full">
              <button 
                onClick={handleBackClick}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6 w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">{selectedServer.serverName}</h2>
                <div className="text-lg mb-6 text-center">
                  Total Profit: <span className="font-semibold text-blue-600">${selectedServer.totalProfitUSD.toFixed(2)}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-md font-medium mb-3">Server Details</h3>
                  <table className="min-w-full">
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Server ID</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">{selectedServer.serverId || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">IP Address</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">{selectedServer.ipAddress || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Location</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">{selectedServer.location || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Created At</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 text-left">{selectedServer.createdAt || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/2 text-right">Whitelist</td>
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
            </div>
          ) : (
            // Servers overview - SIMPLIFIED, showing only server cards
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {serverData.map((server, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100" onClick={() => handleServerClick(server)}>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: COLORS[index % COLORS.length] }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{server.serverName}</div>
                        <div className="text-sm text-gray-500">{server.ipAddress}</div>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <span className={`font-semibold text-md ${server.totalProfitUSD > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${server.totalProfitUSD.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}