require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';

async function clearMockPrices() {
  console.log('\n🧹 Clearing mock/seeded historical price data...\n');

  await connectToDatabase();

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`Today's date: ${today.toISOString()}`);

  // Count total records before deletion
  const totalBefore = await CardPrice.countDocuments();
  console.log(`Total price records before: ${totalBefore}`);

  // Count records from today (real data we want to keep)
  const todayCount = await CardPrice.countDocuments({ date: today });
  console.log(`Records from today (will keep): ${todayCount}`);

  // Delete all records that are NOT from today (mock/seeded data)
  const deleteResult = await CardPrice.deleteMany({
    date: { $lt: today }
  });

  console.log(`\n✅ Deleted ${deleteResult.deletedCount} mock/seeded price records`);

  // Count total records after deletion
  const totalAfter = await CardPrice.countDocuments();
  console.log(`Total price records after: ${totalAfter}`);

  console.log('\n✨ Done! Your database now contains only real price data.');
  console.log('💡 Run the cron job daily to build up historical data over time.');

  process.exit(0);
}

clearMockPrices();
