'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
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
    <div className="min-h-screen bg-white flex" style={{ fontFamily: 'Open Sans' }}> 
      <Sidebar username={username} onLogout={handleLogout} />

      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Welcome Back {username}</h1>
          </div>

          {/* Merged Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
              <select className="border border-gray-300 rounded-md text-sm p-1">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
              <div className="p-4">
                <h3 className="text-gray-500 text-sm font-medium">Gross Revenue</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">${totalRevenue}</span>
                  <span className="text-sm ml-1">.25</span>
                </div>
              </div>

              <div className="p-4 border-l border-r border-gray-200">
                <h3 className="text-gray-500 text-sm font-medium">Average Daily Income</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">${averageProfit}</span>
                  <span className="text-sm ml-1">.15</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Days</h3>
                <div className="flex items-end">
                  <span className="text-2xl font-bold">{profitData.length}</span>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={profitData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="totalProfitUSD" name="Total Profit (USD)" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Top Dates Section - Removed as per request */}
        </div>
      </main>
    </div>
  );
}