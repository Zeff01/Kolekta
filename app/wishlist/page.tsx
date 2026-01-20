'use client';

import { useCollection } from '@/contexts/CollectionContext';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, updatePriority, isLoaded } = useCollection();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-retro-white dark:bg-retro-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="h-6 sm:h-8 w-32 sm:w-48 bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse mb-6 sm:mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[245/342] bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-retro-red';
      case 'medium':
        return 'bg-retro-yellow';
      case 'low':
        return 'bg-retro-gray';
      default:
        return 'bg-retro-gray';
    }
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Medium';
    }
  };

  // Group by priority
  const highPriority = wishlist.filter((item) => item.priority === 'high');
  const mediumPriority = wishlist.filter((item) => item.priority === 'medium');
  const lowPriority = wishlist.filter((item) => item.priority === 'low');

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel mb-4 sm:mb-6 inline-block">
            <h1 className="text-[10px] sm:text-xs md:text-sm font-pixel uppercase">My Wishlist</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-retro-red border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="flex items-center gap-2 sm:gap-3">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-retro-white fill-current" />
                <div>
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-white opacity-80">High Priority</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-white">{highPriority.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-retro-yellow border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="flex items-center gap-2 sm:gap-3">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-retro-black fill-current" />
                <div>
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-black opacity-80">Medium Priority</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-black">{mediumPriority.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-retro-gray border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="flex items-center gap-2 sm:gap-3">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-retro-white" />
                <div>
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-white opacity-80">Low Priority</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-white">{lowPriority.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-retro-white dark:bg-retro-black border-2 sm:border-3 border-retro-black shadow-pixel p-6 sm:p-8 md:p-12 inline-block">
              <Heart className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-retro-gray dark:text-retro-gray-light mx-auto mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm font-pixel text-retro-gray dark:text-retro-gray-light mb-3 sm:mb-4">
                Your wishlist is empty
              </p>
              <Link
                href="/cards"
                className="inline-block px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-retro-blue text-retro-white border-2 sm:border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1"
              >
                <span className="text-[10px] sm:text-xs font-pixel uppercase">Browse Cards</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* High Priority */}
            {highPriority.length > 0 && (
              <div>
                <h2 className="text-[10px] sm:text-xs font-pixel uppercase text-retro-black dark:text-retro-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-retro-red" />
                  High Priority ({highPriority.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {highPriority.map((item) => {
                    const hasImage = Boolean(
                      item.card.images?.small && item.card.images.small.trim().length > 0
                    );

                    return (
                      <div key={item.card.id} className="group relative">
                        <Link href={`/cards/${item.card.id}`} className="block">
                          <div className="relative aspect-[245/342] bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 overflow-hidden">
                            {hasImage ? (
                              <Image
                                src={item.card.images.small}
                                alt={item.card.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                                className="object-contain pixelated p-2"
                                loading="lazy"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light text-center uppercase leading-relaxed">
                                  {item.card.name}
                                </p>
                              </div>
                            )}

                            {/* Priority Badge */}
                            <div className={`absolute top-2 right-2 ${getPriorityColor(item.priority)} text-retro-white border-2 border-retro-black px-2 py-1`}>
                              <Heart className="w-3 h-3 fill-current" />
                            </div>
                          </div>
                        </Link>

                        <div className="mt-2 px-2">
                          <p className="text-retro-black dark:text-retro-white text-[8px] font-pixel truncate uppercase leading-relaxed">
                            {item.card.name}
                          </p>
                          <p className="text-retro-gray dark:text-retro-gray-light text-[6px] font-pixel truncate">
                            #{item.card.number}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Medium Priority */}
            {mediumPriority.length > 0 && (
              <div>
                <h2 className="text-[10px] sm:text-xs font-pixel uppercase text-retro-black dark:text-retro-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-retro-yellow" />
                  Medium Priority ({mediumPriority.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {mediumPriority.map((item) => {
                    const hasImage = Boolean(
                      item.card.images?.small && item.card.images.small.trim().length > 0
                    );

                    return (
                      <div key={item.card.id} className="group relative">
                        <Link href={`/cards/${item.card.id}`} className="block">
                          <div className="relative aspect-[245/342] bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 overflow-hidden">
                            {hasImage ? (
                              <Image
                                src={item.card.images.small}
                                alt={item.card.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                                className="object-contain pixelated p-2"
                                loading="lazy"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light text-center uppercase leading-relaxed">
                                  {item.card.name}
                                </p>
                              </div>
                            )}

                            <div className={`absolute top-2 right-2 ${getPriorityColor(item.priority)} border-2 border-retro-black px-2 py-1`}>
                              <Heart className="w-3 h-3 fill-current text-retro-black" />
                            </div>
                          </div>
                        </Link>

                        <div className="mt-2 px-2">
                          <p className="text-retro-black dark:text-retro-white text-[8px] font-pixel truncate uppercase leading-relaxed">
                            {item.card.name}
                          </p>
                          <p className="text-retro-gray dark:text-retro-gray-light text-[6px] font-pixel truncate">
                            #{item.card.number}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {lowPriority.length > 0 && (
              <div>
                <h2 className="text-[10px] sm:text-xs font-pixel uppercase text-retro-black dark:text-retro-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-retro-gray" />
                  Low Priority ({lowPriority.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {lowPriority.map((item) => {
                    const hasImage = Boolean(
                      item.card.images?.small && item.card.images.small.trim().length > 0
                    );

                    return (
                      <div key={item.card.id} className="group relative">
                        <Link href={`/cards/${item.card.id}`} className="block">
                          <div className="relative aspect-[245/342] bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 overflow-hidden">
                            {hasImage ? (
                              <Image
                                src={item.card.images.small}
                                alt={item.card.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                                className="object-contain pixelated p-2"
                                loading="lazy"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light text-center uppercase leading-relaxed">
                                  {item.card.name}
                                </p>
                              </div>
                            )}

                            <div className={`absolute top-2 right-2 ${getPriorityColor(item.priority)} text-retro-white border-2 border-retro-black px-2 py-1`}>
                              <Heart className="w-3 h-3 fill-current" />
                            </div>
                          </div>
                        </Link>

                        <div className="mt-2 px-2">
                          <p className="text-retro-black dark:text-retro-white text-[8px] font-pixel truncate uppercase leading-relaxed">
                            {item.card.name}
                          </p>
                          <p className="text-retro-gray dark:text-retro-gray-light text-[6px] font-pixel truncate">
                            #{item.card.number}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
