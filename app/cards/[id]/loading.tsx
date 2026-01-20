import LoadingSpinner from "@/components/pokemon/LoadingSpinner";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="w-full aspect-[245/342] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
}
