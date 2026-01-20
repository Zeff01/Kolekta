import { PokemonCard, PokemonSet, ApiResponse, TCGPlayerPricing } from "@/types/pokemon";
import { PokemonTCG } from "pokemon-tcg-sdk-typescript";

// Using pokemontcg.io API - complete card data
const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

interface FetchOptions {
  page?: number;
  pageSize?: number;
  query?: string;
  orderBy?: string;
}

// In-memory cache with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache: Map<string, CacheEntry<unknown>>;
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 60) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert minutes to milliseconds
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    const isExpired = Date.now() - entry.timestamp > this.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create cache instance with 60 minute TTL
const apiCache = new APICache(60);

class PokemonTCGAPI {
  // Map SDK card to our type format
  private mapCard(card: PokemonTCG.Card): PokemonCard {
    return {
      id: card.id,
      name: card.name,
      supertype: card.supertype,
      subtypes: card.subtypes || [],
      level: (card as { level?: string }).level,
      hp: card.hp,
      types: card.types || [],
      evolvesFrom: card.evolvesFrom,
      evolvesTo: card.evolvesTo,
      rules: card.rules,
      ancientTrait: card.ancientTrait,
      abilities: card.abilities,
      attacks: card.attacks || [],
      weaknesses: card.weaknesses || [],
      resistances: card.resistances || [],
      retreatCost: card.retreatCost || [],
      convertedRetreatCost: card.convertedRetreatCost || 0,
      set: {
        id: card.set.id,
        name: card.set.name,
        series: card.set.series,
        printedTotal: card.set.printedTotal,
        total: card.set.total,
        legalities: card.set.legalities,
        ptcgoCode: card.set.ptcgoCode,
        releaseDate: card.set.releaseDate,
        updatedAt: card.set.updatedAt,
        images: {
          symbol: card.set.images.symbol,
          logo: card.set.images.logo,
        },
      },
      number: card.number,
      artist: card.artist,
      rarity: card.rarity,
      flavorText: card.flavorText,
      nationalPokedexNumbers: card.nationalPokedexNumbers,
      legalities: card.legalities,
      images: {
        small: card.images.small,
        large: card.images.large,
      },
      tcgplayer: card.tcgplayer as unknown as TCGPlayerPricing,
    };
  }

  // Map SDK set to our type format
  private mapSet(set: PokemonTCG.Set): PokemonSet {
    return {
      id: set.id,
      name: set.name,
      series: set.series,
      printedTotal: set.printedTotal,
      total: set.total,
      legalities: set.legalities,
      ptcgoCode: set.ptcgoCode,
      releaseDate: set.releaseDate,
      updatedAt: set.updatedAt,
      images: {
        symbol: set.images.symbol,
        logo: set.images.logo,
      },
    };
  }

  // Cards endpoints
  async getCards(options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 50, page = 1 } = options;
    const cacheKey = `cards:page${page}:size${pageSize}`;

    // Check cache first
    const cached = apiCache.get<ApiResponse<PokemonCard[]>>(cacheKey);
    if (cached) {
      console.log(`[PokemonTCG API] Cache HIT - Retrieved ${cached.data.length} cards from cache`);
      return cached;
    }

    console.log(`[PokemonTCG API] Cache MISS - Fetching cards (page: ${page}, limit: ${pageSize})`);
    const startTime = Date.now();

    try {
      const response = await PokemonTCG.findCardsByQueries({
        q: 'supertype:pokemon', // Only fetch Pokemon cards, not trainers/energy
        pageSize: pageSize,
        page: page,
      });

      const duration = Date.now() - startTime;
      console.log(`[PokemonTCG API] Success - Retrieved ${response.length} cards in ${duration}ms`);

      const mappedCards = response.map(card => this.mapCard(card));

      const result = {
        data: mappedCards,
        count: mappedCards.length,
        page,
        pageSize,
      };

      // Store in cache
      apiCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('[PokemonTCG API] Error fetching cards:', error);
      throw error;
    }
  }

  async getCard(id: string): Promise<ApiResponse<PokemonCard>> {
    const cacheKey = `card:${id}`;

    // Check cache first
    const cached = apiCache.get<ApiResponse<PokemonCard>>(cacheKey);
    if (cached) {
      console.log(`[PokemonTCG API] Cache HIT - Retrieved card ${id} from cache`);
      return cached;
    }

    console.log(`[PokemonTCG API] Cache MISS - Fetching card: ${id}`);
    const startTime = Date.now();

    try {
      const card = await PokemonTCG.findCardByID(id);
      const duration = Date.now() - startTime;

      console.log(`[PokemonTCG API] Success - Retrieved card: ${card.name} in ${duration}ms`);
      console.log(`[PokemonTCG API] TCGPlayer data:`, card.tcgplayer ? 'Present' : 'Missing');
      if (card.tcgplayer) {
        console.log(`[PokemonTCG API] TCGPlayer prices:`, JSON.stringify(card.tcgplayer, null, 2));
      }

      const result = {
        data: this.mapCard(card),
      };

      // Store in cache
      apiCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error(`[PokemonTCG API] Error fetching card ${id}:`, error);
      throw error;
    }
  }

  async searchCards(searchTerm: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 250, page = 1 } = options;

    console.log(`[PokemonTCG API] Searching cards: "${searchTerm}" (page: ${page}, pageSize: ${pageSize})`);
    const startTime = Date.now();

    try {
      // Build a more flexible search query
      // Search in both name and set name for better results
      const searchWords = searchTerm.trim().split(/\s+/);

      // For multi-word searches, try to match all words with wildcards
      let query: string;
      if (searchWords.length > 1) {
        // Search for cards where name contains all the search words (in any order)
        const nameQueries = searchWords.map(word => `name:*${word}*`).join(' ');
        query = nameQueries;
      } else {
        // Single word search - use wildcard on both sides for partial matching
        query = `name:*${searchTerm}*`;
      }

      const response = await PokemonTCG.findCardsByQueries({
        q: query,
        pageSize: pageSize,
        page: page,
      });

      const duration = Date.now() - startTime;
      console.log(`[PokemonTCG API] Success - Found ${response.length} cards matching "${searchTerm}" in ${duration}ms`);

      const mappedCards = response.map(card => this.mapCard(card));

      return {
        data: mappedCards,
        count: mappedCards.length,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('[PokemonTCG API] Error searching cards:', error);
      throw error;
    }
  }

  async getCardsBySet(setId: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 250 } = options; // Sets can have up to ~250 cards
    const cacheKey = `set-cards:${setId}:size${pageSize}`;

    // Check cache first
    const cached = apiCache.get<ApiResponse<PokemonCard[]>>(cacheKey);
    if (cached) {
      console.log(`[PokemonTCG API] Cache HIT - Retrieved ${cached.data.length} cards from set ${setId} from cache`);
      return cached;
    }

    console.log(`[PokemonTCG API] Cache MISS - Fetching cards from set: ${setId}`);
    const startTime = Date.now();

    try {
      const response = await PokemonTCG.findCardsByQueries({
        q: `set.id:${setId}`,
        pageSize: pageSize,
        orderBy: 'number', // Order by card number in set
      });

      const duration = Date.now() - startTime;
      console.log(`[PokemonTCG API] Success - Retrieved ${response.length} cards from set in ${duration}ms`);

      const mappedCards = response.map(card => this.mapCard(card));

      const result = {
        data: mappedCards,
        count: mappedCards.length,
        totalCount: mappedCards.length,
      };

      // Store in cache
      apiCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error(`[PokemonTCG API] Error fetching cards from set ${setId}:`, error);
      throw error;
    }
  }

  // Sets endpoints
  async getSets(options: FetchOptions = {}): Promise<ApiResponse<PokemonSet[]>> {
    const { pageSize = 500 } = options;
    const cacheKey = `sets:size${pageSize}`;

    // Check cache first
    const cached = apiCache.get<ApiResponse<PokemonSet[]>>(cacheKey);
    if (cached) {
      console.log(`[PokemonTCG API] Cache HIT - Retrieved ${cached.data.length} sets from cache`);
      return cached;
    }

    console.log(`[PokemonTCG API] Cache MISS - Fetching sets (limit: ${pageSize})`);
    const startTime = Date.now();

    try {
      const response = await PokemonTCG.findSetsByQueries({
        orderBy: '-releaseDate', // Newest first
      });

      const duration = Date.now() - startTime;
      console.log(`[PokemonTCG API] Success - Retrieved ${response.length} sets in ${duration}ms`);

      const mappedSets = response.slice(0, pageSize).map(set => this.mapSet(set));

      const result = {
        data: mappedSets,
        count: mappedSets.length,
        totalCount: response.length,
      };

      // Store in cache
      apiCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('[PokemonTCG API] Error fetching sets:', error);
      throw error;
    }
  }

  async getSet(id: string): Promise<ApiResponse<PokemonSet>> {
    const cacheKey = `set:${id}`;

    // Check cache first
    const cached = apiCache.get<ApiResponse<PokemonSet>>(cacheKey);
    if (cached) {
      console.log(`[PokemonTCG API] Cache HIT - Retrieved set ${id} from cache`);
      return cached;
    }

    console.log(`[PokemonTCG API] Cache MISS - Fetching set: ${id}`);
    const startTime = Date.now();

    try {
      const set = await PokemonTCG.findSetByID(id);
      const duration = Date.now() - startTime;

      console.log(`[PokemonTCG API] Success - Retrieved set: ${set.name} in ${duration}ms`);

      const result = {
        data: this.mapSet(set),
      };

      // Store in cache
      apiCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error(`[PokemonTCG API] Error fetching set ${id}:`, error);
      throw error;
    }
  }

  // Filter helpers
  async getCardsByType(type: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 50, page = 1 } = options;

    console.log(`[PokemonTCG API] Fetching cards by type: ${type}`);

    try {
      const response = await PokemonTCG.findCardsByQueries({
        q: `types:${type}`,
        pageSize: pageSize,
        page: page,
      });

      const mappedCards = response.map(card => this.mapCard(card));

      return {
        data: mappedCards,
        count: mappedCards.length,
      };
    } catch (error) {
      console.error(`[PokemonTCG API] Error fetching cards by type ${type}:`, error);
      throw error;
    }
  }

  async getCardsByRarity(rarity: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 50, page = 1 } = options;

    console.log(`[PokemonTCG API] Fetching cards by rarity: ${rarity}`);

    try {
      const response = await PokemonTCG.findCardsByQueries({
        q: `rarity:"${rarity}"`,
        pageSize: pageSize,
        page: page,
      });

      const mappedCards = response.map(card => this.mapCard(card));

      return {
        data: mappedCards,
        count: mappedCards.length,
      };
    } catch (error) {
      console.error(`[PokemonTCG API] Error fetching cards by rarity ${rarity}:`, error);
      throw error;
    }
  }

  async getCardsBySupertype(supertype: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 50, page = 1 } = options;

    console.log(`[PokemonTCG API] Fetching cards by supertype: ${supertype}`);

    try {
      const response = await PokemonTCG.findCardsByQueries({
        q: `supertype:${supertype}`,
        pageSize: pageSize,
        page: page,
      });

      const mappedCards = response.map(card => this.mapCard(card));

      return {
        data: mappedCards,
        count: mappedCards.length,
      };
    } catch (error) {
      console.error(`[PokemonTCG API] Error fetching cards by supertype ${supertype}:`, error);
      throw error;
    }
  }

  async getCardsByTypeAndRarity(type: string, rarity: string, options: FetchOptions = {}): Promise<ApiResponse<PokemonCard[]>> {
    const { pageSize = 50, page = 1 } = options;

    console.log(`[PokemonTCG API] Fetching cards by type: ${type} and rarity: ${rarity}`);

    try {
      const response = await PokemonTCG.findCardsByQueries({
        q: `types:${type} rarity:"${rarity}"`,
        pageSize: pageSize,
        page: page,
      });

      const mappedCards = response.map(card => this.mapCard(card));

      return {
        data: mappedCards,
        count: mappedCards.length,
        page,
        pageSize,
      };
    } catch (error) {
      console.error(`[PokemonTCG API] Error fetching cards by type ${type} and rarity ${rarity}:`, error);
      throw error;
    }
  }

  // Cache management methods
  getCacheStats() {
    return apiCache.getStats();
  }

  clearCache() {
    apiCache.clear();
    console.log('[PokemonTCG API] Cache cleared');
  }
}

export const pokemonAPI = new PokemonTCGAPI();
