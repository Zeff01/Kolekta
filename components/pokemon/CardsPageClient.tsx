'use client';

import { PokemonCard } from "@/types/pokemon";
import CardGrid from "./CardGrid";
import { useState, useMemo, useCallback, useEffect } from "react";
import SearchInput from "@/components/ui/SearchInput";
import FilterSelect from "@/components/ui/FilterSelect";
import SortSelect from "@/components/ui/SortSelect";
import CardGridSkeleton from "@/components/ui/CardGridSkeleton";
import PokeballLoader from "@/components/ui/PokeballLoader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { fetchCardsClient } from "@/lib/pokemon-api-client";

interface CardsPageClientProps {
  cards: PokemonCard[];
}

type SortOption = 'name-asc' | 'name-desc' | 'hp-high' | 'hp-low' | 'number-asc' | 'number-desc' | 'set-newest' | 'set-oldest';

export default function CardsPageClient({ cards: initialCards }: CardsPageClientProps) {
  const [allCards, setAllCards] = useState<PokemonCard[]>(initialCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('set-newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true);

  // Load more cards
  const loadMoreCards = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetchCardsClient({
        page: nextPage,
        pageSize: 50,
        type: selectedType !== 'all' ? selectedType : '',
        rarity: selectedRarity !== 'all' ? selectedRarity : '',
      });

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setAllCards(prev => [...prev, ...response.data]);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more cards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isLoading, hasMore, selectedType, selectedRarity]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (isLoading || !hasMoreSearchResults || !searchQuery) return;

    setIsLoading(true);
    try {
      const nextPage = searchPage + 1;
      const response = await fetchCardsClient({
        page: nextPage,
        pageSize: 250,
        searchQuery
      });

      if (response.data.length === 0) {
        setHasMoreSearchResults(false);
      } else {
        setAllCards(prev => [...prev, ...response.data]);
        setSearchPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more search results:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchPage, searchQuery, isLoading, hasMoreSearchResults]);

  // Setup infinite scroll (uses different handler for search vs normal browsing)
  useInfiniteScroll({
    onLoadMore: searchQuery ? loadMoreSearchResults : loadMoreCards,
    hasMore: searchQuery ? hasMoreSearchResults : hasMore,
    isLoading,
    threshold: 0.8,
  });

  // Handle server-side search with debounce
  useEffect(() => {
    const searchCards = async () => {
      if (searchQuery) {
        setIsSearching(true);
        try {
          const response = await fetchCardsClient({ page: 1, pageSize: 250, searchQuery });
          setAllCards(response.data);
          setSearchPage(1);
          setHasMoreSearchResults(response.data.length === 250); // If we got full page, there might be more
        } catch (error) {
          console.error('Error searching cards:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Reset to initial cards when search is cleared
        setAllCards(initialCards);
        setCurrentPage(1);
        setHasMore(true);
        setSearchPage(1);
        setHasMoreSearchResults(true);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchCards();
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, initialCards]);

  // Handle type filter change - fetch filtered cards from server
  useEffect(() => {
    const fetchFilteredCards = async () => {
      // Skip if we're in search mode
      if (searchQuery) return;

      setIsLoading(true);
      try {
        const response = await fetchCardsClient({
          page: 1,
          pageSize: 50,
          type: selectedType !== 'all' ? selectedType : '',
          rarity: selectedRarity !== 'all' ? selectedRarity : '',
        });

        setAllCards(response.data);
        setCurrentPage(1);
        setHasMore(response.data.length === 50); // If we got full page, there might be more
      } catch (error) {
        console.error('Error fetching filtered cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if not using initial cards (user has changed filters)
    if (selectedType !== 'all' || selectedRarity !== 'all') {
      fetchFilteredCards();
    } else if (!searchQuery) {
      // Reset to initial cards when filters are cleared
      setAllCards(initialCards);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [selectedType, selectedRarity, searchQuery, initialCards]);

  // All possible Pokemon types (static list for filter dropdown)
  const allTypes = useMemo(() => {
    const pokemonTypes = [
      'Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting',
      'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'
    ];
    return pokemonTypes.map(type => ({ value: type, label: type }));
  }, []);

  // All possible rarities (static list for filter dropdown)
  const allRarities = useMemo(() => {
    const rarities = [
      'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX',
      'Rare Holo GX', 'Rare Holo V', 'Rare Holo VMAX', 'Rare Holo VSTAR',
      'Rare Ultra', 'Rare Secret', 'Rare Rainbow', 'Rare Shiny',
      'Promo', 'Amazing Rare', 'Radiant Rare', 'Illustration Rare',
      'Special Illustration Rare', 'Hyper Rare'
    ];
    return rarities.map(rarity => ({ value: rarity, label: rarity }));
  }, []);

  // Sort options
  const sortOptions = [
    { value: 'set-newest', label: 'Latest First' },
    { value: 'set-oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'hp-high', label: 'HP (High to Low)' },
    { value: 'hp-low', label: 'HP (Low to High)' },
    { value: 'number-asc', label: 'Number (Low to High)' },
    { value: 'number-desc', label: 'Number (High to Low)' },
  ];

  // Sort cards (filtering is now done server-side)
  const filteredAndSortedCards = useMemo(() => {
    // All filtering is now handled server-side in the API
    // We only need to sort the results here

    // Apply sorting
    const sorted = [...allCards].sort((a, b) => {
      switch (sortBy) {
        case 'set-newest':
          // Sort by set ID (newer sets have higher prefixes like sv, swsh, sm, xy, bw)
          // Since we don't have release dates, use reverse alphabetical on set ID as proxy
          return b.set.id.localeCompare(a.set.id);
        case 'set-oldest':
          return a.set.id.localeCompare(b.set.id);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'hp-high':
          const aHp = parseInt(a.hp || '0');
          const bHp = parseInt(b.hp || '0');
          return bHp - aHp;
        case 'hp-low':
          const aHpLow = parseInt(a.hp || '999');
          const bHpLow = parseInt(b.hp || '999');
          return aHpLow - bHpLow;
        case 'number-asc':
          return (a.number || '0').localeCompare(b.number || '0', undefined, { numeric: true });
        case 'number-desc':
          return (b.number || '0').localeCompare(a.number || '0', undefined, { numeric: true });
        default:
          return 0;
      }
    });

    return sorted;
  }, [allCards, sortBy]);

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel mb-4 sm:mb-6 inline-block">
            <h1 className="text-[10px] sm:text-xs md:text-sm font-pixel uppercase">Pokemon Cards</h1>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Search Bar */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search cards by name..."
              className="md:col-span-2"
            />

            {/* Type Filter */}
            <FilterSelect
              value={selectedType}
              onChange={setSelectedType}
              options={allTypes}
              placeholder="Filter by type"
              allOptionLabel="All Types"
            />

            {/* Rarity Filter */}
            <FilterSelect
              value={selectedRarity}
              onChange={setSelectedRarity}
              options={allRarities}
              placeholder="Filter by rarity"
              allOptionLabel="All Rarities"
            />
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <SortSelect
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              options={sortOptions}
              placeholder="Sort by..."
            />
          </div>

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <p className="text-[10px] sm:text-xs font-pixel text-retro-gray dark:text-retro-gray-light leading-relaxed">
              Showing {filteredAndSortedCards.length} {filteredAndSortedCards.length === 1 ? 'card' : 'cards'}
            </p>
            <p className="text-[8px] sm:text-[10px] font-pixel text-retro-gray dark:text-retro-gray-light">
              Loaded {allCards.length} total cards
            </p>
          </div>
        </div>

        {/* Cards Display */}
        {isSearching ? (
          <PokeballLoader message="Searching cards..." />
        ) : isLoading && filteredAndSortedCards.length === 0 ? (
          <PokeballLoader message="Loading cards..." />
        ) : filteredAndSortedCards.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-xs sm:text-sm font-pixel text-retro-gray dark:text-retro-gray-light">
              {searchQuery || selectedType !== 'all' || selectedRarity !== 'all'
                ? 'No cards found matching your filters'
                : 'No cards available'}
            </p>
          </div>
        ) : (
          <>
            <CardGrid cards={filteredAndSortedCards} />

            {/* Loading indicator */}
            {isLoading && (
              <div className="mt-6 sm:mt-8">
                <PokeballLoader message="Loading more cards..." />
              </div>
            )}

            {/* End of results */}
            {((searchQuery && !hasMoreSearchResults) || (!searchQuery && !hasMore)) && allCards.length > 50 && (
              <div className="mt-6 sm:mt-8 text-center">
                <div className="inline-block bg-retro-gray text-retro-white px-4 sm:px-6 py-2 sm:py-3 border-2 sm:border-3 border-retro-black">
                  <p className="text-[10px] sm:text-xs font-pixel uppercase">You've reached the end!</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
