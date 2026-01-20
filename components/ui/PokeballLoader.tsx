'use client';

import Image from 'next/image';

interface PokeballLoaderProps {
  message?: string;
}

export default function PokeballLoader({ message = 'Loading...' }: PokeballLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-6 relative w-24 h-24">
        <Image
          src="/pokeball-animation.gif"
          alt="Loading..."
          width={96}
          height={96}
          unoptimized
          className="pixelated"
        />
      </div>
      <p className="text-xs sm:text-sm font-pixel text-retro-black dark:text-retro-white uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
