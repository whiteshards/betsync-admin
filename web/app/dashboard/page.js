
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '@/components/sidebar';

const COLORS = ['#5f6cff', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];
const CRYPTO_COLORS = {
  BTC: '#f7931a',
  ETH: '#627eea',
  SOL: '#14f195',
  DOGE: '#ba9f33',
  USDT: '#26a17b'
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [profitData, setProfitData] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [selectedView, setSelectedView] = useState('Daily');
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = Cookies.get('isAuthenticated');
    const storedUsername = Cookies.get('username');

    if (isAuthenticated !== 'true') {
      router.push('/');
    } else {
      setUsername(storedUsername || 'Admin');
      fetchProfitData();
    }
  }, [router]);

  const fetchProfitData = async () => {
    try {
      const response = await fetch('/api/profit-data');
      const { data, cryptoPrices } = await response.json();

      if (data) {
        setProfitData(data);
      }
      
      if (cryptoPrices) {
        setCryptoPrices(cryptoPrices);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profit data:', error);
      setLoading(false);
    }
  };

  const handleViewChange = (e) => {
    setSelectedView(e.target.value);
  };

  const handleLogout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('username');
    router.push('/');
  };
  
  const handleDayClick = (day) => {
    setSelectedDay(day);
  };
  
  const handleBackClick = () => {
    setSelectedDay(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate daily/weekly/monthly profit data
  const getProfitChartData = () => {
    if (!profitData.length) return [];

    if (selectedView === 'Daily') {
      return profitData.map(item => ({
        date: item.date,
        profit: item.totalProfitUSD
      }));
    } else if (selectedView === 'Weekly') {
      const weeklyData = {};
      profitData.forEach(item => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { date: weekKey, profit: 0 };
        }
        weeklyData[weekKey].profit += item.totalProfitUSD;
      });
      return Object.values(weeklyData);
    } else {
      const monthlyData = {};
      profitData.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { date: monthKey, profit: 0 };
        }
        monthlyData[monthKey].profit += item.totalProfitUSD;
      });
      return Object.values(monthlyData);
    }
  };

  // Top profit days
  const topDates = [...profitData]
    .sort((a, b) => b.totalProfitUSD - a.totalProfitUSD)
    .slice(0, 5);

  // Calculate total profit
  const totalProfit = profitData.reduce((sum, item) => sum + item.totalProfitUSD, 0);

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
      <main className="p-6 pt-0 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {selectedDay ? (
            // Day detail view
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mt-6">
              <button 
                onClick={handleBackClick}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </button>
              
              <h2 className="text-xl font-semibold mb-4">{formatDate(selectedDay.date)}</h2>
              <div className="text-lg mb-6">
                Total Value: <span className="font-semibold text-blue-600">${formatCurrency(selectedDay.totalProfitUSD)}</span>
              </div>
              
              {/* Wallet Details */}
              {Object.keys(selectedDay.cryptoValues || {}).length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Wallet Details</h3>
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
                      {Object.entries(selectedDay.cryptoValues || {}).map(([crypto, data], index) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">${formatCurrency(selectedDay.totalProfitUSD)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-4">No wallet data available for this day</div>
              )}
            </div>
          ) : (
            // Dashboard view
            <>
              {/* Top stats row */}
              <div className="bg-white rounded-lg p-6 shadow-sm mt-6 flex flex-col md:flex-row border border-gray-100">
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Profit</h3>
                    <p className="text-2xl font-semibold">${formatCurrency(totalProfit)}</p>
                  </div>
                </div>
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Days Recorded</h3>
                    <p className="text-2xl font-semibold">{profitData.length}</p>
                  </div>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Average Per Day</h3>
                    <p className="text-2xl font-semibold">
                      ${formatCurrency(profitData.length ? totalProfit / profitData.length : 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profit chart */}
              <div className="bg-white rounded-lg p-6 shadow-sm mt-6 border border-gray-100">
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
                
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getProfitChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${formatCurrency(value)}`, 'Profit']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString();
                        }}
                      />
                      <Area type="monotone" dataKey="profit" stroke="#5f6cff" fill="#5f6cff" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Top performing days */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Days</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Value
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cryptocurrencies
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {topDates.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleDayClick(item)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                              {formatDate(item.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">
                              ${formatCurrency(item.totalProfitUSD)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-1">
                                {Object.keys(item.cryptoValues || {}).map((crypto, i) => (
                                  <div key={i} className="h-6 w-6 rounded-full flex items-center justify-center" 
                                      style={{ backgroundColor: (CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length]) + '20' }}>
                                    <span className="text-xs font-bold" 
                                        style={{ color: CRYPTO_COLORS[crypto] || COLORS[i % COLORS.length] }}>
                                      {crypto.charAt(0)}
                                    </span>
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

                {/* Cryptocurrency overview */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Cryptocurrency Prices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(cryptoPrices).map(([crypto, price], index) => (
                      <div key={index} className="p-3 rounded-lg flex items-center" 
                          style={{ backgroundColor: (CRYPTO_COLORS[crypto.toUpperCase()] || COLORS[index % COLORS.length]) + '10' }}>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" 
                            style={{ backgroundColor: (CRYPTO_COLORS[crypto.toUpperCase()] || COLORS[index % COLORS.length]) + '20' }}>
                          <span className="text-sm font-bold" 
                              style={{ color: CRYPTO_COLORS[crypto.toUpperCase()] || COLORS[index % COLORS.length] }}>
                            {crypto.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs uppercase font-medium text-gray-500">{crypto.toUpperCase()}</div>
                          <div className="text-sm font-bold">${formatCurrency(price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* All Days Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm mt-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">All Days</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overview</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {profitData.sort((a, b) => new Date(b.date) - new Date(a.date)).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(item.date)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {Object.keys(item.cryptoValues || {}).length > 0 ? (
                                Object.entries(item.cryptoValues).map(([crypto, data], idx) => (
                                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}>
                                    {crypto}: {data.amount.toFixed(4)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">No wallet data</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            ${formatCurrency(item.totalProfitUSD)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button 
                              onClick={() => handleDayClick(item)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
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

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/sidebar';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [profitData, setProfitData] = useState([]);
  const [topDates, setTopDates] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageProfit, setAverageProfit] = useState(0);
  const [selectedView, setSelectedView] = useState('Daily');

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

  // Format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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