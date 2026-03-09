import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface RPESelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

const RPE_VALUES = [6, 7, 8, 9, 10] as const;

/**
 * RPE (Rate of Perceived Exertion) selector with 6-10 buttons.
 * Cyberpunk aesthetic with ember accent on selection.
 */
export function RPESelector({ value, onChange }: RPESelectorProps) {
  const handlePress = (rpe: number) => {
    Haptics.selectionAsync();
    onChange(rpe);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>RPE</Text>
      <View style={styles.buttonRow}>
        {RPE_VALUES.map((rpe) => {
          const isSelected = value === rpe;
          return (
            <Pressable
              key={rpe}
              style={[
                styles.button,
                isSelected ? styles.buttonSelected : styles.buttonUnselected,
              ]}
              onPress={() => handlePress(rpe)}
            >
              <Text
                style={[
                  styles.buttonText,
                  isSelected ? styles.buttonTextSelected : styles.buttonTextUnselected,
                ]}
              >
                {rpe}
              </Text>
            </Pressable>
          );
        })}
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
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonSelected: {
    backgroundColor: colors.ember[500],
    borderColor: colors.ember[500],
  },
  buttonUnselected: {
    backgroundColor: colors.bg.card,
    borderColor: colors.ember[700],
  },
  buttonText: {
    fontFamily: fonts.mono,
    fontSize: 18,
  },
  buttonTextSelected: {
    color: '#FFFFFF',
  },
  buttonTextUnselected: {
    color: colors.ember[500],
  },
});
