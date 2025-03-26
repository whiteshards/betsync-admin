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
        const sortedDates = [...data].sort((a, b) => b.totalProfitUSD - a.totalProfitUSD);
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
              <div className="flex flex-wrap mb-6">
                <div className="w-full md:w-1/3 mb-4 md:mb-0 pr-4">
                  <div className="h-full">
                    <h3 className="text-sm font-light text-gray-500 mb-1">Gross Revenue</h3>
                    <p className="text-2xl font-light">${formatCurrency(totalRevenue)}</p>
                  </div>
                </div>

                <div className="w-full md:w-1/3 mb-4 md:mb-0 pr-4">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Average Daily Income</h3>
                    <p className="text-2xl font-medium">${formatCurrency(averageProfit)}</p>
                  </div>
                </div>

                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <div className="h-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Days Recorded</h3>
                    <p className="text-2xl font-medium">{profitData.length}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 mb-4"></div>

              <div className="mb-6">
                <select 
                  value={selectedView} 
                  onChange={handleViewChange}
                  className="border border-gray-200 text-sm rounded-md px-3 py-1 font-medium bg-white"
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