require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';

// Cards to seed with their current prices and metadata
const cardsToSeed = [
  {
    cardId: 'svp-85',
    cardName: 'Pikachu with Grey Felt Hat',
    setId: 'svp',
    setName: 'Scarlet & Violet Black Star Promos',
    variant: 'normal',
    basePrice: 510.14,
  },
  {
    cardId: 'me2-125',
    cardName: 'Mega Charizard X ex',
    setId: 'me2',
    setName: 'Mega Evolution',
    variant: 'holofoil',
    basePrice: 608.25,
  },
];

async function seedMaxHistoricalPrices() {
  console.log(`\n🔄 Seeding maximum historical price data for ${cardsToSeed.length} cards...`);

  await connectToDatabase();

  // Generate 3 years of historical data (to show long-term trends)
  const yearsToGenerate = 3;
  const daysToGenerate = yearsToGenerate * 365;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalSaved = 0;
  let totalSkipped = 0;

  for (const card of cardsToSeed) {
    console.log(`\n📊 Seeding ${card.cardName} (${card.cardId})...`);

    let savedCount = 0;
    let skippedCount = 0;

    for (let daysAgo = daysToGenerate; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      // Check if price already exists for this date
      const existing = await CardPrice.findOne({
        cardId: card.cardId,
        variant: card.variant,
        date,
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Generate realistic price variation over time
      // Older prices tend to be lower with more volatility
      const ageInYears = daysAgo / 365;

      // Price tends to increase over time (appreciation)
      // 3 years ago: ~60% of current price
      // 2 years ago: ~75% of current price
      // 1 year ago: ~85% of current price
      // Recent: ~95-100% of current price
      const appreciationFactor = 0.6 + (1 - ageInYears / yearsToGenerate) * 0.4;

      // Add random variation (±15% for older dates, ±5% for recent dates)
      const volatility = 0.05 + (ageInYears / yearsToGenerate) * 0.10;
      const variation = (Math.random() - 0.5) * 2 * volatility;

      // Calculate price
      const price = card.basePrice * appreciationFactor * (1 + variation);

      const newPrice = new CardPrice({
        cardId: card.cardId,
        cardName: card.cardName,
        setId: card.setId,
        setName: card.setName,
        variant: card.variant,
        marketPrice: Number(price.toFixed(2)),
        lowPrice: Number((price * 0.85).toFixed(2)),
        midPrice: Number((price * 1.10).toFixed(2)),
        highPrice: Number((price * 1.30).toFixed(2)),
        date,
      });

      await newPrice.save();
      savedCount++;
      totalSaved++;

      if (savedCount % 50 === 0) {
        console.log(`  ✓ Saved ${savedCount} price records...`);
      }
    }

    totalSkipped += skippedCount;
    console.log(`  ✅ ${card.cardName}: Saved ${savedCount}, Skipped ${skippedCount}`);
  }

  console.log(`\n✅ All Done!`);
  console.log(`  📈 Total Saved: ${totalSaved} price records`);
  console.log(`  ⏭️  Total Skipped: ${totalSkipped} (already exists)`);
  console.log(`  📅 Date Range: ${yearsToGenerate} years of historical data`);
  console.log(`\n🎉 Now you can view the full price history with the MAX filter!`);

  process.exit(0);
}

seedMaxHistoricalPrices();
