import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface WeightInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

const NUM_PAD_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '.', '0', 'Done',
];

/**
 * Weight input with number pad and +/- stepper buttons.
 * Cyberpunk aesthetic with ember accents.
 */
export function WeightInput({
  value,
  onChange,
  step = 2.5,
  min = 0,
  max = 500,
}: WeightInputProps) {
  const [showNumPad, setShowNumPad] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleDecrement = () => {
    Haptics.selectionAsync();
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    Haptics.selectionAsync();
    onChange(Math.min(max, value + step));
  };

  const handleValuePress = () => {
    Haptics.selectionAsync();
    setInputValue(value.toString());
    setShowNumPad(true);
  };

  const handleNumPadKey = (key: string) => {
    Haptics.selectionAsync();

    if (key === 'Done') {
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        const clamped = Math.min(max, Math.max(min, parsed));
        onChange(clamped);
      }
      setShowNumPad(false);
      setInputValue('');
      return;
    }

    if (key === '.') {
      // Only add decimal if not already present
      if (!inputValue.includes('.')) {
        setInputValue((prev) => prev + '.');
      }
      return;
    }

    // Limit to reasonable length
    if (inputValue.length < 6) {
      setInputValue((prev) => prev + key);
    }
  };

  const handleClear = () => {
    Haptics.selectionAsync();
    setInputValue('');
  };

  return (
    <View style={styles.container}>
      {/* Main row: stepper - value - stepper */}
      <View style={styles.mainRow}>
        <Pressable style={styles.stepperButton} onPress={handleDecrement}>
          <Text style={styles.stepperText}>-{step}</Text>
        </Pressable>

        <Pressable style={styles.valueDisplay} onPress={handleValuePress}>
          <Text style={styles.valueText}>
            {showNumPad ? inputValue || '0' : value.toFixed(1)}
          </Text>
          <Text style={styles.unitText}>kg</Text>
        </Pressable>

        <Pressable style={styles.stepperButton} onPress={handleIncrement}>
          <Text style={styles.stepperText}>+{step}</Text>
        </Pressable>
      </View>

      {/* Number pad overlay */}
      {showNumPad && (
        <View style={styles.numPadContainer}>
          <View style={styles.numPadHeader}>
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>CLEAR</Text>
            </Pressable>
          </View>
          <View style={styles.numPadGrid}>
            {NUM_PAD_KEYS.map((key) => (
              <Pressable
                key={key}
                style={[
                  styles.numPadKey,
                  key === 'Done' && styles.numPadKeyDone,
                ]}
                onPress={() => handleNumPadKey(key)}
              >
                <Text
                  style={[
                    styles.numPadKeyText,
                    key === 'Done' && styles.numPadKeyTextDone,
                  ]}
                >
                  {key}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  stepperText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ember[500],
  },
  valueDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: fonts.mono,
    fontSize: 28,
    color: colors.text.primary,
  },
  unitText: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    marginLeft: 4,
  },
  numPadContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
    padding: 8,
    zIndex: 10,
  },
  numPadHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  numPadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  numPadKey: {
    width: '31%',
    aspectRatio: 1.8,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.ember[700],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numPadKeyDone: {
    backgroundColor: colors.ember[500],
    borderColor: colors.ember[500],
  },
  numPadKeyText: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.text.primary,
  },
  numPadKeyTextDone: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
