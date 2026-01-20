require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';

async function checkPriceData() {
  console.log('\n🔍 Checking price data in database...\n');

  await connectToDatabase();

  // Get a sample card to check its price history
  const sampleCard = await CardPrice.findOne();

  if (!sampleCard) {
    console.log('❌ No price data found in database');
    process.exit(1);
  }

  console.log(`Sample card: ${sampleCard.cardName} (${sampleCard.cardId})`);
  console.log(`Variant: ${sampleCard.variant}\n`);

  // Get all price records for this card/variant combination
  const priceHistory = await CardPrice.find({
    cardId: sampleCard.cardId,
    variant: sampleCard.variant,
  }).sort({ date: 1 });

  console.log(`Found ${priceHistory.length} price records:\n`);

  priceHistory.forEach(record => {
    console.log(`${record.date.toLocaleDateString()} - Market: $${record.marketPrice.toFixed(2)}`);
  });

  console.log('\n');
  process.exit(0);
}

checkPriceData();
