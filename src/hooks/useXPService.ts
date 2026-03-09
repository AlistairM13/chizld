import { useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  calculateSetXP,
  getLevelFromXP,
  wasTrainedWithin7Days,
  type XPResult,
} from '@/services/xp-calculator';

/**
 * Generates a unique ID using timestamp + random suffix.
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Parameters for awarding XP to a completed set.
 */
export interface AwardSetXPParams {
  zoneId: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  tempoEnabled: boolean;
  sessionId: string;
  applyConsistencyBonus: boolean;
}

/**
 * Result of finalizing a session with XP.
 */
export interface FinalizeSessionResult {
  leveledUp: boolean;
  newLevel: number;
}

/**
 * Hook for XP-related database operations.
 *
 * Provides functions for:
 * - Checking if a set is a personal record
 * - Checking zone consistency (trained within 7 days)
 * - Calculating XP for a set (without writing to DB)
 * - Finalizing a session with total XP (atomic DB update)
 */
export function useXPService() {
  const db = useSQLiteContext();

  /**
   * Checks if this weight at these reps is a personal record.
   *
   * A PR is achieved when:
   * - No prior sets exist for this exercise at same or higher reps, OR
   * - The weight exceeds all prior sets at same or higher reps
   *
   * @param exerciseId - The exercise to check
   * @param weightKg - The weight being lifted
   * @param reps - The rep count being performed
   * @returns true if this is a PR, false otherwise
   */
  const checkIsPR = useCallback(
    async (
      exerciseId: string,
      weightKg: number,
      reps: number
    ): Promise<boolean> => {
      const result = await db.getFirstAsync<{ max_weight: number | null }>(
        `SELECT MAX(weight_kg) as max_weight
         FROM workout_sets
         WHERE exercise_id = ? AND reps >= ?`,
        [exerciseId, reps]
      );

      // PR if no prior sets or weight exceeds max
      if (result === null || result.max_weight === null) {
        return true;
      }

      return weightKg > result.max_weight;
    },
    [db]
  );

  /**
   * Checks if a zone was trained within the last 7 days.
   *
   * Used to determine eligibility for the consistency bonus.
   * The actual application of the bonus is controlled by the caller.
   *
   * @param zoneId - The zone to check
   * @returns true if trained within 7 days, false otherwise
   */
  const getZoneConsistency = useCallback(
    async (zoneId: string): Promise<boolean> => {
      const result = await db.getFirstAsync<{ last_trained_at: string | null }>(
        'SELECT last_trained_at FROM zone_stats WHERE zone_id = ?',
        [zoneId]
      );

      if (result === null) {
        return false;
      }

      return wasTrainedWithin7Days(result.last_trained_at);
    },
    [db]
  );

  /**
   * Calculates XP for a completed set.
   *
   * This function does NOT write to the database. The caller accumulates
   * XP across sets and calls finalizeSession to persist.
   *
   * @param params - Set parameters including exercise, weight, reps, tempo, and consistency flag
   * @returns XPResult with breakdown of all XP components
   */
  const awardSetXP = useCallback(
    async (params: AwardSetXPParams): Promise<XPResult> => {
      const isPR = await checkIsPR(
        params.exerciseId,
        params.weightKg,
        params.reps
      );

      const result = calculateSetXP({
        weightKg: params.weightKg,
        reps: params.reps,
        tempoEnabled: params.tempoEnabled,
        isPR,
        applyConsistencyBonus: params.applyConsistencyBonus,
      });

      return result;
    },
    [checkIsPR]
  );

  /**
   * Finalizes a session by persisting accumulated XP.
   *
   * Atomically:
   * - Updates zone_stats with new total_xp, level, last_trained_at, streak
   * - Inserts xp_history record for audit trail
   *
   * @param zoneId - The zone that was trained
   * @param totalXP - Total XP earned in this session
   * @param sessionId - The workout session ID for reference
   * @returns Object indicating if leveled up and the new level
   */
  const finalizeSession = useCallback(
    async (
      zoneId: string,
      totalXP: number,
      sessionId: string
    ): Promise<FinalizeSessionResult> => {
      let leveledUp = false;
      let newLevel = 1;

      await db.withExclusiveTransactionAsync(async (txn) => {
        // Read current zone stats
        const current = await txn.getFirstAsync<{
          total_xp: number;
          level: number;
          last_trained_at: string | null;
          current_streak: number;
        }>(
          `SELECT total_xp, level, last_trained_at, current_streak
           FROM zone_stats WHERE zone_id = ?`,
          [zoneId]
        );

        if (!current) {
          // Zone doesn't exist, create it
          const insertedLevel = getLevelFromXP(totalXP);
          await txn.runAsync(
            `INSERT INTO zone_stats (zone_id, total_xp, level, current_streak, last_trained_at)
             VALUES (?, ?, ?, 1, datetime('now'))`,
            [zoneId, totalXP, insertedLevel]
          );
          newLevel = insertedLevel;
          leveledUp = insertedLevel > 1;
        } else {
          // Calculate new values
          const newTotalXP = current.total_xp + totalXP;
          newLevel = getLevelFromXP(newTotalXP);
          leveledUp = newLevel > current.level;

          // Calculate streak: increment if was warm (trained within 7 days), else reset to 1
          const wasWarm = wasTrainedWithin7Days(current.last_trained_at);
          const newStreak = wasWarm ? current.current_streak + 1 : 1;
          const longestStreak = Math.max(newStreak, current.current_streak);

          // Update zone_stats
          await txn.runAsync(
            `UPDATE zone_stats
             SET total_xp = ?,
                 level = ?,
                 current_streak = ?,
                 longest_streak = MAX(longest_streak, ?),
                 last_trained_at = datetime('now'),
                 updated_at = datetime('now')
             WHERE zone_id = ?`,
            [newTotalXP, newLevel, newStreak, longestStreak, zoneId]
          );
        }

        // Insert xp_history record
        const historyId = generateId();
        await txn.runAsync(
          `INSERT INTO xp_history (id, zone_id, xp_amount, source, source_id, earned_at)
           VALUES (?, ?, ?, 'SESSION', ?, datetime('now'))`,
          [historyId, zoneId, totalXP, sessionId]
        );
      });

      return { leveledUp, newLevel };
    },
    [db]
  );

  return {
    checkIsPR,
    getZoneConsistency,
    awardSetXP,
    finalizeSession,
  };
}
