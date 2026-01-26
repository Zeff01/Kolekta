import { pokemonAPI } from "@/lib/pokemon-api";
import CardGrid from "@/components/pokemon/CardGrid";
import Image from "next/image";
import Link from "next/link";

interface SetDetailPageProps {
  params: Promise<{ id: string }>;
}

// Enable ISR - revalidate every 7 days
export const revalidate = 604800;

// Pre-generate popular set pages at build time
// export async function generateStaticParams() {
//   console.log('[Static Generation] Fetching sets for pre-generation...');
//   const { data: sets } = await pokemonAPI.getSets({ pageSize: 20 });

//   console.log(`[Static Generation] Pre-generating ${sets.length} set pages`);
//   return sets.map((set) => ({
//     id: set.id,
//   }));
// }

export async function generateMetadata({ params }: SetDetailPageProps) {
  const { id } = await params;
  const { data: set } = await pokemonAPI.getSet(id);

  return {
    title: `${set.name} | Kolekta Korner`,
    description: `Browse all ${set.total} cards from the ${set.name} set`,
  };
}

export default async function SetDetailPage({ params }: SetDetailPageProps) {
  const { id } = await params;

  // Fetch set info first
  const { data: set } = await pokemonAPI.getSet(id);

  // Then fetch all cards from the set (pokemontcg.io returns complete data)
  const { data: cards } = await pokemonAPI.getCardsBySet(id);

  const releaseDate = set.releaseDate
    ? new Date(set.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Release date TBA";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/sets"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        ← Back to Sets
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-900 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
            {set.images.logo ? (
              <Image
                src={set.images.logo}
                alt={set.name}
                width={400}
                height={200}
                style={{ width: 'auto', height: 'auto' }}
                className="object-contain"
                loading="lazy"
              />
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                  {set.name}
                </h2>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {set.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {set.series}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Release Date:
                </span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {releaseDate}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Total Cards:
                </span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {set.total}
                </p>
              </div>
              {set.ptcgoCode && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    PTCGO Code:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {set.ptcgoCode}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Set ID:
                </span>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                  {set.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Cards ({cards.length})
        </h2>
      </div>

      <CardGrid cards={cards} />
    </div>
  );
}
