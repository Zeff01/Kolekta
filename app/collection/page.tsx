'use client';

import { useCollection } from '@/contexts/CollectionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Image from 'next/image';
import Link from 'next/link';
import { Package, TrendingUp } from 'lucide-react';

export default function CollectionPage() {
  const { collection, totalCards, totalValue, totalPurchaseCost, totalProfitLoss, removeFromCollection, isLoaded } = useCollection();
  const { convertPrice, currency } = useCurrency();

  // Helper function to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = () => {
    return currency === 'PHP' ? '₱' : '$';
  };

  // Convert USD values to current currency
  const displayTotalValue = convertPrice(totalValue);
  const displayTotalCost = convertPrice(totalPurchaseCost);
  const displayProfitLoss = convertPrice(totalProfitLoss);
  const profitLossPercentage = totalPurchaseCost > 0 ? (totalProfitLoss / totalPurchaseCost) * 100 : 0;

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

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel mb-4 sm:mb-6 inline-block">
            <h1 className="text-[10px] sm:text-xs md:text-sm font-pixel uppercase">My Collection</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-retro-blue border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="flex items-center gap-2 sm:gap-3">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-retro-white" />
                <div>
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-white opacity-80">Total Cards</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-white">{totalCards}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500 border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="flex items-center gap-2 sm:gap-3">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-retro-white" />
                <div>
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-white opacity-80">Unique Cards</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-pixel text-retro-white">{collection.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-retro-yellow border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-retro-black flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-black opacity-80 whitespace-nowrap">Market Value</p>
                  <p className="text-sm sm:text-lg md:text-xl font-pixel text-retro-black truncate">{getCurrencySymbol()}{formatNumber(displayTotalValue)}</p>
                </div>
              </div>
            </div>

            <div className={`border-2 sm:border-3 border-retro-black p-3 sm:p-4 shadow-pixel ${
              displayProfitLoss >= 0 ? 'bg-green-600' : 'bg-retro-red'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-retro-white flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-white opacity-80 whitespace-nowrap">Profit/Loss</p>
                  <p className="text-sm sm:text-lg md:text-xl font-pixel text-retro-white truncate">
                    {displayProfitLoss >= 0 ? '+' : ''}{getCurrencySymbol()}{formatNumber(Math.abs(displayProfitLoss))}
                  </p>
                  {totalPurchaseCost > 0 && (
                    <p className="text-[8px] sm:text-[10px] font-pixel text-retro-white opacity-80 truncate">
                      {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Cost Info */}
          {totalPurchaseCost > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-retro-white dark:bg-retro-gray-dark border-2 border-retro-black">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-gray dark:text-retro-gray-light opacity-80 mb-1">Total Invested</p>
                  <p className="text-sm sm:text-base font-pixel text-retro-black dark:text-retro-white">{getCurrencySymbol()}{formatNumber(displayTotalCost)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs font-pixel text-retro-gray dark:text-retro-gray-light opacity-80 mb-1">Current Value</p>
                  <p className="text-sm sm:text-base font-pixel text-retro-black dark:text-retro-white">{getCurrencySymbol()}{formatNumber(displayTotalValue)}</p>
                </div>
                <div className={`text-right ${displayProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <p className="text-[10px] sm:text-xs font-pixel opacity-80 mb-1">Return</p>
                  <p className="text-sm sm:text-base font-pixel">{displayProfitLoss >= 0 ? '+' : ''}{getCurrencySymbol()}{formatNumber(Math.abs(displayProfitLoss))}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collection Grid */}
        {collection.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-retro-white dark:bg-retro-black border-2 sm:border-3 border-retro-black shadow-pixel p-6 sm:p-8 md:p-12 inline-block">
              <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-retro-gray dark:text-retro-gray-light mx-auto mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm font-pixel text-retro-gray dark:text-retro-gray-light mb-3 sm:mb-4">
                Your collection is empty
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {collection.map((item) => {
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

                      {/* Quantity Badge */}
                      {item.quantity > 1 && (
                        <div className="absolute top-2 right-2 bg-retro-red text-retro-white border-2 border-retro-black px-2 py-1">
                          <span className="text-xs font-pixel">×{item.quantity}</span>
                        </div>
                      )}

                      {/* Condition/Grading Badges */}
                      {(item.condition || item.grading) && (
                        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                          {item.condition && (
                            <span className={`px-1 py-0.5 text-[8px] font-pixel text-white border border-retro-black ${
                              item.condition === 'Raw' ? 'bg-retro-blue' :
                              item.condition === 'LP' ? 'bg-green-500' :
                              item.condition === 'MP' ? 'bg-retro-yellow text-retro-black' :
                              'bg-retro-red'
                            }`}>
                              {item.condition}
                            </span>
                          )}
                          {item.grading && (
                            <span className="px-1 py-0.5 text-[8px] font-pixel bg-retro-yellow text-retro-black border border-retro-black">
                              {item.grading.company} {item.grading.grade}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="mt-2 px-2">
                    <p className="text-retro-black dark:text-retro-white text-xs font-pixel truncate uppercase leading-relaxed">
                      {item.card.name}
                    </p>

                    {/* Current Price */}
                    {(() => {
                      const usdPrice = item.card.tcgplayer?.prices?.holofoil?.market
                        || item.card.tcgplayer?.prices?.normal?.market
                        || item.card.tcgplayer?.prices?.reverseHolofoil?.market
                        || 0;
                      const currentPrice = convertPrice(usdPrice);

                      return (
                        <p className="text-retro-blue dark:text-blue-400 text-[10px] font-pixel truncate">
                          {getCurrencySymbol()}{formatNumber(currentPrice)}
                        </p>
                      );
                    })()}

                    {/* Profit/Loss Display */}
                    {item.purchasePrice && (() => {
                      const usdPrice = item.card.tcgplayer?.prices?.holofoil?.market
                        || item.card.tcgplayer?.prices?.normal?.market
                        || item.card.tcgplayer?.prices?.reverseHolofoil?.market
                        || 0;
                      const currentPrice = convertPrice(usdPrice);
                      const purchasePriceConverted = convertPrice(item.purchasePrice);
                      const profitLoss = currentPrice - purchasePriceConverted;
                      const isProfit = profitLoss >= 0;

                      return (
                        <p className={`text-[10px] font-pixel truncate ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isProfit ? '▲' : '▼'} {getCurrencySymbol()}{formatNumber(Math.abs(profitLoss))}
                        </p>
                      );
                    })()}

                    <p className="text-retro-gray dark:text-retro-gray-light text-[10px] font-pixel truncate">
                      #{item.card.number}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
