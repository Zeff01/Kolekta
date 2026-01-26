import { pokemonAPI } from "@/lib/pokemon-api";
import Image from "next/image";
import Link from "next/link";
import PriceDisplay from "@/components/pokemon/PriceDisplay";
import PriceGraphTabs from "@/components/pokemon/PriceGraphTabs";
import GradedPrices from "@/components/pokemon/GradedPrices";
import PrintCardButton from "@/components/pokemon/PrintCardButton";
import CollectionButtons from "@/components/pokemon/CollectionButtons";

interface CardDetailPageProps {
  params: Promise<{ id: string }>;
}

// Enable ISR with aggressive caching (card data rarely changes)
export const revalidate = 86400; // 24 hours - balances freshness with performance

// Generate pages on-demand instead of at build time (too many cards)
export const dynamicParams = true;

// Enable static generation for better caching
export const dynamic = 'force-static';

export async function generateMetadata({ params }: CardDetailPageProps) {
  const { id } = await params;
  const { data: card } = await pokemonAPI.getCard(id);

  return {
    title: `${card.name} - ${card.set.name} | Kolekta Korner`,
    description: `View details for ${card.name} from the ${card.set.name} set`,
  };
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;
  const { data: card } = await pokemonAPI.getCard(id);

  // Get the primary variant for price graph (prefer holofoil, then normal)
  const primaryVariant = card.tcgplayer?.prices?.holofoil ? 'holofoil'
    : card.tcgplayer?.prices?.normal ? 'normal'
    : card.tcgplayer?.prices ? Object.keys(card.tcgplayer.prices)[0] as keyof typeof card.tcgplayer.prices
    : 'normal';

  const priceVariant = card.tcgplayer?.prices?.[primaryVariant as keyof typeof card.tcgplayer.prices];
  const initialPrice = priceVariant?.market
    || priceVariant?.marketPrice
    || priceVariant?.mid
    || priceVariant?.midPrice
    || 0;

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Link
          href="/cards"
          className="inline-flex items-center text-retro-black dark:text-retro-white hover:translate-x-1 transition-transform mb-3 sm:mb-4 text-[10px] sm:text-xs font-pixel uppercase border-2 border-retro-black px-2 sm:px-3 py-1.5 sm:py-2"
        >
          ← Back to Cards
        </Link>

        {/* Title & Set Info */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {card.name}
          </h1>
          <Link
            href={`/sets/${card.set.id}`}
            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {card.set.name} #{card.number}/{card.set.printedTotal}
          </Link>
        </div>

        {/* Top Section: Card Image + Card Details (side by side) */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6 justify-center">
          {/* Left: Card Image & Action Buttons */}
          <div className="flex flex-col gap-3 w-full lg:w-[450px] lg:flex-shrink-0">
            {/* Card Image - Larger */}
            <div className="relative w-full max-w-[350px] sm:max-w-[400px] lg:max-w-full aspect-[245/342] rounded-lg overflow-hidden shadow-2xl mx-auto">
              <Image
                src={card.images.large}
                alt={card.name}
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Action Buttons - Horizontal */}
            <div className="space-y-2">
              <div className="flex gap-2 justify-center">
                <div className="flex-1">
                  <CollectionButtons card={card} />
                </div>
                <div className="flex-shrink-0">
                  <PrintCardButton card={card} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Card Details (30% width, no scroll) */}
          <div className="flex flex-col gap-3 w-full lg:w-[30%] lg:flex-shrink-0">
            {/* Compressed Card Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
              <h2 className="text-xs font-semibold mb-1.5 text-gray-900 dark:text-gray-100">
                Card Information
              </h2>
              <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Supertype</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">
                    {card.supertype}
                  </dd>
                </div>
                {card.subtypes && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Subtypes</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                      {card.subtypes.join(", ")}
                    </dd>
                  </div>
                )}
                {card.hp && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">HP</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                      {card.hp}
                    </dd>
                  </div>
                )}
                {card.types && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Types</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                      {card.types.join(", ")}
                    </dd>
                  </div>
                )}
                {card.rarity && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Rarity</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                      {card.rarity}
                    </dd>
                  </div>
                )}
                {card.artist && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Artist</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                      {card.artist}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Compressed Attacks */}
            {card.attacks && card.attacks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <h2 className="text-xs font-semibold mb-1.5 text-gray-900 dark:text-gray-100">
                  Attacks
                </h2>
                {card.attacks.map((attack, index) => (
                  <div key={index} className="mb-1.5 last:mb-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-semibold text-gray-900 dark:text-gray-100">
                        {attack.name}
                      </span>
                      {attack.damage && (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                          {attack.damage}
                        </span>
                      )}
                    </div>
                    {attack.cost.length > 0 && (
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">
                        Cost: {attack.cost.join(", ")}
                      </p>
                    )}
                    <p className="text-[9px] text-gray-600 dark:text-gray-400 leading-tight">
                      {attack.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Compressed Battle Stats */}
            {(card.weaknesses || card.resistances || card.retreatCost) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <h2 className="text-xs font-semibold mb-1.5 text-gray-900 dark:text-gray-100">
                  Battle Stats
                </h2>
                <dl className="space-y-1 text-[10px]">
                  {card.weaknesses && card.weaknesses.length > 0 && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400 mb-0.5">
                        Weakness
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-100">
                        {card.weaknesses
                          .map((w) => `${w.type} ${w.value}`)
                          .join(", ")}
                      </dd>
                    </div>
                  )}
                  {card.resistances && card.resistances.length > 0 && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400 mb-0.5">
                        Resistance
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-100">
                        {card.resistances
                          .map((r) => `${r.type} ${r.value}`)
                          .join(", ")}
                      </dd>
                    </div>
                  )}
                  {card.retreatCost && card.retreatCost.length > 0 && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400 mb-0.5">
                        Retreat Cost
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-100">
                        {card.retreatCost.join(", ")}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* TCGPlayer Pricing */}
            <PriceDisplay cardId={card.id} pricing={card.tcgplayer} showAllVariants={true} hideGraphs={true} />
          </div>
        </div>

        {/* Bottom Section: Price Graph with Tabs (full width) */}
        <div className="w-full mt-4 sm:mt-6">
          <PriceGraphTabs
            cardId={card.id}
            cardName={card.name}
            setName={card.set.name}
            cardNumber={card.number}
            variant={primaryVariant}
            initialPrice={initialPrice}
          />
        </div>

        {/* Graded Card Pricing Section */}
        <div className="w-full mt-4 sm:mt-6">
          <GradedPrices
            cardId={card.id}
            cardName={card.name}
            setName={card.set.name}
            cardNumber={card.number}
            basePrice={initialPrice}
          />
        </div>

        {/* Abilities Section (Full Width Below) */}
        {card.abilities && card.abilities.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">
              Abilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {card.abilities.map((ability, index) => (
                <div key={index} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                      {ability.name}
                    </span>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {ability.type}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {ability.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
