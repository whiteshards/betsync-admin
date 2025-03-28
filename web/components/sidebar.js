'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
//import { motion, AnimatePresence } from 'framer-motion'; //Removed

export default function TopNavbar({ username }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Servers', path: '/dashboard/servers' },
    { name: 'Configure', path: '/dashboard/configure' },
    { name: 'Fetch', path: '/fetch' },
  ];

  const onLogout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('username');
    router.push('/');
  };

  // Removed animation variants

  return (
    <header className="fixed w-full bg-[#111111] shadow-md border-b border-[#222222] z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Image 
                src="/logo.webp" 
                alt="BetSync Logo" 
                width={30} 
                height={30} 
                className="rounded-lg" 
              />
              <span className="ml-2 text-white text-lg font-semibold">
                BetSync
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    pathname === link.path
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User menu and mobile nav toggle */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 hidden md:inline-block">
                {username}
              </span>

              <button
                onClick={onLogout}
                className="bg-[#222222] hover:bg-[#333333] text-gray-300 px-4 py-2 rounded-full text-sm focus:outline-none"
              >
                Sign Out
              </button>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#333333] focus:outline-none"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#111111] border-t border-[#222222]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <div key={link.path}>
                <Link
                  href={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.path
                      ? 'bg-[#8758FF] bg-opacity-20 text-white'
                      : 'text-gray-300 hover:bg-[#222222] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </div>
            ))}

            <div className="pt-4 pb-3 border-t border-[#222222]">
              <div className="flex items-center px-3">
                <div className="text-base font-medium text-gray-300">
                  {username}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}