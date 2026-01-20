'use client';

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PokemonCard } from '@/types/pokemon';
import { useAuth } from '@/contexts/AuthContext';

// Card condition types
export type CardCondition = 'Raw' | 'LP' | 'MP' | 'HP';
export type GradingCompany = 'PSA' | 'CGC' | 'BGS';
export type GradeValue = '10' | '9.5' | '9' | '8.5' | '8' | '7.5' | '7' | '6.5' | '6' | '5.5' | '5' | '4.5' | '4' | '3.5' | '3' | '2.5' | '2' | '1.5' | '1';

export interface GradingInfo {
  company: GradingCompany;
  grade: GradeValue;
}

interface CollectionItem {
  card: PokemonCard;
  addedAt: string;
  quantity: number;
  purchasePrice?: number; // Price paid per card
  condition?: CardCondition; // Card condition (Raw, LP, MP, HP)
  grading?: GradingInfo; // Grading information (PSA/CGC/BGS + grade)
}

interface WishlistItem {
  card: PokemonCard;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface CollectionContextType {
  // Collection
  collection: CollectionItem[];
  addToCollection: (card: PokemonCard, quantity?: number, purchasePrice?: number, condition?: CardCondition, grading?: GradingInfo) => void;
  removeFromCollection: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  updatePurchasePrice: (cardId: string, purchasePrice: number) => void;
  updateCondition: (cardId: string, condition: CardCondition) => void;
  updateGrading: (cardId: string, grading: GradingInfo | undefined) => void;
  isInCollection: (cardId: string) => boolean;
  getCardQuantity: (cardId: string) => number;
  getCollectionItem: (cardId: string) => CollectionItem | undefined;

  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (card: PokemonCard, priority?: 'low' | 'medium' | 'high') => void;
  removeFromWishlist: (cardId: string) => void;
  updatePriority: (cardId: string, priority: 'low' | 'medium' | 'high') => void;
  isInWishlist: (cardId: string) => boolean;
  getWishlistItem: (cardId: string) => WishlistItem | undefined;

  // Stats
  totalCards: number;
  totalValue: number;
  totalPurchaseCost: number;
  totalProfitLoss: number;
  isLoaded: boolean;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [localCollection, setLocalCollection, localCollectionLoaded] = useLocalStorage<CollectionItem[]>('pokemon-collection', []);
  const [localWishlist, setLocalWishlist, localWishlistLoaded] = useLocalStorage<WishlistItem[]>('pokemon-wishlist', []);

  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to database (debounced)
  const syncToDatabase = useCallback(async (newCollection: CollectionItem[], newWishlist: WishlistItem[]) => {
    if (!isAuthenticated || isSyncing) return;

    setIsSyncing(true);
    try {
      await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: newCollection,
          wishlist: newWishlist,
        }),
      });
    } catch (error) {
      console.error('Failed to sync collection:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, isSyncing]);

  // Load data on mount and when auth changes
  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !localCollectionLoaded || !localWishlistLoaded) {
        return;
      }

      if (isAuthenticated) {
        // Load from database
        try {
          const response = await fetch('/api/collection');
          if (response.ok) {
            const data = await response.json();

            // Merge localStorage data with database data (database takes precedence)
            if (data.collection.length === 0 && localCollection.length > 0) {
              // First time login: migrate localStorage to database
              await syncToDatabase(localCollection, localWishlist);
              setCollection(localCollection);
              setWishlist(localWishlist);
            } else {
              setCollection(data.collection);
              setWishlist(data.wishlist);
            }
          }
        } catch (error) {
          console.error('Failed to load collection from database:', error);
          // Fallback to localStorage
          setCollection(localCollection);
          setWishlist(localWishlist);
        }
      } else {
        // Use localStorage when not authenticated
        setCollection(localCollection);
        setWishlist(localWishlist);
      }

      setIsLoaded(true);
    };

    loadData();
  }, [isAuthenticated, authLoading, localCollectionLoaded, localWishlistLoaded, localCollection, localWishlist, syncToDatabase]);

  // Collection methods
  const addToCollection = (card: PokemonCard, quantity: number = 1, purchasePrice?: number, condition?: CardCondition, grading?: GradingInfo) => {
    const updateFn = (prev: CollectionItem[]) => {
      const existing = prev.find((item) => item.card.id === card.id);
      if (existing) {
        return prev.map((item) =>
          item.card.id === card.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                purchasePrice: purchasePrice ?? item.purchasePrice,
                condition: condition ?? item.condition,
                grading: grading ?? item.grading,
              }
            : item
        );
      }
      return [...prev, { card, addedAt: new Date().toISOString(), quantity, purchasePrice, condition, grading }];
    };

    const newCollection = updateFn(collection);
    setCollection(newCollection);
    setLocalCollection(newCollection);
    syncToDatabase(newCollection, wishlist);
  };

  const removeFromCollection = (cardId: string) => {
    const newCollection = collection.filter((item) => item.card.id !== cardId);
    setCollection(newCollection);
    setLocalCollection(newCollection);
    syncToDatabase(newCollection, wishlist);
  };

  const updateQuantity = (cardId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCollection(cardId);
      return;
    }
    const newCollection = collection.map((item) =>
      item.card.id === cardId ? { ...item, quantity } : item
    );
    setCollection(newCollection);
    setLocalCollection(newCollection);
    syncToDatabase(newCollection, wishlist);
  };

  const isInCollection = (cardId: string) => {
    return collection.some((item) => item.card.id === cardId);
  };

  const getCardQuantity = (cardId: string) => {
    const item = collection.find((item) => item.card.id === cardId);
    return item?.quantity || 0;
  };

  const getCollectionItem = (cardId: string) => {
    return collection.find((item) => item.card.id === cardId);
  };

  const updatePurchasePrice = (cardId: string, purchasePrice: number) => {
    const newCollection = collection.map((item) =>
      item.card.id === cardId ? { ...item, purchasePrice } : item
    );
    setCollection(newCollection);
    setLocalCollection(newCollection);
    syncToDatabase(newCollection, wishlist);
  };

  const updateCondition = (cardId: string, condition: CardCondition) => {
    const newCollection = collection.map((item) =>
      item.card.id === cardId ? { ...item, condition } : item
    );
    setCollection(newCollection);
    setLocalCollection(newCollection);
    syncToDatabase(newCollection, wishlist);
  };

  const updateGrading = (cardId: string, grading: GradingInfo | undefined) => {
    const newCollection = collection.map((item) =>
      item.card.id === cardId ? { ...item, grading } : item
    );
    setCollection(newCollection);
    setLocalCollection(newCollection);
    syncToDatabase(newCollection, wishlist);
  };

  // Wishlist methods
  const addToWishlist = (card: PokemonCard, priority: 'low' | 'medium' | 'high' = 'medium') => {
    console.log('[CollectionContext] addToWishlist called for:', card.name, card.id, 'priority:', priority);
    console.log('[CollectionContext] Current wishlist size:', wishlist.length);

    const updateFn = (prev: WishlistItem[]) => {
      const existing = prev.find((item) => item.card.id === card.id);
      if (existing) {
        console.log('[CollectionContext] Card already in wishlist, updating priority');
        return prev.map((item) =>
          item.card.id === card.id ? { ...item, priority } : item
        );
      }
      console.log('[CollectionContext] Adding new card to wishlist');
      return [...prev, { card, addedAt: new Date().toISOString(), priority }];
    };

    const newWishlist = updateFn(wishlist);
    console.log('[CollectionContext] New wishlist size:', newWishlist.length);
    setWishlist(newWishlist);
    setLocalWishlist(newWishlist);
    syncToDatabase(collection, newWishlist);
  };

  const removeFromWishlist = (cardId: string) => {
    const newWishlist = wishlist.filter((item) => item.card.id !== cardId);
    setWishlist(newWishlist);
    setLocalWishlist(newWishlist);
    syncToDatabase(collection, newWishlist);
  };

  const updatePriority = (cardId: string, priority: 'low' | 'medium' | 'high') => {
    const newWishlist = wishlist.map((item) =>
      item.card.id === cardId ? { ...item, priority } : item
    );
    setWishlist(newWishlist);
    setLocalWishlist(newWishlist);
    syncToDatabase(collection, newWishlist);
  };

  const isInWishlist = (cardId: string) => {
    return wishlist.some((item) => item.card.id === cardId);
  };

  const getWishlistItem = (cardId: string) => {
    return wishlist.find((item) => item.card.id === cardId);
  };

  // Stats
  const totalCards = collection.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total current market value
  const totalValue = collection.reduce((sum, item) => {
    const price = item.card.tcgplayer?.prices?.holofoil?.market ||
                  item.card.tcgplayer?.prices?.normal?.market ||
                  item.card.tcgplayer?.prices?.reverseHolofoil?.market ||
                  0;
    return sum + (price * item.quantity);
  }, 0);

  // Calculate total purchase cost (in USD)
  const totalPurchaseCost = collection.reduce((sum, item) => {
    if (item.purchasePrice) {
      return sum + (item.purchasePrice * item.quantity);
    }
    return sum;
  }, 0);

  // Calculate total profit/loss
  const totalProfitLoss = totalValue - totalPurchaseCost;

  const value: CollectionContextType = {
    collection,
    addToCollection,
    removeFromCollection,
    updateQuantity,
    updatePurchasePrice,
    updateCondition,
    updateGrading,
    isInCollection,
    getCardQuantity,
    getCollectionItem,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    updatePriority,
    isInWishlist,
    getWishlistItem,
    totalCards,
    totalValue,
    totalPurchaseCost,
    totalProfitLoss,
    isLoaded,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}
