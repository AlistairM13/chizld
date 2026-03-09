import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

/**
 * Set data for a completed set in a workout session.
 */
export interface SetData {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number;
  completedAt: string;
}

/**
 * Exercise with its logged sets in the current session.
 */
export interface SessionExercise {
  id: string;
  name: string;
  sets: SetData[];
}

/**
 * Summary of a completed workout session.
 */
export interface SessionSummary {
  totalSets: number;
  exercisesCompleted: number;
  exercises: { id: string; name: string; setCount: number }[];
}

/**
 * Generates a unique ID using timestamp + random suffix.
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Hook for managing workout session state and SQLite persistence.
 *
 * Creates workout_sessions and workout_sets rows, tracks exercises and completed sets.
 */
export function useWorkoutSession() {
  const db = useSQLiteContext();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  /**
   * Creates a new workout session and loads exercise names.
   * @param exerciseIds - Array of exercise IDs to include in this session
   * @returns The new session ID
   */
  const createSession = useCallback(
    async (exerciseIds: string[]): Promise<string> => {
      const newSessionId = generateId();
      const startedAt = new Date().toISOString();

      // Create workout_sessions row
      await db.runAsync(
        'INSERT INTO workout_sessions (id, started_at) VALUES (?, ?)',
        [newSessionId, startedAt]
      );

      // Load exercise names for the selected exercises
      const placeholders = exerciseIds.map(() => '?').join(',');
      const rows = await db.getAllAsync<{ id: string; name: string }>(
        `SELECT id, name FROM exercises WHERE id IN (${placeholders})`,
        exerciseIds
      );

      // Build exercises array in order of exerciseIds
      const exerciseMap = new Map(rows.map((r) => [r.id, r.name]));
      const sessionExercises: SessionExercise[] = exerciseIds.map((id) => ({
        id,
        name: exerciseMap.get(id) || 'Unknown Exercise',
        sets: [],
      }));

      setSessionId(newSessionId);
      setExercises(sessionExercises);
      setCurrentExerciseIndex(0);

      return newSessionId;
    },
    [db]
  );

  /**
   * Adds a completed set to the database and local state.
   * @param exerciseId - The exercise this set belongs to
   * @param data - Set data (weightKg, reps, rpe)
   * @returns The new set ID
   */
  const addSet = useCallback(
    async (
      exerciseId: string,
      data: { weightKg: number; reps: number; rpe: number }
    ): Promise<string> => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      const setId = generateId();
      const completedAt = new Date().toISOString();

      // Find set number for this exercise
      const exerciseIndex = exercises.findIndex((e) => e.id === exerciseId);
      const setNumber =
        exerciseIndex >= 0 ? exercises[exerciseIndex].sets.length + 1 : 1;

      // Insert into workout_sets
      await db.runAsync(
        `INSERT INTO workout_sets (id, session_id, exercise_id, set_number, weight_kg, reps, rpe, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          setId,
          sessionId,
          exerciseId,
          setNumber,
          data.weightKg,
          data.reps,
          data.rpe,
          completedAt,
        ]
      );

      // Update local state
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: [
                  ...exercise.sets,
                  {
                    setNumber,
                    weightKg: data.weightKg,
                    reps: data.reps,
                    rpe: data.rpe,
                    completedAt,
                  },
                ],
              }
            : exercise
        )
      );

      return setId;
    },
    [db, sessionId, exercises]
  );

  /**
   * Completes the workout session.
   * @param notes - Optional session notes
   */
  const completeSession = useCallback(
    async (notes?: string): Promise<void> => {
      if (!sessionId) {
        throw new Error('No active session');
      }

      const endedAt = new Date().toISOString();

      await db.runAsync(
        'UPDATE workout_sessions SET ended_at = ?, notes = ? WHERE id = ?',
        [endedAt, notes || null, sessionId]
      );
    },
    [db, sessionId]
  );

  /**
   * Returns a summary of the current session.
   */
  const getSessionSummary = useCallback((): SessionSummary => {
    const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);
    const exercisesCompleted = exercises.filter((e) => e.sets.length > 0).length;

    return {
      totalSets,
      exercisesCompleted,
      exercises: exercises.map((e) => ({
        id: e.id,
        name: e.name,
        setCount: e.sets.length,
      })),
    };
  }, [exercises]);

  return {
    sessionId,
    exercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    createSession,
    addSet,
    completeSession,
    getSessionSummary,
  };
}
