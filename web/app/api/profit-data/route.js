
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("BetSync");
    
    // Fetch data from profit_data collection
    const profitData = await db.collection("profit_data")
      .find({})
      .sort({ date: -1 })
      .toArray();
    
    // Keep raw profit values
    const processedData = profitData.map(item => ({
      date: item.date,
      totalProfitTokens: item.total_profit,
      totalProfitUSD: item.total_profit
    }));
    
    return NextResponse.json({ data: processedData });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit data' },
      { status: 500 }
    );
  }
}
