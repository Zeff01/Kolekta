'use client';

interface PokemonBurgerProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function PokemonBurger({ isOpen, onClick }: PokemonBurgerProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center bg-retro-black border-2 border-retro-white shadow-pixel hover:bg-retro-white hover:border-retro-black group transition-colors"
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <div className="relative w-6 h-5 flex flex-col justify-between">
        {/* Top bar - transforms into top part of pokeball */}
        <span
          className={`block h-0.5 w-full bg-retro-white group-hover:bg-retro-black transition-all duration-300 origin-center ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />

        {/* Middle bar - becomes pokeball center */}
        <span
          className={`block h-0.5 w-full bg-retro-white group-hover:bg-retro-black transition-all duration-300 ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        />

        {/* Bottom bar - transforms into bottom part of pokeball */}
        <span
          className={`block h-0.5 w-full bg-retro-white group-hover:bg-retro-black transition-all duration-300 origin-center ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />

        {/* Pokeball center dot (appears when open) */}
        <span
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-retro-white group-hover:bg-retro-black transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
      </div>

      {/* Animated sparkles effect */}
      {isOpen && (
        <>
          <span className="absolute -top-1 -right-1 w-1 h-1 bg-retro-yellow rounded-full animate-ping" />
          <span className="absolute -bottom-1 -left-1 w-1 h-1 bg-retro-yellow rounded-full animate-ping delay-75" />
        </>
      )}
    </button>
  );
}
