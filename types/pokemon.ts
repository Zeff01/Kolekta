// Pokemon TCG API Type Definitions

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  level?: string;
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  ancientTrait?: {
    name: string;
    text: string;
  };
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: SetInfo;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: TCGPlayerPricing;
  justTCGVariants?: JustTCGVariant[]; // All variants from JustTCG for detailed pricing
}

export interface Ability {
  name: string;
  text: string;
  type: string;
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface Price {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

export interface TCGPlayerPrice {
  productId?: number;
  lowPrice?: number;
  midPrice?: number;
  highPrice?: number;
  marketPrice?: number;
  directLowPrice?: number;
  // Also support the actual API format
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number | null;
}

export interface TCGPlayerPricing {
  url?: string;
  updatedAt?: string;
  prices?: {
    normal?: TCGPlayerPrice;
    holofoil?: TCGPlayerPrice;
    reverseHolofoil?: TCGPlayerPrice;
    firstEdition?: TCGPlayerPrice;
    unlimited?: TCGPlayerPrice;
  };
  // Legacy format (keeping for backward compatibility)
  updated?: string;
  unit?: string;
  normal?: TCGPlayerPrice;
  holofoil?: TCGPlayerPrice;
  reverseHolofoil?: TCGPlayerPrice;
}

// JustTCG API variant with comprehensive pricing statistics
export interface JustTCGVariant {
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

export interface SetInfo {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities?: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities?: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
  totalPages?: number;
}

// Marketplace Types
export type CardCondition = 'Raw' | 'LP' | 'MP' | 'HP' | 'Damaged';
export type CardGradingStatus = 'raw' | 'graded';

export interface CardGrading {
  company: 'PSA' | 'CGC' | 'BGS';
  grade: string;
}

export interface PaymentInfo {
  gcashNumber?: string;
  gcashQR?: string; // URL to uploaded QR image
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

export interface MarketplaceListing {
  _id: string;
  userId: string;
  seller?: {
    _id: string;
    username: string;
    email: string;
  };
  cardId: string;
  card: PokemonCard;
  quantity: number;
  pricePerCard: number; // In PHP
  condition: CardCondition;
  gradingStatus: CardGradingStatus;
  grading?: CardGrading;
  description?: string;
  images?: string[]; // URLs to additional photos
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  message: string;
  images?: string[]; // URLs to uploaded images (gcash receipt, address, etc)
  read: boolean;
  createdAt: string;
}

export interface MessageThread {
  listingId: string;
  listing: MarketplaceListing;
  otherUser: {
    _id: string;
    username: string;
  };
  messages: Message[];
  unreadCount: number;
}
