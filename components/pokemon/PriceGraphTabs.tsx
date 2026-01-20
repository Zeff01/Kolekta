'use client';

import { useState, useEffect } from 'react';
import PriceGraph from './PriceGraph';
import MultiLinePriceGraph from './MultiLinePriceGraph';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceGraphTabsProps {
  cardId: string;
  cardName: string;
  setName: string;
  cardNumber: string;
  variant: string;
  initialPrice: number;
}

type MainTab = 'raw' | 'graded' | 'pop';
type GradingFilter = 'psa-10' | 'psa-9' | 'cgc-10' | 'cgc-9' | 'bgs-10' | 'bgs-9';

interface GradeData {
  grade: number | string;
  price: number;
  population: number;
}

export default function PriceGraphTabs({ cardId, cardName, setName, cardNumber, variant, initialPrice }: PriceGraphTabsProps) {
  const { formatPrice, convertPrice } = useCurrency();
  const [selectedTab, setSelectedTab] = useState<MainTab>('graded');
  const [visibleLines, setVisibleLines] = useState<Set<GradingFilter>>(new Set(['psa-10', 'cgc-10', 'bgs-10']));
  const [psaGrades, setPsaGrades] = useState<GradeData[]>([]);
  const [bgsGrades, setBgsGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch graded prices
  useEffect(() => {
    const fetchGradedPrices = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          cardId,
          basePrice: initialPrice.toString(),
          cardName,
          setName,
          cardNumber,
        });
        const response = await fetch(`/api/prices/graded?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch graded prices');
        }

        const data = await response.json();
        console.log('[PriceGraphTabs] Graded prices source:', data.source);

        // Filter to show only specific grades in the UI
        const psaGradesToShow = data.psa.filter((g: GradeData) => [10, 9, 8, 7].includes(g.grade as number));
        const bgsGradesToShow = data.bgs.filter((g: GradeData) => [10, 9.5, 9, 8.5].includes(g.grade as number));

        setPsaGrades(psaGradesToShow);
        setBgsGrades(bgsGradesToShow);
      } catch (error) {
        console.error('[PriceGraphTabs] Error fetching graded prices:', error);
        setPsaGrades([]);
        setBgsGrades([]);
      } finally {
        setLoading(false);
      }
    };

    if (cardId && initialPrice > 0) {
      fetchGradedPrices();
    }
  }, [cardId, initialPrice]);

  const toggleLine = (line: GradingFilter) => {
    const newVisible = new Set(visibleLines);
    if (newVisible.has(line)) {
      newVisible.delete(line);
    } else {
      newVisible.add(line);
    }
    setVisibleLines(newVisible);
  };

  const gradingCompanies = [
    { id: 'psa-10' as GradingFilter, label: 'Holofoil PSA 10', color: 'bg-cyan-400', lineColor: '#22d3ee' },
    { id: 'cgc-10' as GradingFilter, label: 'Holofoil CGC Pristine 10', color: 'bg-blue-400', lineColor: '#60a5fa' },
    { id: 'bgs-10' as GradingFilter, label: 'Holofoil BGS 10', color: 'bg-orange-400', lineColor: '#fb923c' },
    { id: 'psa-9' as GradingFilter, label: 'Holofoil PSA 9', color: 'bg-green-400', lineColor: '#4ade80' },
  ];

  return (
    <div className="w-full">
      {/* Main Tabs: RAW, GRADED, POP */}
      <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel mb-4">
        <div className="flex border-b-3 border-retro-black">
          <button
            onClick={() => setSelectedTab('raw')}
            className={`flex-1 px-6 py-3 text-xs font-pixel uppercase transition-all ${
              selectedTab === 'raw'
                ? 'bg-retro-gray text-retro-white'
                : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:bg-retro-gray-light'
            }`}
          >
            RAW
          </button>
          <button
            onClick={() => setSelectedTab('graded')}
            className={`flex-1 px-6 py-3 text-xs font-pixel uppercase transition-all border-l-3 border-r-3 border-retro-black ${
              selectedTab === 'graded'
                ? 'bg-retro-blue text-retro-white'
                : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:bg-retro-gray-light'
            }`}
          >
            GRADED
          </button>
          <button
            onClick={() => setSelectedTab('pop')}
            className={`flex-1 px-6 py-3 text-xs font-pixel uppercase transition-all ${
              selectedTab === 'pop'
                ? 'bg-retro-gray text-retro-white'
                : 'bg-retro-white dark:bg-retro-black text-retro-black dark:text-retro-white hover:bg-retro-gray-light'
            }`}
          >
            POP
          </button>
        </div>

        {/* Graded Tab Content: Legend with toggles */}
        {selectedTab === 'graded' && (
          <div className="p-4 border-b-3 border-retro-black">
            <div className="flex flex-wrap gap-3">
              {gradingCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => toggleLine(company.id)}
                  className={`flex items-center gap-2 px-3 py-2 border-2 border-retro-black text-[10px] font-pixel transition-all ${
                    visibleLines.has(company.id)
                      ? 'bg-retro-white dark:bg-retro-black shadow-pixel'
                      : 'bg-retro-gray-light dark:bg-retro-gray-dark opacity-50'
                  }`}
                >
                  <div className={`w-3 h-3 ${company.color} border border-retro-black`}></div>
                  <span className="text-retro-black dark:text-retro-white">{company.label}</span>
                  {visibleLines.has(company.id) && (
                    <span className="text-retro-black dark:text-retro-white">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Graph */}
      {selectedTab === 'raw' && (
        <PriceGraph
          cardId={cardId}
          variant={variant}
          initialPrice={initialPrice}
          conditionFilter="raw"
        />
      )}

      {selectedTab === 'graded' && (
        <>
          <MultiLinePriceGraph
            cardId={cardId}
            variant={variant}
            visibleLines={visibleLines}
            lineConfigs={gradingCompanies}
          />

          {/* Grade Breakdown Table */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {/* PSA Grades */}
            <div>
              <h3 className="text-xs font-pixel text-retro-black dark:text-retro-white uppercase mb-3 border-b-2 border-retro-black pb-2">
                PSA - Holofoil
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {loading ? (
                  [10, 9, 8, 7].map((grade) => (
                    <div key={grade} className="bg-retro-white dark:bg-retro-black border-2 border-retro-black p-2 text-center">
                      <div className="text-lg font-pixel text-retro-black dark:text-retro-white">{grade}</div>
                      <div className="text-[10px] font-pixel text-retro-gray dark:text-retro-gray-light animate-pulse">Loading...</div>
                      <div className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light">-</div>
                    </div>
                  ))
                ) : (
                  psaGrades.map((gradeData) => (
                    <div key={gradeData.grade} className="bg-retro-white dark:bg-retro-black border-2 border-retro-black p-2 text-center">
                      <div className="text-lg font-pixel text-retro-black dark:text-retro-white">{gradeData.grade}</div>
                      <div className="text-[10px] font-pixel text-retro-gray dark:text-retro-gray-light">
                        {formatPrice(convertPrice(gradeData.price))}
                      </div>
                      <div className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light">
                        {gradeData.population.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* BGS Grades */}
            <div>
              <h3 className="text-xs font-pixel text-retro-black dark:text-retro-white uppercase mb-3 border-b-2 border-retro-black pb-2">
                BGS - Holofoil
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {loading ? (
                  [10, 9.5, 9, 8.5].map((grade) => (
                    <div key={grade} className="bg-retro-white dark:bg-retro-black border-2 border-retro-black p-2 text-center">
                      <div className="text-lg font-pixel text-retro-black dark:text-retro-white">{grade}</div>
                      <div className="text-[10px] font-pixel text-retro-gray dark:text-retro-gray-light animate-pulse">Loading...</div>
                      <div className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light">-</div>
                    </div>
                  ))
                ) : (
                  bgsGrades.map((gradeData) => (
                    <div key={gradeData.grade} className="bg-retro-white dark:bg-retro-black border-2 border-retro-black p-2 text-center">
                      <div className="text-lg font-pixel text-retro-black dark:text-retro-white">{gradeData.grade}</div>
                      <div className="text-[10px] font-pixel text-retro-gray dark:text-retro-gray-light">
                        {formatPrice(convertPrice(gradeData.price))}
                      </div>
                      <div className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light">
                        {gradeData.population.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedTab === 'pop' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Population data chart (showing distribution of graded cards)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
