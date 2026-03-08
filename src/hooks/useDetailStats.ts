import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { zones } from '../constants/zones';

interface ZoneStatsRow {
  zone_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  last_trained_at: string | null;
}

export interface ZoneDetailStats {
  zoneId: string;
  zoneName: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  totalSets: number;
  sessions: number;
  volume7d: number;
  maxWeight: number | null;
  lastTrainedAt: string | null;
}

/**
 * Fetches detailed zone stats for the stat card display.
 * Returns null if no zone is selected.
 */
export function useDetailStats(zoneId: string | null): ZoneDetailStats | null {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<ZoneDetailStats | null>(null);

  useEffect(() => {
    if (!zoneId) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      const row = await db.getFirstAsync<ZoneStatsRow>(
        'SELECT zone_id, total_xp, level, current_streak, last_trained_at FROM zone_stats WHERE zone_id = ?',
        [zoneId]
      );

      if (!row) {
        setStats(null);
        return;
      }

      // Find zone metadata
      const zoneMeta = zones.find((z) => z.id === row.zone_id);

      // Placeholder values for workout stats (Phase 4 will add real queries)
      setStats({
        zoneId: row.zone_id,
        zoneName: zoneMeta?.name ?? row.zone_id.toUpperCase(),
        level: row.level,
        totalXp: row.total_xp,
        currentStreak: row.current_streak,
        totalSets: 0, // Placeholder
        sessions: 0, // Placeholder
        volume7d: 0, // Placeholder
        maxWeight: null, // Placeholder
        lastTrainedAt: row.last_trained_at,
      });
    };

    fetchStats();
  }, [db, zoneId]);

  return stats;
}
