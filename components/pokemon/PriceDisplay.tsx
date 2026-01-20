'use client';

import { TCGPlayerPricing, JustTCGVariant } from "@/types/pokemon";
import PriceGraph from "./PriceGraph";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceDisplayProps {
  cardId?: string; // Card ID for fetching price history
  pricing?: TCGPlayerPricing;
  variants?: JustTCGVariant[]; // JustTCG comprehensive pricing data
  variant?: 'normal' | 'holofoil' | 'reverseHolofoil';
  showAllVariants?: boolean;
  hideGraphs?: boolean; // Hide price graphs (when shown elsewhere)
}

// JustTCG comprehensive pricing display
function JustTCGPricingDisplay({ variants }: { variants: JustTCGVariant[] }) {
  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatPriceChange = (change: number) => {
    const isPositive = change > 0;
    const color = isPositive ? 'text-retro-red' : 'text-green-600';
    const symbol = isPositive ? '+' : '';
    return <span className={`${color} font-pixel text-xs`}>{symbol}{change.toFixed(1)}%</span>;
  };

  // Group variants by printing (Normal, Holofoil, Reverse Holofoil)
  const groupedVariants: Record<string, JustTCGVariant[]> = {};
  variants.forEach(v => {
    if (!groupedVariants[v.printing]) {
      groupedVariants[v.printing] = [];
    }
    groupedVariants[v.printing].push(v);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-4 py-3 border-3 border-retro-black shadow-pixel">
        <h2 className="text-sm font-pixel uppercase">Market Pricing (USD)</h2>
        <p className="text-[8px] font-pixel mt-1 opacity-80">
          Powered by JustTCG
        </p>
      </div>

      {/* All Printing Variants */}
      {Object.entries(groupedVariants).map(([printing, printingVariants]) => (
        <div key={printing} className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-4">
          {/* Printing Header */}
          <div className="bg-retro-red text-retro-white border-2 border-retro-black px-3 py-2 mb-4 inline-block">
            <h3 className="text-xs font-pixel uppercase">{printing}</h3>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            {printingVariants.map((v) => (
              <div key={v.id} className="border-2 border-retro-gray-light dark:border-retro-gray p-3">
                {/* Condition Header with Current Price */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-retro-gray-light dark:border-retro-gray">
                  <span className="font-pixel text-xs text-retro-black dark:text-retro-white">
                    {v.condition}
                  </span>
                  <div className="text-right">
                    <p className="text-xl font-pixel text-retro-black dark:text-retro-white">
                      {formatPrice(v.price)}
                    </p>
                    {v.priceChange7d !== 0 && (
                      <p className="text-[8px]">
                        7d: {formatPriceChange(v.priceChange7d)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Statistics Grid */}
                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  {/* 7-Day Stats */}
                  {v.avgPrice7d !== undefined && (
                    <div className="bg-retro-gray-light dark:bg-retro-gray-dark p-2">
                      <p className="font-pixel text-retro-gray dark:text-retro-gray-light mb-1">7D AVG</p>
                      <p className="font-pixel text-retro-black dark:text-retro-white">
                        {formatPrice(v.avgPrice7d)}
                      </p>
                    </div>
                  )}
                  {v.minPrice7d !== undefined && (
                    <div className="bg-retro-gray-light dark:bg-retro-gray-dark p-2">
                      <p className="font-pixel text-retro-gray dark:text-retro-gray-light mb-1">7D LOW</p>
                      <p className="font-pixel text-retro-black dark:text-retro-white">
                        {formatPrice(v.minPrice7d)}
                      </p>
                    </div>
                  )}
                  {v.maxPrice7d !== undefined && (
                    <div className="bg-retro-gray-light dark:bg-retro-gray-dark p-2">
                      <p className="font-pixel text-retro-gray dark:text-retro-gray-light mb-1">7D HIGH</p>
                      <p className="font-pixel text-retro-black dark:text-retro-white">
                        {formatPrice(v.maxPrice7d)}
                      </p>
                    </div>
                  )}

                  {/* 30-Day Stats */}
                  {v.avgPrice30d !== undefined && (
                    <div className="bg-retro-gray-light dark:bg-retro-gray-dark p-2">
                      <p className="font-pixel text-retro-gray dark:text-retro-gray-light mb-1">30D AVG</p>
                      <p className="font-pixel text-retro-black dark:text-retro-white">
                        {formatPrice(v.avgPrice30d)}
                      </p>
                    </div>
                  )}
                  {v.minPrice30d !== undefined && (
                    <div className="bg-retro-gray-light dark:bg-retro-gray-dark p-2">
                      <p className="font-pixel text-retro-gray dark:text-retro-gray-light mb-1">30D LOW</p>
                      <p className="font-pixel text-retro-black dark:text-retro-white">
                        {formatPrice(v.minPrice30d)}
                      </p>
                    </div>
                  )}
                  {v.maxPrice30d !== undefined && (
                    <div className="bg-retro-gray-light dark:bg-retro-gray-dark p-2">
                      <p className="font-pixel text-retro-gray dark:text-retro-gray-light mb-1">30D HIGH</p>
                      <p className="font-pixel text-retro-black dark:text-retro-white">
                        {formatPrice(v.maxPrice30d)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Changes */}
                {(v.priceChange30d !== 0 || v.priceChange90d !== 0) && (
                  <div className="flex gap-3 mt-3 pt-2 border-t-2 border-retro-gray-light dark:border-retro-gray">
                    {v.priceChange30d !== 0 && (
                      <div>
                        <span className="font-pixel text-[8px] text-retro-gray dark:text-retro-gray-light">30D: </span>
                        {formatPriceChange(v.priceChange30d)}
                      </div>
                    )}
                    {v.priceChange90d !== 0 && (
                      <div>
                        <span className="font-pixel text-[8px] text-retro-gray dark:text-retro-gray-light">90D: </span>
                        {formatPriceChange(v.priceChange90d)}
                      </div>
                    )}
                  </div>
                )}

                {/* All-Time Stats */}
                {(v.allTimeMinPrice || v.allTimeMaxPrice) && (
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t-2 border-retro-gray-light dark:border-retro-gray">
                    {v.allTimeMinPrice !== undefined && (
                      <div className="bg-retro-yellow border-2 border-retro-black p-2">
                        <p className="font-pixel text-[8px] text-retro-gray mb-1">ALL-TIME LOW</p>
                        <p className="font-pixel text-xs text-retro-black">
                          {formatPrice(v.allTimeMinPrice)}
                        </p>
                        {v.allTimeMinPriceDate && (
                          <p className="font-pixel text-[7px] text-retro-gray mt-1">
                            {new Date(v.allTimeMinPriceDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    {v.allTimeMaxPrice !== undefined && (
                      <div className="bg-retro-yellow border-2 border-retro-black p-2">
                        <p className="font-pixel text-[8px] text-retro-gray mb-1">ALL-TIME HIGH</p>
                        <p className="font-pixel text-xs text-retro-black">
                          {formatPrice(v.allTimeMaxPrice)}
                        </p>
                        {v.allTimeMaxPriceDate && (
                          <p className="font-pixel text-[7px] text-retro-gray mt-1">
                            {new Date(v.allTimeMaxPriceDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* No variants available */}
      {Object.keys(groupedVariants).length === 0 && (
        <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-3 border-retro-black p-6 text-center">
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
            No pricing data available for this card
          </p>
        </div>
      )}
    </div>
  );
}

export default function PriceDisplay({ cardId, pricing, variants, variant = 'normal', showAllVariants = false, hideGraphs = false }: PriceDisplayProps) {
  const { formatPrice: formatCurrencyPrice, convertPrice, currency } = useCurrency();

  // Helper to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper to get currency symbol
  const getCurrencySymbol = () => {
    return currency === 'PHP' ? '₱' : '$';
  };

  // If we have JustTCG variants, use those for comprehensive pricing display
  if (variants && variants.length > 0 && showAllVariants) {
    return <JustTCGPricingDisplay variants={variants} />;
  }

  // Check if pricing exists and has actual price data
  // Support both old format (pricing.normal) and new format (pricing.prices.normal)
  const pricesData = pricing?.prices || pricing;
  const hasPricing = pricesData && (pricesData.normal || pricesData.holofoil || pricesData.reverseHolofoil);

  if (!pricing || !hasPricing) {
    return (
      <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-3 border-retro-black p-4">
        <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light text-center">
          Pricing data not available for this card
        </p>
        <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light text-center mt-2">
          This card may be too new or not tracked on TCGPlayer
        </p>
      </div>
    );
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    const convertedPrice = convertPrice(price);
    return `${getCurrencySymbol()}${formatNumber(convertedPrice)}`;
  };

  const getVariantName = (variantKey: string) => {
    const names: Record<string, string> = {
      normal: 'Normal',
      holofoil: 'Holofoil',
      reverseHolofoil: 'Reverse Holo',
    };
    return names[variantKey] || variantKey;
  };

  const renderVariantPrices = (variantKey: 'normal' | 'holofoil' | 'reverseHolofoil', variantData?: any) => {
    if (!variantData) return null;

    const currentPrice = variantData.market || variantData.marketPrice || variantData.mid || variantData.midPrice || 0;

    return (
      <div key={variantKey} className="mb-6">
        {/* Variant Header */}
        <div className="bg-retro-red text-retro-white border-2 border-retro-black px-3 py-2 mb-3">
          <h3 className="text-xs font-pixel uppercase">{getVariantName(variantKey)}</h3>
        </div>

        {/* Price Graph */}
        {!hideGraphs && currentPrice > 0 && cardId && (
          <div className="mb-4">
            <PriceGraph cardId={cardId} variant={variantKey} initialPrice={currentPrice} />
          </div>
        )}

        {/* Price Grid */}
        <div className="bg-retro-white dark:bg-retro-black border-2 border-retro-black p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Market Price - Most Prominent */}
            {(variantData.market || variantData.marketPrice) && (
              <div className="col-span-2 bg-retro-yellow border-3 border-retro-black p-3">
                <p className="text-[8px] font-pixel text-retro-gray mb-1">MARKET PRICE</p>
                <p className="text-lg font-pixel text-retro-black">{formatPrice(variantData.market || variantData.marketPrice)}</p>
              </div>
            )}

            {/* Low Price */}
            {(variantData.low !== undefined || variantData.lowPrice !== undefined) && (
              <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black p-3">
                <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light mb-1">LOW</p>
                <p className="text-sm font-pixel text-retro-black dark:text-retro-white">{formatPrice(variantData.low || variantData.lowPrice)}</p>
              </div>
            )}

            {/* Mid Price */}
            {(variantData.mid !== undefined || variantData.midPrice !== undefined) && (
              <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black p-3">
                <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light mb-1">MID</p>
                <p className="text-sm font-pixel text-retro-black dark:text-retro-white">{formatPrice(variantData.mid || variantData.midPrice)}</p>
              </div>
            )}

            {/* High Price */}
            {(variantData.high !== undefined || variantData.highPrice !== undefined) && (
              <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black p-3">
                <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light mb-1">HIGH</p>
                <p className="text-sm font-pixel text-retro-black dark:text-retro-white">{formatPrice(variantData.high || variantData.highPrice)}</p>
              </div>
            )}

            {/* Direct Low Price */}
            {(variantData.directLow !== undefined || variantData.directLowPrice !== undefined) && (
              <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black p-3">
                <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light mb-1">DIRECT LOW</p>
                <p className="text-sm font-pixel text-retro-black dark:text-retro-white">{formatPrice(variantData.directLow || variantData.directLowPrice)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (showAllVariants) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-4 py-3 border-3 border-retro-black shadow-pixel">
          <h2 className="text-sm font-pixel uppercase">TCGPlayer Prices (USD)</h2>
          {(pricing.updatedAt || pricing.updated) && (
            <p className="text-[8px] font-pixel mt-1 opacity-80">
              Updated: {new Date(pricing.updatedAt || pricing.updated!).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* All Variants */}
        {renderVariantPrices('normal', pricesData.normal)}
        {renderVariantPrices('holofoil', pricesData.holofoil)}
        {renderVariantPrices('reverseHolofoil', pricesData.reverseHolofoil)}

        {/* No prices available */}
        {!pricesData.normal && !pricesData.holofoil && !pricesData.reverseHolofoil && (
          <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-3 border-retro-black p-6 text-center">
            <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
              No TCGPlayer pricing available for this card
            </p>
          </div>
        )}
      </div>
    );
  }

  // Single variant display (compact)
  const variantData = pricesData[variant];
  if (!variantData) {
    return (
      <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black p-3">
        <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light text-center">
          No {getVariantName(variant)} pricing
        </p>
      </div>
    );
  }

  return (
    <div className="bg-retro-white dark:bg-retro-black border-2 border-retro-black p-3">
      <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light mb-2">
        {getVariantName(variant)} • TCGPlayer
      </p>
      {(variantData.market || variantData.marketPrice) && (
        <p className="text-lg font-pixel text-retro-black dark:text-retro-white">
          {formatPrice(variantData.market || variantData.marketPrice)}
        </p>
      )}
      {!(variantData.market || variantData.marketPrice) && (variantData.mid || variantData.midPrice) && (
        <p className="text-lg font-pixel text-retro-black dark:text-retro-white">
          {formatPrice(variantData.mid || variantData.midPrice)}
        </p>
      )}
    </div>
  );
}
