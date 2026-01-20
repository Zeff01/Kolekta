'use client';

import Image from 'next/image';

interface PokeballLoaderProps {
  message?: string;
}

export default function PokeballLoader({ message = 'Loading...' }: PokeballLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16">
      <div
        className="relative overflow-hidden w-[280px] h-[280px] sm:w-[420px] sm:h-[420px]"
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

        {/* Cover watermark at bottom left */}
        <div className="absolute bottom-0 left-0 w-32 h-8 bg-retro-black" />

        {/* Floating text at bottom of image */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <p className="text-sm sm:text-lg font-pixel text-retro-black dark:text-retro-white uppercase animate-pulse bg-retro-white/80 dark:bg-retro-black/80 px-4 py-2 border-2 border-retro-black shadow-pixel">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
