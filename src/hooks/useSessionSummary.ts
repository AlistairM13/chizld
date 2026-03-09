import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

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
  xpEarned: number; // PLACEHOLDER: totalSets * 10 - Phase 5 will replace
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
 * Hook for fetching and aggregating session summary data.
 *
 * Queries workout_sessions and workout_sets tables to calculate:
 * - Session duration
 * - Total sets completed
 * - Exercises with set counts
 * - Total volume (weight * reps)
 * - XP earned (placeholder calculation)
 *
 * @param sessionId - The session ID to fetch data for
 * @returns Object containing summary data and loading state
 */
export function useSessionSummary(sessionId: string) {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        // XP earned (PLACEHOLDER: totalSets * 10 - Phase 5 will replace with real calculation)
        const xpEarned = totalSets * 10;

        setSummary({
          sessionId,
          startedAt,
          endedAt,
          duration,
          totalSets,
          exercises,
          totalVolume,
          xpEarned,
        });
      } catch (error) {
        console.error('Failed to fetch session summary:', error);
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [db, sessionId]);

  return { summary, isLoading };
}
