'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black"> {/* Changed background to white */}
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">BetSync Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {username}</span>
            <button 
              onClick={handleLogout}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 py-6">
        <h2 className="text-xl font-bold mb-6">Dashboard Overview</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Total Revenue</div>
            <div className="text-lg font-bold">${totalRevenue}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Average Daily Profit</div>
            <div className="text-lg font-bold">${averageProfit}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Total Days Recorded</div>
            <div className="text-lg font-bold">{profitData.length}</div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8"> {/* Changed background to white */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Daily Revenue (USD)</h3> {/* Changed text color to black */}
            <div className="text-sm text-gray-400">
              {profitData.length > 0 && 
                `${profitData[profitData.length-1]?.date} - ${profitData[0]?.date}`
              }
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5f6cff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#5f6cff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    color: 'black'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#5f6cff" 
                  strokeWidth={2}
                  fillOpacity={0.3} 
                  fill="url(#colorRevenue)" 
                  name="Revenue (USD)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Dates By Revenue */}
        <div className="bg-white border border-gray-200 rounded-lg p-5"> {/* Changed background to white */}
          <h3 className="text-lg font-semibold text-black mb-4">Top Days by Revenue</h3> {/* Changed text color to black */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topDates}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    dataKey="totalProfitUSD"
                    nameKey="date"
                  >
                    {topDates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      color: 'black'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <ul className="space-y-3">
                {topDates.map((date, index) => (
                  <li key={date.date} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      <span>{date.date}</span>
                    </div>
                    <span className="font-semibold text-black">${date.totalProfitUSD.toFixed(2)}</span> {/* Changed text color to black */}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Removed daily revenue breakdown as requested */}
      </main>
    </div>
  );
}