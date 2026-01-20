import Link from "next/link";
import { pokemonAPI } from "@/lib/pokemon-api";
import SetCard from "@/components/pokemon/SetCard";

// Enable ISR - revalidate every 7 days
export const revalidate = 604800;

export default async function Home() {
  const { data: sets } = await pokemonAPI.getSets({ pageSize: 8 });

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      {/* Hero Section */}
      <div className="relative bg-retro-white dark:bg-retro-black border-b-3 border-retro-black dark:border-retro-white py-8 sm:py-12 md:py-16 overflow-hidden">
        {/* Eevee background image for dark mode */}
        <div className="absolute inset-0 hidden dark:block">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: "url('/eeveebg.jpg')" }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-retro-red text-retro-white border-2 sm:border-3 border-retro-black shadow-pixel-lg">
            <span className="text-[10px] sm:text-xs font-pixel uppercase animate-blink">★ Gotta Collect Em All ★</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-pixel mb-4 sm:mb-6 md:mb-8 text-retro-black dark:text-retro-white drop-shadow-lg uppercase leading-relaxed">
            Pokemon TCG<br/>Collector
          </h1>
          <p className="text-[10px] sm:text-xs font-pixel text-retro-gray dark:text-retro-gray-light max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed">
            Browse thousands of Pokemon cards
          </p>
        </div>
      </div>

      {/* Latest Sets Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-2 sm:border-3 border-retro-black shadow-pixel">
            <h2 className="text-[10px] sm:text-xs md:text-sm font-pixel uppercase">Latest Sets</h2>
          </div>
          <Link
            href="/sets"
            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs font-pixel uppercase bg-retro-red text-white border-2 sm:border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all whitespace-nowrap"
          >
            View All &gt;&gt;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {sets.map((set, index) => (
            <SetCard key={set.id} set={set} index={index} />
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <Link
            href="/cards"
            className="group p-4 sm:p-6 md:p-8 bg-retro-red text-white border-2 sm:border-3 border-retro-black shadow-pixel-lg hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            <div className="bg-retro-black text-retro-white px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-retro-white mb-3 sm:mb-4 inline-block">
              <span className="text-[10px] sm:text-xs font-pixel">CARDS</span>
            </div>
            <p className="text-[10px] sm:text-xs font-pixel leading-relaxed">
              Explore all Pokemon cards from every set
            </p>
          </Link>
          <Link
            href="/sets"
            className="group p-4 sm:p-6 md:p-8 bg-retro-black text-white border-2 sm:border-3 border-retro-white shadow-pixel-lg hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            <div className="bg-retro-white text-retro-black px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-retro-black mb-3 sm:mb-4 inline-block">
              <span className="text-[10px] sm:text-xs font-pixel">SETS</span>
            </div>
            <p className="text-[10px] sm:text-xs font-pixel leading-relaxed">
              Complete sets from Base to latest
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
