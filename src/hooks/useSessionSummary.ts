import { useState, useEffect, useRef, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useXPService, type FinalizeSessionResult } from '@/hooks/useXPService';

/**
 * XP breakdown structure showing all bonus components.
 */
export interface XPBreakdownData {
  base: number;           // totalSets * 10
  volumeBonus: number;    // Sum of floor(weight * reps / 100) for each set
  prBonus: number;        // Count of PR sets * 50
  consistencyBonus: number; // 20 if applied (once per session, not per set)
  tempoBonus: number;     // Sum of (setXP * 0.5) for tempo sets
}

/**
 * Pre-calculated XP data passed from active session.
 */
export interface PreCalculatedXP {
  total: number;
  breakdown: XPBreakdownData;
}

/**
 * Exercise summary data for a completed workout session.
 */
export interface ExerciseSummary {
  id: string;
  name: string;
  setCount: number;
}

/**
 * Aggregated session summary data.
 */
export interface SessionSummary {
  sessionId: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number; // minutes
  totalSets: number;
  exercises: ExerciseSummary[];
  totalVolume: number; // kg
  xpEarned: number;         // Real XP from route params or recalculated
  xpBreakdown: XPBreakdownData;  // Detailed breakdown
  leveledUp: boolean;       // Did zone level up?
  newLevel: number | null;  // New level if leveled up
  zoneId: string;           // Zone for display
  zoneName: string;         // Zone name for display
}

/**
 * Query result from workout_sessions table.
 */
interface SessionRow {
  id: string;
  started_at: string;
  ended_at: string | null;
}

/**
 * Query result for sets count.
 */
interface CountRow {
  count: number;
}

/**
 * Query result for exercise grouping.
 */
interface ExerciseGroupRow {
  exercise_id: string;
  name: string;
  set_count: number;
}

/**
 * Query result for volume calculation.
 */
interface VolumeRow {
  total_volume: number | null;
}

/**
 * Query result for zone name.
 */
interface ZoneRow {
  name: string;
}

/**
 * Query result for historical XP.
 */
interface XPHistoryRow {
  xp_amount: number;
}

/**
 * Hook parameters.
 */
interface UseSessionSummaryParams {
  sessionId: string;
  zoneId: string;
  preCalculatedXP?: PreCalculatedXP;
}

/**
 * Hook for fetching and aggregating session summary data.
 *
 * Queries workout_sessions and workout_sets tables to calculate:
 * - Session duration
 * - Total sets completed
 * - Exercises with set counts
 * - Total volume (weight * reps)
 * - XP earned (real calculation from route params or historical)
 *
 * Also handles finalization of XP to zone_stats.
 *
 * @param params - Session ID, zone ID, and optional pre-calculated XP
 * @returns Object containing summary data, loading state, and finalization function
 */
export function useSessionSummary(params: UseSessionSummaryParams) {
  const { sessionId, zoneId, preCalculatedXP } = params;
  const db = useSQLiteContext();
  const xpService = useXPService();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFinalized = useRef(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);

      try {
        // Get session times
        const session = await db.getFirstAsync<SessionRow>(
          'SELECT id, started_at, ended_at FROM workout_sessions WHERE id = ?',
          [sessionId]
        );

        if (!session) {
          setSummary(null);
          setIsLoading(false);
          return;
        }

        // Get total sets count
        const setsCount = await db.getFirstAsync<CountRow>(
          'SELECT COUNT(*) as count FROM workout_sets WHERE session_id = ?',
          [sessionId]
        );

        // Get exercises with set counts
        const exerciseRows = await db.getAllAsync<ExerciseGroupRow>(
          `SELECT ws.exercise_id, e.name, COUNT(*) as set_count
           FROM workout_sets ws
           JOIN exercises e ON ws.exercise_id = e.id
           WHERE ws.session_id = ?
           GROUP BY ws.exercise_id
           ORDER BY MIN(ws.completed_at)`,
          [sessionId]
        );

        // Get total volume (weight_kg * reps)
        const volumeRow = await db.getFirstAsync<VolumeRow>(
          `SELECT SUM(weight_kg * reps) as total_volume
           FROM workout_sets
           WHERE session_id = ?`,
          [sessionId]
        );

        // Get zone name
        const zoneRow = await db.getFirstAsync<ZoneRow>(
          'SELECT name FROM zones WHERE id = ?',
          [zoneId]
        );

        // Parse dates
        const startedAt = new Date(session.started_at);
        const endedAt = session.ended_at ? new Date(session.ended_at) : null;

        // Calculate duration in minutes
        const endTime = endedAt || new Date();
        const durationMs = endTime.getTime() - startedAt.getTime();
        const duration = Math.round(durationMs / 1000 / 60);

        // Total sets
        const totalSets = setsCount?.count ?? 0;

        // Map exercises
        const exercises: ExerciseSummary[] = exerciseRows.map((row) => ({
          id: row.exercise_id,
          name: row.name,
          setCount: row.set_count,
        }));

        // Total volume
        const totalVolume = volumeRow?.total_volume ?? 0;

        // Determine XP earned and breakdown
        let xpEarned: number;
        let xpBreakdown: XPBreakdownData;

        if (preCalculatedXP) {
          // Active session: use pre-calculated values from route params
          xpEarned = preCalculatedXP.total;
          xpBreakdown = preCalculatedXP.breakdown;
        } else {
          // Historical session: query xp_history for this session
          const xpHistoryRow = await db.getFirstAsync<XPHistoryRow>(
            'SELECT xp_amount FROM xp_history WHERE source_id = ?',
            [sessionId]
          );

          if (xpHistoryRow) {
            // Use stored XP value
            xpEarned = xpHistoryRow.xp_amount;
            // Approximate breakdown (we don't store granular data for historical)
            const baseApprox = totalSets * 10;
            xpBreakdown = {
              base: baseApprox,
              volumeBonus: xpEarned - baseApprox > 0 ? xpEarned - baseApprox : 0,
              prBonus: 0,
              consistencyBonus: 0,
              tempoBonus: 0,
            };
          } else {
            // No XP record, estimate from sets
            xpEarned = totalSets * 10;
            xpBreakdown = {
              base: xpEarned,
              volumeBonus: 0,
              prBonus: 0,
              consistencyBonus: 0,
              tempoBonus: 0,
            };
          }
        }

        setSummary({
          sessionId,
          startedAt,
          endedAt,
          duration,
          totalSets,
          exercises,
          totalVolume,
          xpEarned,
          xpBreakdown,
          leveledUp: false,
          newLevel: null,
          zoneId,
          zoneName: zoneRow?.name ?? 'Unknown Zone',
        });
      } catch (error) {
        console.error('Failed to fetch session summary:', error);
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [db, sessionId, zoneId, preCalculatedXP]);

  /**
   * Finalizes the session by persisting XP to zone_stats.
   * Returns level-up information.
   * Only runs once per mount (tracked by hasFinalized ref).
   */
  const finalizeAndGetResult = useCallback(async (): Promise<FinalizeSessionResult | null> => {
    if (hasFinalized.current || !summary) {
      return null;
    }

    hasFinalized.current = true;

    try {
      const result = await xpService.finalizeSession(
        zoneId,
        summary.xpEarned,
        sessionId
      );

      // Update summary with level-up info
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              leveledUp: result.leveledUp,
              newLevel: result.newLevel,
            }
          : null
      );

      return result;
    } catch (error) {
      console.error('Failed to finalize session:', error);
      return null;
    }
  }, [summary, xpService, zoneId, sessionId]);

  return { summary, isLoading, finalizeAndGetResult };
}
