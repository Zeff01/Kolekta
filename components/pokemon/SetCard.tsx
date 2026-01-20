'use client';

import { PokemonSet } from "@/types/pokemon";
import Image from "next/image";
import Link from "next/link";

interface SetCardProps {
  set: PokemonSet;
  index?: number;
}

export default function SetCard({ set, index = 0 }: SetCardProps) {
  const releaseDate = set.releaseDate
    ? new Date(set.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
      })
    : "TBA";

  const hasLogo = set.images?.logo && set.images.logo.trim().length > 0;

  return (
    <Link
      href={`/sets/${set.id}`}
      className="group block bg-retro-white dark:bg-retro-black border-3 border-retro-white dark:border-retro-white shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1"
    >
      <div className="aspect-[16/9] relative bg-retro-white-dark dark:bg-retro-black-light flex items-center justify-center p-4 border-b-2 border-retro-black">
        {hasLogo ? (
          <Image
            src={set.images.logo}
            alt={set.name}
            width={200}
            height={100}
            className="object-contain max-h-full pixelated max-w-full"
            loading="lazy"
          />
        ) : (
          <div className="text-center px-2">
            <h3 className="text-xs font-pixel text-retro-black dark:text-retro-white uppercase leading-relaxed">
              {set.name}
            </h3>
          </div>
        )}
      </div>
      <div className="p-3 bg-retro-gray-light dark:bg-retro-gray-dark border-t-2 border-retro-black">
        <h3 className="font-pixel text-[10px] mb-2 text-retro-black dark:text-retro-white uppercase leading-relaxed truncate">
          {set.name}
        </h3>
        <div className="flex justify-between items-center">
          <span className="px-2 py-1 bg-retro-red text-retro-white border-2 border-retro-black text-[8px] font-pixel">
            {set.total}
          </span>
          <span className="text-[8px] font-pixel text-retro-gray-dark dark:text-retro-gray-light">{releaseDate}</span>
        </div>
      </div>
    </Link>
  );
}
