'use client';

import SetCardSkeleton from "./SetCardSkeleton";

interface SetGridSkeletonProps {
  count?: number;
}

export default function SetGridSkeleton({ count = 8 }: SetGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SetCardSkeleton key={index} />
      ))}
    </div>
  );
}
