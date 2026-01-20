'use client';

import { PokemonCard } from "@/types/pokemon";
import Image from "next/image";
import Link from "next/link";

interface CardGridProps {
  cards: PokemonCard[];
}

export default function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 bg-retro-black text-retro-white border-3 border-retro-black shadow-pixel p-8">
        <p className="text-xs font-pixel uppercase">No cards found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const hasImage = Boolean(card.images?.small && card.images.small.trim().length > 0);

        return (
          <Link
            key={`${card.id}-${index}`}
            href={`/cards/${card.id}`}
            className="group block"
          >
            <div className="relative aspect-[245/342] bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 overflow-hidden">
              {hasImage ? (
                <Image
                  src={card.images.small}
                  alt={card.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="object-contain pixelated p-2"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light text-center uppercase leading-relaxed">
                    {card.name}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-2 px-2">
              <p className="text-retro-black dark:text-retro-white text-[8px] font-pixel truncate uppercase leading-relaxed">
                {card.name}
              </p>
              <p className="text-retro-gray dark:text-retro-gray-light text-[6px] font-pixel truncate">
                #{card.number}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
