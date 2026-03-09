export type RootStackParamList = {
  Main: undefined;
  ExerciseSelect: { zoneId: string };
  WorkoutSession: { sessionId: string; exercises: string[]; zoneId: string };
  SessionSummary: { sessionId: string; zoneId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Train: undefined;
  Sleep: undefined;
  Fuel: undefined;
};
