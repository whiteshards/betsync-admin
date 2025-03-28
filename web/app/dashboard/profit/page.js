'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

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

  // Format date from YYYY-MM-DD to more readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';

    // Check if the date is already in MM/DD/YYYY format
    if (dateString.includes('/')) return dateString;

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
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

        {/* Profit Over Time Chart */}
        {profitData.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Profit Over Time</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={profitData.map(item => ({
                    ...item,
                    date: formatDate(item.date)
                  }))}
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

        {/* Cryptocurrency Distribution */}
        {profitData.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Latest Cryptocurrency Distribution</h2>
            <div className="h-80 flex flex-col md:flex-row items-center justify-center">
              <div className="w-full md:w-1/2 h-full">
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => ['$' + formatCurrency(value), '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <h3 className="text-sm font-medium mb-2">Latest Values</h3>
                <ul className="space-y-2">
                  {Object.entries(getLatestProfit().cryptoValues || {}).map(([crypto, data], idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="text-sm">{crypto}</span>
                      </div>
                      <span className="text-sm font-medium">${formatCurrency(data.valueUSD)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(item.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${formatCurrency(item.totalProfitUSD)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.entries(item.cryptoValues || {}).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.cryptoValues).map(([crypto, data], idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {crypto}: {data.amount} (${formatCurrency(data.valueUSD)})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No cryptocurrencies</span>
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