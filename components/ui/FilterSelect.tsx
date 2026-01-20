'use client';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
  allOptionLabel?: string;
}

export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  allOptionLabel = "All",
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 text-xs font-pixel bg-retro-white dark:bg-retro-black border-3 border-retro-black dark:border-retro-white text-retro-black dark:text-retro-white focus:outline-none focus:shadow-pixel appearance-none cursor-pointer ${className}`}
      aria-label={placeholder}
    >
      <option value="all">{allOptionLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
