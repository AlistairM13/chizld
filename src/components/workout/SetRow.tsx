import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { WeightInput } from './WeightInput';
import { RPESelector } from './RPESelector';
import { RepsInput } from './RepsInput';

interface SetRowProps {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number | null;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onRpeChange: (value: number) => void;
  onComplete: () => void;
  isCompleted: boolean;
}

/**
 * Row for logging a single set: weight, reps, RPE, and complete button.
 * Cyberpunk aesthetic with ember accents.
 */
export function SetRow({
  setNumber,
  weightKg,
  reps,
  rpe,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onComplete,
  isCompleted,
}: SetRowProps) {
  const canComplete = weightKg > 0 && reps > 0 && rpe !== null;

  return (
    <View style={[styles.container, isCompleted && styles.containerCompleted]}>
      {/* Set number label */}
      <Text style={[styles.setLabel, isCompleted && styles.textCompleted]}>
        #{setNumber}
      </Text>

      {/* Weight input */}
      <View style={styles.inputSection}>
        <WeightInput
          value={weightKg}
          onChange={onWeightChange}
          step={2.5}
          min={0}
          max={500}
        />
      </View>

      {/* Reps input */}
      <View style={styles.inputSection}>
        <RepsInput value={reps} onChange={onRepsChange} />
      </View>

      {/* RPE selector */}
      <View style={styles.rpeSection}>
        <RPESelector value={rpe} onChange={onRpeChange} />
      </View>

      {/* Complete button */}
      <Pressable
        style={[
          styles.completeButton,
          canComplete && !isCompleted
            ? styles.completeButtonEnabled
            : styles.completeButtonDisabled,
          isCompleted && styles.completeButtonDone,
        ]}
        onPress={onComplete}
        disabled={!canComplete || isCompleted}
      >
        <Text
          style={[
            styles.completeButtonText,
            canComplete && !isCompleted
              ? styles.completeButtonTextEnabled
              : styles.completeButtonTextDisabled,
          ]}
        >
          {isCompleted ? 'DONE' : 'LOG'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.zone.cold,
  },
  containerCompleted: {
    opacity: 0.5,
    borderColor: colors.success,
  },
  setLabel: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.secondary,
    minWidth: 28,
  },
  textCompleted: {
    color: colors.text.muted,
  },
  inputSection: {
    flex: 0,
  },
  rpeSection: {
    flex: 1,
  },
  completeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  completeButtonEnabled: {
    backgroundColor: colors.ember[500],
  },
  completeButtonDisabled: {
    backgroundColor: colors.zone.cold,
  },
  completeButtonDone: {
    backgroundColor: colors.success,
  },
  completeButtonText: {
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 1,
  },
  completeButtonTextEnabled: {
    color: '#FFFFFF',
  },
  completeButtonTextDisabled: {
    color: colors.text.muted,
  },
});
