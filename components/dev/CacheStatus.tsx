'use client';

import { useState, useEffect } from 'react';

export default function CacheStatus() {
  const [stats, setStats] = useState<{ size: number; keys: string[] } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    }
  };

  const clearCache = async () => {
    try {
      await fetch('/api/cache/clear', { method: 'POST' });
      fetchStats();
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg border border-gray-700 text-xs max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">Cache Status (Dev)</h3>
        <button
          onClick={fetchStats}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          Refresh
        </button>
      </div>

      {stats ? (
        <div className="space-y-2">
          <div>
            <span className="text-gray-400">Cached Items:</span>{' '}
            <span className="font-mono">{stats.size}</span>
          </div>

          {stats.keys.length > 0 && (
            <details className="cursor-pointer">
              <summary className="text-gray-400 hover:text-gray-300">
                Cache Keys ({stats.keys.length})
              </summary>
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto font-mono text-[10px] text-gray-300">
                {stats.keys.map((key, i) => (
                  <li key={i} className="truncate">
                    {key}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <button
            onClick={clearCache}
            className="w-full mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Clear Cache
          </button>
        </div>
      ) : (
        <button
          onClick={fetchStats}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Load Stats
        </button>
      )}
    </div>
  );
}
