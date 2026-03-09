export type RootStackParamList = {
  Main: undefined;
  ExerciseSelect: { zoneId: string };
  WorkoutSession: { sessionId: string; exercises: string[] };
  SessionSummary: { sessionId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Train: undefined;
  Sleep: undefined;
  Fuel: undefined;
};
