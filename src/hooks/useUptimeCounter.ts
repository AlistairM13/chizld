import { useState, useEffect } from 'react';

/**
 * Formats elapsed seconds into a human-readable uptime string.
 *
 * Format:
 * - >= 1 day: "Xd Yh"
 * - >= 1 hour: "Xh Ym"
 * - < 1 hour: "Xm Ys"
 */
function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Tracks session uptime since the hook was mounted.
 * Returns a formatted string that updates every second.
 *
 * Usage:
 * ```tsx
 * const uptime = useUptimeCounter();
 * // uptime = "0m 42s" or "1h 23m" or "2d 5h"
 * ```
 */
export function useUptimeCounter(): string {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return formatUptime(elapsedSeconds);
}
