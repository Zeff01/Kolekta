'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { MarketplaceListing, Message } from '@/types/pokemon';
import Image from 'next/image';
import {  Store, Send, Upload, X, Copy, Check } from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { convertPrice, currency } = useCurrency();

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageImages, setMessageImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchListing();
      if (isAuthenticated) {
        fetchMessages();
      }
    }
  }, [params.id, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/marketplace/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data.listing);
      } else {
        router.push('/marketplace');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?listingId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'message');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessageImages([...messageImages, data.url]);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setMessageImages(messageImages.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && messageImages.length === 0) return;
    if (!listing || !user) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params.id,
          receiverId: listing.userId,
          message: newMessage,
          images: messageImages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
        setMessageImages([]);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatPrice = (priceInPHP: number) => {
    const converted = convertPrice(priceInPHP, 'PHP');
    const symbol = currency === 'PHP' ? '₱' : '$';
    return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isOwnListing = listing && user && listing.userId === user._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-white dark:bg-retro-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="h-96 bg-retro-gray-light dark:bg-retro-gray-dark animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-retro-white dark:bg-retro-black flex items-center justify-center">
        <p className="font-pixel text-sm text-retro-black dark:text-retro-white">Listing not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="font-pixel text-xs text-retro-blue hover:underline mb-4"
          >
            ← Back to Marketplace
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Card Details */}
          <div className="lg:col-span-2">
            <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 sm:border-3 border-retro-black shadow-pixel p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Image */}
                <div>
                  <div className="relative aspect-[245/342] bg-retro-white border-2 border-retro-black mb-4">
                    <Image
                      src={listing.card.images.large}
                      alt={listing.card.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>

                  {/* Additional Images */}
                  {listing.images && listing.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {listing.images.map((img, index) => (
                        <div key={index} className="relative aspect-square border-2 border-retro-black bg-retro-white">
                          <Image src={img} alt={`Photo ${index + 1}`} fill className="object-cover" sizes="33vw" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div>
                  <h1 className="font-pixel text-base sm:text-lg text-retro-black dark:text-retro-white mb-2">
                    {listing.card.name}
                  </h1>
                  <p className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark mb-4">
                    {listing.card.set.name} • #{listing.card.number}
                  </p>

                  {/* Price */}
                  <div className="bg-green-500 border-2 sm:border-3 border-retro-black p-4 shadow-pixel mb-4">
                    <p className="font-pixel text-xs text-retro-white opacity-80 mb-1">Price Per Card</p>
                    <p className="font-pixel text-2xl text-retro-white">{formatPrice(listing.pricePerCard)}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center py-2 border-b-2 border-retro-black">
                      <span className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark">Quantity:</span>
                      <span className="font-pixel text-xs text-retro-black dark:text-retro-white">{listing.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b-2 border-retro-black">
                      <span className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark">Condition:</span>
                      <span className="font-pixel text-xs text-retro-black dark:text-retro-white">{listing.condition}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b-2 border-retro-black">
                      <span className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark">Grading:</span>
                      <span className="font-pixel text-xs text-retro-black dark:text-retro-white">
                        {listing.gradingStatus === 'graded' && listing.grading
                          ? `${listing.grading.company} ${listing.grading.grade}`
                          : 'Ungraded (Raw)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b-2 border-retro-black">
                      <span className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark">Rarity:</span>
                      <span className="font-pixel text-xs text-retro-black dark:text-retro-white">{listing.card.rarity || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <div className="mt-4">
                      <h3 className="font-pixel text-xs text-retro-black dark:text-retro-white mb-2">Description</h3>
                      <p className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark whitespace-pre-wrap">
                        {listing.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-retro-blue border-2 sm:border-3 border-retro-black shadow-pixel p-4 mt-6">
              <h3 className="font-pixel text-xs text-retro-white mb-4 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Seller Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-xs text-retro-white opacity-80">Username:</span>
                  <span className="font-pixel text-xs text-retro-white">@{listing.seller?.username || 'Unknown'}</span>
                </div>

                {/* Payment Info (only show to interested buyers in messages) */}
                {!isOwnListing && messages.length > 0 && listing.seller?.paymentInfo && (
                  <div className="mt-4 pt-4 border-t-2 border-retro-white/20">
                    <p className="font-pixel text-xs text-retro-white mb-3">Payment Information:</p>

                    {listing.seller.paymentInfo.gcashNumber && (
                      <div className="mb-2">
                        <p className="font-pixel text-[10px] text-retro-white opacity-80 mb-1">GCash Number:</p>
                        <div className="flex items-center gap-2">
                          <code className="font-pixel text-xs text-retro-white bg-retro-black/20 px-2 py-1 rounded">
                            {listing.seller.paymentInfo.gcashNumber}
                          </code>
                          <button
                            onClick={() => copyToClipboard(listing.seller!.paymentInfo!.gcashNumber!, 'gcash')}
                            className="p-1 hover:bg-retro-white/10 rounded"
                          >
                            {copiedField === 'gcash' ? (
                              <Check className="w-3 h-3 text-green-300" />
                            ) : (
                              <Copy className="w-3 h-3 text-retro-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {listing.seller.paymentInfo.gcashQR && (
                      <div className="mb-2">
                        <p className="font-pixel text-[10px] text-retro-white opacity-80 mb-1">GCash QR:</p>
                        <div className="relative w-32 h-32 bg-retro-white border-2 border-retro-black">
                          <Image src={listing.seller.paymentInfo.gcashQR} alt="GCash QR" fill className="object-contain" sizes="128px" />
                        </div>
                      </div>
                    )}

                    {listing.seller.paymentInfo.bankName && (
                      <div className="mb-2">
                        <p className="font-pixel text-[10px] text-retro-white opacity-80 mb-1">Bank:</p>
                        <code className="font-pixel text-xs text-retro-white bg-retro-black/20 px-2 py-1 rounded block">
                          {listing.seller.paymentInfo.bankName}
                        </code>
                      </div>
                    )}

                    {listing.seller.paymentInfo.bankAccountNumber && (
                      <div className="mb-2">
                        <p className="font-pixel text-[10px] text-retro-white opacity-80 mb-1">Account Number:</p>
                        <div className="flex items-center gap-2">
                          <code className="font-pixel text-xs text-retro-white bg-retro-black/20 px-2 py-1 rounded">
                            {listing.seller.paymentInfo.bankAccountNumber}
                          </code>
                          <button
                            onClick={() => copyToClipboard(listing.seller!.paymentInfo!.bankAccountNumber!, 'bank')}
                            className="p-1 hover:bg-retro-white/10 rounded"
                          >
                            {copiedField === 'bank' ? (
                              <Check className="w-3 h-3 text-green-300" />
                            ) : (
                              <Copy className="w-3 h-3 text-retro-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {listing.seller.paymentInfo.bankAccountName && (
                      <div className="mb-2">
                        <p className="font-pixel text-[10px] text-retro-white opacity-80 mb-1">Account Name:</p>
                        <code className="font-pixel text-xs text-retro-white bg-retro-black/20 px-2 py-1 rounded block">
                          {listing.seller.paymentInfo.bankAccountName}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Messaging */}
          <div className="lg:col-span-1">
            {!isAuthenticated ? (
              <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 sm:border-3 border-retro-black shadow-pixel p-6 text-center">
                <p className="font-pixel text-xs text-retro-black dark:text-retro-white mb-4">
                  Login to contact the seller
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-retro-blue border-2 border-retro-black px-4 py-2 shadow-pixel hover:shadow-pixel-lg transition-all font-pixel text-xs text-retro-white uppercase"
                >
                  Login
                </button>
              </div>
            ) : isOwnListing ? (
              <div className="bg-retro-yellow border-2 sm:border-3 border-retro-black shadow-pixel p-6 text-center">
                <p className="font-pixel text-xs text-retro-black mb-4">This is your listing</p>
                <button
                  onClick={() => router.push('/marketplace/my-shop')}
                  className="bg-retro-blue border-2 border-retro-black px-4 py-2 shadow-pixel hover:shadow-pixel-lg transition-all font-pixel text-xs text-retro-white uppercase"
                >
                  Manage Listings
                </button>
              </div>
            ) : (
              <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 sm:border-3 border-retro-black shadow-pixel h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="bg-retro-blue border-b-2 sm:border-b-3 border-retro-black p-3">
                  <p className="font-pixel text-xs text-retro-white">
                    Chat with @{listing.seller?.username}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-pixel text-xs text-retro-gray-light dark:text-retro-gray-dark">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId._id === user._id;
                      return (
                        <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] p-3 border-2 border-retro-black ${
                              isOwn
                                ? 'bg-retro-blue text-retro-white'
                                : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white'
                            }`}
                          >
                            {msg.message && (
                              <p className="font-pixel text-[10px] whitespace-pre-wrap break-words">{msg.message}</p>
                            )}
                            {msg.images && msg.images.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.images.map((img, idx) => (
                                  <div key={idx} className="relative w-full aspect-square border-2 border-retro-black">
                                    <Image src={img} alt={`Attachment ${idx + 1}`} fill className="object-cover" sizes="200px" />
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className={`font-pixel text-[8px] mt-1 ${isOwn ? 'text-retro-white opacity-60' : 'text-retro-gray-light dark:text-retro-gray-dark'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t-2 sm:border-t-3 border-retro-black p-3">
                  {/* Image Previews */}
                  {messageImages.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {messageImages.map((url, index) => (
                        <div key={index} className="relative w-16 h-16 border-2 border-retro-black bg-retro-white">
                          <Image src={url} alt={`Upload ${index + 1}`} fill className="object-cover" sizes="64px" />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 border border-retro-black rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            <X className="w-2 h-2 text-retro-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <label className="flex-shrink-0 cursor-pointer">
                      <div className="w-8 h-8 border-2 border-retro-black bg-retro-white dark:bg-retro-black flex items-center justify-center hover:bg-retro-gray-light dark:hover:bg-retro-gray-dark transition-colors">
                        <Upload className="w-4 h-4 text-retro-black dark:text-retro-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading || messageImages.length >= 3}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-blue"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={sending || (!newMessage.trim() && messageImages.length === 0)}
                      className="flex-shrink-0 bg-retro-blue border-2 border-retro-black px-4 py-2 shadow-pixel hover:shadow-pixel-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 text-retro-white" />
                    </button>
                  </div>

                  <p className="font-pixel text-[8px] text-retro-gray-light dark:text-retro-gray-dark mt-2">
                    Send photos of payment, shipping address, etc.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
