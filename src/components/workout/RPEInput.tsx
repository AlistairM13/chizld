import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface RPEInputProps {
  value: number | null;
  onChange: (value: number) => void;
}

const RPE_MIN = 6;
const RPE_MAX = 10;

/**
 * RPE input with +/- stepper buttons.
 * Range is 6-10, matching standard RPE scale for lifting.
 */
export function RPEInput({ value, onChange }: RPEInputProps) {
  const displayValue = value ?? RPE_MIN;

  const handleDecrement = () => {
    Haptics.selectionAsync();
    const newValue = Math.max(RPE_MIN, displayValue - 1);
    onChange(newValue);
  };

  const handleIncrement = () => {
    Haptics.selectionAsync();
    const newValue = Math.min(RPE_MAX, displayValue + 1);
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable style={styles.stepperButton} onPress={handleDecrement}>
          <Text style={styles.stepperText}>-</Text>
        </Pressable>

        <View style={styles.valueDisplay}>
          <Text style={styles.valueText}>{value ?? '-'}</Text>
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
