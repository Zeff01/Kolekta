'use client';

import { useCollection, CardCondition, GradingCompany, GradeValue, GradingInfo } from '@/contexts/CollectionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { PokemonCard } from '@/types/pokemon';
import { Heart, BookmarkPlus, Check, Minus, Plus, Star, DollarSign, Award, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface CollectionButtonsProps {
  card: PokemonCard;
}

const CONDITIONS: CardCondition[] = ['Raw', 'LP', 'MP', 'HP'];
const GRADING_COMPANIES: GradingCompany[] = ['PSA', 'CGC', 'BGS'];
const GRADES: GradeValue[] = ['10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1'];

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

  // Helper functions
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getCurrencySymbol = () => {
    return currency === 'PHP' ? '₱' : '$';
  };

  // State
  const [showQuantity, setShowQuantity] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showPurchasePriceModal, setShowPurchasePriceModal] = useState(false);
  const [purchasePriceInput, setPurchasePriceInput] = useState('');
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<CardCondition>('Raw');
  const [selectedGradingCompany, setSelectedGradingCompany] = useState<GradingCompany>('PSA');
  const [selectedGrade, setSelectedGrade] = useState<GradeValue>('10');
  const [isGraded, setIsGraded] = useState(false);

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
      setShowAddModal(true);
    }
  };

  const handleConfirmAdd = () => {
    // Convert price to USD before storing (if user is in PHP, divide by exchange rate)
    let priceInUSD: number | undefined = undefined;
    if (purchasePriceInput) {
      const enteredPrice = parseFloat(purchasePriceInput);
      priceInUSD = currency === 'PHP' ? enteredPrice / 56.5 : enteredPrice;
    }
    const grading: GradingInfo | undefined = isGraded ? { company: selectedGradingCompany, grade: selectedGrade } : undefined;

    addToCollection(card, 1, priceInUSD, selectedCondition, grading);
    setShowAddModal(false);
    setPurchasePriceInput('');
    setSelectedCondition('Raw');
    setIsGraded(false);
    setShowQuantity(true);
  };

  const handleAddToWishlist = () => {
    console.log('[CollectionButtons] Adding to wishlist:', card.name, card.id);
    if (inWishlist) {
      console.log('[CollectionButtons] Already in wishlist, showing priority controls');
      setShowPriority(!showPriority);
    } else {
      console.log('[CollectionButtons] Adding new card to wishlist');
      addToWishlist(card, 'medium');
      setShowPriority(true);
    }
  };

  const getConditionColor = (condition: CardCondition) => {
    switch (condition) {
      case 'Raw': return 'bg-retro-blue';
      case 'LP': return 'bg-green-500';
      case 'MP': return 'bg-retro-yellow';
      case 'HP': return 'bg-retro-red';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-retro-red';
      case 'medium': return 'bg-retro-yellow';
      case 'low': return 'bg-retro-gray';
    }
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
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

      {/* Condition/Grading Display (when in collection) */}
      {inCollection && collectionItem && (collectionItem.condition || collectionItem.grading) && (
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-3 shadow-pixel flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-retro-gray dark:text-retro-gray-light" />
            <div className="flex items-center gap-2">
              {collectionItem.condition && (
                <span className={`px-2 py-1 text-xs font-pixel ${getConditionColor(collectionItem.condition)} text-white border-2 border-retro-black`}>
                  {collectionItem.condition}
                </span>
              )}
              {collectionItem.grading && (
                <span className="px-2 py-1 text-xs font-pixel bg-retro-yellow text-retro-black border-2 border-retro-black">
                  {collectionItem.grading.company} {collectionItem.grading.grade}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowConditionModal(true)}
            className="text-xs text-retro-blue hover:underline flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>
      )}

      {/* Purchase Price Display (when in collection) */}
      {inCollection && collectionItem && collectionItem.purchasePrice && (
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-3 shadow-pixel">
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-2">
            Purchase Price
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-pixel text-retro-black dark:text-retro-white">
              Paid: {getCurrencySymbol()}{formatNumber(convertPrice(collectionItem.purchasePrice))}
            </span>
            {(() => {
              const usdPrice = card.tcgplayer?.prices?.holofoil?.market
                || card.tcgplayer?.prices?.normal?.market
                || card.tcgplayer?.prices?.reverseHolofoil?.market
                || 0;
              const currentPrice = convertPrice(usdPrice);
              const purchasePrice = convertPrice(collectionItem.purchasePrice);
              const profitLoss = currentPrice - purchasePrice;
              const profitLossPercent = ((profitLoss / purchasePrice) * 100).toFixed(1);
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

      {/* Rest of the existing UI sections (Priority Controls, Quantity Controls, etc.) */}
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
                    Paid: {getCurrencySymbol()}{formatNumber(convertPrice(collectionItem.purchasePrice))}
                  </span>
                  <button
                    onClick={() => {
                      // Convert from USD to current currency for editing
                      const priceInCurrentCurrency = convertPrice(collectionItem.purchasePrice || 0);
                      setPurchasePriceInput(priceInCurrentCurrency.toFixed(2));
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
                  const purchasePrice = convertPrice(collectionItem.purchasePrice);
                  const profitLoss = currentPrice - purchasePrice;
                  const profitLossPercent = ((profitLoss / purchasePrice) * 100).toFixed(1);
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

      {/* Add to Collection Modal (with condition/grading) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-6 shadow-pixel max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-pixel text-retro-black dark:text-retro-white mb-4">
              Add to Collection
            </h3>

            {/* Purchase Price */}
            <div className="mb-4">
              <label className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-2 block">
                Purchase Price (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchasePriceInput}
                onChange={(e) => setPurchasePriceInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border-2 border-retro-black text-retro-black dark:text-retro-white bg-white dark:bg-gray-800 font-pixel"
              />
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-2 block">
                Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => setSelectedCondition(condition)}
                    className={`px-4 py-2 border-2 border-retro-black text-xs font-pixel uppercase transition-all ${
                      selectedCondition === condition
                        ? `${getConditionColor(condition)} text-white shadow-pixel`
                        : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:shadow-pixel'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Grading */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="isGraded"
                  checked={isGraded}
                  onChange={(e) => setIsGraded(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isGraded" className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
                  Graded Card
                </label>
              </div>

              {isGraded && (
                <div className="space-y-2 mt-3">
                  {/* Grading Company */}
                  <div>
                    <label className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-1 block">
                      Company
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {GRADING_COMPANIES.map((company) => (
                        <button
                          key={company}
                          onClick={() => setSelectedGradingCompany(company)}
                          className={`px-3 py-2 border-2 border-retro-black text-xs font-pixel uppercase transition-all ${
                            selectedGradingCompany === company
                              ? 'bg-retro-yellow text-retro-black shadow-pixel'
                              : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:shadow-pixel'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-1 block">
                      Grade
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value as GradeValue)}
                      className="w-full px-3 py-2 border-2 border-retro-black text-retro-black dark:text-retro-white bg-white dark:bg-gray-800 font-pixel"
                    >
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAdd}
                className="flex-1 px-4 py-2 bg-retro-blue text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-blue-700 transition-colors"
              >
                Add to Collection
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setPurchasePriceInput('');
                  setSelectedCondition('Raw');
                  setIsGraded(false);
                }}
                className="flex-1 px-4 py-2 bg-retro-gray text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Condition/Grading Modal */}
      {showConditionModal && collectionItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-6 shadow-pixel max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-pixel text-retro-black dark:text-retro-white mb-4">
              Edit Condition & Grading
            </h3>

            {/* Condition */}
            <div className="mb-4">
              <label className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-2 block">
                Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => {
                      updateCondition(card.id, condition);
                      setSelectedCondition(condition);
                    }}
                    className={`px-4 py-2 border-2 border-retro-black text-xs font-pixel uppercase transition-all ${
                      (collectionItem.condition === condition)
                        ? `${getConditionColor(condition)} text-white shadow-pixel`
                        : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:shadow-pixel'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Grading */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="editIsGraded"
                  checked={!!collectionItem.grading}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      updateGrading(card.id, undefined);
                    }
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="editIsGraded" className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
                  Graded Card
                </label>
              </div>

              {collectionItem.grading && (
                <div className="space-y-2 mt-3">
                  {/* Grading Company */}
                  <div>
                    <label className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-1 block">
                      Company
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {GRADING_COMPANIES.map((company) => (
                        <button
                          key={company}
                          onClick={() => {
                            updateGrading(card.id, { company, grade: collectionItem.grading!.grade });
                          }}
                          className={`px-3 py-2 border-2 border-retro-black text-xs font-pixel uppercase transition-all ${
                            collectionItem.grading!.company === company
                              ? 'bg-retro-yellow text-retro-black shadow-pixel'
                              : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:shadow-pixel'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light mb-1 block">
                      Grade
                    </label>
                    <select
                      value={collectionItem.grading.grade}
                      onChange={(e) => {
                        updateGrading(card.id, { company: collectionItem.grading!.company, grade: e.target.value as GradeValue });
                      }}
                      className="w-full px-3 py-2 border-2 border-retro-black text-retro-black dark:text-retro-white bg-white dark:bg-gray-800 font-pixel"
                    >
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowConditionModal(false)}
              className="w-full px-4 py-2 bg-retro-blue text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Purchase Price Edit Modal */}
      {showPurchasePriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black p-6 shadow-pixel max-w-md">
            <h3 className="text-lg font-pixel text-retro-black dark:text-retro-white mb-4">
              {collectionItem?.purchasePrice ? 'Edit Purchase Price' : 'Enter Purchase Price'}
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
                onClick={() => {
                  // Convert price to USD before storing (if user is in PHP, divide by exchange rate)
                  let priceInUSD = 0;
                  if (purchasePriceInput) {
                    const enteredPrice = parseFloat(purchasePriceInput);
                    priceInUSD = currency === 'PHP' ? enteredPrice / 56.5 : enteredPrice;
                  }
                  updatePurchasePrice(card.id, priceInUSD);
                  setShowPurchasePriceModal(false);
                  setPurchasePriceInput('');
                }}
                className="flex-1 px-4 py-2 bg-retro-blue text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowPurchasePriceModal(false);
                  setPurchasePriceInput('');
                }}
                className="flex-1 px-4 py-2 bg-retro-gray text-retro-white border-2 border-retro-black text-xs font-pixel uppercase hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
