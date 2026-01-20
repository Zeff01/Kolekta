import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CardPrice from '@/models/CardPrice';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    const variant = searchParams.get('variant') || 'normal';
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 365;

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
    }

    // Calculate date range
    const endDate = new Date();

    // For "max" (very large number like 999999), get ALL price history
    let query: Record<string, unknown>;
    if (days >= 99999) {
      // Get all historical data (no date filter)
      query = {
        cardId,
        variant,
      };
    } else {
      // Get data within specific date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = {
        cardId,
        variant,
        date: { $gte: startDate, $lte: endDate },
      };
    }

    // Fetch price history
    const priceHistory = await CardPrice.find(query)
      .sort({ date: 1 })
      .select('date marketPrice lowPrice highPrice midPrice')
      .lean();

    // Calculate statistics
    const prices = priceHistory.map((p) => p.marketPrice);
    const currentPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
    const oldestPrice = prices.length > 0 ? prices[0] : 0;
    const priceChange = currentPrice - oldestPrice;
    const priceChangePercent = oldestPrice > 0 ? ((priceChange / oldestPrice) * 100) : 0;

    const maxPrice = Math.max(...prices, 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    return NextResponse.json({
      cardId,
      variant,
      history: priceHistory,
      stats: {
        currentPrice,
        priceChange,
        priceChangePercent,
        maxPrice,
        minPrice,
        avgPrice,
        dataPoints: priceHistory.length,
        oldestDate: priceHistory.length > 0 ? priceHistory[0].date : null,
        newestDate: priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].date : null,
      },
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history', details: String(error) },
      { status: 500 }
    );
  }
}
