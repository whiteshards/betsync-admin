
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

async function fetchCryptoPrices() {
  try {
    // Using CoinGecko API to fetch cryptocurrency prices
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

    // Fetch data from servers collection
    const serverData = await db.collection("servers")
      .find({})
      .toArray();

    // Process the server data structure with wallet
    const processedData = serverData.map(server => {
      // Initialize total USD value
      let totalProfitUSD = 0;
      
      // Calculate crypto values
      const cryptoValues = {};
      
      // Process wallet if it exists
      if (server.wallet) {
        Object.entries(server.wallet).forEach(([crypto, amount]) => {
          const price = cryptoPrices[crypto.toLowerCase()] || 0;
          const valueUSD = amount * price;
          cryptoValues[crypto] = {
            amount,
            priceUSD: price,
            valueUSD
          };
          totalProfitUSD += valueUSD;
        });
      }

      return {
        serverId: server.server_id.toString(),
        serverName: server.server_name,
        wallet: server.wallet || {},
        cryptoValues,
        totalProfitUSD,
        giveawayChannel: server.giveaway_channel,
        whitelist: server.whitelisted_channels || []
      };
    });

    // Sort by total profit
    processedData.sort((a, b) => b.totalProfitUSD - a.totalProfitUSD);

    return NextResponse.json({ 
      data: processedData,
      cryptoPrices
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server data' },
      { status: 500 }
    );
  }
}
