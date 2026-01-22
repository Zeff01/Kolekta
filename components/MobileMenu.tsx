'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import CurrencySwitcher from '@/components/CurrencySwitcher';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when menu is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-retro-black bg-opacity-80 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-retro-red border-l-4 border-retro-black shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with Pokeball */}
        <div className="relative bg-retro-black border-b-4 border-retro-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 animate-spin-slow">
              <Image
                src="/pokeball.png"
                alt="Pokeball"
                fill
                className="pixelated"
              />
            </div>
            <span className="text-retro-white font-pixel text-sm uppercase">Menu</span>
          </div>
          <button
            onClick={handleClose}
            className="text-retro-white hover:text-retro-yellow transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col p-4 gap-2">
          <Link
            href="/"
            onClick={handleClose}
            className="group px-4 py-3 bg-retro-black text-retro-white border-2 border-retro-white font-pixel text-xs uppercase hover:bg-retro-white hover:text-retro-black transition-all hover:translate-x-1"
          >
            <span className="inline-block group-hover:animate-bounce">🏠</span> Home
          </Link>

          <Link
            href="/sets"
            onClick={handleClose}
            className="group px-4 py-3 bg-retro-black text-retro-white border-2 border-retro-white font-pixel text-xs uppercase hover:bg-retro-white hover:text-retro-black transition-all hover:translate-x-1"
          >
            <span className="inline-block group-hover:animate-bounce">📚</span> Sets
          </Link>

          <Link
            href="/cards"
            onClick={handleClose}
            className="group px-4 py-3 bg-retro-black text-retro-white border-2 border-retro-white font-pixel text-xs uppercase hover:bg-retro-white hover:text-retro-black transition-all hover:translate-x-1"
          >
            <span className="inline-block group-hover:animate-bounce">🃏</span> Cards
          </Link>

          <Link
            href="/collection"
            onClick={handleClose}
            className="group px-4 py-3 bg-green-500 text-retro-white border-2 border-retro-black font-pixel text-xs uppercase hover:bg-green-600 transition-all hover:translate-x-1"
          >
            <span className="inline-block group-hover:animate-bounce">💎</span> Collection
          </Link>

          <Link
            href="/wishlist"
            onClick={handleClose}
            className="group px-4 py-3 bg-retro-yellow text-retro-black border-2 border-retro-black font-pixel text-xs uppercase hover:bg-yellow-500 transition-all hover:translate-x-1"
          >
            <span className="inline-block group-hover:animate-bounce">⭐</span> Wishlist
          </Link>

          <Link
            href="/marketplace"
            onClick={handleClose}
            className="group px-4 py-3 bg-purple-600 text-retro-white border-2 border-retro-black font-pixel text-xs uppercase hover:bg-purple-700 transition-all hover:translate-x-1"
          >
            <span className="inline-block group-hover:animate-bounce">🏪</span> Marketplace
          </Link>

          {/* Divider */}
          <div className="h-px bg-retro-white opacity-30 my-2"></div>

          {/* Settings Section */}
          <div className="space-y-2">
            <div className="px-4 py-3 bg-retro-black border-2 border-retro-white">
              <p className="text-retro-white font-pixel text-[8px] mb-2 opacity-80">CURRENCY</p>
              <CurrencySwitcher />
            </div>
            <div className="px-4 py-3 bg-retro-black border-2 border-retro-white">
              <p className="text-retro-white font-pixel text-[8px] mb-2 opacity-80">THEME</p>
              <ThemeToggle />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-retro-white opacity-30 my-2"></div>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <>
              <Link
                href="/profile"
                onClick={handleClose}
                className="group px-4 py-3 bg-retro-blue text-retro-white border-2 border-retro-black font-pixel text-xs uppercase hover:bg-blue-600 transition-all hover:translate-x-1"
              >
                <span className="inline-block group-hover:animate-bounce">👤</span> {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="group px-4 py-3 bg-retro-black text-retro-white border-2 border-retro-white font-pixel text-xs uppercase hover:bg-retro-gray-dark transition-all hover:translate-x-1 text-left"
              >
                <span className="inline-block group-hover:animate-bounce">🚪</span> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={handleClose}
                className="group px-4 py-3 bg-retro-blue text-retro-white border-2 border-retro-black font-pixel text-xs uppercase hover:bg-blue-600 transition-all hover:translate-x-1"
              >
                <span className="inline-block group-hover:animate-bounce">🔑</span> Login
              </Link>
              <Link
                href="/signup"
                onClick={handleClose}
                className="group px-4 py-3 bg-green-500 text-retro-white border-2 border-retro-black font-pixel text-xs uppercase hover:bg-green-600 transition-all hover:translate-x-1"
              >
                <span className="inline-block group-hover:animate-bounce">✨</span> Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-retro-black border-t-4 border-retro-white">
          <p className="text-retro-white font-pixel text-[8px] text-center opacity-80">
            Gotta Collect Em All! ⚡
          </p>
        </div>
      </div>
    </>
  );
}
