import { PokemonCard, PokemonSet, ApiResponse } from "@/types/pokemon";

// JustTCG API configuration
const BASE_URL = "https://api.justtcg.com/v1";
const API_KEY = process.env.JUSTTCG_API_KEY;

interface FetchOptions {
  page?: number;
  pageSize?: number;
  query?: string;
  orderBy?: string;
}

// JustTCG API response types
interface JustTCGVariant {
  id: string;
  condition: string;
  printing: string;
  price: number;
  priceChange7d: number;
  priceChange30d: number;
  priceChange90d: number;
  avgPrice7d?: number;
  avgPrice30d?: number;
  avgPrice90d?: number;
  minPrice7d?: number;
  maxPrice7d?: number;
  minPrice30d?: number;
  maxPrice30d?: number;
  stddevPopPrice7d?: number;
  stddevPopPrice30d?: number;
  trendSlope7d?: number;
  trendSlope30d?: number;
  priceHistory?: Array<{ timestamp: string; price: number }>;
  allTimeMinPrice?: number;
  allTimeMinPriceDate?: string;
  allTimeMaxPrice?: number;
  allTimeMaxPriceDate?: string;
}

interface JustTCGCard {
  id: string;
  name: string;
  game: string;
  set: string;
  set_name: string;
  number: string;
  rarity: string;
  tcgplayerId: string;
  variants: JustTCGVariant[];
}

interface JustTCGSet {
  id: string;
  name: string;
  game_id: string;
  game: string;
  count: number;
  cards_count: number;
  variants_count: number;
  sealed_count: number;
  release_date: string;
  set_value_usd: number;
  set_value_change_7d_pct: number;
  set_value_change_30d_pct: number;
  set_value_change_90d_pct: number;
}

class JustTCGAPI {
  private async fetchWithRetry<T>(
    url: string,
    retries = 2
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[JustTCG API] Attempt ${i + 1}/${retries} - Fetching: ${url}`);
        const startTime = Date.now();

        const response = await fetch(url, {
          headers: {
            "x-api-key": API_KEY || "",
          },
          cache: 'force-cache', // Static generation - cache forever
        });

        const duration = Date.now() - startTime;
        console.log(`[JustTCG API] Response received in ${duration}ms - Status: ${response.status}`);
        return response;
      } catch (error) {
        const isLastRetry = i === retries - 1;
        console.error(`[JustTCG API] Attempt ${i + 1} failed:`, error);

        if (isLastRetry) throw error;

        const waitTime = Math.pow(2, i + 1) * 1000;
        console.log(`[JustTCG API] Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
    throw new Error("Max retries reached");
  }

  // Map JustTCG card to our PokemonCard type (simplified)
  private mapToCardResponse(justTCGCard: JustTCGCard): PokemonCard {
    // Get "Near Mint" + "Normal" variant for primary pricing
    const nearMintNormal = justTCGCard.variants.find(
      v => v.condition === "Near Mint" && v.printing === "Normal"
    );
    const nearMintHolofoil = justTCGCard.variants.find(
      v => v.condition === "Near Mint" && v.printing === "Holofoil"
    );
    const nearMintReverseHolo = justTCGCard.variants.find(
      v => v.condition === "Near Mint" && v.printing === "Reverse Holofoil"
    );

    // Build TCGPlayer pricing structure
    const tcgplayer = {
      updated: new Date().toISOString(),
      unit: "USD",
      normal: nearMintNormal ? {
        productId: parseInt(justTCGCard.tcgplayerId),
        lowPrice: nearMintNormal.minPrice30d,
        midPrice: nearMintNormal.avgPrice30d,
        highPrice: nearMintNormal.maxPrice30d,
        marketPrice: nearMintNormal.price,
        directLowPrice: nearMintNormal.minPrice7d,
      } : undefined,
      holofoil: nearMintHolofoil ? {
        productId: parseInt(justTCGCard.tcgplayerId),
        lowPrice: nearMintHolofoil.minPrice30d,
        midPrice: nearMintHolofoil.avgPrice30d,
        highPrice: nearMintHolofoil.maxPrice30d,
        marketPrice: nearMintHolofoil.price,
        directLowPrice: nearMintHolofoil.minPrice7d,
      } : undefined,
      reverseHolofoil: nearMintReverseHolo ? {
        productId: parseInt(justTCGCard.tcgplayerId),
        lowPrice: nearMintReverseHolo.minPrice30d,
        midPrice: nearMintReverseHolo.avgPrice30d,
        highPrice: nearMintReverseHolo.maxPrice30d,
        marketPrice: nearMintReverseHolo.price,
        directLowPrice: nearMintReverseHolo.minPrice7d,
      } : undefined,
    };

    return {
      id: justTCGCard.id,
      name: justTCGCard.name,
      supertype: "Unknown", // Not provided by JustTCG
      subtypes: [],
      set: {
        id: justTCGCard.set,
        name: justTCGCard.set_name,
        series: "", // Will be populated from sets endpoint
        printedTotal: 0,
        total: 0,
        releaseDate: "",
        updatedAt: new Date().toISOString(),
        images: {
          symbol: "",
          logo: "",
        },
      },
      number: justTCGCard.number,
      rarity: justTCGCard.rarity,
      images: {
        small: "", // No images from JustTCG
        large: "",
      },
      tcgplayer,
      // Store all variants for detailed pricing view
      justTCGVariants: justTCGCard.variants,
    };
  }

  private mapToSetResponse(justTCGSet: JustTCGSet): PokemonSet {
    return {
      id: justTCGSet.id,
      name: justTCGSet.name,
      series: "Pokemon",
      printedTotal: justTCGSet.cards_count,
      total: justTCGSet.cards_count,
      releaseDate: justTCGSet.release_date,
      updatedAt: new Date().toISOString(),
      images: {
        symbol: "",
        logo: "",
      },
    };
  }

  // Cards endpoints
  async getCards(options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 30, page = 1 } = options;

    console.log(`[JustTCG API] Fetching cards (page: ${page}, limit: ${pageSize})`);

    // JustTCG doesn't have a "get all cards" endpoint, we'll need to fetch by sets
    // For now, return empty array - we'll populate this from sets
    console.log(`[JustTCG API] Note: Use getCardsBySet() instead - JustTCG requires set-based fetching`);

    return {
      data: [],
      count: 0,
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  async getCard(tcgplayerId: string): Promise<ApiResponse<PokemonCard>> {
    console.log(`[JustTCG API] Fetching card by TCGPlayer ID: ${tcgplayerId}`);
    const response = await this.fetchWithRetry(
      `${BASE_URL}/cards?tcgplayerId=${tcgplayerId}`
    );

    if (!response.ok) {
      throw new Error(`JustTCG API returned ${response.status}: ${response.statusText}`);
    }

    const cards: JustTCGCard[] = await response.json();

    if (!cards || cards.length === 0) {
      throw new Error(`Card with TCGPlayer ID ${tcgplayerId} not found`);
    }

    const card = cards[0];
    console.log(`[JustTCG API] Success - Retrieved card: ${card.name}`);

    return {
      data: this.mapToCardResponse(card),
    };
  }

  async searchCards(searchTerm: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 30 } = options;

    console.log(`[JustTCG API] Searching cards: ${searchTerm}`);
    const response = await this.fetchWithRetry(
      `${BASE_URL}/cards?name=${encodeURIComponent(searchTerm)}&game=Pokemon&limit=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`JustTCG API returned ${response.status}: ${response.statusText}`);
    }

    const cards: JustTCGCard[] = await response.json();
    const mappedCards = cards.map(card => this.mapToCardResponse(card));

    console.log(`[JustTCG API] Success - Found ${mappedCards.length} cards matching "${searchTerm}"`);
    return {
      data: mappedCards,
      count: mappedCards.length,
      totalCount: mappedCards.length,
    };
  }

  async getCardsBySet(setId: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 500 } = options;

    console.log(`[JustTCG API] Fetching cards from set: ${setId}`);
    const response = await this.fetchWithRetry(
      `${BASE_URL}/cards?set=${setId}&game=Pokemon&limit=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`JustTCG API returned ${response.status}: ${response.statusText}`);
    }

    const cards: JustTCGCard[] = await response.json();
    const mappedCards = cards.map(card => this.mapToCardResponse(card));

    console.log(`[JustTCG API] Success - Retrieved ${mappedCards.length} cards from set`);
    return {
      data: mappedCards,
      count: mappedCards.length,
      totalCount: mappedCards.length,
    };
  }

  // Sets endpoints
  async getSets(options: FetchOptions = {}): Promise<ApiResponse<PokemonSet[]>> {
    const { pageSize = 500 } = options;

    console.log(`[JustTCG API] Fetching sets (limit: ${pageSize})`);
    const response = await this.fetchWithRetry(
      `${BASE_URL}/sets?game=Pokemon&limit=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`JustTCG API returned ${response.status}: ${response.statusText}`);
    }

    const responseData: { data: JustTCGSet[] } = await response.json();
    const sets = responseData.data;

    // Console log first 3 sets to see structure
    console.log('[JustTCG API] Sample sets data:', JSON.stringify(sets.slice(0, 3), null, 2));

    const mappedSets = sets.map(set => this.mapToSetResponse(set));

    console.log(`[JustTCG API] Success - Retrieved ${mappedSets.length} sets`);
    console.log('[JustTCG API] First 3 mapped sets:', JSON.stringify(mappedSets.slice(0, 3), null, 2));

    return {
      data: mappedSets,
      count: mappedSets.length,
      totalCount: mappedSets.length,
    };
  }

  async getSet(id: string): Promise<ApiResponse<PokemonSet>> {
    console.log(`[JustTCG API] Fetching set: ${id}`);
    const response = await this.fetchWithRetry(
      `${BASE_URL}/sets?id=${id}`
    );

    if (!response.ok) {
      throw new Error(`JustTCG API returned ${response.status}: ${response.statusText}`);
    }

    const responseData: { data: JustTCGSet[] } = await response.json();
    const set = responseData.data[0];

    if (!set) {
      throw new Error(`Set with ID ${id} not found`);
    }

    console.log(`[JustTCG API] Success - Retrieved set: ${set.name}`);

    return {
      data: this.mapToSetResponse(set),
    };
  }
}

export const pokemonAPI = new JustTCGAPI();
