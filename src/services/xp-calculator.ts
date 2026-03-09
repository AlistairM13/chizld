import { LEVEL_THRESHOLDS } from '@/constants/xp';

/**
 * Input parameters for calculating XP from a completed set.
 */
export interface SetXPInput {
  weightKg: number;
  reps: number;
  tempoEnabled: boolean;
  isPR: boolean;
  applyConsistencyBonus: boolean; // Caller controls when to apply (once per session)
}

/**
 * Breakdown of XP earned from a set.
 * All components shown for UI display purposes.
 */
export interface XPResult {
  base: number; // Always 10
  volumeBonus: number; // floor(weight * reps / 100)
  prBonus: number; // 50 if isPR, else 0
  consistencyBonus: number; // 20 if applyConsistencyBonus, else 0
  tempoMultiplier: number; // 1.5 if tempo, else 1.0
  subtotal: number; // base + volumeBonus + prBonus + consistencyBonus
  total: number; // floor(subtotal * tempoMultiplier)
}

/**
 * Calculates XP earned from a completed workout set.
 *
 * Formula: (base + volumeBonus + prBonus + consistencyBonus) * tempoMultiplier
 *
 * - Base: Always 10 XP
 * - Volume bonus: floor(weight * reps / 100)
 * - PR bonus: 50 XP if this is a personal record
 * - Consistency bonus: 20 XP if zone was trained within 7 days (caller controls)
 * - Tempo multiplier: 1.5x if tempo training was enabled
 *
 * @param input - Set parameters including weight, reps, tempo, PR status, and consistency flag
 * @returns XPResult with all components for breakdown display
 */
export function calculateSetXP(input: SetXPInput): XPResult {
  const base = 10;
  const volumeBonus = Math.floor((input.weightKg * input.reps) / 100);
  const prBonus = input.isPR ? 50 : 0;
  const consistencyBonus = input.applyConsistencyBonus ? 20 : 0;
  const tempoMultiplier = input.tempoEnabled ? 1.5 : 1.0;

  const subtotal = base + volumeBonus + prBonus + consistencyBonus;
  const total = Math.floor(subtotal * tempoMultiplier);

  return {
    base,
    volumeBonus,
    prBonus,
    consistencyBonus,
    tempoMultiplier,
    subtotal,
    total,
  };
}

/**
 * Determines the level from total accumulated XP.
 *
 * Uses LEVEL_THRESHOLDS to find the highest level where totalXp >= xpRequired.
 *
 * @param totalXp - Total XP accumulated in a zone
 * @returns Level number (1-10)
 */
export function getLevelFromXP(totalXp: number): number {
  // Find highest level where totalXp >= xpRequired
  // Iterate from highest to lowest to find first match
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  // Default to level 1 if no threshold met (shouldn't happen since level 1 requires 0)
  return 1;
}

/**
 * Progress information toward the next level.
 */
export interface XPProgress {
  current: number; // XP earned toward next level
  needed: number; // XP required to reach next level
  progress: number; // Ratio (0-1) of current/needed
}

/**
 * Calculates progress toward the next level.
 *
 * @param totalXp - Total XP accumulated
 * @param level - Current level
 * @returns Progress object with current XP, needed XP, and progress ratio
 */
export function getXPProgress(totalXp: number, level: number): XPProgress {
  // Check if at max level
  const maxLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].level;
  if (level >= maxLevel) {
    return { current: 0, needed: 0, progress: 1 };
  }

  // Find current level threshold and next level threshold
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);

  if (!currentThreshold || !nextThreshold) {
    return { current: 0, needed: 0, progress: 1 };
  }

  const current = totalXp - currentThreshold.xpRequired;
  const needed = nextThreshold.xpRequired - currentThreshold.xpRequired;
  const progress = needed > 0 ? current / needed : 1;

  return { current, needed, progress };
}

/**
 * Checks if a zone was trained within the last 7 days.
 *
 * Used to determine eligibility for the consistency bonus (20 XP).
 * The actual application of the bonus is controlled by the caller.
 *
 * @param lastTrainedAt - ISO timestamp of last training, or null if never trained
 * @returns true if trained within 7 days, false otherwise
 */
export function wasTrainedWithin7Days(lastTrainedAt: string | null): boolean {
  if (lastTrainedAt === null) {
    return false;
  }

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 604800000ms
  const lastTrainedTime = new Date(lastTrainedAt).getTime();
  const now = Date.now();

  return now - lastTrainedTime < SEVEN_DAYS_MS;
}
