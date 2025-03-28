
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNavbar({ username }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onLogout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('username');
    router.push('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Servers', path: '/dashboard/servers' },
    { name: 'Fetch', path: '/fetch' },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };

  const linkVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 }
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-10 bg-[#111111] shadow-md bg-opacity-80 backdrop-blur-lg border-b border-[#222222]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image src="/logo.webp" alt="BetSync Logo" width={32} height={32} className="rounded-lg mr-3" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
                BetSync
              </span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href={link.path} 
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pathname === link.path 
                        ? 'text-white bg-[#8758FF] bg-opacity-20' 
                        : 'text-gray-300 hover:text-white hover:bg-[#8758FF] hover:bg-opacity-10'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* User menu and mobile nav toggle */}
          <div className="flex items-center">
            <motion.div 
              className="ml-3 relative flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-gray-300 hidden md:inline-block">
                {username}
              </span>
              
              <motion.button
                onClick={onLogout}
                className="bg-[#222222] hover:bg-[#333333] text-gray-300 px-4 py-2 rounded-full text-sm focus:outline-none"
                whileHover={{ scale: 1.05, backgroundColor: "#333333" }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Out
              </motion.button>
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#333333] focus:outline-none"
                  whileTap={{ scale: 0.9 }}
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
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-[#111111] border-t border-[#222222]"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <motion.div
                  key={link.path}
                  variants={linkVariants}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
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
                </motion.div>
              ))}
              
              <motion.div
                variants={linkVariants}
                className="pt-4 pb-3 border-t border-[#222222]"
              >
                <div className="flex items-center px-3">
                  <div className="text-base font-medium text-gray-300">
                    {username}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
