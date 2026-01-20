'use client';

import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-retro-gray dark:text-retro-gray-light" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 text-xs font-pixel bg-retro-white dark:bg-retro-black border-3 border-retro-black dark:border-retro-white text-retro-black dark:text-retro-white placeholder-retro-gray focus:outline-none focus:shadow-pixel"
      />
    </div>
  );
}
