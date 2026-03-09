import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface RepsInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

/**
 * Reps input with +/- stepper buttons.
 * Simpler than WeightInput - steppers only, no number pad.
 */
export function RepsInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100,
}: RepsInputProps) {
  const handleDecrement = () => {
    Haptics.selectionAsync();
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    Haptics.selectionAsync();
    onChange(Math.min(max, value + step));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>REPS</Text>
      <View style={styles.row}>
        <Pressable style={styles.stepperButton} onPress={handleDecrement}>
          <Text style={styles.stepperText}>-</Text>
        </Pressable>

        <View style={styles.valueDisplay}>
          <Text style={styles.valueText}>{value}</Text>
        </View>

        <Pressable style={styles.stepperButton} onPress={handleIncrement}>
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperButton: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.ember[500],
  },
  valueDisplay: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 48,
    alignItems: 'center',
  },
  valueText: {
    fontFamily: fonts.mono,
    fontSize: 22,
    color: colors.text.primary,
  },
});
