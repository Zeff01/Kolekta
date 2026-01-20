require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';

async function backdatePricesWithVariation() {
  console.log('\n📊 Creating backdated prices with realistic variation...\n');

  await connectToDatabase();

  // First, delete all existing backdated data (keep only today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Clearing old backdated data...');
  const deleteResult = await CardPrice.deleteMany({ date: { $lt: today } });
  console.log(`Deleted ${deleteResult.deletedCount} old records\n`);

  // Get today's real price data
  console.log(`Fetching today's price data (${today.toISOString()})...`);
  const todayPrices = await CardPrice.find({ date: today });

  if (todayPrices.length === 0) {
    console.log('❌ No price data found for today. Please run the price cron job first.');
    process.exit(1);
  }

  console.log(`Found ${todayPrices.length} price records from today.\n`);

  // Generate backdated entries for the last 3 years (1095 days)
  const daysToBackdate = 1095; // ~3 years
  const daysBetweenEntries = 7; // Weekly data points
  const numberOfEntries = Math.floor(daysToBackdate / daysBetweenEntries);

  console.log(`Creating ${numberOfEntries} backdated entries with price variation...\n`);

  let totalCreated = 0;

  for (let i = numberOfEntries; i >= 1; i--) {
    const daysAgo = i * daysBetweenEntries;
    const backdatedDate = new Date(today);
    backdatedDate.setDate(backdatedDate.getDate() - daysAgo);
    backdatedDate.setHours(0, 0, 0, 0);

    console.log(`Creating entries for ${backdatedDate.toLocaleDateString()}...`);

    // Create price variation based on how far back we go
    // Older prices will have more variation (market fluctuation simulation)
    const maxVariation = 0.20; // ±20% max variation
    const variationRange = (daysAgo / daysToBackdate) * maxVariation;

    // Random variation for this week
    const weeklyVariation = (Math.random() - 0.5) * 2 * variationRange;

    // Significant upward trend over time (prices generally increase over 3 years)
    const trendFactor = 1 - (daysAgo / daysToBackdate) * 0.5; // 50% growth over 3 years

    const backdatedPrices = todayPrices.map(price => {
      // Calculate varied prices
      const combinedFactor = (1 + weeklyVariation) * trendFactor;

      return {
        cardId: price.cardId,
        cardName: price.cardName,
        setId: price.setId,
        setName: price.setName,
        variant: price.variant,
        marketPrice: Math.max(0.01, Number((price.marketPrice * combinedFactor).toFixed(2))),
        lowPrice: Math.max(0.01, Number((price.lowPrice * combinedFactor).toFixed(2))),
        midPrice: Math.max(0.01, Number((price.midPrice * combinedFactor).toFixed(2))),
        highPrice: Math.max(0.01, Number((price.highPrice * combinedFactor).toFixed(2))),
        directLowPrice: price.directLowPrice ? Math.max(0.01, Number((price.directLowPrice * combinedFactor).toFixed(2))) : undefined,
        date: backdatedDate,
      };
    });

    // Insert backdated prices
    await CardPrice.insertMany(backdatedPrices);
    totalCreated += backdatedPrices.length;
    console.log(`  ✅ Created ${backdatedPrices.length} price records (variation: ${(weeklyVariation * 100).toFixed(1)}%)`);
  }

  console.log(`\n✨ Done! Created ${totalCreated} backdated price records with realistic variation.`);
  console.log(`📊 Your graph should now display ${numberOfEntries + 1} data points over 3 years.`);
  console.log(`📅 Date range: ${new Date(today.getTime() - daysToBackdate * 24 * 60 * 60 * 1000).toLocaleDateString()} to ${today.toLocaleDateString()}`);
  console.log('\n💡 Note: Prices include simulated market fluctuation for demonstration.');
  console.log('   Daily cron job will continue to add real price data going forward.\n');

  process.exit(0);
}

backdatePricesWithVariation();
