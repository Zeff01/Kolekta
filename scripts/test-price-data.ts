require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { pokemonAPI } from '../lib/pokemon-api';

async function testPriceData() {
  try {
    console.log('Fetching a sample card to check price data...');

    const response = await pokemonAPI.getCards({ pageSize: 10, page: 1 });

    console.log(`\nFetched ${response.data.length} cards`);

    for (const card of response.data) {
      console.log(`\n--- Card: ${card.name} (${card.id}) ---`);
      console.log('Has tcgplayer data:', !!card.tcgplayer);

      if (card.tcgplayer) {
        console.log('TCGPlayer data:', JSON.stringify(card.tcgplayer, null, 2));
      } else {
        console.log('No TCGPlayer pricing data available');
      }

      console.log('Has cardmarket data:', !!card.cardmarket);
      if (card.cardmarket) {
        console.log('Cardmarket data:', JSON.stringify(card.cardmarket, null, 2));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testPriceData();
