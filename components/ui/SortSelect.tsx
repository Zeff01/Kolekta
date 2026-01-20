'use client';

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  placeholder?: string;
  className?: string;
}

export default function SortSelect({
  value,
  onChange,
  options,
  placeholder = "Sort by...",
  className = "",
}: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 text-xs font-pixel bg-retro-white dark:bg-retro-black border-3 border-retro-black dark:border-retro-white text-retro-black dark:text-retro-white focus:outline-none focus:shadow-pixel appearance-none cursor-pointer ${className}`}
      aria-label={placeholder}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
