import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { WorkoutSplit } from '@/types';

interface SplitCardProps {
  split: WorkoutSplit;
  onPress: () => void;
}

/**
 * Split list item with name, exercise count, and navigation indicator.
 * Cyberpunk aesthetic with cold border and ember accent.
 */
export function SplitCard({ split, onPress }: SplitCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const exerciseLabel = split.exerciseCount === 1 ? 'EXERCISE' : 'EXERCISES';

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={styles.name}>{split.name}</Text>
        <Text style={styles.count}>
          {split.exerciseCount} {exerciseLabel}
        </Text>
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    backgroundColor: colors.bg.card,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  name: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.text.primary,
  },
  count: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  chevron: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.ember[500],
  },
});
