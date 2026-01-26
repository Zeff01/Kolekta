'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/contexts/CollectionContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Store, Upload, X } from 'lucide-react';
import { CardCondition, CardGrading} from '@/types/pokemon';

export default function SellPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { collection, isLoaded } = useCollection();
  const toast = useToast();
  const router = useRouter();

  const [selectedCardId, setSelectedCardId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricingMode, setPricingMode] = useState<'market' | 'custom'>('market');
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [pricePerCard, setPricePerCard] = useState('');
  const [condition, setCondition] = useState<CardCondition>('Raw');
  const [gradingStatus, setGradingStatus] = useState<'raw' | 'graded'>('raw');
  const [grading, setGrading] = useState<CardGrading | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const selectedCard = collection.find((item) => item.card.id === selectedCardId);
  const availableQuantity = selectedCard
    ? selectedCard.quantity - (selectedCard.lockedQuantity || 0)
    : 0;

  // Fetch market price when card is selected
  useEffect(() => {
    const fetchMarketPrice = async () => {
      if (!selectedCard) {
        setMarketPrice(null);
        return;
      }

      // Get market price from card's TCGPlayer data
      const tcgPrice = selectedCard.card.tcgplayer?.prices?.normal?.market ||
                       selectedCard.card.tcgplayer?.prices?.holofoil?.market ||
                       selectedCard.card.tcgplayer?.prices?.reverseHolofoil?.market ||
                       selectedCard.card.tcgplayer?.prices?.['1stEditionHolofoil']?.market;

      if (tcgPrice) {
        // Convert USD to PHP (approximate rate: 1 USD = 56.50 PHP)
        const phpPrice = tcgPrice * 56.50;
        setMarketPrice(phpPrice);

        // If in market mode, set the price
        if (pricingMode === 'market') {
          const finalPrice = phpPrice * (1 + markupPercentage / 100);
          setPricePerCard(finalPrice.toFixed(2));
        }
      } else {
        setMarketPrice(null);
      }
    };

    fetchMarketPrice();
  }, [selectedCard, pricingMode, markupPercentage]);

  // Update price when markup changes in market mode
  useEffect(() => {
    if (pricingMode === 'market' && marketPrice) {
      const finalPrice = marketPrice * (1 + markupPercentage / 100);
      setPricePerCard(finalPrice.toFixed(2));
    }
  }, [markupPercentage, marketPrice, pricingMode]);

  // Clear custom price when switching to market mode
  const handlePricingModeChange = (mode: 'market' | 'custom') => {
    setPricingMode(mode);
    if (mode === 'market' && marketPrice) {
      const finalPrice = marketPrice * (1 + markupPercentage / 100);
      setPricePerCard(finalPrice.toFixed(2));
    } else if (mode === 'custom') {
      setPricePerCard('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'listing');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImages([...images, data.url]);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCard) {
      toast.warning('Please select a card');
      return;
    }

    if (quantity > availableQuantity) {
      toast.warning(`Only ${availableQuantity} available to list`);
      return;
    }

    if (!pricePerCard || parseFloat(pricePerCard) <= 0) {
      toast.warning('Please enter a valid price');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCard.card.id,
          card: selectedCard.card,
          quantity,
          pricePerCard: parseFloat(pricePerCard),
          condition,
          gradingStatus,
          grading: gradingStatus === 'graded' ? grading : undefined,
          description,
          images,
        }),
      });

      if (response.ok) {
        toast.success('Listing created successfully!');
        router.push('/marketplace/my-shop');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-retro-white dark:bg-retro-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="h-8 w-48 bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse mb-8"></div>
          <div className="h-96 bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-retro-yellow dark:bg-retro-yellow text-retro-black px-4 md:px-6 py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-xs md:text-sm font-pixel uppercase flex items-center gap-2">
              <Store className="w-4 h-4 md:w-5 md:h-5" />
              Create Listing
            </h1>
          </div>
        </div>

        {collection.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-pixel text-sm text-retro-black dark:text-retro-white mb-4">
              You don't have any cards in your collection yet
            </p>
            <button
              onClick={() => router.push('/cards')}
              className="bg-retro-blue border-2 border-retro-black px-4 py-2 shadow-pixel hover:shadow-pixel-lg transition-all font-pixel text-xs text-retro-white uppercase"
            >
              Browse Cards
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 sm:border-3 border-retro-black shadow-pixel p-4 sm:p-6">
            {/* Card Selection */}
            <div className="mb-6">
              <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                Select Card *
              </label>
              <select
                value={selectedCardId}
                onChange={(e) => {
                  setSelectedCardId(e.target.value);
                  setQuantity(1);
                }}
                required
                className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
              >
                <option value="">-- Choose a card --</option>
                {collection.map((item) => {
                  const available = item.quantity - (item.lockedQuantity || 0);
                  return (
                    <option key={item.card.id} value={item.card.id} disabled={available === 0}>
                      {item.card.name} - {item.card.set.name} (Available: {available}/{item.quantity})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Card Preview */}
            {selectedCard && (
              <div className="mb-6 p-4 bg-retro-white dark:bg-retro-black border-2 border-retro-black">
                <div className="flex gap-4">
                  <div className="relative w-32 h-44 flex-shrink-0">
                    <Image
                      src={selectedCard.card.images.small}
                      alt={selectedCard.card.name}
                      fill
                      className="object-contain"
                      sizes="128px"
                    />
                  </div>
                  <div>
                    <h3 className="font-pixel text-sm text-retro-black dark:text-retro-white mb-1">
                      {selectedCard.card.name}
                    </h3>
                    <p className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark mb-2">
                      {selectedCard.card.set.name}
                    </p>
                    <p className="font-pixel text-xs text-retro-black dark:text-retro-white">
                      Available: {availableQuantity}
                    </p>
                    {selectedCard.lockedQuantity && selectedCard.lockedQuantity > 0 && (
                      <p className="font-pixel text-xs text-retro-yellow mt-1">
                        (Locked in marketplace: {selectedCard.lockedQuantity})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                max={availableQuantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
                disabled={!selectedCard}
                className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue disabled:opacity-50"
              />
            </div>

            {/* Pricing Mode Selector */}
            <div className="mb-6">
              <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                Pricing Method *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePricingModeChange('market')}
                  disabled={!selectedCard || !marketPrice}
                  className={`px-4 py-3 border-2 border-retro-black font-pixel text-xs uppercase transition-all ${
                    pricingMode === 'market'
                      ? 'bg-retro-blue text-retro-white shadow-pixel'
                      : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:bg-retro-gray-light dark:hover:bg-retro-gray-dark'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Market Price
                  {!marketPrice && selectedCard && (
                    <span className="block text-[8px] mt-1 normal-case">No market data</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricingModeChange('custom')}
                  disabled={!selectedCard}
                  className={`px-4 py-3 border-2 border-retro-black font-pixel text-xs uppercase transition-all ${
                    pricingMode === 'custom'
                      ? 'bg-retro-blue text-retro-white shadow-pixel'
                      : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:bg-retro-gray-light dark:hover:bg-retro-gray-dark'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Custom Price
                </button>
              </div>
            </div>

            {/* Market Price Info & Markup */}
            {pricingMode === 'market' && marketPrice && (
              <div className="mb-6 p-4 bg-retro-blue border-2 border-retro-black">
                <div className="mb-3">
                  <p className="font-pixel text-[9px] text-retro-white opacity-80 mb-1">
                    TCG Market Price (USD → PHP)
                  </p>
                  <p className="font-pixel text-sm text-retro-white">
                    ₱{marketPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <label className="block font-pixel text-[9px] text-retro-white mb-2">
                    Markup Percentage (0% = Market Price)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-pixel text-xs text-retro-white w-12 text-right">
                      {markupPercentage}%
                    </span>
                  </div>
                  <p className="font-pixel text-[8px] text-retro-white opacity-70 mt-2">
                    Your Price: ₱{pricePerCard}
                    {markupPercentage > 0 && ` (+${markupPercentage}% above market)`}
                  </p>
                </div>
              </div>
            )}

            {/* Custom Price Input */}
            {pricingMode === 'custom' && (
              <div className="mb-6">
                <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                  Custom Price Per Card (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={pricePerCard}
                  onChange={(e) => setPricePerCard(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
                />
                {marketPrice && (
                  <p className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark mt-2">
                    Market Price: ₱{marketPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Condition */}
              <div>
                <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as CardCondition)}
                  required
                  className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
                >
                  <option value="Raw">Raw (Mint/Near Mint)</option>
                  <option value="LP">Light Played (LP)</option>
                  <option value="MP">Moderately Played (MP)</option>
                  <option value="HP">Heavily Played (HP)</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              {/* Grading Status */}
              <div>
                <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                  Grading Status *
                </label>
                <select
                  value={gradingStatus}
                  onChange={(e) => {
                    const status = e.target.value as 'raw' | 'graded';
                    setGradingStatus(status);
                    if (status === 'raw') {
                      setGrading(undefined);
                    }
                  }}
                  required
                  className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
                >
                  <option value="raw">Raw (Ungraded)</option>
                  <option value="graded">Graded</option>
                </select>
              </div>
            </div>

            {/* Grading Info (if graded) */}
            {gradingStatus === 'graded' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-retro-yellow border-2 border-retro-black">
                <div>
                  <label className="block font-pixel text-xs text-retro-black mb-2">
                    Grading Company *
                  </label>
                  <select
                    value={grading?.company || ''}
                    onChange={(e) =>
                      setGrading({
                        company: e.target.value as 'PSA' | 'CGC' | 'BGS',
                        grade: grading?.grade || '10',
                      })
                    }
                    required
                    className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white text-retro-black font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
                  >
                    <option value="">-- Select --</option>
                    <option value="PSA">PSA</option>
                    <option value="CGC">CGC</option>
                    <option value="BGS">BGS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-pixel text-xs text-retro-black mb-2">
                    Grade *
                  </label>
                  <input
                    type="text"
                    value={grading?.grade || ''}
                    onChange={(e) =>
                      setGrading({
                        company: grading?.company || 'PSA',
                        grade: e.target.value,
                      })
                    }
                    placeholder="e.g., 10, 9.5, 9"
                    required
                    className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white text-retro-black font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Add any additional details about the card..."
                className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue resize-none"
              />
              <p className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Additional Images */}
            <div className="mb-6">
              <label className="block font-pixel text-xs text-retro-black dark:text-retro-white mb-2">
                Additional Images (Optional)
              </label>
              <p className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark mb-2">
                Upload close-up photos to show card condition
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 border-2 border-retro-black bg-retro-white">
                    <Image src={url} alt={`Upload ${index + 1}`} fill className="object-cover" sizes="96px" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 border-2 border-retro-black rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3 text-retro-white" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-retro-black bg-retro-white dark:bg-retro-black flex flex-col items-center justify-center cursor-pointer hover:bg-retro-gray-light dark:hover:bg-retro-gray-dark transition-colors">
                    <Upload className="w-6 h-6 text-retro-gray-light dark:text-retro-gray-dark mb-1" />
                    <span className="font-pixel text-[8px] text-retro-gray-light dark:text-retro-gray-dark">
                      {uploading ? 'Uploading...' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="font-pixel text-[9px] text-retro-gray-light dark:text-retro-gray-dark">
                Max 5 images (JPEG, PNG, WebP up to 5MB each)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || !selectedCard}
                className="flex-1 bg-retro-blue border-2 sm:border-3 border-retro-black px-6 py-3 shadow-pixel hover:shadow-pixel-lg transition-all font-pixel text-xs text-retro-white uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Listing'}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 sm:border-3 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs uppercase hover:bg-retro-gray-light dark:hover:bg-retro-gray-dark transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
