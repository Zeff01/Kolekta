'use client';

import { PokemonSet } from "@/types/pokemon";
import SetCard from "./SetCard";
import { useState, useMemo } from "react";
import SearchInput from "@/components/ui/SearchInput";
import FilterSelect from "@/components/ui/FilterSelect";
import SortSelect from "@/components/ui/SortSelect";

interface SetsPageClientProps {
  sets: PokemonSet[];
}

type SortOption = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest' | 'cards-most' | 'cards-least';

export default function SetsPageClient({ sets }: SetsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');

  // Get unique series for filter dropdown
  // Note: Since TCGdex /sets endpoint doesn't include releaseDate, we'll sort by series name
  const allSeries = useMemo(() => {
    // Get unique series names
    const uniqueSeries = Array.from(new Set(sets.map(set => set.series || 'Other Sets')));

    // Define the order of series (newest to oldest based on Pokemon TCG history)
    const seriesOrder = [
      'Scarlet & Violet',
      'Sword & Shield',
      'Sun & Moon',
      'XY',
      'Black & White',
      'HeartGold & SoulSilver',
      'Platinum',
      'Diamond & Pearl',
      'EX',
      'e-Card',
      'Neo',
      'Gym',
      'Base',
      'Mega Evolution',
      'Call of Legends',
      'Promos',
      'Promotions',
      'Sample',
      'Best of Game',
      'Southern Islands',
      'Legendary Collection',
      'Rumble',
      'Dragon Vault',
      'Radiant Collection',
      'Double Crisis',
      'Generations',
      'Detective Pikachu',
      'Celebrations',
      'Jumbo Cards',
      'Yellow A Alternate',
      'Futsal',
      'Unseen Forces Unown',
      'Other Sets',
    ];

    // Sort series based on the predefined order
    const sortedSeries = uniqueSeries.sort((a, b) => {
      const indexA = seriesOrder.indexOf(a);
      const indexB = seriesOrder.indexOf(b);

      // If both are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only A is in the list, it comes first
      if (indexA !== -1) return -1;
      // If only B is in the list, it comes first
      if (indexB !== -1) return 1;
      // If neither is in the list, sort alphabetically
      return a.localeCompare(b);
    });

    return sortedSeries.map(series => ({ value: series, label: series }));
  }, [sets]);

  // Sort options
  const sortOptions = [
    { value: 'date-newest', label: 'Newest First' },
    { value: 'date-oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'cards-most', label: 'Most Cards' },
    { value: 'cards-least', label: 'Least Cards' },
  ];

  // Filter and sort sets
  const filteredAndSortedSets = useMemo(() => {
    let filtered = sets;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(set =>
        set.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply series filter
    if (selectedSeries !== 'all') {
      filtered = filtered.filter(set =>
        (set.series || 'Other Sets') === selectedSeries
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-newest':
          return (b.releaseDate || '0000').localeCompare(a.releaseDate || '0000');
        case 'date-oldest':
          return (a.releaseDate || '9999').localeCompare(b.releaseDate || '9999');
        case 'cards-most':
          return b.total - a.total;
        case 'cards-least':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return sorted;
  }, [sets, searchQuery, selectedSeries, sortBy]);

  // Group by series for display
  const groupedBySeries = useMemo(() => {
    const grouped = filteredAndSortedSets.reduce((acc: Record<string, PokemonSet[]>, set) => {
      const series = set.series || 'Other Sets';
      if (!acc[series]) {
        acc[series] = [];
      }
      acc[series].push(set);
      return acc;
    }, {});

    // Sort each series' sets by release date (newest first) and then sort series by latest release date
    return Object.entries(grouped)
      .map(([seriesName, seriesSets]) => {
        // Sort sets within each series by release date (newest first)
        const sortedSets = [...seriesSets].sort((a, b) => {
          return (b.releaseDate || '0000').localeCompare(a.releaseDate || '0000');
        });
        return [seriesName, sortedSets] as [string, PokemonSet[]];
      })
      .sort((a, b) => {
        // Sort series by latest release date
        const aLatest = a[1]
          .map(set => set.releaseDate)
          .filter(date => date)
          .sort()
          .reverse()[0] || '0000';

        const bLatest = b[1]
          .map(set => set.releaseDate)
          .filter(date => date)
          .sort()
          .reverse()[0] || '0000';

        return bLatest.localeCompare(aLatest);
      });
  }, [filteredAndSortedSets]);

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel mb-4 sm:mb-6 inline-block">
            <h1 className="text-[10px] sm:text-xs md:text-sm font-pixel uppercase">All Sets</h1>
          </div>
          <p className="text-[10px] sm:text-xs font-pixel text-retro-gray dark:text-retro-gray-light leading-relaxed mb-4 sm:mb-6">
            Browse all {sets.length} Pokemon TCG sets organized by series
          </p>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Search Bar */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search sets..."
            />

            {/* Series Filter */}
            <FilterSelect
              value={selectedSeries}
              onChange={setSelectedSeries}
              options={allSeries}
              placeholder="Filter by series"
              allOptionLabel="All Series"
            />

            {/* Sort Options */}
            <SortSelect
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              options={sortOptions}
              placeholder="Sort by..."
            />
          </div>

          {/* Results Count */}
          <p className="text-[8px] sm:text-[10px] font-pixel text-retro-gray dark:text-retro-gray-light">
            Showing {filteredAndSortedSets.length} {filteredAndSortedSets.length === 1 ? 'set' : 'sets'}
          </p>
        </div>

        {/* Sets Display */}
        {filteredAndSortedSets.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-xs sm:text-sm font-pixel text-retro-gray dark:text-retro-gray-light">
              No sets found matching your filters
            </p>
          </div>
        ) : (
          <>
            {groupedBySeries.map(([seriesName, seriesSets], seriesIndex) => (
              <div key={seriesName}>
                {/* Divider Line before each series (except first) */}
                {seriesIndex > 0 && (
                  <div className="mb-8 sm:mb-12 md:mb-16 flex items-center gap-2 sm:gap-4">
                    <div className="flex-1 h-1 bg-retro-black dark:bg-retro-white"></div>
                    <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-retro-gray text-retro-white border-2 border-retro-black">
                      <span className="text-[6px] sm:text-[8px] font-pixel">★ ★ ★</span>
                    </div>
                    <div className="flex-1 h-1 bg-retro-black dark:bg-retro-white"></div>
                  </div>
                )}

                <div className="mb-8 sm:mb-12 md:mb-16">
                  {/* Series Header */}
                  <div className="mb-4 sm:mb-6 md:mb-8 bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 border-2 sm:border-3 border-retro-black shadow-pixel-lg inline-block">
                    <h2 className="text-xs sm:text-sm md:text-base font-pixel uppercase">
                      {seriesName}
                    </h2>
                    <p className="text-[8px] sm:text-[10px] font-pixel mt-1 sm:mt-2 opacity-80">
                      {seriesSets.length} {seriesSets.length === 1 ? 'Set' : 'Sets'}
                    </p>
                  </div>

                  {/* Sets Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {seriesSets.map((set, index) => (
                      <SetCard key={set.id} set={set} index={index} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
