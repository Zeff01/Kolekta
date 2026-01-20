import SetGridSkeleton from "@/components/ui/SetGridSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-6 py-4 border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-sm font-pixel uppercase">All Sets</h1>
          </div>
          <div className="animate-pulse mb-6">
            <div className="h-4 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black w-64"></div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-pulse">
            {/* Search Bar Skeleton */}
            <div className="h-12 bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black"></div>
            {/* Series Filter Skeleton */}
            <div className="h-12 bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black"></div>
            {/* Sort Options Skeleton */}
            <div className="h-12 bg-retro-gray dark:bg-retro-gray-light border-3 border-retro-black"></div>
          </div>

          {/* Results Count Skeleton */}
          <div className="animate-pulse">
            <div className="h-3 bg-retro-gray dark:bg-retro-gray-light border-2 border-retro-black w-32"></div>
          </div>
        </div>

        {/* Series Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="bg-retro-gray dark:bg-retro-gray-light text-retro-white dark:text-retro-black px-8 py-5 border-3 border-retro-black shadow-pixel-lg inline-block">
            <div className="h-5 bg-retro-white dark:bg-retro-black border-2 border-retro-black w-48 mb-2"></div>
            <div className="h-3 bg-retro-white dark:bg-retro-black border-2 border-retro-black w-24"></div>
          </div>
        </div>

        {/* Sets Grid Skeleton */}
        <SetGridSkeleton count={12} />
      </div>
    </div>
  );
}
