"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/cards?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/cards");
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH POKEMON..."
          className="flex-1 px-4 py-3 border-3 border-retro-black bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white font-pixel text-xs placeholder:text-retro-gray dark:placeholder:text-retro-gray-light focus:outline-none shadow-pixel uppercase"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-retro-red text-white border-3 border-retro-black font-pixel text-xs uppercase shadow-pixel hover:shadow-pixel-lg hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          GO
        </button>
      </div>
    </form>
  );
}
