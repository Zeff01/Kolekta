import axios from 'axios';

async function testDirectAPI() {
  try {
    console.log('Testing direct API call without SDK...\n');

    // Test 1: Simple request without orderBy
    const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
      params: {
        q: 'supertype:pokemon',
        pageSize: 5,
        page: 1,
      }
    });

    console.log(`✅ Fetched ${response.data.data.length} cards\n`);

    for (const card of response.data.data) {
      console.log(`--- ${card.name} (${card.id}) ---`);
      console.log('Has tcgplayer:', !!card.tcgplayer);

      if (card.tcgplayer) {
        console.log('URL:', card.tcgplayer.url);
        console.log('Updated:', card.tcgplayer.updatedAt);
        console.log('Prices:');

        for (const [variant, priceData] of Object.entries(card.tcgplayer.prices || {})) {
          console.log(`  ${variant}:`, priceData);
        }
      } else {
        console.log('❌ No TCGPlayer data');
      }
      console.log('');
    }

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.status, error.response?.statusText);
      console.error('URL:', error.config?.url);
    } else {
      console.error('Error:', error);
    }
  }
}

testDirectAPI();
