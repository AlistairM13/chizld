/**
 * XP breakdown data passed from workout session to summary.
 */
export interface XPBreakdownParams {
  base: number;
  volumeBonus: number;
  prBonus: number;
  consistencyBonus: number;
  tempoBonus: number;
}

/**
 * Tempo defaults for an exercise in a split-based workout.
 */
export interface ExerciseTempoDefaults {
  exerciseId: string;
  tempoEccentric: number;
  tempoPauseBottom: number;
  tempoConcentric: number;
  tempoPauseTop: number;
}

export type RootStackParamList = {
  Main: undefined;
  ExerciseSelect: { zoneId: string };
  WorkoutSession: {
    sessionId: string;
    exercises: string[];
    zoneId: string;
    splitId?: string;
    tempoDefaults?: ExerciseTempoDefaults[];
  };
  SessionSummary: {
    sessionId: string;
    zoneId: string;
    totalXP?: number;
    xpBreakdown?: XPBreakdownParams;
  };
  SplitCreate: undefined;
  SplitDetail: { splitId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Train: undefined;
  Sleep: undefined;
  Fuel: undefined;
};
