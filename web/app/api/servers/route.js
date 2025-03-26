
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("BetSync");

    // Fetch data from servers collection
    const serverData = await db.collection("servers")
      .find({})
      .toArray();

    // Process the server data structure
    const processedData = serverData.map(server => ({
      serverId: server.server_id.toString(),
      serverName: server.server_name,
      totalProfit: server.total_profit,
      totalProfitUSD: server.total_profit,
      giveawayChannel: server.giveaway_channel,
      whitelist: server.whitelisted_channels || []
    }));

    // Sort by total profit
    processedData.sort((a, b) => b.totalProfit - a.totalProfit);

    return NextResponse.json({ data: processedData });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server data' },
      { status: 500 }
    );
  }
}
