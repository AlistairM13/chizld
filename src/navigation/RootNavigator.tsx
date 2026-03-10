import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { ExerciseSelectScreen } from '@/screens/workout/ExerciseSelectScreen';
import { WorkoutSessionScreen } from '@/screens/workout/WorkoutSessionScreen';
import { SessionSummaryScreen } from '@/screens/workout/SessionSummaryScreen';
import { type RootStackParamList } from './types';

// Temporary placeholders until Plan 03.1-03 creates real screens
function SplitCreateScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#F0F0F5' }}>Create Split</Text>
    </View>
  );
}

function SplitDetailScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#F0F0F5' }}>Split Detail</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ExerciseSelect" component={ExerciseSelectScreen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
      <Stack.Screen name="SplitCreate" component={SplitCreateScreen} />
      <Stack.Screen name="SplitDetail" component={SplitDetailScreen} />
    </Stack.Navigator>
  );
}
