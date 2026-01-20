'use client';

export default function CardSkeleton() {
  return (
    <div className="group block animate-pulse">
      {/* Card Image Skeleton */}
      <div className="relative aspect-[245/342] bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black">
        {/* Placeholder pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-3 border-retro-black bg-retro-white dark:bg-retro-black"></div>
        </div>
      </div>

      {/* Card Info Skeleton */}
      <div className="mt-2 px-2 space-y-2">
        {/* Card name skeleton */}
        <div className="h-3 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black w-3/4"></div>
        {/* Card number skeleton */}
        <div className="h-2 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black w-1/2"></div>
      </div>
    </div>
  );
}
