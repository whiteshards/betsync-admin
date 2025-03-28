
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TopNavbar from '../../components/sidebar';

const COLORS = ['#8758FF', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export default function Dashboard() {
  // Format date string
  const formatDate = (dateString) => {
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [profitData, setProfitData] = useState([]);
  const [topDates, setTopDates] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageProfit, setAverageProfit] = useState(0);
  const [selectedView, setSelectedView] = useState('Daily');

  // Format currency with commas - defined globally for reuse throughout the component
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Initialize any state that might be conditionally rendered
  // This fixes the issue with hooks being called in different orders
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = Cookies.get('isAuthenticated');
    const storedUsername = Cookies.get('username');

    if (isAuthenticated !== 'true') {
      router.push('/');
    } else {
      setUsername(storedUsername || 'Admin');

      // Fetch profit data from API
      fetchProfitData();
    }
  }, [router]);

  const fetchProfitData = async () => {
    try {
      const response = await fetch('/api/profit-data');
      const { data } = await response.json();

      if (data) {
        setProfitData(data);

        // Calculate top dates by profit
        const sortedDates = [...data]
          .sort((a, b) => {
            // First sort by profit (highest first)
            if (b.totalProfitUSD !== a.totalProfitUSD) {
              return b.totalProfitUSD - a.totalProfitUSD;
            }

            // Then by date (most recent first) if profits are equal
            const [aMonth, aDay, aYear] = a.date.split('/').map(Number);
            const [bMonth, bDay, bYear] = b.date.split('/').map(Number);

            if (aYear !== bYear) return bYear - aYear;
            if (aMonth !== bMonth) return bMonth - aMonth;
            return bDay - aDay;
          });
        setTopDates(sortedDates.slice(0, 5));

        // Calculate total revenue
        const totalRev = data.reduce((sum, item) => sum + item.totalProfitUSD, 0);
        setTotalRevenue(totalRev);

        // Calculate average daily profit
        setAverageProfit(totalRev / data.length);

        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profit data:', error);
      setLoading(false);
    }
  };

  const handleViewChange = (e) => {
    setSelectedView(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <TopNavbar username={username} />
      
      <main className="pt-20 px-6 pb-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">Welcome back, {username}</h1>
          <p className="text-gray-400">Here's your financial overview</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111111] rounded-xl p-6 border border-[#222222]">
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <h2 className="text-3xl font-bold">${formatCurrency(totalRevenue)}</h2>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#222222]">
            <p className="text-gray-400 text-sm mb-1">Average Daily Income</p>
            <h2 className="text-3xl font-bold">${formatCurrency(averageProfit)}</h2>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#222222]">
            <p className="text-gray-400 text-sm mb-1">Total Days Recorded</p>
            <h2 className="text-3xl font-bold">{profitData.length}</h2>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#222222] mb-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-purple-300">Revenue Trend</h2>
            <select 
              value={selectedView} 
              onChange={handleViewChange}
              className="bg-[#222222] border-none text-sm rounded-full px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className="h-64">
            {!loading && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={profitData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#888888' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#888888' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#222222', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalProfitUSD"
                    stroke="#8758FF"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8758FF' }}
                    activeDot={{ r: 6, fill: '#8758FF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* All Days Data Grid */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#222222] mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-purple-300">All Days Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profitData.map((item, index) => {
              return (
                <div key={index}>
                  <div 
                    className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-xl"
                    onClick={() => {setShowDetails(!showDetails); setSelectedItem(item)}}
                  >
                    <div className="text-sm text-purple-300">{formatDate(item.date)}</div>
                    <div className="text-xl font-bold mt-1 text-white">${formatCurrency(item.totalProfitUSD)}</div>
                  </div>

                  {showDetails && selectedItem === item && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
                      <div className="bg-[#111111] rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-[#333333]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold">Details for {formatDate(item.date)}</h3>
                          <button 
                            className="text-gray-400 hover:text-white"
                            onClick={() => setShowDetails(false)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="mb-6">
                          <div className="text-sm text-gray-400 mb-1">Total Value</div>
                          <div className="text-3xl font-bold">${formatCurrency(item.totalProfitUSD)}</div>
                        </div>

                        {item.cryptoValues && Object.keys(item.cryptoValues).length > 0 ? (
                          <div>
                            <h4 className="font-semibold mb-4 text-gray-300">Wallet Details</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-[#333333]">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cryptocurrency</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price (USD)</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Value (USD)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#333333]">
                                  {Object.entries(item.cryptoValues).map(([crypto, data], i) => (
                                    <tr key={i}>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" 
                                              style={{ backgroundColor: (COLORS[i % COLORS.length]) + '20' }}>
                                            <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{crypto.charAt(0)}</span>
                                          </div>
                                          {crypto}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-right">{data.amount.toFixed(6)}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-right">${formatCurrency(data.priceUSD)}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-right">${formatCurrency(data.valueUSD)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">No wallet data available for this day.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Days */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#222222]">
          <h2 className="text-xl font-semibold mb-6">Top Performing Days</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#333333]">
              <thead className="bg-[#111111]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Profit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#111111] divide-y divide-[#222222]">
                {topDates.map((item, index) => (
                  <tr key={index} className="hover:bg-[#1c1c1c]">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-purple-300">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-400 font-semibold">${formatCurrency(item.totalProfitUSD)}</span>
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
