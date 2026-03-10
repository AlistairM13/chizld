import { useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

/**
 * Exercise data from the exercises table.
 */
export interface Exercise {
  id: string;
  name: string;
  primaryZone: string;
  equipment: string | null;
  isCustom?: boolean;
}

interface ExerciseRow {
  id: string;
  name: string;
  primary_zone: string;
  equipment: string | null;
  is_custom: number;
}

function generateId(): string {
  return 'custom-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Fetches exercises filtered by zone and optional search query.
 * Also provides a function to create custom exercises.
 *
 * @param zoneId - The zone to filter exercises by (e.g., 'biceps', 'quads')
 * @param searchQuery - Optional search string to filter by name
 */
export function useExercises(
  zoneId: string,
  searchQuery?: string
): {
  exercises: Exercise[];
  isLoading: boolean;
  createExercise: (name: string, equipment?: string) => Promise<Exercise>;
  refetch: () => void;
} {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);

      const query = searchQuery?.trim() || '';
      const rows = await db.getAllAsync<ExerciseRow>(
        `SELECT id, name, primary_zone, equipment, is_custom
         FROM exercises
         WHERE primary_zone = ?
           AND (name LIKE '%' || ? || '%' OR ? = '')
         ORDER BY is_custom DESC, name ASC`,
        [zoneId, query, query]
      );

      const processed: Exercise[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        primaryZone: row.primary_zone,
        equipment: row.equipment,
        isCustom: row.is_custom === 1,
      }));

      setExercises(processed);
      setIsLoading(false);
    };

    fetchExercises();
  }, [db, zoneId, searchQuery, refreshKey]);

  const createExercise = useCallback(
    async (name: string, equipment?: string): Promise<Exercise> => {
      const id = generateId();
      const trimmedName = name.trim();
      const trimmedEquipment = equipment?.trim() || null;

      await db.runAsync(
        `INSERT INTO exercises (id, name, primary_zone, equipment, is_custom)
         VALUES (?, ?, ?, ?, 1)`,
        [id, trimmedName, zoneId, trimmedEquipment]
      );

      const newExercise: Exercise = {
        id,
        name: trimmedName,
        primaryZone: zoneId,
        equipment: trimmedEquipment,
        isCustom: true,
      };

      // Refresh the list
      refetch();

      return newExercise;
    },
    [db, zoneId, refetch]
  );

  return { exercises, isLoading, createExercise, refetch };
}
