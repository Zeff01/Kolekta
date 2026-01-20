'use client';

export default function SetCardSkeleton() {
  return (
    <div className="group block bg-retro-white dark:bg-retro-black border-3 border-retro-white dark:border-retro-white shadow-pixel animate-pulse">
      {/* Logo area skeleton */}
      <div className="aspect-[16/9] relative bg-retro-gray dark:bg-retro-gray-light flex items-center justify-center p-4 border-b-2 border-retro-black">
        {/* Placeholder logo box */}
        <div className="w-32 h-16 bg-retro-white dark:bg-retro-black border-2 border-retro-black"></div>
      </div>

      {/* Info area skeleton */}
      <div className="p-3 bg-retro-gray-light dark:bg-retro-gray-dark border-t-2 border-retro-black">
        {/* Title skeleton */}
        <div className="h-4 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black w-3/4 mb-2"></div>

        {/* Bottom info skeleton */}
        <div className="flex justify-between items-center">
          {/* Card count badge skeleton */}
          <div className="w-12 h-6 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black"></div>
          {/* Year skeleton */}
          <div className="h-3 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black w-16"></div>
        </div>
      </div>
    </div>
  );
}
