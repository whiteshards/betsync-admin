
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FetchPage() {
  const [serverId, setServerId] = useState('');
  const [serverData, setServerData] = useState(null);
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
    } catch (err) {
      setError(err.message);
      setServerData(null);
    } finally {
      setLoading(false);
    }
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">${serverData.totalProfitUSD.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Server's Cut (30%)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-2/3">${serverData.serverCut.toFixed(2)}</td>
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
          </div>
        )}
      </div>
    </div>
  );
}
