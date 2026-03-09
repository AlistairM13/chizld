import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface ExerciseBottomBarProps {
  count: number;
  onStart: () => void;
  disabled: boolean;
}

/**
 * Bottom bar showing selected exercise count and Start Workout button.
 * Fixed at bottom of ExerciseSelectScreen.
 */
export function ExerciseBottomBar({ count, onStart, disabled }: ExerciseBottomBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.countText}>
        {count} EXERCISE{count !== 1 ? 'S' : ''} SELECTED
      </Text>
      <Pressable
        style={[styles.startButton, disabled && styles.startButtonDisabled]}
        onPress={onStart}
        disabled={disabled}
      >
        <Text style={[styles.startButtonText, disabled && styles.startButtonTextDisabled]}>
          START WORKOUT
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: colors.bg.card,
    borderTopWidth: 1,
    borderTopColor: colors.ember[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  countText: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  startButton: {
    backgroundColor: colors.ember[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  startButtonDisabled: {
    backgroundColor: colors.zone.cold,
  },
  startButtonText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  startButtonTextDisabled: {
    color: colors.text.muted,
  },
});
