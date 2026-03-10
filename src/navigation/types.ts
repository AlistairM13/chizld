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

export type RootStackParamList = {
  Main: undefined;
  ExerciseSelect: { zoneId: string };
  WorkoutSession: { sessionId: string; exercises: string[]; zoneId: string };
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
