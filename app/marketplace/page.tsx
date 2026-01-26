'use client';

import { useState, useEffect } from 'react';
import { MarketplaceListing } from '@/types/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Store, TrendingUp, Package } from 'lucide-react';

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [gradingFilter, setGradingFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, searchTerm, conditionFilter, gradingFilter, sortBy]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/marketplace');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((listing) =>
        listing.card.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Condition filter
    if (conditionFilter) {
      filtered = filtered.filter((listing) => listing.condition === conditionFilter);
    }

    // Grading filter
    if (gradingFilter) {
      filtered = filtered.filter((listing) => listing.gradingStatus === gradingFilter);
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.pricePerCard - b.pricePerCard);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.pricePerCard - a.pricePerCard);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredListings(filtered);
  };

  const formatPrice = (priceInPHP: number) => {
    // Marketplace prices are always stored in PHP, display as-is
    return `₱${priceInPHP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-white dark:bg-retro-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="h-8 w-48 bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[245/380] bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-purple-600 dark:bg-purple-500 text-retro-white px-4 md:px-6 py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-xs md:text-sm font-pixel uppercase flex items-center gap-2">
              <Store className="w-4 h-4 md:w-5 md:h-5" />
              Marketplace
            </h1>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-retro-blue border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-retro-white" />
                <div>
                  <p className="text-[9px] sm:text-[10px] font-pixel text-retro-white opacity-80">Listings</p>
                  <p className="text-base sm:text-lg md:text-xl font-pixel text-retro-white">{filteredListings.length}</p>
                </div>
              </div>
            </div>

            <Link href="/marketplace/my-shop" className="block">
              <div className="bg-green-500 border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel hover:shadow-pixel-lg transition-all cursor-pointer h-full">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-retro-white" />
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-pixel text-retro-white opacity-80">My Shop</p>
                    <p className="text-sm sm:text-base font-pixel text-retro-white">Manage →</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/marketplace/sell" className="block sm:col-span-1 col-span-2">
              <div className="bg-retro-yellow border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel hover:shadow-pixel-lg transition-all cursor-pointer h-full">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-retro-black" />
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-pixel text-retro-black opacity-80">Sell Cards</p>
                    <p className="text-sm sm:text-base font-pixel text-retro-black">Create Listing →</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 sm:border-3 border-retro-black p-4 shadow-pixel mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-retro-black dark:text-retro-white" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
                />
              </div>

              {/* Condition Filter */}
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
              >
                <option value="">All Conditions</option>
                <option value="Raw">Raw</option>
                <option value="LP">Light Played</option>
                <option value="MP">Moderately Played</option>
                <option value="HP">Heavily Played</option>
                <option value="Damaged">Damaged</option>
              </select>

              {/* Grading Filter */}
              <select
                value={gradingFilter}
                onChange={(e) => setGradingFilter(e.target.value)}
                className="px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
              >
                <option value="">All Gradings</option>
                <option value="raw">Raw (Ungraded)</option>
                <option value="graded">Graded</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-retro-gray-light dark:text-retro-gray-dark" />
            <p className="font-pixel text-sm text-retro-black dark:text-retro-white">No listings found</p>
            <p className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark mt-2">
              Try adjusting your filters or be the first to list a card!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredListings.map((listing) => (
              <Link key={listing._id} href={`/marketplace/listing/${listing._id}`}>
                <div className="bg-retro-white dark:bg-retro-black border-2 sm:border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all cursor-pointer group">
                  {/* Card Image */}
                  <div className="relative aspect-[245/342] bg-retro-gray-light dark:bg-retro-gray-dark">
                    <Image
                      src={listing.card.images.small}
                      alt={listing.card.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />

                    {/* Graded Badge */}
                    {listing.gradingStatus === 'graded' && listing.grading && (
                      <div className="absolute top-2 left-2 bg-retro-yellow border-2 border-retro-black px-2 py-1">
                        <p className="text-[8px] font-pixel text-retro-black">
                          {listing.grading.company} {listing.grading.grade}
                        </p>
                      </div>
                    )}

                    {/* Condition Badge */}
                    <div className="absolute top-2 right-2 bg-retro-blue border-2 border-retro-black px-2 py-1">
                      <p className="text-[8px] font-pixel text-retro-white">{listing.condition}</p>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-2 sm:p-3 border-t-2 sm:border-t-3 border-retro-black">
                    <p className="font-pixel text-[9px] sm:text-[10px] text-retro-black dark:text-retro-white truncate mb-1">
                      {listing.card.name}
                    </p>
                    <p className="font-pixel text-[8px] sm:text-[9px] text-retro-gray-light dark:text-retro-gray-dark truncate mb-2">
                      {listing.card.set.name}
                    </p>

                    {/* Price */}
                    <div className="bg-green-500 border-2 border-retro-black px-2 py-1 mb-2">
                      <p className="font-pixel text-[10px] sm:text-xs text-retro-white text-center">
                        {formatPrice(listing.pricePerCard)}
                      </p>
                    </div>

                    {/* Seller & Quantity */}
                    <div className="flex justify-between items-center">
                      <p className="font-pixel text-[8px] text-retro-gray-light dark:text-retro-gray-dark truncate">
                        @{listing.seller?.username || 'Unknown'}
                      </p>
                      <p className="font-pixel text-[8px] text-retro-gray-light dark:text-retro-gray-dark">
                        Qty: {listing.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
