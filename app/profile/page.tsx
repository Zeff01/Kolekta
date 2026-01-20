'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/contexts/CollectionContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { collection, wishlist } = useCollection();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
