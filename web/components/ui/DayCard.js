'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    // More readable format for the card
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    // Fallback for potentially invalid date strings from the API
    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Assuming MM/DD/YYYY format if Date object fails
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateString; // Return original if completely unparseable
  }
};


const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  },
};

const DayCard = ({ date, profit, rank }) => {
  const formattedDate = formatDate(date);
  const formattedProfit = formatCurrency(profit);

  return (
    <motion.div
      className="bg-[#1c1c1c] border border-[#333333] rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:border-purple-500/50 group relative overflow-hidden"
      variants={itemVariants}
      initial="hidden" // Let parent handle initial/animate for stagger
      animate="visible" // Let parent handle initial/animate for stagger
      whileHover={{ scale: 1.03 }}
    >
      {/* Optional Rank Badge */}
      {rank && (
        <div className="absolute top-2 right-2 bg-purple-600/80 text-white text-xs font-bold px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
          #{rank}
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Date */}
        <p className="text-sm text-gray-400 mb-1 group-hover:text-gray-300 transition-colors">
          {formattedDate}
        </p>

        {/* Profit */}
        <p className="text-2xl font-semibold text-green-400 mt-auto">
          ${formattedProfit}
        </p>
      </div>

       {/* Subtle background glow on hover */}
       <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10"></div>
    </motion.div>
  );
};

export default DayCard;