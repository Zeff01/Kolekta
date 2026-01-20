'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="bg-retro-black text-retro-white border-3 border-retro-black shadow-pixel-lg p-8">
        <p className="text-xs font-pixel uppercase animate-blink text-center leading-relaxed">
          Loading<br/>Pokemon<br/>Cards...
        </p>
      </div>
    </div>
  );
}
