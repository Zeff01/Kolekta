'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { useAuth } from '@/contexts/AuthContext';
import PokemonBurger from '@/components/PokemonBurger';
import MobileMenu from '@/components/MobileMenu';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <nav className="border-b-2 border-retro-black bg-retro-red shadow-pixel">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-retro-black text-retro-white border-2 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all"
            >
              <Image
                src="/Kolekta-Korner-logo.png"
                alt="Kolekta Korner"
                width={32}
                height={32}
                className="pixelated"
              />
              <span className="text-xs font-pixel uppercase">Kolekta Korner</span>
            </Link>
            <Link
              href="/sets"
              className="px-3 py-2 text-xs font-pixel uppercase bg-retro-black text-retro-white border-2 border-retro-black hover:bg-retro-black-light transition-colors"
            >
              Sets
            </Link>
            <Link
              href="/cards"
              className="px-3 py-2 text-xs font-pixel uppercase bg-retro-black text-retro-white border-2 border-retro-black hover:bg-retro-black-light transition-colors"
            >
              Cards
            </Link>
            <Link
              href="/collection"
              className="px-3 py-2 text-xs font-pixel uppercase bg-green-500 text-retro-white border-2 border-retro-black hover:bg-green-600 transition-colors"
            >
              My Cards
            </Link>
            <Link
              href="/wishlist"
              className="px-3 py-2 text-xs font-pixel uppercase bg-retro-yellow text-retro-black border-2 border-retro-black hover:bg-yellow-500 transition-colors"
            >
              Wishlist
            </Link>
            <Link
              href="/marketplace"
              className="px-3 py-2 text-xs font-pixel uppercase bg-purple-600 text-retro-white border-2 border-retro-black hover:bg-purple-700 transition-colors"
            >
              Market
            </Link>
          </div>

          {/* Mobile Logo - Centered */}
          <Link
            href="/"
            className="flex md:hidden items-center gap-2 px-3 py-2 bg-retro-black text-retro-white border-2 border-retro-black shadow-pixel"
          >
            <Image
              src="/Kolekta-Korner-logo.png"
              alt="Kolekta Korner"
              width={24}
              height={24}
              className="pixelated"
            />
            <span className="text-[10px] font-pixel uppercase">Kolekta Korner</span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Currency and Theme - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block">
              <CurrencySwitcher />
            </div>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Desktop Auth Buttons - Hidden on mobile */}
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden md:flex px-3 py-2 text-xs font-pixel uppercase bg-retro-blue text-retro-white border-2 border-retro-black hover:bg-blue-600 transition-colors"
                >
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block px-3 py-2 text-xs font-pixel uppercase bg-retro-black text-retro-white border-2 border-retro-black hover:bg-retro-gray-dark transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex px-3 py-2 text-xs font-pixel uppercase bg-retro-blue text-retro-white border-2 border-retro-black hover:bg-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:flex px-3 py-2 text-xs font-pixel uppercase bg-green-500 text-retro-white border-2 border-retro-black hover:bg-green-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Burger Menu Button */}
            <div className="md:hidden">
              <PokemonBurger
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Menu */}
    <MobileMenu
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
    />
    </>
  );
}
