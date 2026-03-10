import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface Tempo {
  eccentric: number;
  pauseBottom: number;
  concentric: number;
  pauseTop: number;
}

interface SplitExerciseRowProps {
  exerciseName: string;
  zoneName: string;
  sets: number;
  reps: number;
  tempo: Tempo;
  onSetsChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onTempoChange: (tempo: Tempo) => void;
  onRemove: () => void;
}

const SETS_MIN = 1;
const SETS_MAX = 10;
const REPS_MIN = 1;
const REPS_MAX = 30;
const TEMPO_MIN = 0;
const TEMPO_MAX = 10;

/**
 * Exercise row with editable sets/reps steppers and remove button.
 * Used in SplitCreateScreen to configure selected exercises.
 */
export function SplitExerciseRow({
  exerciseName,
  zoneName,
  sets,
  reps,
  tempo,
  onSetsChange,
  onRepsChange,
  onTempoChange,
  onRemove,
}: SplitExerciseRowProps) {
  const handleSetsDecrement = () => {
    Haptics.selectionAsync();
    onSetsChange(Math.max(SETS_MIN, sets - 1));
  };

  const handleSetsIncrement = () => {
    Haptics.selectionAsync();
    onSetsChange(Math.min(SETS_MAX, sets + 1));
  };

  const handleRepsDecrement = () => {
    Haptics.selectionAsync();
    onRepsChange(Math.max(REPS_MIN, reps - 1));
  };

  const handleRepsIncrement = () => {
    Haptics.selectionAsync();
    onRepsChange(Math.min(REPS_MAX, reps + 1));
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove();
  };

  const handleTempoChange = (key: keyof Tempo, delta: number) => {
    Haptics.selectionAsync();
    const newValue = Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, tempo[key] + delta));
    onTempoChange({ ...tempo, [key]: newValue });
  };

  return (
    <View style={styles.container}>
      {/* Content area */}
      <View style={styles.contentArea}>
        {/* Top row: Exercise info + sets/reps */}
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exerciseName}
            </Text>
            <Text style={styles.zoneName}>{zoneName.toUpperCase()}</Text>
          </View>

          <View style={styles.steppersSection}>
            {/* Sets stepper */}
            <View style={styles.stepperGroup}>
              <Text style={styles.stepperLabel}>SETS</Text>
              <View style={styles.stepperRow}>
                <Pressable style={styles.stepperButton} onPress={handleSetsDecrement}>
                  <Text style={styles.stepperButtonText}>-</Text>
                </Pressable>
                <View style={styles.valueDisplay}>
                  <Text style={styles.valueText}>{sets}</Text>
                </View>
                <Pressable style={styles.stepperButton} onPress={handleSetsIncrement}>
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Reps stepper */}
            <View style={styles.stepperGroup}>
              <Text style={styles.stepperLabel}>REPS</Text>
              <View style={styles.stepperRow}>
                <Pressable style={styles.stepperButton} onPress={handleRepsDecrement}>
                  <Text style={styles.stepperButtonText}>-</Text>
                </Pressable>
                <View style={styles.valueDisplay}>
                  <Text style={styles.valueText}>{reps}</Text>
                </View>
                <Pressable style={styles.stepperButton} onPress={handleRepsIncrement}>
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom row: Tempo controls */}
        <View style={styles.tempoRow}>
          <Text style={styles.tempoLabel}>TEMPO</Text>
          <View style={styles.tempoControls}>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('eccentric', -1)}
            >
              <Text style={styles.tempoButtonText}>-</Text>
            </Pressable>
            <Text style={styles.tempoValue}>{tempo.eccentric}</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('eccentric', 1)}
            >
              <Text style={styles.tempoButtonText}>+</Text>
            </Pressable>
            <Text style={styles.tempoDash}>-</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('pauseBottom', -1)}
            >
              <Text style={styles.tempoButtonText}>-</Text>
            </Pressable>
            <Text style={styles.tempoValue}>{tempo.pauseBottom}</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('pauseBottom', 1)}
            >
              <Text style={styles.tempoButtonText}>+</Text>
            </Pressable>
            <Text style={styles.tempoDash}>-</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('concentric', -1)}
            >
              <Text style={styles.tempoButtonText}>-</Text>
            </Pressable>
            <Text style={styles.tempoValue}>{tempo.concentric}</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('concentric', 1)}
            >
              <Text style={styles.tempoButtonText}>+</Text>
            </Pressable>
            <Text style={styles.tempoDash}>-</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('pauseTop', -1)}
            >
              <Text style={styles.tempoButtonText}>-</Text>
            </Pressable>
            <Text style={styles.tempoValue}>{tempo.pauseTop}</Text>
            <Pressable
              style={styles.tempoButton}
              onPress={() => handleTempoChange('pauseTop', 1)}
            >
              <Text style={styles.tempoButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Remove button - spans full height */}
      <Pressable style={styles.removeButton} onPress={handleRemove}>
        <Text style={styles.removeButtonText}>X</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
    marginBottom: 8,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.primary,
  },
  zoneName: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  steppersSection: {
    flexDirection: 'row',
    gap: 16,
  },
  stepperGroup: {
    alignItems: 'center',
  },
  stepperLabel: {
    fontFamily: fonts.monoLight,
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stepperButton: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.card,
  },
  stepperButtonText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.ember[500],
  },
  valueDisplay: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.primary,
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.zone.cold,
  },
  tempoLabel: {
    fontFamily: fonts.monoLight,
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  tempoControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempoButton: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.card,
  },
  tempoButtonText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ember[500],
  },
  tempoValue: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.primary,
    width: 16,
    textAlign: 'center',
  },
  tempoDash: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.muted,
    marginHorizontal: 4,
  },
  removeButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.zone.cold,
  },
  removeButtonText: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.ember[500],
  },
});
