'use client';

import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '@/contexts/CurrencyContext';

type TimeFilter = '3m' | '6m' | '12m' | 'max';

interface PriceDataPoint {
  date: string;
  timestamp: number;
  [key: string]: number | string; // Dynamic keys for each grading company
}

interface MultiLinePriceGraphProps {
  cardId: string;
  variant: string;
  visibleLines: Set<string>;
  lineConfigs: Array<{ id: string; label: string; color: string; lineColor: string }>;
}

export default function MultiLinePriceGraph({ cardId, variant, visibleLines, lineConfigs }: MultiLinePriceGraphProps) {
  const { formatPrice, convertPrice, currency } = useCurrency();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3m');
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch price history for all visible lines
  useEffect(() => {
    const fetchMultiLinePriceHistory = async () => {
      setLoading(true);
      setError(null);

      const daysMap: Record<TimeFilter, number> = {
        '3m': 90,
        '6m': 180,
        '12m': 365,
        'max': 999999,
      };

      const days = daysMap[timeFilter];

      try {
        // Fetch data for each visible line
        const fetchPromises = Array.from(visibleLines).map(async (lineId) => {
          const response = await fetch(`/api/prices/history?cardId=${cardId}&variant=${variant}&days=${days}&condition=${lineId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch price history for ${lineId}`);
          }
          const data = await response.json();
          return { lineId, history: data.history || [] };
        });

        const results = await Promise.all(fetchPromises);

        // Merge all histories into a single dataset
        const mergedData = new Map<number, PriceDataPoint>();

        results.forEach(({ lineId, history }) => {
          history.forEach((point: { date: string; marketPrice: number }) => {
            const timestamp = new Date(point.date).getTime();
            const dateStr = new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            if (!mergedData.has(timestamp)) {
              mergedData.set(timestamp, {
                date: dateStr,
                timestamp,
              });
            }

            const dataPoint = mergedData.get(timestamp)!;
            dataPoint[lineId] = convertPrice(point.marketPrice);
          });
        });

        // Convert to array and sort by timestamp
        const sortedData = Array.from(mergedData.values()).sort((a, b) => a.timestamp - b.timestamp);

        console.log('[MultiLinePriceGraph] Loaded', sortedData.length, 'data points for', Array.from(visibleLines).join(', '));
        setPriceHistory(sortedData);
        setError(null);
      } catch (err) {
        console.error('[MultiLinePriceGraph] Error fetching price history:', err);
        setPriceHistory([]);
        setError('Unable to load price history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (visibleLines.size > 0) {
      fetchMultiLinePriceHistory();
    } else {
      setPriceHistory([]);
      setLoading(false);
    }
  }, [cardId, variant, timeFilter, visibleLines, convertPrice]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading price history...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error or no data message
  if (error || priceHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {error || 'No price history available yet'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Price tracking will build up historical data over time
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow w-full">
      {/* Time Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['3m', '6m', '12m', 'max'] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 text-xs font-semibold uppercase rounded transition-colors ${
              timeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Multi-line Chart */}
      <div className="h-[300px] w-full min-w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              tickMargin={10}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              tickMargin={10}
              tickFormatter={(value) => formatPrice(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value: number | undefined, name: string | undefined) => {
                const config = lineConfigs.find(c => c.id === name);
                return [formatPrice(value || 0), config?.label || name || ''];
              }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            {/* Render a Line for each visible company */}
            {lineConfigs
              .filter(config => visibleLines.has(config.id))
              .map(config => (
                <Line
                  key={config.id}
                  type="monotone"
                  dataKey={config.id}
                  stroke={config.lineColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name={config.label}
                  connectNulls
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Historical pricing data for graded cards • Updated daily
        </p>
      </div>
    </div>
  );
}
