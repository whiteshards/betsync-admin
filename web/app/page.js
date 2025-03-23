
'use client';

import { useState } from 'react';
import { Inter, Montserrat } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'krizz1vxiw' && password === 'krizz1vxiw') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-black text-white ${montserrat.variable}`}>
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
            BetSync Admin Panel
          </h1>
        </div>
      </nav>

      {authenticated ? (
        // Welcome screen after successful login
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
              Welcome!
            </h2>
            <p className="text-gray-300 text-lg md:text-xl">
              You have successfully logged in to the admin panel.
            </p>
          </div>
        </div>
      ) : (
        // Login form
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-10 w-full max-w-md border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Admin Login</h2>
              <p className="text-gray-400 text-sm">Enter your credentials to access the panel</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white py-3 rounded-md font-medium shadow-lg shadow-purple-500/20 transition-all"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
