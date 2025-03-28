'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/sidebar';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

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
    <div className="flex h-screen bg-white">
      <Sidebar username={username} />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-light text-gray-800 mb-8">Welcome Back {username}</h1>

          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6">
              <div className="flex flex-wrap mb-8">
                <div className="w-full md:w-1/3 mb-4 md:mb-0 pr-4">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Gross Revenue</h3>
                    <p className="text-2xl font-semibold">${formatCurrency(totalRevenue)}</p>
                  </div>
                </div>

                <div className="w-full md:w-1/3 mb-4 md:mb-0 pr-4">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Average Daily Income</h3>
                    <p className="text-2xl font-semibold">${formatCurrency(averageProfit)}</p>
                  </div>
                </div>

                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Days Recorded</h3>
                    <p className="text-2xl font-semibold">{profitData.length}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 mb-4"></div>

              <div className="mb-6 flex justify-between items-center">
                <select 
                  value={selectedView} 
                  onChange={handleViewChange}
                  className="border border-gray-200 text-sm rounded-md px-3 py-1 font-medium bg-white"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                <span className="text-xs text-gray-500">Showing data in chronological order</span>
              </div>

              {/* All Days Data Section */}
              <div className="mt-8 mb-6">
                <h3 className="text-lg font-medium mb-4">All Days Data</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {profitData.map((item, index) => {
                    return (
                      <div key={index}>
                        <div 
                          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors"
                          onClick={() => {setShowDetails(!showDetails); setSelectedItem(item)}}
                        >
                          <div className="text-sm font-medium">{formatDate(item.date)}</div>
                          <div className="text-lg font-semibold">${formatCurrency(item.totalProfitUSD)}</div>
                        </div>

                        {showDetails && selectedItem === item && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
                            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Details for {formatDate(item.date)}</h3>
                                <button 
                                  className="text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowDetails(false)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>

                              <div className="mb-4">
                                <div className="text-sm text-gray-500 mb-1">Total Value</div>
                                <div className="text-xl font-bold">${formatCurrency(item.totalProfitUSD)}</div>
                              </div>

                              {item.cryptoValues && Object.keys(item.cryptoValues).length > 0 ? (
                                <div>
                                  <h4 className="font-medium mb-2">Wallet Details</h4>
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrency</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (USD)</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {Object.entries(item.cryptoValues).map(([crypto, data], i) => (
                                        <tr key={i}>
                                          <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                              <div className="h-6 w-6 rounded-full flex items-center justify-center mr-2" 
                                                   style={{ backgroundColor: (COLORS[i % COLORS.length]) + '20' }}>
                                                <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{crypto.charAt(0)}</span>
                                              </div>
                                              {crypto}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-right">{data.amount.toFixed(6)}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-right">${formatCurrency(data.priceUSD)}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-right">${formatCurrency(data.valueUSD)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No wallet data available for this day.</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="h-64">
                {!loading && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={profitData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#666', fontWeight: 300 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#666', fontWeight: 300 }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="totalProfitUSD"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-light text-gray-800 mb-4">Top Performing Days</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                        Total Profit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {topDates.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-800">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-800">
                          ${formatCurrency(item.totalProfitUSD)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-800">
                          {item.orders}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}