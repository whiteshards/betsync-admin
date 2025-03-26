
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("BetSync");
    
    // Fetch data from profit_data collection
    const profitData = await db.collection("profit_data")
      .find({})
      .toArray();
    
    // Keep raw profit values and format dates
    const processedData = profitData.map(item => ({
      date: item.date,
      totalProfitTokens: item.total_profit,
      totalProfitUSD: item.total_profit
    }));
    
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
    
    return NextResponse.json({ data: processedData });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit data' },
      { status: 500 }
    );
  }
}
