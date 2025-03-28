
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function TopNavbar({ username }) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('username');
    router.push('/');
  };

  return (
    <div className="fixed w-full z-10 bg-[#111111] text-white py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center mr-3">
            <span className="text-xl font-bold">L</span>
          </div>
          <span className="text-xl font-bold">BetSync</span>
        </div>
        
        <div className="flex space-x-1">
          <Link href="/dashboard" className={`px-4 py-2 rounded-full text-sm font-medium ${pathname === '/dashboard' ? 'bg-purple-600' : 'hover:bg-[#2a2a2a]'}`}>
            Dashboard
          </Link>
          <Link href="/dashboard/servers" className={`px-4 py-2 rounded-full text-sm font-medium ${pathname === '/dashboard/servers' ? 'bg-purple-600' : 'hover:bg-[#2a2a2a]'}`}>
            Servers
          </Link>
          <Link href="/dashboard/krizz1vxiw" className={`px-4 py-2 rounded-full text-sm font-medium ${pathname === '/dashboard/krizz1vxiw' ? 'bg-purple-600' : 'hover:bg-[#2a2a2a]'}`}>
            Krizz1vxiw
          </Link>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-4">{username}</span>
          <button 
            onClick={onLogout}
            className="px-4 py-2 rounded-full text-sm bg-[#2a2a2a] hover:bg-[#333333]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
