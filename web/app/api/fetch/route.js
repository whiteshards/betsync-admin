
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

    // Fetch data for the specific server
    const server = await db.collection("servers").findOne({ 
      server_id: serverId 
    });

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // Process the server data
    const processedData = {
      serverId: server.server_id.toString(),
      serverName: server.server_name,
      totalProfit: server.total_profit,
      totalProfitUSD: server.total_profit,
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
