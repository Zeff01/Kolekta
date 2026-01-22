'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/contexts/CollectionContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout, refreshUser } = useAuth();
  const { collection, wishlist } = useCollection();
  const router = useRouter();

  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashQR, setGcashQR] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.paymentInfo) {
      setGcashNumber(user.paymentInfo.gcashNumber || '');
      setGcashQR(user.paymentInfo.gcashQR || '');
      setBankName(user.paymentInfo.bankName || '');
      setBankAccountNumber(user.paymentInfo.bankAccountNumber || '');
      setBankAccountName(user.paymentInfo.bankAccountName || '');
    }
  }, [user]);

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'payment');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setGcashQR(data.url);
      } else {
        alert('Failed to upload QR code');
      }
    } catch (error) {
      console.error('Error uploading QR:', error);
      alert('Failed to upload QR code');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePaymentInfo = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentInfo: {
            gcashNumber,
            gcashQR,
            bankName,
            bankAccountNumber,
            bankAccountName,
          },
        }),
      });

      if (response.ok) {
        alert('Payment information saved successfully!');
        refreshUser?.();
      } else {
        alert('Failed to save payment information');
      }
    } catch (error) {
      console.error('Error saving payment info:', error);
      alert('Failed to save payment information');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-retro-white dark:bg-retro-black flex items-center justify-center">
        <div className="text-xs font-pixel text-retro-black dark:text-retro-white">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-6 py-4 border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-xl font-pixel uppercase">Trainer Profile</h1>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel p-6 mb-6">
          <h2 className="text-sm font-pixel uppercase text-retro-black dark:text-retro-white mb-4 border-b-2 border-retro-black pb-2">
            Account Information
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light w-24">
                Username:
              </span>
              <span className="text-xs font-pixel text-retro-black dark:text-retro-white">
                {user.username}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light w-24">
                Email:
              </span>
              <span className="text-xs font-pixel text-retro-black dark:text-retro-white">
                {user.email}
              </span>
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light w-24">
                  Joined:
                </span>
                <span className="text-xs font-pixel text-retro-black dark:text-retro-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Collection Card */}
          <div className="bg-green-500 border-3 border-retro-black shadow-pixel p-6">
            <h2 className="text-sm font-pixel uppercase text-retro-white mb-4 border-b-2 border-retro-black pb-2">
              Collection
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-pixel text-retro-white">
                  Total Cards:
                </span>
                <span className="text-xl font-pixel text-retro-white">
                  {collection.length}
                </span>
              </div>
              <Link
                href="/collection"
                className="block w-full px-4 py-2 mt-4 bg-retro-white text-retro-black border-2 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 text-center"
              >
                <span className="text-xs font-pixel uppercase">
                  View Collection
                </span>
              </Link>
            </div>
          </div>

          {/* Wishlist Card */}
          <div className="bg-retro-yellow border-3 border-retro-black shadow-pixel p-6">
            <h2 className="text-sm font-pixel uppercase text-retro-black mb-4 border-b-2 border-retro-black pb-2">
              Wishlist
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-pixel text-retro-black">
                  Total Cards:
                </span>
                <span className="text-xl font-pixel text-retro-black">
                  {wishlist.length}
                </span>
              </div>
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-[10px] font-pixel text-retro-black">
                  <span>High Priority:</span>
                  <span>{wishlist.filter(item => item.priority === 'high').length}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-pixel text-retro-black">
                  <span>Medium Priority:</span>
                  <span>{wishlist.filter(item => item.priority === 'medium').length}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-pixel text-retro-black">
                  <span>Low Priority:</span>
                  <span>{wishlist.filter(item => item.priority === 'low').length}</span>
                </div>
              </div>
              <Link
                href="/wishlist"
                className="block w-full px-4 py-2 mt-4 bg-retro-black text-retro-white border-2 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 text-center"
              >
                <span className="text-xs font-pixel uppercase">
                  View Wishlist
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-purple-600 dark:bg-purple-500 border-3 border-retro-black shadow-pixel p-6 mb-6">
          <h2 className="text-sm font-pixel uppercase text-retro-white mb-4 border-b-2 border-retro-white pb-2">
            Payment Information (For Marketplace)
          </h2>

          <p className="text-[10px] font-pixel text-retro-white opacity-80 mb-4">
            This information will be shared with buyers when they contact you about your listings.
          </p>

          <div className="space-y-4">
            {/* GCash Section */}
            <div className="bg-retro-white/10 border-2 border-retro-white/20 p-4">
              <h3 className="text-xs font-pixel text-retro-white mb-3">GCash</h3>

              <div className="mb-3">
                <label className="block text-[10px] font-pixel text-retro-white opacity-80 mb-1">
                  GCash Number
                </label>
                <input
                  type="text"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white text-retro-black font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-yellow"
                />
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-retro-white opacity-80 mb-1">
                  GCash QR Code
                </label>
                {gcashQR ? (
                  <div className="relative">
                    <div className="relative w-32 h-32 bg-retro-white border-2 border-retro-black mb-2">
                      <Image src={gcashQR} alt="GCash QR" fill className="object-contain" sizes="128px" />
                    </div>
                    <button
                      onClick={() => setGcashQR('')}
                      className="absolute -top-2 -right-2 bg-red-500 border-2 border-retro-black rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3 text-retro-white" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-32 h-32 border-2 border-dashed border-retro-white bg-retro-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-retro-white/10 transition-colors">
                    <Upload className="w-6 h-6 text-retro-white mb-1" />
                    <span className="text-[8px] font-pixel text-retro-white">
                      {uploading ? 'Uploading...' : 'Upload QR'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleQRUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Bank Section */}
            <div className="bg-retro-white/10 border-2 border-retro-white/20 p-4">
              <h3 className="text-xs font-pixel text-retro-white mb-3">Bank Transfer</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-pixel text-retro-white opacity-80 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., BDO, BPI, Metrobank"
                    className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white text-retro-black font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-yellow"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-pixel text-retro-white opacity-80 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white text-retro-black font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-yellow"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-pixel text-[10px] text-retro-white opacity-80 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white text-retro-black font-pixel text-xs focus:outline-none focus:ring-2 focus:ring-retro-yellow"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePaymentInfo}
              disabled={saving}
              className="w-full bg-retro-yellow border-2 border-retro-black px-4 py-3 shadow-pixel hover:shadow-pixel-lg transition-all font-pixel text-xs text-retro-black uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Payment Information'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 text-xs font-pixel uppercase text-retro-black dark:text-retro-white border-2 border-retro-black hover:shadow-pixel transition-all text-center"
          >
            ← Back to Home
          </Link>

          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-retro-red text-retro-white border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1"
          >
            <span className="text-xs font-pixel uppercase">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
