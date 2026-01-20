'use client';

import { PokemonCard } from "@/types/pokemon";
import Image from "next/image";
import Link from "next/link";
import { useLazyLoad } from "@/hooks/useLazyLoad";
import { useState, MouseEvent } from "react";

interface CardGridProps {
  cards: PokemonCard[];
}

interface AnimatedCardProps {
  card: PokemonCard;
  index: number;
}

function AnimatedCard({ card, index }: AnimatedCardProps) {
  const { elementRef, isVisible } = useLazyLoad<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px',
  });

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!elementRef.current) return;

    const card = elementRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
  };

  const hasImage = Boolean(card.images?.small && card.images.small.trim().length > 0);

  return (
    <Link
      href={`/cards/${card.id}`}
      className="group block"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div
        ref={elementRef}
        className={`relative aspect-[245/342] bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel overflow-hidden transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          transform: isHovering
            ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: 'transform 0.1s ease-out, opacity 0.6s ease-out, translate 0.6s ease-out',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: isHovering ? 'translateZ(20px)' : 'translateZ(0px)',
            transition: 'transform 0.1s ease-out',
          }}
        >
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
      {cards.map((card, index) => (
        <AnimatedCard key={`${card.id}-${index}`} card={card} index={index} />
      ))}
    </div>
  );
}
