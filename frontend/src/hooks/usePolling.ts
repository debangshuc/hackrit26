/**
 * usePolling — polls an async function at a given interval.
 * Used for guardian alert polling (every 5 seconds).
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 5000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fetcherRef = useRef(fetcher);

  // Keep fetcher ref current
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const poll = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Polling failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Initial fetch
    poll();

    // Start interval
    timerRef.current = setInterval(poll, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, intervalMs, poll]);

  return { data, error, isLoading, refetch: poll };
}
