import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

/**
 * Exercise data from the exercises table.
 */
export interface Exercise {
  id: string;
  name: string;
  primaryZone: string;
  equipment: string | null;
}

interface ExerciseRow {
  id: string;
  name: string;
  primary_zone: string;
  equipment: string | null;
}

/**
 * Fetches exercises filtered by zone and optional search query.
 *
 * @param zoneId - The zone to filter exercises by (e.g., 'biceps', 'quads')
 * @param searchQuery - Optional search string to filter by name
 */
export function useExercises(
  zoneId: string,
  searchQuery?: string
): { exercises: Exercise[]; isLoading: boolean } {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);

      const query = searchQuery?.trim() || '';
      const rows = await db.getAllAsync<ExerciseRow>(
        `SELECT id, name, primary_zone, equipment
         FROM exercises
         WHERE primary_zone = ?
           AND (name LIKE '%' || ? || '%' OR ? = '')
         ORDER BY name ASC`,
        [zoneId, query, query]
      );

      const processed: Exercise[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        primaryZone: row.primary_zone,
        equipment: row.equipment,
      }));

      setExercises(processed);
      setIsLoading(false);
    };

    fetchExercises();
  }, [db, zoneId, searchQuery]);

  return { exercises, isLoading };
}
