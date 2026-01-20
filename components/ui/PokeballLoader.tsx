'use client';

import Image from 'next/image';

interface PokeballLoaderProps {
  message?: string;
}

export default function PokeballLoader({ message = 'Loading...' }: PokeballLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
      <div className="mb-8 relative w-40 h-40 sm:w-48 sm:h-48">
        <Image
          src="/pokeball-animation.gif"
          alt="Loading..."
          width={192}
          height={192}
          unoptimized
          className="pixelated drop-shadow-2xl"
          style={{ mixBlendMode: 'normal' }}
        />
      </div>
      <p className="text-sm sm:text-base font-pixel text-retro-black dark:text-retro-white uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
