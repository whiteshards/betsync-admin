'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ username, onLogout }) {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-10 shadow-sm hidden md:block">
      {/* Brand */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="ml-2 text-lg font-semibold">BetSync</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <Link href="/dashboard" className={`flex items-center p-2 rounded-lg ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="ml-3 text-sm font-medium">Dashboard</span>
        </Link>

        <Link href="/dashboard/servers" className={`flex items-center p-2 rounded-lg mt-1 ${pathname === '/dashboard/servers' ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <span className="ml-3 text-sm font-medium">Servers</span>
        </Link>
      </div>

      {/* Logout at the bottom */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="ml-3 text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}