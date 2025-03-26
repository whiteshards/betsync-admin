'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Avg. Order Value</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">${averageProfit}</span>
                  <span className="text-sm ml-1">.15</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Days</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">{profitData.length}</span>
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
          <div className="bg-white rounded-lg p-4 shadow-sm mb-8 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#93C5FD" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Dates Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">All Recorded Days</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {profitData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.totalProfitUSD.toFixed(2)}</td>
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
      </main>
    </div>
  );
}