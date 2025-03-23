
'use client';

import { useState, useEffect } from 'react';
import { Inter, Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = Cookies.get('isAuthenticated');
    if (isAuthenticated === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'krizz1vxiw' && password === 'krizz1vxiw') {
      // Set authentication cookie (expires in 1 day)
      Cookies.set('isAuthenticated', 'true', { expires: 1 });
      Cookies.set('username', username, { expires: 1 });
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className={`min-h-screen bg-black text-white ${montserrat.variable}`}>
      {/* Navbar */}
      <nav className="bg-gray-950 border-b border-white/10 py-3">
        <div className="max-w-7xl mx-auto flex items-center px-3">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            BetSync Admin Panel
          </h1>
        </div>
      </nav>

      {/* Login form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-54px)] px-4">
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-sm border border-gray-800">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-1">Admin Login</h2>
            <p className="text-gray-300 text-sm">Enter your credentials to access the panel</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-white px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-white">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all text-white"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all text-white"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium transition-all"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
