'use client';

interface PokeballLoaderProps {
  message?: string;
}

export default function PokeballLoader({ message = 'Loading...' }: PokeballLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="pokeball-loader mb-6">
        <div className="pokeball">
          <div className="pokeball-top"></div>
          <div className="pokeball-middle">
            <div className="pokeball-button"></div>
          </div>
          <div className="pokeball-bottom"></div>
        </div>
      </div>
      <p className="text-xs sm:text-sm font-pixel text-retro-black dark:text-retro-white uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
