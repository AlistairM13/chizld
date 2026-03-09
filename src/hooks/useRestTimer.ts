import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook for managing a rest timer countdown with adjust and skip capabilities.
 *
 * Uses absolute end time tracking to avoid drift from interval timing inaccuracies.
 */
export function useRestTimer(defaultDuration: number = 90) {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(defaultDuration);

  // Track absolute end time to avoid drift
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Updates remaining time from endTimeRef.
   */
  const updateRemaining = useCallback(() => {
    const now = Date.now();
    const remainingMs = endTimeRef.current - now;
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    setRemaining(remainingSec);

    if (remainingMs <= 0) {
      // Timer complete
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    }
  }, []);

  /**
   * Starts the timer with optional custom duration.
   */
  const start = useCallback(
    (customDuration?: number) => {
      const timerDuration = customDuration ?? duration;

      endTimeRef.current = Date.now() + timerDuration * 1000;
      setRemaining(timerDuration);
      setIsRunning(true);

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start new interval at 100ms for smooth updates
      intervalRef.current = setInterval(updateRemaining, 100);
    },
    [duration, updateRemaining]
  );

  /**
   * Skips the timer, stopping it immediately.
   */
  const skip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemaining(0);
    setIsRunning(false);
  }, []);

  /**
   * Adjusts the timer by delta seconds (can be positive or negative).
   */
  const adjustTime = useCallback(
    (delta: number) => {
      if (!isRunning) return;

      // Add delta to end time
      endTimeRef.current += delta * 1000;

      // Don't allow end time in the past
      const now = Date.now();
      if (endTimeRef.current < now) {
        endTimeRef.current = now;
      }

      // Update remaining immediately
      updateRemaining();
    },
    [isRunning, updateRemaining]
  );

  /**
   * Sets the default duration for future timer starts.
   */
  const setDefaultDuration = useCallback((seconds: number) => {
    setDuration(seconds);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    remaining,
    isRunning,
    duration,
    start,
    skip,
    adjustTime,
    setDefaultDuration,
  };
}
