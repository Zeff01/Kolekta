require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { pokemonAPI } from '../lib/pokemon-api';
import { connectToDatabase } from '../lib/mongodb';
import CardPrice from '../models/CardPrice';

async function checkCardPrice() {
  const cardId = 'me2-125';

  console.log(`\n=== Checking card: ${cardId} ===\n`);

  // 1. Check if card has pricing from API
  console.log('1. Fetching card from Pokemon API...');
  try {
    const response = await pokemonAPI.getCard(cardId);
    console.log(`   Card name: ${response.data.name}`);
    console.log(`   Has tcgplayer data: ${!!response.data.tcgplayer}`);

    if (response.data.tcgplayer) {
      console.log('   TCGPlayer prices:');
      for (const [variant, prices] of Object.entries(response.data.tcgplayer)) {
        if (variant !== 'url' && variant !== 'updatedAt') {
          console.log(`     ${variant}:`, prices);
        }
      }
    }
  } catch (error) {
    console.error('   Error fetching card:', error);
  }

  // 2. Check MongoDB for saved prices
  console.log('\n2. Checking MongoDB for saved prices...');
  try {
    await connectToDatabase();

    const priceRecords = await CardPrice.find({ cardId }).sort({ date: -1 }).limit(10);

    if (priceRecords.length === 0) {
      console.log('   ❌ No price records found in MongoDB');
    } else {
      console.log(`   ✅ Found ${priceRecords.length} price records`);
      priceRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.variant} - $${record.marketPrice} (${record.date.toISOString().split('T')[0]})`);
      });
    }
  } catch (error) {
    console.error('   Error checking MongoDB:', error);
  }

  // 3. Test the price history API endpoint
  console.log('\n3. Testing price history API endpoint...');
  console.log(`   URL: http://localhost:3001/api/prices/history?cardId=${cardId}&variant=normal`);
  console.log('   (You can test this in your browser)\n');
}

checkCardPrice();
