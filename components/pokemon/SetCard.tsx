'use client';

import { PokemonSet } from "@/types/pokemon";
import Image from "next/image";
import Link from "next/link";
import { useLazyLoad } from "@/hooks/useLazyLoad";
import { useState, MouseEvent } from "react";

interface SetCardProps {
  set: PokemonSet;
  index?: number;
}

export default function SetCard({ set, index = 0 }: SetCardProps) {
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

    const rotateXValue = ((y - centerY) / centerY) * -8;
    const rotateYValue = ((x - centerX) / centerX) * 8;

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

  const releaseDate = set.releaseDate
    ? new Date(set.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
      })
    : "TBA";

  const hasLogo = set.images?.logo && set.images.logo.trim().length > 0;

  return (
    <Link
      href={`/sets/${set.id}`}
      className="group block"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div
        ref={elementRef}
        className={`bg-retro-white dark:bg-retro-black border-3 border-retro-white dark:border-retro-white shadow-pixel transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          transform: isHovering
            ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: 'transform 0.1s ease-out, opacity 0.6s ease-out, translate 0.6s ease-out',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            transform: isHovering ? 'translateZ(15px)' : 'translateZ(0px)',
            transition: 'transform 0.1s ease-out',
          }}
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
        </div>
      </div>
    </Link>
  );
}
