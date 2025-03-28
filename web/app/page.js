
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Montserrat } from 'next/font/google';
import Image from 'next/image';

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
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#111111] border-b border-[#2a2a2a] py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3">
              <Image src="/logo.webp" alt="BetSync Logo" width={32} height={32} className="rounded-lg" />
            </div>
            <h1 className="text-xl font-bold">BetSync Admin Panel</h1>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#1a1a1a] rounded-xl shadow-lg p-8 border border-[#2a2a2a]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to continue to BetSync</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
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
                className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
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
                className="w-full bg-[#2a2a2a] border border-[#333333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
