
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = Cookies.get('isAuthenticated');
    const storedUsername = Cookies.get('username');
    
    if (isAuthenticated !== 'true') {
      router.push('/');
    } else {
      setUsername(storedUsername || 'Admin');
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('username');
    router.push('/');
  };

  // Placeholder data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4800 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 8500 },
    { name: 'Jul', value: 9200 },
    { name: 'Aug', value: 8700 },
  ];

  const topProductsData = [
    { name: 'Product A', value: 27450.60 },
    { name: 'Product B', value: 18320.40 },
    { name: 'Product C', value: 15640.75 },
    { name: 'Product D', value: 12980.30 },
    { name: 'Product E', value: 9820.15 },
  ];

  const dailyRevenueData = [
    { date: '22 Jan', value: 780.40 },
    { date: '23 Jan', value: 1240.25 },
    { date: '24 Jan', value: 980.60 },
    { date: '25 Jan', value: 1150.90 },
    { date: '26 Jan', value: 1320.40 },
    { date: '27 Jan', value: 1450.30 },
    { date: '28 Jan', value: 1120.80 },
  ];

  // KPI stats
  const kpiStats = {
    grossRevenue: {
      value: '$1,240.25',
      change: '+2.15%',
      isPositive: true
    },
    avgOrderValue: {
      value: '$46.15',
      change: '+4.12%',
      isPositive: true
    },
    totalOrders: {
      value: '1,180',
      change: '-1.20%',
      isPositive: false
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-white/10 py-3 px-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            BetSync Admin Panel
          </h1>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-gray-300">Welcome, {username}</span>
            <button 
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {/* Welcome message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Welcome back, Admin</h2>
          <p className="text-gray-400 mt-1">Here's an overview of your revenue statistics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Gross Revenue */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Gross Revenue</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{kpiStats.grossRevenue.value}</p>
              <span className={`text-sm font-medium ${kpiStats.grossRevenue.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {kpiStats.grossRevenue.change} from last month
              </span>
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Avg. Order Value</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{kpiStats.avgOrderValue.value}</p>
              <span className={`text-sm font-medium ${kpiStats.avgOrderValue.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {kpiStats.avgOrderValue.change} from last month
              </span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Orders</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{kpiStats.totalOrders.value}</p>
              <span className={`text-sm font-medium ${kpiStats.totalOrders.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {kpiStats.totalOrders.change} from last month
              </span>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Over Time</h3>
            <div className="text-sm text-gray-400">Jan 22 - Aug 23</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151',
                    color: 'white'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Revenue Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Daily Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      borderColor: '#374151',
                      color: 'white'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#82ca9d" 
                    activeDot={{ r: 8 }} 
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products by Revenue */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProductsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      dataKey="value"
                    >
                      {topProductsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        borderColor: '#374151',
                        color: 'white'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <ul className="space-y-3">
                  {topProductsData.map((product, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm">{product.name}</span>
                      </div>
                      <span className="text-sm font-medium">${product.value.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Product Category */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4">Revenue by Product Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="value" fill="#8884d8" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
