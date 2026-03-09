import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { type Exercise } from '@/hooks/useExercises';

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  onToggle: () => void;
}

/**
 * Exercise list item with selection state.
 * Displays exercise name and optional equipment.
 * Cyberpunk aesthetic with sharp corners and ember accents.
 */
export function ExerciseCard({ exercise, isSelected, onToggle }: ExerciseCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Pressable
      style={[
        styles.container,
        isSelected ? styles.containerSelected : styles.containerUnselected,
      ]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{exercise.name}</Text>
        {exercise.equipment && (
          <Text style={styles.equipment}>{exercise.equipment}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 8,
  },
  containerSelected: {
    backgroundColor: 'rgba(255, 140, 26, 0.1)',
    borderColor: colors.ember[500],
    borderLeftWidth: 2,
  },
  containerUnselected: {
    backgroundColor: colors.bg.card,
    borderColor: colors.zone.cold,
  },
  content: {
    flexDirection: 'column',
    gap: 2,
  },
  name: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.text.primary,
  },
  equipment: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
