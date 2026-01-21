import PokeballLoader from "@/components/ui/PokeballLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PokeballLoader message="Loading sets..." />
      </div>
    </div>
  );
}
