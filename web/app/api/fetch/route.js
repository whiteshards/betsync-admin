
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

export async function GET(request) {
  try {
    // Get the server ID from the URL parameters
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('id');

    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("BetSync");

    // Fetch crypto prices
    const cryptoPrices = await fetchCryptoPrices();

    // Try different approaches to find the server
    let server = null;
    
    // First try numeric ID
    if (!isNaN(serverId)) {
      server = await db.collection("servers").findOne({ server_id: Number(serverId) });
    }
    
    // If not found, try string ID
    if (!server) {
      server = await db.collection("servers").findOne({ server_id: serverId });
    }
    
    // If still not found, try string comparison
    if (!server) {
      const allServers = await db.collection("servers").find({}).toArray();
      server = allServers.find(s => String(s.server_id) === String(serverId));
    }

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // Calculate total USD value and crypto values
    let totalProfitUSD = 0;
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
    } else if (typeof server.total_profit === 'number' || typeof server.total_profit === 'string') {
      // Fallback to total_profit if wallet doesn't exist
      totalProfitUSD = typeof server.total_profit === 'number' ? server.total_profit : parseFloat(server.total_profit || 0);
    }

    // Calculate server's cut (30% of total profit)
    const serverCut = totalProfitUSD * 0.3;

    // Process the server data
    const processedData = {
      serverId: server.server_id.toString(),
      serverName: server.server_name,
      wallet: server.wallet || {},
      cryptoValues,
      totalProfitUSD,
      serverCut,
      giveawayChannel: server.giveaway_channel,
      whitelist: server.whitelisted_channels || [],
      region: "US-East", // Adding this for consistency with the UI
      status: "Active"    // Adding this for consistency with the UI
    };

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
