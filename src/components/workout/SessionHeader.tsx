import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface SessionHeaderProps {
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  onFinish: () => void;
}

/**
 * Header bar for workout session showing current exercise and finish button.
 * Cyberpunk aesthetic with ember accent border.
 */
export function SessionHeader({
  exerciseName,
  currentSet,
  totalSets,
  onFinish,
}: SessionHeaderProps) {
  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFinish();
  };

  return (
    <View style={styles.container}>
      {/* Exercise name */}
      <Text style={styles.exerciseName} numberOfLines={1}>
        {exerciseName}
      </Text>

      {/* Set counter */}
      <View style={styles.setCounter}>
        <Text style={styles.setCounterText}>
          SET {currentSet}/{totalSets}
        </Text>
      </View>

      {/* Finish button */}
      <Pressable style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>FINISH</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ember[700],
  },
  exerciseName: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text.primary,
  },
  setCounter: {
    marginHorizontal: 16,
  },
  setCounterText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  finishButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  finishButtonText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.ember[500],
    letterSpacing: 1,
  },
});
