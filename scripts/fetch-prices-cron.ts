// IMPORTANT: Load environment variables using require() to ensure it runs first
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

// Now import everything else
import cron from 'node-cron';
import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';
import { pokemonAPI } from '../lib/pokemon-api';

const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-change-in-production';

/**
 * Fetches and saves price data for Pokemon cards
 * This script should be run daily to build up historical price data
 */
async function fetchAndSavePrices() {
  console.log(`[Price Cron] Starting price fetch at ${new Date().toISOString()}`);

  try {
    await connectToDatabase();
    console.log('[Price Cron] Connected to database');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch recent cards to track (you can adjust this logic)
    // For now, fetch the first 250 cards (5 pages of 50)
    const cardsToProcess = [];

    for (let page = 1; page <= 5; page++) {
      try {
        const response = await pokemonAPI.getCards({ pageSize: 50, page });
        cardsToProcess.push(...response.data);
        console.log(`[Price Cron] Fetched page ${page} - ${response.data.length} cards`);
      } catch (error) {
        console.error(`[Price Cron] Error fetching page ${page}:`, error);
      }
    }

    console.log(`[Price Cron] Processing ${cardsToProcess.length} cards`);

    let savedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const card of cardsToProcess) {
      try {
        if (!card.tcgplayer?.prices) {
          continue; // Skip cards without pricing data
        }

        const variants: Array<'normal' | 'holofoil' | 'reverseHolofoil' | 'firstEdition'> = [
          'normal',
          'holofoil',
          'reverseHolofoil',
          'firstEdition',
        ];

        for (const variant of variants) {
          const priceData = card.tcgplayer.prices[variant];

          if (priceData && priceData.market) {
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
                marketPrice: priceData.market,
                lowPrice: priceData.low || priceData.market,
                midPrice: priceData.mid || priceData.market,
                highPrice: priceData.high || priceData.market,
                directLowPrice: priceData.directLow || undefined,
                date: today,
              });

              await newPrice.save();
              savedCount++;
            } else {
              skippedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`[Price Cron] Error processing card ${card.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[Price Cron] Completed:`);
    console.log(`  - Saved: ${savedCount} new price snapshots`);
    console.log(`  - Skipped: ${skippedCount} (already exists)`);
    console.log(`  - Errors: ${errorCount}`);
  } catch (error) {
    console.error('[Price Cron] Fatal error:', error);
  }
}

// Run immediately on start
console.log('[Price Cron] Starting price tracking service...');
fetchAndSavePrices();

// Schedule to run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[Price Cron] Running scheduled price fetch');
  await fetchAndSavePrices();
});

console.log('[Price Cron] Cron job scheduled - will run daily at 2:00 AM');

// Keep the process running
process.on('SIGINT', () => {
  console.log('[Price Cron] Shutting down gracefully...');
  process.exit(0);
});
