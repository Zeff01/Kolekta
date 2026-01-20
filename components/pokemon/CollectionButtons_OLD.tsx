'use client';

import { useCollection, CardCondition, GradingCompany, GradeValue, GradingInfo } from '@/contexts/CollectionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { PokemonCard } from '@/types/pokemon';
import { Heart, BookmarkPlus, Check, Minus, Plus, Star, DollarSign, Award, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface CollectionButtonsProps {
  card: PokemonCard;
}

export default function CollectionButtons({ card }: CollectionButtonsProps) {
  const {
    isInCollection,
    addToCollection,
    removeFromCollection,
    getCardQuantity,
    updateQuantity,
    updatePurchasePrice,
    updateCondition,
    updateGrading,
    getCollectionItem,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    updatePriority,
    getWishlistItem,
    isLoaded,
  } = useCollection();

  const { convertPrice, currency } = useCurrency();

  // Helper function to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = () => {
    return currency === 'PHP' ? '₱' : '$';
  };

  const [showQuantity, setShowQuantity] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showPurchasePriceModal, setShowPurchasePriceModal] = useState(false);
  const [purchasePriceInput, setPurchasePriceInput] = useState('');
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<CardCondition>('Raw');
  const [selectedGradingCompany, setSelectedGradingCompany] = useState<GradingCompany>('PSA');
  const [selectedGrade, setSelectedGrade] = useState<GradeValue>('10');
  const inCollection = isLoaded && isInCollection(card.id);
  const inWishlist = isLoaded && isInWishlist(card.id);
  const quantity = getCardQuantity(card.id);
  const collectionItem = inCollection ? getCollectionItem(card.id) : null;
  const wishlistItem = inWishlist ? getWishlistItem(card.id) : null;

  if (!isLoaded) {
    return (
      <div className="flex gap-3">
        <div className="h-12 w-40 bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black animate-pulse"></div>
        <div className="h-12 w-40 bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black animate-pulse"></div>
      </div>
    );
  }

  const handleAddToCollection = () => {
    if (inCollection) {
      setShowQuantity(!showQuantity);
    } else {
      // Show modal to ask for purchase price before adding
      setShowPurchasePriceModal(true);
    }
  };

  const handleConfirmAdd = () => {
    const price = purchasePriceInput ? parseFloat(purchasePriceInput) : undefined;
    addToCollection(card, 1, price);
    setShowPurchasePriceModal(false);
    setPurchasePriceInput('');
    setShowQuantity(true);
  };

  const handleSkipPurchasePrice = () => {
    addToCollection(card, 1);
    setShowPurchasePriceModal(false);
    setPurchasePriceInput('');
    setShowQuantity(true);
  };

  const handleAddToWishlist = () => {
    if (inWishlist) {
      setShowPriority(!showPriority);
    } else {
      addToWishlist(card, 'medium');
      setShowPriority(true);
    }
  };

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
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Medium';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 flex-wrap">
        {/* Add to Collection Button */}
        <button
          onClick={handleAddToCollection}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-3 border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 ${
            inCollection
              ? 'bg-green-500 text-white'
              : 'bg-retro-blue text-retro-white'
          }`}
        >
          {inCollection ? (
            <Check className="w-5 h-5" />
          ) : (
            <BookmarkPlus className="w-5 h-5" />
          )}
          <span className="text-xs font-pixel uppercase">
            {inCollection ? `In Collection (${quantity})` : 'Add to Collection'}
          </span>
        </button>

        {/* Add to Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-3 border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 ${
            inWishlist && wishlistItem
              ? `${getPriorityColor(wishlistItem.priority)} text-retro-white`
              : 'bg-retro-yellow text-retro-black'
          }`}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          <span className="text-xs font-pixel uppercase">
            {inWishlist && wishlistItem ? `${getPriorityLabel(wishlistItem.priority)} Priority` : 'Add to Wishlist'}
          </span>
        </button>
      </div>

      {/* Purchase Price Display (when in collection) */}
      {inCollection && collectionItem && collectionItem.purchasePrice && (
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-3 shadow-pixel">
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-2">
            Purchase Price
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-pixel text-retro-black dark:text-retro-white">
              Paid: {getCurrencySymbol()}{formatNumber(collectionItem.purchasePrice)}
            </span>
            {(() => {
              const usdPrice = card.tcgplayer?.prices?.holofoil?.market
                || card.tcgplayer?.prices?.normal?.market
                || card.tcgplayer?.prices?.reverseHolofoil?.market
                || 0;
              const currentPrice = convertPrice(usdPrice);
              const profitLoss = currentPrice - collectionItem.purchasePrice;
              const profitLossPercent = ((profitLoss / collectionItem.purchasePrice) * 100).toFixed(1);
              const isProfit = profitLoss >= 0;

              return (
                <span className={`text-sm font-pixel ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isProfit ? '▲' : '▼'} {getCurrencySymbol()}{formatNumber(Math.abs(profitLoss))} ({isProfit ? '+' : ''}{profitLossPercent}%)
                </span>
              );
            })()}
          </div>
        </div>
      )}

      {/* Priority Controls */}
      {inWishlist && showPriority && wishlistItem && (
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-4 shadow-pixel">
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Set Priority Level
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => updatePriority(card.id, 'high')}
              className={`flex-1 min-w-[80px] px-4 py-2 border-2 border-retro-black text-xs font-pixel uppercase transition-all ${
                wishlistItem.priority === 'high'
                  ? 'bg-retro-red text-retro-white shadow-pixel'
                  : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:shadow-pixel'
              }`}
            >
              High
            </button>
            <button
              onClick={() => updatePriority(card.id, 'medium')}
              className={`flex-1 min-w-[80px] px-4 py-2 border-2 border-retro-black text-xs font-pixel uppercase transition-all ${
                wishlistItem.priority === 'medium'
                  ? 'bg-retro-yellow text-retro-black shadow-pixel'
                  : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:shadow-pixel'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => updatePriority(card.id, 'low')}
              className={`flex-1 min-w-[80px] px-4 py-2 border-2 border-retro-black text-xs font-pixel uppercase transition-all ${
                wishlistItem.priority === 'low'
                  ? 'bg-retro-gray text-retro-white shadow-pixel'
                  : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:shadow-pixel'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => {
                removeFromWishlist(card.id);
                setShowPriority(false);
              }}
              className="px-4 py-2 bg-retro-red text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Quantity Controls */}
      {inCollection && showQuantity && collectionItem && (
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-4 shadow-pixel">
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-3">
            Quantity in Collection
          </p>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => updateQuantity(card.id, quantity - 1)}
              className="p-2 bg-retro-gray text-retro-white border-2 border-retro-black hover:bg-retro-gray-dark transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-pixel text-retro-black dark:text-retro-white min-w-[3ch] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(card.id, quantity + 1)}
              className="p-2 bg-retro-gray text-retro-white border-2 border-retro-black hover:bg-retro-gray-dark transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                removeFromCollection(card.id);
                setShowQuantity(false);
              }}
              className="ml-auto px-3 py-2 bg-retro-red text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Purchase Price & Profit/Loss */}
          <div className="border-t-2 border-retro-black pt-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-retro-gray dark:text-retro-gray-light" />
              <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
                Purchase Price
              </p>
            </div>
            {collectionItem.purchasePrice ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-pixel text-retro-black dark:text-retro-white">
                    Paid: {getCurrencySymbol()}{formatNumber(collectionItem.purchasePrice)}
                  </span>
                  <button
                    onClick={() => {
                      setPurchasePriceInput(collectionItem.purchasePrice?.toString() || '');
                      setShowPurchasePriceModal(true);
                    }}
                    className="text-xs text-retro-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {(() => {
                  const usdPrice = card.tcgplayer?.prices?.holofoil?.market
                    || card.tcgplayer?.prices?.normal?.market
                    || card.tcgplayer?.prices?.reverseHolofoil?.market
                    || 0;
                  const currentPrice = convertPrice(usdPrice);
                  const profitLoss = currentPrice - collectionItem.purchasePrice;
                  const profitLossPercent = ((profitLoss / collectionItem.purchasePrice) * 100).toFixed(1);
                  const isProfit = profitLoss >= 0;

                  return (
                    <div className={`text-sm font-pixel ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isProfit ? '▲' : '▼'} {getCurrencySymbol()}{formatNumber(Math.abs(profitLoss))} ({isProfit ? '+' : ''}{profitLossPercent}%)
                    </div>
                  );
                })()}
              </div>
            ) : (
              <button
                onClick={() => setShowPurchasePriceModal(true)}
                className="text-xs text-retro-blue hover:underline font-pixel"
              >
                + Add Purchase Price
              </button>
            )}
          </div>
        </div>
      )}

      {/* Purchase Price Modal */}
      {showPurchasePriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-6 shadow-pixel max-w-md">
            <h3 className="text-lg font-pixel text-retro-black dark:text-retro-white mb-4">
              Enter Purchase Price
            </h3>
            <p className="text-xs text-retro-gray dark:text-retro-gray-light mb-4">
              How much did you pay for this card? (per card)
            </p>
            <input
              type="number"
              step="0.01"
              min="0"
              value={purchasePriceInput}
              onChange={(e) => setPurchasePriceInput(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border-2 border-retro-black text-retro-black dark:text-retro-white bg-white dark:bg-gray-800 font-pixel mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={inCollection ? () => {
                  const price = purchasePriceInput ? parseFloat(purchasePriceInput) : 0;
                  updatePurchasePrice(card.id, price);
                  setShowPurchasePriceModal(false);
                  setPurchasePriceInput('');
                } : handleConfirmAdd}
                className="flex-1 px-4 py-2 bg-retro-blue text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-blue-700 transition-colors"
              >
                {purchasePriceInput ? 'Save' : 'Skip'}
              </button>
              <button
                onClick={() => {
                  setShowPurchasePriceModal(false);
                  setPurchasePriceInput('');
                  if (!inCollection) {
                    handleSkipPurchasePrice();
                  }
                }}
                className="flex-1 px-4 py-2 bg-retro-gray text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-gray-700 transition-colors"
              >
                {inCollection ? 'Cancel' : 'Skip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
