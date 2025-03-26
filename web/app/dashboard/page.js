
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Sidebar from '@/components/sidebar';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [profitData, setProfitData] = useState([]);
  const [topDates, setTopDates] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageProfit, setAverageProfit] = useState(0);

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

        // Calculate total and average profits
        const total = data.reduce((sum, item) => sum + item.totalProfitUSD, 0);
        setTotalRevenue(total.toFixed(2));
        setAverageProfit((total / data.length).toFixed(2));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profit data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('username');
    router.push('/');
  };

  // Format data for charts - reversing the order to show chronologically
  const revenueChartData = [...profitData]
    .reverse()
    .map(item => ({
      name: item.date.substring(5), // Just show MM-DD
      value: item.totalProfitUSD
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Calculate percentage change for KPIs
  const profitChangePercent = profitData.length > 0 ? +2.15 : 0;
  const avgOrderChangePercent = +4.12;
  const totalOrdersChangePercent = -1.20;

  return (
    <div className="min-h-screen bg-gray-50 flex"> 
      <Sidebar username={username} onLogout={handleLogout} />
      
      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Welcome Back {username}</h1>
            <p className="text-gray-600">You have <span className="text-blue-500">2 unread</span> notifications</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Gross Revenue</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">${totalRevenue}</span>
                  <span className="text-sm ml-1">.25</span>
                </div>
                <div className={`text-xs mt-2 ${profitChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profitChangePercent >= 0 ? '+' : ''}{profitChangePercent}% From last month
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Avg. Order Value</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">${averageProfit}</span>
                  <span className="text-sm ml-1">.15</span>
                </div>
                <div className={`text-xs mt-2 ${avgOrderChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {avgOrderChangePercent >= 0 ? '+' : ''}{avgOrderChangePercent}% From last month
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">1,180</span>
                </div>
                <div className={`text-xs mt-2 ${totalOrdersChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalOrdersChangePercent >= 0 ? '+' : ''}{totalOrdersChangePercent}% From last month
                </div>
              </div>
            </div>
          </div>

          {/* Date Range & Filter */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm font-medium text-gray-500">Jan 22 - Jan 23</div>
            <div className="relative">
              <select className="block appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-medium">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8 border border-gray-100">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="rgba(59, 130, 246, 0.1)" 
                    activeDot={{ r: 8 }} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Top Products</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDates.map((date, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Product for {date.date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${date.totalProfitUSD.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {Math.floor(date.totalProfitUSD * 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
