'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MarketplaceListing } from '@/types/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { Store, Package, Edit, Trash2, X, Check } from 'lucide-react';

export default function MyShopPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'cancelled'>('active');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyListings();
    }
  }, [isAuthenticated]);

  const fetchMyListings = async () => {
    try {
      const response = await fetch('/api/marketplace');
      if (response.ok) {
        const data = await response.json();
        // Filter to only show current user's listings
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const response = await fetch(`/api/marketplace/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings(listings.filter((l) => l._id !== listingId));
      } else {
        alert('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    }
  };

  const handleUpdateStatus = async (listingId: string, status: 'active' | 'sold' | 'cancelled') => {
    try {
      const response = await fetch(`/api/marketplace/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setListings(listings.map((l) => (l._id === listingId ? data.listing : l)));
      } else {
        alert('Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing');
    }
  };

  const formatPrice = (priceInPHP: number) => {
    // Marketplace prices are always stored in PHP, display as-is
    return `₱${priceInPHP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredListings = listings.filter((l) => l.status === activeTab);
  const activeCount = listings.filter((l) => l.status === 'active').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;
  const cancelledCount = listings.filter((l) => l.status === 'cancelled').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-retro-white dark:bg-retro-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="h-8 w-48 bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-green-500 dark:bg-green-600 text-retro-white px-4 md:px-6 py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-xs md:text-sm font-pixel uppercase flex items-center gap-2">
              <Store className="w-4 h-4 md:w-5 md:h-5" />
              My Shop
            </h1>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-retro-blue border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="text-center">
                <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-white">{activeCount}</p>
                <p className="text-[9px] sm:text-[10px] font-pixel text-retro-white opacity-80">Active</p>
              </div>
            </div>

            <div className="bg-green-500 border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="text-center">
                <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-white">{soldCount}</p>
                <p className="text-[9px] sm:text-[10px] font-pixel text-retro-white opacity-80">Sold</p>
              </div>
            </div>

            <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="text-center">
                <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-black dark:text-retro-white">{cancelledCount}</p>
                <p className="text-[9px] sm:text-[10px] font-pixel text-retro-black dark:text-retro-white opacity-80">Cancelled</p>
              </div>
            </div>
          </div>

          {/* Create Listing Button */}
          <Link href="/marketplace/sell">
            <button className="bg-retro-yellow border-2 sm:border-3 border-retro-black px-4 py-2 shadow-pixel hover:shadow-pixel-lg transition-all font-pixel text-xs text-retro-black uppercase mb-6">
              + Create New Listing
            </button>
          </Link>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 border-2 border-retro-black font-pixel text-xs uppercase transition-all ${
                activeTab === 'active'
                  ? 'bg-retro-blue text-retro-white shadow-pixel'
                  : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`px-4 py-2 border-2 border-retro-black font-pixel text-xs uppercase transition-all ${
                activeTab === 'sold'
                  ? 'bg-retro-blue text-retro-white shadow-pixel'
                  : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white'
              }`}
            >
              Sold ({soldCount})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 border-2 border-retro-black font-pixel text-xs uppercase transition-all ${
                activeTab === 'cancelled'
                  ? 'bg-retro-blue text-retro-white shadow-pixel'
                  : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white'
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-retro-gray-light dark:text-retro-gray-dark" />
            <p className="font-pixel text-sm text-retro-black dark:text-retro-white">
              No {activeTab} listings
            </p>
            {activeTab === 'active' && (
              <Link href="/marketplace/sell">
                <button className="mt-4 bg-retro-yellow border-2 border-retro-black px-4 py-2 shadow-pixel hover:shadow-pixel-lg transition-all font-pixel text-xs text-retro-black uppercase">
                  Create Your First Listing
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-retro-white dark:bg-retro-black border-2 sm:border-3 border-retro-black shadow-pixel"
              >
                <div className="flex gap-4 p-4">
                  {/* Card Image */}
                  <div className="relative w-24 h-32 flex-shrink-0">
                    <Image
                      src={listing.card.images.small}
                      alt={listing.card.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/marketplace/listing/${listing._id}`}>
                      <h3 className="font-pixel text-xs text-retro-black dark:text-retro-white mb-1 hover:text-retro-blue dark:hover:text-retro-blue truncate">
                        {listing.card.name}
                      </h3>
                    </Link>
                    <p className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark mb-2 truncate">
                      {listing.card.set.name}
                    </p>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark">Price:</span>
                        <span className="font-pixel text-xs text-green-600 dark:text-green-400">
                          {formatPrice(listing.pricePerCard)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark">Qty:</span>
                        <span className="font-pixel text-[9px] text-retro-black dark:text-retro-white">
                          {listing.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark">Condition:</span>
                        <span className="font-pixel text-[9px] text-retro-black dark:text-retro-white">
                          {listing.condition}
                          {listing.gradingStatus === 'graded' && listing.grading && (
                            <> - {listing.grading.company} {listing.grading.grade}</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {activeTab === 'active' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(listing._id, 'sold')}
                            className="bg-green-500 border-2 border-retro-black px-2 py-1 font-pixel text-[9px] text-retro-white hover:shadow-pixel transition-all"
                            title="Mark as Sold"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(listing._id, 'cancelled')}
                            className="bg-retro-yellow border-2 border-retro-black px-2 py-1 font-pixel text-[9px] text-retro-black hover:shadow-pixel transition-all"
                            title="Cancel Listing"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteListing(listing._id)}
                        className="bg-red-500 border-2 border-retro-black px-2 py-1 font-pixel text-[9px] text-retro-white hover:shadow-pixel transition-all ml-auto"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
