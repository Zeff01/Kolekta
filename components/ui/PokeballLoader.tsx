'use client';

import Image from 'next/image';

interface PokeballLoaderProps {
  message?: string;
}

export default function PokeballLoader({ message = 'Loading...' }: PokeballLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
      <div className="mb-8 relative" style={{ width: '480px', height: '480px', maxWidth: '90vw' }}>
        <Image
          src="/pokeball-animation.webp"
          alt="Loading..."
          fill
          unoptimized
          className="pixelated drop-shadow-2xl object-contain"
          style={{ mixBlendMode: 'normal' }}
        />
      </div>
      <p className="text-lg sm:text-xl font-pixel text-retro-black dark:text-retro-white uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
