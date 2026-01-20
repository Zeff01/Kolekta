require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';

async function backdateRealPrices() {
  console.log('\n📅 Backdating real price data for testing...\n');

  await connectToDatabase();

  // Get today's real price data
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`Fetching today's price data (${today.toISOString()})...`);
  const todayPrices = await CardPrice.find({ date: today });

  if (todayPrices.length === 0) {
    console.log('❌ No price data found for today. Please run the price cron job first.');
    process.exit(1);
  }

  console.log(`Found ${todayPrices.length} price records from today.\n`);

  // Generate backdated entries for the last 90 days (3 months)
  // We'll create entries every 7 days (weekly) to match the graph's data point frequency
  const daysToBackdate = 90;
  const daysBetweenEntries = 7;
  const numberOfEntries = Math.floor(daysToBackdate / daysBetweenEntries);

  console.log(`Creating ${numberOfEntries} backdated entries (one per week for ${daysToBackdate} days)...\n`);

  let totalCreated = 0;

  for (let i = 1; i <= numberOfEntries; i++) {
    const daysAgo = i * daysBetweenEntries;
    const backdatedDate = new Date(today);
    backdatedDate.setDate(backdatedDate.getDate() - daysAgo);
    backdatedDate.setHours(0, 0, 0, 0);

    console.log(`Creating entries for ${backdatedDate.toLocaleDateString()}...`);

    // Check if data already exists for this date
    const existingCount = await CardPrice.countDocuments({ date: backdatedDate });
    if (existingCount > 0) {
      console.log(`  ⚠️  Skipping - ${existingCount} entries already exist for this date`);
      continue;
    }

    // Duplicate today's prices with the backdated date
    const backdatedPrices = todayPrices.map(price => ({
      cardId: price.cardId,
      cardName: price.cardName,
      setId: price.setId,
      setName: price.setName,
      variant: price.variant,
      marketPrice: price.marketPrice,
      lowPrice: price.lowPrice,
      midPrice: price.midPrice,
      highPrice: price.highPrice,
      directLowPrice: price.directLowPrice,
      date: backdatedDate,
    }));

    // Insert backdated prices
    await CardPrice.insertMany(backdatedPrices);
    totalCreated += backdatedPrices.length;
    console.log(`  ✅ Created ${backdatedPrices.length} price records`);
  }

  console.log(`\n✨ Done! Created ${totalCreated} backdated price records.`);
  console.log(`📊 Your graph should now display ${numberOfEntries + 1} data points over ${daysToBackdate} days.`);
  console.log('\n💡 Note: These are real current prices backdated for testing purposes.');
  console.log('   Daily cron job will continue to add real price data going forward.\n');

  process.exit(0);
}

backdateRealPrices();
