'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface GradeData {
  grade: number;
  price: number;
  population?: number;
  lowPrice?: number;
  highPrice?: number;
}

interface GradedPricesData {
  cardId: string;
  basePrice: number;
  source: 'ebay' | 'estimated';
  psa: GradeData[];
  bgs: GradeData[];
  cgc: GradeData[];
}

interface GradedPricesProps {
  cardId: string;
  cardName: string;
  setName: string;
  cardNumber: string;
  basePrice: number; // Raw/ungraded price from TCGPlayer
}

export default function GradedPrices({
  cardId,
  cardName,
  setName,
  cardNumber,
  basePrice
}: GradedPricesProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GradedPricesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<'raw' | 'psa' | 'bgs' | 'cgc'>('raw');
  const { formatPrice, convertPrice } = useCurrency();

  useEffect(() => {
    async function fetchGradedPrices() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          cardId,
          cardName,
          setName,
          cardNumber,
          basePrice: basePrice.toString(),
        });

        const response = await fetch(`/api/prices/graded?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch graded prices');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching graded prices:', err);
        setError('Failed to load graded pricing data');
      } finally {
        setLoading(false);
      }
    }

    if (basePrice > 0) {
      fetchGradedPrices();
    } else {
      setLoading(false);
      setError('Base price not available');
    }
  }, [cardId, cardName, setName, cardNumber, basePrice]);

  const formatPriceValue = (price: number) => {
    const converted = convertPrice(price);
    return formatPrice(converted);
  };

  const renderGradeCard = (grade: GradeData, company: string) => {
    const gradeDisplay = company === 'BGS' || company === 'CGC'
      ? grade.grade.toFixed(1)
      : grade.grade.toString();

    return (
      <div
        key={`${company}-${grade.grade}`}
        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
      >
        {/* Grade Badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
            {company} {gradeDisplay}
          </div>
          {grade.population !== undefined && grade.population > 0 && (
            <div className="text-[9px] text-gray-500 dark:text-gray-400">
              Pop: {grade.population.toLocaleString()}
            </div>
          )}
        </div>

        {/* Average Price */}
        <div className="mb-2">
          <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1">Average Price</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatPriceValue(grade.price)}
          </p>
        </div>

        {/* Price Range */}
        {(grade.lowPrice !== undefined && grade.highPrice !== undefined) && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-[8px] text-gray-500 dark:text-gray-400">Low</p>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                {formatPriceValue(grade.lowPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-gray-500 dark:text-gray-400">High</p>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                {formatPriceValue(grade.highPrice)}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Graded Card Pricing
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || 'Pricing data not available'}
        </p>
      </div>
    );
  }

  const companies = [
    { key: 'raw' as const, label: 'Raw (Ungraded)', data: null },
    { key: 'psa' as const, label: 'PSA', data: data.psa },
    { key: 'bgs' as const, label: 'BGS', data: data.bgs },
    { key: 'cgc' as const, label: 'CGC', data: data.cgc },
  ];

  const selectedData = selectedCompany === 'raw'
    ? null
    : companies.find(c => c.key === selectedCompany)?.data;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Graded Card Pricing
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.source === 'ebay' ? (
              <span className="text-green-600 dark:text-green-400">● Live eBay Data</span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400">
                ● Estimated (eBay API not configured)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Company Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {companies.map(({ key, label, data: companyData }) => {
          const hasData = key === 'raw' || (companyData && companyData.length > 0);
          const isRaw = key === 'raw';

          return (
            <button
              key={key}
              onClick={() => setSelectedCompany(key)}
              disabled={!hasData}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${selectedCompany === key
                  ? 'bg-blue-600 text-white'
                  : hasData
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }
              `}
            >
              {label}
              {!hasData && !isRaw && (
                <span className="ml-1 text-xs">(No data)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Raw Card Display */}
      {selectedCompany === 'raw' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-bold">
                Raw (Ungraded)
              </div>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1">Market Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatPriceValue(basePrice)}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Base TCGPlayer price for comparison
            </p>
          </div>
        </div>
      )}

      {/* Graded Cards Display */}
      {selectedCompany !== 'raw' && selectedData && (
        <>
          {selectedData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedData.map((grade) =>
                renderGradeCard(grade, selectedCompany.toUpperCase())
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No {selectedCompany.toUpperCase()} pricing data available for this card
              </p>
            </div>
          )}
        </>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
          {data.source === 'ebay' ? (
            'Prices are based on recent eBay sold listings and are updated regularly.'
          ) : (
            'Prices are estimated based on market multipliers. Configure eBay API credentials for real-time data.'
          )}
        </p>
      </div>
    </div>
  );
}
