'use client';

import Image from 'next/image';

interface PokeballLoaderProps {
  message?: string;
}

export default function PokeballLoader({ message = 'Loading...' }: PokeballLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
      <div
        className="mb-8 relative overflow-hidden"
        style={{ width: '420px', height: '420px', maxWidth: '90vw', maxHeight: '90vw' }}
      >
        <div style={{ width: '480px', height: '480px', position: 'absolute', top: '-30px', left: '-30px' }}>
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
      <p className="text-lg sm:text-xl font-pixel text-retro-black dark:text-retro-white uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
