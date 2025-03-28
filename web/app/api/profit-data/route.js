
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

async function fetchCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin&vs_currencies=usd');
    const data = await response.json();
    return {
      btc: data.bitcoin?.usd || 0,
      eth: data.ethereum?.usd || 0,
      sol: data.solana?.usd || 0,
      doge: data.dogecoin?.usd || 0,
      usdt: 1 // USDT is pegged to USD
    };
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    // Fallback prices if API fails
    return {
      btc: 65000,
      eth: 3500,
      sol: 150,
      doge: 0.15,
      usdt: 1
    };
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("BetSync");
    
    // Fetch crypto prices
    const cryptoPrices = await fetchCryptoPrices();
    
    // Fetch data from profit_data collection
    const profitData = await db.collection("profit_data")
      .find({})
      .toArray();
    
    // Process the profit data with wallet structure
    const processedData = profitData.map(item => {
      // Initialize total USD value
      let totalProfitUSD = 0;
      
      // Calculate crypto values
      const cryptoValues = {};
      
      // Process wallet if it exists
      if (item.wallet) {
        Object.entries(item.wallet).forEach(([crypto, amount]) => {
          if (amount > 0) { // Only include crypto with non-zero values
            const price = cryptoPrices[crypto.toLowerCase()] || 0;
            const valueUSD = amount * price;
            cryptoValues[crypto] = {
              amount,
              priceUSD: price,
              valueUSD
            };
            totalProfitUSD += valueUSD;
          }
        });
      }

      return {
        date: item.date,
        wallet: item.wallet || {},
        cryptoValues,
        totalProfitUSD
      };
    });
    
    // Sort by date chronologically (MM/DD/YYYY format)
    processedData.sort((a, b) => {
      const [aMonth, aDay, aYear] = a.date.split('/').map(Number);
      const [bMonth, bDay, bYear] = b.date.split('/').map(Number);
      
      // Compare years first
      if (aYear !== bYear) return aYear - bYear;
      // Then compare months
      if (aMonth !== bMonth) return aMonth - bMonth;
      // Finally compare days
      return aDay - bDay;
    });
    
    return NextResponse.json({ 
      data: processedData,
      cryptoPrices
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit data' },
      { status: 500 }
    );
  }
}
