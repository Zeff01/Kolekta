'use client';

import { useCurrency, Currency } from '@/contexts/CurrencyContext';

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const handleToggle = () => {
    setCurrency(currency === 'USD' ? 'PHP' : 'USD');
  };

  return (
    <button
      onClick={handleToggle}
      className="bg-retro-white dark:bg-retro-black border-2 border-retro-black px-3 py-1.5 text-xs font-pixel uppercase hover:bg-retro-yellow transition-colors"
      title="Toggle currency"
    >
      {currency}
    </button>
  );
}
