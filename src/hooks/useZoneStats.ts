import { useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { type ZoneId } from '../types/index';
import { zones } from '../constants/zones';

/**
 * Zone data enriched with warm/cold state and intensity calculation.
 * Used for zone card styling and glow effects.
 */
export interface ZoneWithIntensity {
  zoneId: ZoneId;
  name: string;
  side: 'left' | 'right';
  position: string;
  level: number;
  totalXp: number;
  lastTrainedAt: string | null;
  isWarm: boolean;      // trained within 3 days
  intensity: number;    // 0.0 (cold) to 1.0 (just trained)
}

interface ZoneStatsRow {
  zone_id: string;
  total_xp: number;
  level: number;
  last_trained_at: string | null;
}

// 3 days in milliseconds
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Fetches zone_stats from SQLite and computes warm/cold state with intensity decay.
 *
 * Warmth calculation:
 * - isWarm = true if trained within 3 days
 * - intensity = 1.0 (just trained) decaying to 0.0 (at 3 days)
 * - intensity = 0 for cold zones (trained > 3 days ago or never)
 *
 * Returns refetch function for manual refresh (use in useFocusEffect).
 */
export function useZoneStats(): {
  stats: ZoneWithIntensity[];
  warmCount: number;
  refetch: () => Promise<void>;
} {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<ZoneWithIntensity[]>([]);
  const [warmCount, setWarmCount] = useState(0);

  const fetchStats = useCallback(async () => {
    const rows = await db.getAllAsync<ZoneStatsRow>(
      'SELECT zone_id, total_xp, level, last_trained_at FROM zone_stats'
    );

    const now = Date.now();

    const processed: ZoneWithIntensity[] = rows.map((row) => {
      // Find zone metadata from constants
      const zoneMeta = zones.find((z) => z.id === row.zone_id);

      // Calculate warmth and intensity
      let isWarm = false;
      let intensity = 0;

      if (row.last_trained_at) {
        const lastTrained = new Date(row.last_trained_at).getTime();
        const elapsed = now - lastTrained;
        isWarm = elapsed < THREE_DAYS_MS;
        // Decay: 1.0 (just trained) -> 0.0 (at 3 days)
        intensity = isWarm ? Math.max(0, 1 - elapsed / THREE_DAYS_MS) : 0;
      }

      return {
        zoneId: row.zone_id as ZoneId,
        name: zoneMeta?.name ?? row.zone_id.toUpperCase(),
        side: zoneMeta?.side ?? 'left',
        position: zoneMeta?.position ?? 'mid',
        level: row.level,
        totalXp: row.total_xp,
        lastTrainedAt: row.last_trained_at,
        isWarm,
        intensity,
      };
    });

    setStats(processed);
    setWarmCount(processed.filter((z) => z.isWarm).length);
  }, [db]);

  // Initial fetch on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, warmCount, refetch: fetchStats };
}
