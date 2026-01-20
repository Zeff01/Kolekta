'use client';

import Image from 'next/image';

interface PokeballLoaderProps {
  message?: string;
}

export default function PokeballLoader({ message = 'Loading...' }: PokeballLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16">
      <div
        className="mb-6 sm:mb-8 relative overflow-hidden w-[280px] h-[280px] sm:w-[420px] sm:h-[420px]"
        style={{ maxWidth: '85vw', maxHeight: '85vw' }}
      >
        <div
          className="absolute"
          style={{
            width: 'calc(100% * 480 / 420)',
            height: 'calc(100% * 480 / 420)',
            top: 'calc(-30px * 100% / 420)',
            left: 'calc(-30px * 100% / 420)'
          }}
        >
          <Image
            src="/pokeball-animation.webp"
            alt="Loading..."
            fill
            unoptimized
            className="pixelated drop-shadow-2xl object-contain"
            style={{ mixBlendMode: 'normal' }}
          />
        </div>
      </div>
      <p className="text-sm sm:text-lg font-pixel text-retro-black dark:text-retro-white uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
