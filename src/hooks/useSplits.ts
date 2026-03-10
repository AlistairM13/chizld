import { useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { WorkoutSplit, SplitExercise, SplitExerciseInput } from '@/types';

interface SplitRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  exercise_count: number;
}

interface SplitExerciseRow {
  id: string;
  split_id: string;
  exercise_id: string;
  exercise_name: string;
  primary_zone: string;
  default_sets: number;
  default_reps: number;
  default_tempo_eccentric: number;
  default_tempo_pause_bottom: number;
  default_tempo_concentric: number;
  default_tempo_pause_top: number;
  sort_order: number;
}

function generateId(): string {
  return (
    'split-' +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 6)
  );
}

function generateExerciseId(): string {
  return (
    'se-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
  );
}

/**
 * Hook for managing workout splits with full CRUD operations.
 */
export function useSplits(): {
  splits: WorkoutSplit[];
  isLoading: boolean;
  createSplit: (name: string, exercises: SplitExerciseInput[]) => Promise<string>;
  getSplitExercises: (splitId: string) => Promise<SplitExercise[]>;
  updateSplit: (
    splitId: string,
    name: string,
    exercises: SplitExerciseInput[]
  ) => Promise<void>;
  deleteSplit: (splitId: string) => Promise<void>;
  refetch: () => void;
} {
  const db = useSQLiteContext();
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const fetchSplits = async () => {
      setIsLoading(true);

      const rows = await db.getAllAsync<SplitRow>(
        `SELECT ws.id, ws.name, ws.created_at, ws.updated_at,
                COUNT(se.id) as exercise_count
         FROM workout_splits ws
         LEFT JOIN split_exercises se ON se.split_id = ws.id
         GROUP BY ws.id
         ORDER BY ws.updated_at DESC`
      );

      const processed: WorkoutSplit[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        exerciseCount: row.exercise_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setSplits(processed);
      setIsLoading(false);
    };

    fetchSplits();
  }, [db, refreshKey]);

  const createSplit = useCallback(
    async (name: string, exercises: SplitExerciseInput[]): Promise<string> => {
      const splitId = generateId();
      const trimmedName = name.trim();

      await db.withExclusiveTransactionAsync(async (txn) => {
        // Insert the split
        await txn.runAsync(
          `INSERT INTO workout_splits (id, name) VALUES (?, ?)`,
          [splitId, trimmedName]
        );

        // Insert split exercises with sort order and tempo
        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i];
          const exerciseEntryId = generateExerciseId();
          await txn.runAsync(
            `INSERT INTO split_exercises (id, split_id, exercise_id, default_sets, default_reps, default_tempo_eccentric, default_tempo_pause_bottom, default_tempo_concentric, default_tempo_pause_top, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              exerciseEntryId,
              splitId,
              ex.exerciseId,
              ex.sets,
              ex.reps,
              ex.tempoEccentric ?? 2,
              ex.tempoPauseBottom ?? 0,
              ex.tempoConcentric ?? 1,
              ex.tempoPauseTop ?? 0,
              i,
            ]
          );
        }
      });

      refetch();
      return splitId;
    },
    [db, refetch]
  );

  const getSplitExercises = useCallback(
    async (splitId: string): Promise<SplitExercise[]> => {
      const rows = await db.getAllAsync<SplitExerciseRow>(
        `SELECT se.id, se.split_id, se.exercise_id, e.name as exercise_name,
                e.primary_zone, se.default_sets, se.default_reps,
                se.default_tempo_eccentric, se.default_tempo_pause_bottom,
                se.default_tempo_concentric, se.default_tempo_pause_top, se.sort_order
         FROM split_exercises se
         JOIN exercises e ON e.id = se.exercise_id
         WHERE se.split_id = ?
         ORDER BY se.sort_order`,
        [splitId]
      );

      return rows.map((row) => ({
        id: row.id,
        splitId: row.split_id,
        exerciseId: row.exercise_id,
        exerciseName: row.exercise_name,
        primaryZone: row.primary_zone,
        defaultSets: row.default_sets,
        defaultReps: row.default_reps,
        defaultTempoEccentric: row.default_tempo_eccentric,
        defaultTempoPauseBottom: row.default_tempo_pause_bottom,
        defaultTempoConcentric: row.default_tempo_concentric,
        defaultTempoPauseTop: row.default_tempo_pause_top,
        sortOrder: row.sort_order,
      }));
    },
    [db]
  );

  const updateSplit = useCallback(
    async (
      splitId: string,
      name: string,
      exercises: SplitExerciseInput[]
    ): Promise<void> => {
      const trimmedName = name.trim();

      await db.withExclusiveTransactionAsync(async (txn) => {
        // Update split name and timestamp
        await txn.runAsync(
          `UPDATE workout_splits SET name = ?, updated_at = datetime('now') WHERE id = ?`,
          [trimmedName, splitId]
        );

        // Delete existing exercises for this split
        await txn.runAsync(`DELETE FROM split_exercises WHERE split_id = ?`, [
          splitId,
        ]);

        // Insert new exercises with sort order and tempo
        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i];
          const exerciseEntryId = generateExerciseId();
          await txn.runAsync(
            `INSERT INTO split_exercises (id, split_id, exercise_id, default_sets, default_reps, default_tempo_eccentric, default_tempo_pause_bottom, default_tempo_concentric, default_tempo_pause_top, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              exerciseEntryId,
              splitId,
              ex.exerciseId,
              ex.sets,
              ex.reps,
              ex.tempoEccentric ?? 2,
              ex.tempoPauseBottom ?? 0,
              ex.tempoConcentric ?? 1,
              ex.tempoPauseTop ?? 0,
              i,
            ]
          );
        }
      });

      refetch();
    },
    [db, refetch]
  );

  const deleteSplit = useCallback(
    async (splitId: string): Promise<void> => {
      // CASCADE delete handles split_exercises automatically
      await db.runAsync(`DELETE FROM workout_splits WHERE id = ?`, [splitId]);
      refetch();
    },
    [db, refetch]
  );

  return {
    splits,
    isLoading,
    createSplit,
    getSplitExercises,
    updateSplit,
    deleteSplit,
    refetch,
  };
}
