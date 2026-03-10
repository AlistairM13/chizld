import { useState, useRef, useCallback } from 'react';
import * as Speech from 'expo-speech';

/**
 * Tempo configuration for voice-guided lifting.
 */
export interface TempoConfig {
  eccentric: number; // seconds for lowering phase (default 3)
  pauseBottom: number; // seconds to hold at bottom (default 1)
  concentric: number; // seconds for lifting phase (default 2)
  pauseTop: number; // seconds to hold at top (default 0)
}

const DEFAULT_TEMPO: TempoConfig = {
  eccentric: 3,
  pauseBottom: 1,
  concentric: 2,
  pauseTop: 0,
};

/**
 * Promise-based wrapper for Speech.speak with timeout fallback.
 */
function speakAndWait(text: string): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, {
      language: 'en-US',
      rate: 1.0,
      onDone: () => resolve(),
      onError: () => resolve(), // Don't block on errors
    });

    // Fallback timeout in case onDone never fires
    setTimeout(resolve, 2000);
  });
}

/**
 * Promise-based delay.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Hook for voice-guided tempo countdown during exercises.
 *
 * Uses expo-speech to announce phases and countdown numbers.
 * Supports start/stop control for integration with set logging.
 * Exposes currentPhase and countdown for live UI display.
 */
export function useTempoVoice() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null); // 'DOWN' | 'HOLD' | 'UP' | null
  const [countdown, setCountdown] = useState<number>(0);
  const isActiveRef = useRef(false);

  /**
   * Plays the tempo cycle continuously until stopped.
   */
  const playTempoCycle = useCallback(async (config: TempoConfig) => {
    while (isActiveRef.current) {
      // Eccentric phase
      if (!isActiveRef.current) break;
      setCurrentPhase('DOWN');
      setCountdown(config.eccentric);
      await speakAndWait('Down');

      // Countdown eccentric
      for (let i = config.eccentric; i >= 1; i--) {
        if (!isActiveRef.current) break;
        setCountdown(i);
        await speakAndWait(i.toString());
        if (i > 1) {
          await delay(100); // Small gap between numbers
        }
      }

      // Bottom hold
      if (config.pauseBottom > 0) {
        if (!isActiveRef.current) break;
        setCurrentPhase('HOLD');
        setCountdown(config.pauseBottom);
        await speakAndWait('Hold');
        await delay(config.pauseBottom * 1000);
      }

      // Concentric phase
      if (!isActiveRef.current) break;
      setCurrentPhase('UP');
      setCountdown(config.concentric);
      await speakAndWait('Up');

      // Countdown concentric
      for (let i = config.concentric; i >= 1; i--) {
        if (!isActiveRef.current) break;
        setCountdown(i);
        await speakAndWait(i.toString());
        if (i > 1) {
          await delay(100);
        }
      }

      // Top hold
      if (config.pauseTop > 0) {
        if (!isActiveRef.current) break;
        setCurrentPhase('HOLD');
        setCountdown(config.pauseTop);
        await speakAndWait('Hold');
        await delay(config.pauseTop * 1000);
      }

      // Brief pause between reps
      if (isActiveRef.current) {
        await delay(500);
      }
    }
  }, []);

  /**
   * Starts the tempo voice guidance.
   */
  const startTempo = useCallback(
    (config: TempoConfig = DEFAULT_TEMPO) => {
      if (isActiveRef.current) return; // Already playing

      isActiveRef.current = true;
      setIsPlaying(true);
      playTempoCycle(config);
    },
    [playTempoCycle]
  );

  /**
   * Stops the tempo voice guidance immediately.
   */
  const stopTempo = useCallback(() => {
    isActiveRef.current = false;
    Speech.stop();
    setIsPlaying(false);
    setCurrentPhase(null);
    setCountdown(0);
  }, []);

  return {
    startTempo,
    stopTempo,
    isPlaying,
    currentPhase,
    countdown,
  };
}
