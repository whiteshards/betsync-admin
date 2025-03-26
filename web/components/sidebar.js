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
          <span className="ml-2 text-lg font-semibold">Everbee</span>
        </Link>
      </div>

      {/* Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center p-2 rounded-lg hover:bg-gray-50">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{username}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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

        <Link href="/dashboard/watchlist" className={`flex items-center p-2 rounded-lg mt-1 ${pathname === '/dashboard/watchlist' ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="ml-3 text-sm font-medium">Watchlist</span>
        </Link>
      </div>

      {/* Other Tools */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <h6 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">OTHER TOOLS</h6>
        <Link href="/dashboard/calculator" className={`flex items-center p-2 rounded-lg ${pathname === '/dashboard/calculator' ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="ml-3 text-sm font-medium">Calculator</span>
        </Link>

        <Link href="/dashboard/extensions" className={`flex items-center p-2 rounded-lg mt-1 ${pathname === '/dashboard/extensions' ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
          <span className="ml-3 text-sm font-medium">Extensions</span>
        </Link>

        <Link href="/dashboard/affiliate" className={`flex items-center p-2 rounded-lg mt-1 ${pathname === '/dashboard/affiliate' ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="ml-3 text-sm font-medium">Affiliate Program</span>
        </Link>

        <button 
          onClick={onLogout}
          className="w-full flex items-center p-2 rounded-lg mt-4 text-gray-700 hover:bg-gray-50"
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