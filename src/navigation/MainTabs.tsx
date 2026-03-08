import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CharacterScreen } from '../screens/character/CharacterScreen';
import { WorkoutListScreen } from '../screens/workout/WorkoutListScreen';
import { SleepDashboardScreen } from '../screens/sleep/SleepDashboardScreen';
import { DailyViewScreen } from '../screens/diet/DailyViewScreen';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { type MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.primary,
          borderTopColor: colors.zone.cold,
          borderTopWidth: 1,
          height: 52,
        },
        tabBarActiveTintColor: colors.ember[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.heading,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={CharacterScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="human" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Train"
        component={WorkoutListScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dumbbell" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sleep"
        component={SleepDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="moon-waning-crescent" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Fuel"
        component={DailyViewScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="fire" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
