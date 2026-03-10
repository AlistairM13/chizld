import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Formats elapsed seconds into a workout-duration string.
 *
 * Format:
 * - < 60s: "Xs"
 * - < 1h: "Xm Ys"
 * - >= 1h: "Xh Ym"
 */
function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Elapsed timer that counts up from 0 in whole seconds.
 * Auto-starts on mount. Provides start/stop controls and formatted display.
 *
 * Usage:
 * ```tsx
 * const { formatted, elapsedSeconds, isRunning, stop } = useElapsedTimer();
 * // formatted = "0s", "1m 42s", "1h 3m"
 * ```
 */
export function useElapsedTimer(): {
  elapsedSeconds: number;
  formatted: string;
  start: () => void;
  stop: () => void;
  isRunning: boolean;
} {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    // Clear any existing interval before starting
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
  }, []);

  // Auto-start on mount
  useEffect(() => {
    start();
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    elapsedSeconds,
    formatted: formatElapsed(elapsedSeconds),
    start,
    stop,
    isRunning,
  };
}
