
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

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

    // Calculate server's cut (30% of total profit)
    const totalProfit = typeof server.total_profit === 'number' ? server.total_profit : parseFloat(server.total_profit || 0);
    const serverCut = totalProfit * 0.3;

    // Process the server data
    const processedData = {
      serverId: server.server_id.toString(),
      serverName: server.server_name,
      totalProfit: totalProfit,
      totalProfitUSD: totalProfit,
      serverCut: serverCut,
      giveawayChannel: server.giveaway_channel,
      whitelist: server.whitelisted_channels || [],
      region: "US-East", // Adding this for consistency with the UI
      status: "Active"    // Adding this for consistency with the UI
    };

    return NextResponse.json({ data: processedData });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server data' },
      { status: 500 }
    );
  }
}
