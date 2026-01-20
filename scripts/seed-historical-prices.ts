require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';

async function seedHistoricalPrices() {
  const cardId = 'svp-85'; // Pikachu with Grey Felt Hat (Van Gogh)

  console.log(`\nSeeding historical price data for card: ${cardId}...`);

  await connectToDatabase();

  // Base price from current data
  const basePrice = 510.14;

  // Generate 90 days of historical data (to populate 3-month chart)
  const daysToGenerate = 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let savedCount = 0;
  let skippedCount = 0;

  for (let daysAgo = daysToGenerate; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    // Check if price already exists for this date
    const existing = await CardPrice.findOne({
      cardId,
      variant: 'normal',
      date,
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    // Generate realistic price variation
    // Prices tend to fluctuate ±10% over time with some upward trend
    const variation = (Math.random() - 0.5) * 0.2; // ±10%
    const trendFactor = 0.9 + (daysAgo / daysToGenerate) * 0.2; // Slight upward trend toward present
    const price = basePrice * trendFactor * (1 + variation);

    const newPrice = new CardPrice({
      cardId,
      cardName: 'Pikachu with Grey Felt Hat',
      setId: 'svp',
      setName: 'Scarlet & Violet Black Star Promos',
      variant: 'normal',
      marketPrice: Number(price.toFixed(2)),
      lowPrice: Number((price * 0.78).toFixed(2)), // 400 / 510.14 ≈ 0.78
      midPrice: Number((price * 1.27).toFixed(2)), // 650.15 / 510.14 ≈ 1.27
      highPrice: Number((price * 4.9).toFixed(2)), // 2500 / 510.14 ≈ 4.9
      date,
    });

    await newPrice.save();
    savedCount++;

    if (savedCount % 10 === 0) {
      console.log(`  Saved ${savedCount} price records...`);
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`  - Saved: ${savedCount} new price records`);
  console.log(`  - Skipped: ${skippedCount} (already exists)`);
  console.log(`\nNow you can view the price graph with historical data!`);

  process.exit(0);
}

seedHistoricalPrices();
