require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import { pokemonAPI } from '../lib/pokemon-api';
import CardPrice from '../models/CardPrice';

async function saveSpecificCardPrice() {
  const cardId = 'me2-125';

  console.log(`Fetching card: ${cardId}...`);
  const response = await pokemonAPI.getCard(cardId);
  const card = response.data;

  console.log(`Card name: ${card.name}`);
  const hasPricing = !!(card.tcgplayer && card.tcgplayer.prices);
  console.log(`Has pricing: ${hasPricing}`);

  if (!hasPricing) {
    console.log('No pricing data available');
    process.exit(1);
  }

  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let savedCount = 0;

  const variants: Array<'normal' | 'holofoil' | 'reverseHolofoil' | 'firstEdition'> = [
    'normal',
    'holofoil',
    'reverseHolofoil',
    'firstEdition',
  ];

  for (const variant of variants) {
    const priceData = card.tcgplayer!.prices![variant];

    if (priceData && priceData.market) {
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
        console.log(`✅ Saved ${variant} price: $${priceData.market}`);
        savedCount++;
      } else {
        console.log(`⏭️  Skipped ${variant} (already exists)`);
      }
    }
  }

  console.log(`\nTotal saved: ${savedCount} price records`);
  process.exit(0);
}

saveSpecificCardPrice();
