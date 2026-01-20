import CardGridSkeleton from "@/components/ui/CardGridSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-6 py-4 border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-sm font-pixel uppercase">Pokemon Cards</h1>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
            {/* Search Bar Skeleton */}
            <div className="md:col-span-2 h-12 bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black"></div>
            {/* Type Filter Skeleton */}
            <div className="h-12 bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black"></div>
            {/* Rarity Filter Skeleton */}
            <div className="h-12 bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black"></div>
          </div>

          {/* Sort Options Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 animate-pulse">
            <div className="h-12 bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black"></div>
          </div>

          {/* Results Count Skeleton */}
          <div className="animate-pulse">
            <div className="h-4 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black w-48"></div>
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <CardGridSkeleton count={50} />
      </div>
    </div>
  );
}
