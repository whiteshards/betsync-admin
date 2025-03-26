
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
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
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Inter, sans-serif' }}> 
      <Sidebar username={username} onLogout={handleLogout} />

      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome Back {username}</h1>
          </div>

          {/* Combined Revenue Analytics Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Gross Revenue</h3>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">${totalRevenue}</span>
                  <span className="text-sm text-green-500 ml-2">+2.15% From last month</span>
                </div>
              </div>

              <div>
                <h3 className="text-gray-500 text-sm font-medium">Average Daily Income</h3>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">${averageProfit}</span>
                  <span className="text-sm text-green-500 ml-2">+4.12% From last month</span>
                </div>
              </div>

              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Days</h3>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">{profitData.length}</span>
                  <span className="text-sm text-red-500 ml-2">-1.20% From last month</span>
                </div>
              </div>
            </div>
            
            {/* View selection and chart */}
            <div className="flex justify-end mb-4">
              <div className="relative inline-block">
                <select 
                  className="block appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value)}
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 20,
                  }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#colorValue)" 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Dates Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm mb-8">
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
