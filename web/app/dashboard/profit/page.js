
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Define colors for different cryptocurrencies
const CRYPTO_COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#00FFA3',
  DOGE: '#C3A634',
  USDT: '#26A17B'
};

// Pie chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProfitPage() {
  const [profitData, setProfitData] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Admin');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/profit-data');
        const data = await response.json();
        
        if (data && data.data) {
          setProfitData(data.data);
          setCryptoPrices(data.cryptoPrices || {});
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profit data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
  };

  // Format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get latest profit data
  const getLatestProfit = () => {
    if (profitData.length === 0) return { totalProfitUSD: 0, cryptoValues: {} };
    return profitData[profitData.length - 1];
  };

  // Get cryptocurrency distribution for pie chart
  const getCryptoDistribution = () => {
    const latestData = getLatestProfit();
    if (!latestData || !latestData.cryptoValues) return [];
    
    return Object.entries(latestData.cryptoValues).map(([crypto, data]) => ({
      name: crypto,
      value: data.valueUSD
    }));
  };

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
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profit Dashboard</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col border border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Total Profit (USD)</h2>
            <p className="text-2xl font-semibold text-blue-600">${formatCurrency(getLatestProfit().totalProfitUSD)}</p>
          </div>
          
          {/* Current Crypto Prices */}
          {Object.entries(cryptoPrices).map(([crypto, price], index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm flex flex-col border border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 mb-2">{crypto.toUpperCase()} Price</h2>
              <p className="text-2xl font-semibold" style={{ color: CRYPTO_COLORS[crypto.toUpperCase()] || '#333' }}>
                ${formatCurrency(price)}
              </p>
            </div>
          ))}
        </div>

        {/* Profit Over Time Chart */}
        {profitData.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Profit Over Time</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={profitData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => ['$' + formatCurrency(value), 'Profit (USD)']} />
                  <Legend />
                  <Line type="monotone" dataKey="totalProfitUSD" stroke="#8884d8" name="Profit (USD)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Crypto Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          {getCryptoDistribution().length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Cryptocurrency Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCryptoDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCryptoDistribution().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CRYPTO_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => ['$' + formatCurrency(value), '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Wallet Details */}
          {Object.keys(getLatestProfit().cryptoValues || {}).length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Latest Wallet Details</h2>
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
                  {Object.entries(getLatestProfit().cryptoValues || {}).map(([crypto, data], index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: (CRYPTO_COLORS[crypto] || '#8884d8') + '20' }}>
                            <span className="font-medium" style={{ color: CRYPTO_COLORS[crypto] || '#8884d8' }}>{crypto.substring(0, 1)}</span>
                          </div>
                          <span className="font-medium">{crypto}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{data.amount.toFixed(8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${formatCurrency(data.priceUSD)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${formatCurrency(data.valueUSD)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Profit History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total USD Value</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrencies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profitData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${formatCurrency(item.totalProfitUSD)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.keys(item.wallet || {}).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.wallet).map(([crypto, amount], idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                              style={{ backgroundColor: (CRYPTO_COLORS[crypto] || '#8884d8') + '20', color: CRYPTO_COLORS[crypto] || '#8884d8' }}>
                              {crypto}: {amount.toFixed(8)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'None'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
