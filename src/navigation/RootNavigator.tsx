import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { ExerciseSelectScreen } from '@/screens/workout/ExerciseSelectScreen';
import { WorkoutSessionScreen } from '@/screens/workout/WorkoutSessionScreen';
import { SessionSummaryScreen } from '@/screens/workout/SessionSummaryScreen';
import { type RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ExerciseSelect" component={ExerciseSelectScreen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
    </Stack.Navigator>
  );
}
