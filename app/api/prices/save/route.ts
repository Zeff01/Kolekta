import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CardPrice from '@/models/CardPrice';
import { pokemonAPI } from '@/lib/pokemon-api';

// This endpoint will be called by our cron job to save daily price snapshots
export async function POST(request: NextRequest) {
  try {
    // Simple authentication - check for a secret key
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-change-in-production';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get card ID from request (or fetch multiple cards)
    const body = await request.json();
    const { cardId, limit = 50 } = body;

    let cardsToProcess: string[] = [];

    if (cardId) {
      // Save specific card
      cardsToProcess = [cardId];
    } else {
      // Fetch recent cards to track
      const response = await pokemonAPI.getCards({ pageSize: limit });
      cardsToProcess = response.data.map((card) => card.id);
    }

    const savedPrices = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    for (const id of cardsToProcess) {
      try {
        const { data: card } = await pokemonAPI.getCard(id);

        // Save prices for each variant that exists
        const variants: Array<'normal' | 'holofoil' | 'reverseHolofoil' | 'firstEdition'> = [
          'normal',
          'holofoil',
          'reverseHolofoil',
          'firstEdition',
        ];

        for (const variant of variants) {
          const priceData = card.tcgplayer?.[variant];

          if (priceData && priceData.marketPrice) {
            // Check if we already have a price for today
            const existingPrice = await CardPrice.findOne({
              cardId: card.id,
              variant,
              date: today,
            });

            if (!existingPrice) {
              const newPrice = new CardPrice({
                cardId: card.id,
                cardName: card.name,
                setId: card.set.id,
                setName: card.set.name,
                variant,
                marketPrice: priceData.marketPrice,
                lowPrice: priceData.lowPrice || priceData.marketPrice,
                midPrice: priceData.midPrice || priceData.marketPrice,
                highPrice: priceData.highPrice || priceData.marketPrice,
                directLowPrice: priceData.directLowPrice,
                date: today,
              });

              await newPrice.save();
              savedPrices.push({
                cardId: card.id,
                cardName: card.name,
                variant,
                price: priceData.marketPrice,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing card ${id}:`, error);
        // Continue with next card
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${savedPrices.length} price snapshots`,
      prices: savedPrices,
    });
  } catch (error) {
    console.error('Error saving prices:', error);
    return NextResponse.json(
      { error: 'Failed to save prices', details: String(error) },
      { status: 500 }
    );
  }
}
