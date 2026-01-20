'use client';

import CardSkeleton from "./CardSkeleton";

interface CardGridSkeletonProps {
  count?: number;
}

export default function CardGridSkeleton({ count = 12 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
