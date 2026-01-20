'use client';

import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/contexts/CurrencyContext';

type TimeFilter = '3m' | '6m' | '12m' | 'max';

interface PriceDataPoint {
  date: string;
  price: number;
  timestamp: number;
}

interface PriceGraphProps {
  cardId: string;
  variant: string;
  initialPrice: number;
  conditionFilter?: string;
}

export default function PriceGraph({ cardId, variant, initialPrice, conditionFilter = 'raw' }: PriceGraphProps) {
  const { formatPrice, convertPrice, currency } = useCurrency();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3m');
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real price history from API
  useEffect(() => {
    const fetchPriceHistory = async () => {
      setLoading(true);
      setError(null);

      const daysMap: Record<TimeFilter, number> = {
        '3m': 90,
        '6m': 180,
        '12m': 365,
        'max': 999999, // All time - triggers API to return all historical data
      };

      const days = daysMap[timeFilter];

      try {
        const response = await fetch(`/api/prices/history?cardId=${cardId}&variant=${variant}&days=${days}&condition=${conditionFilter}`);

        if (!response.ok) {
          throw new Error('Failed to fetch price history');
        }

        const data = await response.json();

        if (data.history && data.history.length > 0) {
          const formattedData: PriceDataPoint[] = data.history.map((point: { date: string; marketPrice: number }) => ({
            date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            price: point.marketPrice,
            timestamp: new Date(point.date).getTime(),
          }));

          console.log('[PriceGraph] Loaded real price data:', formattedData.length, 'data points for', conditionFilter);
          setPriceHistory(formattedData);
          setError(null);
        } else {
          console.log('[PriceGraph] No price history available yet for', conditionFilter);
          setPriceHistory([]);
          setError(`No price history available yet for ${conditionFilter}. Price tracking will begin shortly.`);
        }
      } catch (err) {
        console.error('[PriceGraph] Error fetching price history:', err);
        setPriceHistory([]);
        setError('Unable to load price history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [cardId, variant, timeFilter, initialPrice, conditionFilter]);

  // Generate mock historical data (fallback when no real data available)
  const generateMockData = (days: number): PriceDataPoint[] => {
    const data: PriceDataPoint[] = [];
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    // Generate data points (one per week)
    const dataPoints = Math.floor(days / 7);

    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = now - (i * 7 * msPerDay);
      const date = new Date(timestamp);

      // Generate price with some variation
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const trendFactor = 1 + (dataPoints - i) / dataPoints * 0.2; // Slight upward trend
      const price = initialPrice * trendFactor * (1 + variation);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.max(0.01, Number(price.toFixed(2))),
        timestamp,
      });
    }

    return data;
  };

  // Use the fetched price history as chart data (with currency conversion)
  const chartData = useMemo(() => {
    return priceHistory.map(point => ({
      ...point,
      price: convertPrice(point.price),
    }));
  }, [priceHistory, convertPrice]);

  // Calculate price change
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { amount: 0, percentage: 0 };

    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const amount = lastPrice - firstPrice;
    const percentage = (amount / firstPrice) * 100;

    return {
      amount: Number(amount.toFixed(2)),
      percentage: Number(percentage.toFixed(2)),
    };
  }, [chartData]);

  const isPositive = priceChange.amount >= 0;

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading price history...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error or no data message
  if (error || chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex items-center justify-center h-64">
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
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(initialPrice)}
          </h3>
          <span
            className={`text-sm font-semibold ${
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}{formatPrice(Math.abs(priceChange.amount))} (
            {isPositive ? '+' : ''}
            {priceChange.percentage.toFixed(1)}%)
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {variant}
        </p>
      </div>

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

      {/* Chart */}
      <div className="h-[346px] w-full min-w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
              formatter={(value: number | undefined) => [formatPrice(value || 0), 'Price']}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10B981' : '#EF4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Historical pricing data • Updated daily
        </p>
      </div>
    </div>
  );
}
