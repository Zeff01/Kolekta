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
            <div className="hidden md:flex items-center space-x-1 sm:space-x-2 md:space-x-4 overflow-x-auto">
            <Link
              href="/"
              className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-retro-black text-retro-white border-2 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all flex-shrink-0"
            >
              <Image
                src="/pokeball.png"
                alt="Pokeball"
                width={24}
                height={24}
                className="pixelated sm:w-8 sm:h-8"
              />
              <span className="text-[10px] sm:text-sm font-pixel uppercase">Kolekta</span>
            </Link>
            <Link
              href="/sets"
              className="px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-retro-black text-retro-white border-2 border-retro-black hover:bg-retro-black-light transition-colors whitespace-nowrap flex-shrink-0"
            >
              Sets
            </Link>
            <Link
              href="/cards"
              className="px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-retro-black text-retro-white border-2 border-retro-black hover:bg-retro-black-light transition-colors whitespace-nowrap flex-shrink-0"
            >
              Cards
            </Link>
            <Link
              href="/collection"
              className="px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-green-500 text-retro-white border-2 border-retro-black hover:bg-green-600 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Collection
            </Link>
            <Link
              href="/wishlist"
              className="px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-retro-yellow text-retro-black border-2 border-retro-black hover:bg-yellow-500 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Wishlist
            </Link>
          </div>

          {/* Mobile Logo - Centered */}
          <Link
            href="/"
            className="flex md:hidden items-center gap-2 px-3 py-2 bg-retro-black text-retro-white border-2 border-retro-black shadow-pixel"
          >
            <Image
              src="/pokeball.png"
              alt="Pokeball"
              width={20}
              height={20}
              className="pixelated"
            />
            <span className="text-[10px] font-pixel uppercase">Kolekta</span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Currency and Theme - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block scale-75 sm:scale-100 origin-right">
              <CurrencySwitcher />
            </div>
            <div className="hidden md:block scale-75 sm:scale-100 origin-right">
              <ThemeToggle />
            </div>

            {/* Desktop Auth Buttons - Hidden on mobile */}
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden md:flex px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-retro-blue text-retro-white border-2 border-retro-black hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-retro-black text-retro-white border-2 border-retro-black hover:bg-retro-gray-dark transition-colors whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-retro-blue text-retro-white border-2 border-retro-black hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:flex px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-pixel uppercase bg-green-500 text-retro-white border-2 border-retro-black hover:bg-green-600 transition-colors whitespace-nowrap"
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
