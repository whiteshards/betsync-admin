
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("BetSync");
    
    // Fetch data from server_profit collection
    const serverProfitData = await db.collection("server_profit")
      .find({})
      .toArray();
    
    // Group by server_id and calculate total profit
    const serverMap = new Map();
    
    serverProfitData.forEach(item => {
      const serverId = item.server_id.toString();
      const profit = parseFloat(item.profit);
      const serverName = item.server_name;
      
      if (serverMap.has(serverId)) {
        const server = serverMap.get(serverId);
        server.totalProfit += profit;
        server.records.push({
          date: item.date,
          profit: profit
        });
      } else {
        serverMap.set(serverId, {
          serverId: serverId,
          serverName: serverName,
          totalProfit: profit,
          records: [{
            date: item.date,
            profit: profit
          }]
        });
      }
    });
    
    // Convert to array and sort by total profit
    const processedData = Array.from(serverMap.values()).sort((a, b) => b.totalProfit - a.totalProfit);
    
    // Convert tokens to USD (1 token = 0.0212 USD)
    processedData.forEach(server => {
      server.totalProfitUSD = parseFloat((server.totalProfit * 0.0212).toFixed(2));
      server.records.forEach(record => {
        record.profitUSD = parseFloat((record.profit * 0.0212).toFixed(2));
      });
    });
    
    return NextResponse.json({ data: processedData });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server profit data' },
      { status: 500 }
    );
  }
}
