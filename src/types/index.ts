export type ZoneId =
  | 'traps'
  | 'biceps'
  | 'forearms'
  | 'back'
  | 'chest'
  | 'shoulders'
  | 'abs'
  | 'quads';

export interface Zone {
  id: ZoneId;
  name: string;
  side: 'left' | 'right';
  position: string;
}

export interface Exercise {
  id: string;
  name: string;
  primaryZone: ZoneId;
  secondaryZones?: string;
  equipment?: string;
  isCustom: boolean;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  photoId?: string;
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  rpe?: number;
  tempoEccentric?: number;
  tempoPauseBottom?: number;
  tempoConcentric?: number;
  tempoPauseTop?: number;
  completedAt?: string;
  createdAt: string;
}

export interface ZoneStats {
  zoneId: ZoneId;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastTrainedAt?: string;
  personalRecords?: string;
  createdAt: string;
  updatedAt: string;
}

export interface XPHistory {
  id: string;
  zoneId: ZoneId;
  xpAmount: number;
  source: string;
  sourceId?: string;
  earnedAt: string;
}

export interface LevelThreshold {
  level: number;
  xpRequired: number;
  title: string;
}

/**
 * A workout split template containing multiple exercises.
 */
export interface WorkoutSplit {
  id: string;
  name: string;
  exerciseCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * An exercise within a split with default sets/reps/tempo configuration.
 */
export interface SplitExercise {
  id: string;
  splitId: string;
  exerciseId: string;
  exerciseName: string;
  primaryZone: string;
  defaultSets: number;
  defaultReps: number;
  defaultTempoEccentric: number;
  defaultTempoPauseBottom: number;
  defaultTempoConcentric: number;
  defaultTempoPauseTop: number;
  sortOrder: number;
}

/**
 * Input for creating a split exercise entry.
 */
export interface SplitExerciseInput {
  exerciseId: string;
  sets: number;
  reps: number;
  tempoEccentric?: number;
  tempoPauseBottom?: number;
  tempoConcentric?: number;
  tempoPauseTop?: number;
}
