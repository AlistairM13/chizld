import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { type RootStackParamList } from '@/navigation/types';
import { useWorkoutSession, type SetData } from '@/hooks/useWorkoutSession';
import { useTempoVoice, type TempoConfig } from '@/hooks/useTempoVoice';
import { SessionHeader } from '@/components/workout/SessionHeader';
import { TempoToggle } from '@/components/workout/TempoToggle';
import { WeightInput } from '@/components/workout/WeightInput';
import { RepsInput } from '@/components/workout/RepsInput';
import { RPESelector } from '@/components/workout/RPESelector';
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSession'>;

const DEFAULT_TEMPO: TempoConfig = {
  eccentric: 3,
  pauseBottom: 1,
  concentric: 2,
  pauseTop: 0,
};

const DEFAULT_REST_DURATION = 90; // seconds

/**
 * Active workout session screen.
 * Displays current exercise, set logging inputs, and rest timer.
 */
export function WorkoutSessionScreen({ route, navigation }: Props) {
  const { sessionId, exercises: exerciseIds } = route.params;

  // Hooks
  const session = useWorkoutSession();
  const tempoVoice = useTempoVoice();

  // State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState({
    weightKg: 0,
    reps: 0,
    rpe: null as number | null,
  });
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [tempoEnabled, setTempoEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      await session.createSession(exerciseIds);
      setIsInitialized(true);
    };
    initSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Current exercise data
  const currentExercise = session.exercises[currentExerciseIndex];
  const completedSets = currentExercise?.sets || [];
  const currentSetNumber = completedSets.length + 1;

  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        showExitConfirmation();
        return true; // Prevent default behavior
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * Shows confirmation dialog before exiting session.
   */
  const showExitConfirmation = () => {
    Alert.alert(
      'Exit Workout?',
      'Progress is saved but session will end.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: handleExit,
        },
      ]
    );
  };

  /**
   * Completes session and navigates back.
   */
  const handleExit = async () => {
    tempoVoice.stopTempo();
    await session.completeSession();
    navigation.goBack();
  };

  /**
   * Completes session and navigates to summary.
   */
  const handleFinish = async () => {
    tempoVoice.stopTempo();
    await session.completeSession();
    navigation.replace('SessionSummary', { sessionId: session.sessionId! });
  };

  /**
   * Logs the current set and shows rest timer.
   */
  const handleCompleteSet = async () => {
    if (!currentExercise || currentSet.rpe === null) return;

    // Stop tempo if playing
    if (tempoEnabled) {
      tempoVoice.stopTempo();
    }

    // Save set to database
    await session.addSet(currentExercise.id, {
      weightKg: currentSet.weightKg,
      reps: currentSet.reps,
      rpe: currentSet.rpe,
    });

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show rest timer
    setShowRestTimer(true);

    // Reset for next set
    setCurrentSet({
      weightKg: currentSet.weightKg, // Keep weight
      reps: 0,
      rpe: null,
    });
  };

  /**
   * Called when rest timer completes.
   */
  const handleRestComplete = () => {
    setShowRestTimer(false);
    if (tempoEnabled) {
      tempoVoice.startTempo(DEFAULT_TEMPO);
    }
  };

  /**
   * Called when rest is skipped.
   */
  const handleRestSkip = () => {
    setShowRestTimer(false);
    if (tempoEnabled) {
      tempoVoice.startTempo(DEFAULT_TEMPO);
    }
  };

  /**
   * Toggles voice tempo on/off.
   */
  const handleTempoToggle = () => {
    const newEnabled = !tempoEnabled;
    setTempoEnabled(newEnabled);

    if (newEnabled) {
      tempoVoice.startTempo(DEFAULT_TEMPO);
    } else {
      tempoVoice.stopTempo();
    }
  };

  /**
   * Navigates to previous exercise.
   */
  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      Haptics.selectionAsync();
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      resetCurrentSet();
    }
  };

  /**
   * Navigates to next exercise.
   */
  const handleNextExercise = () => {
    if (currentExerciseIndex < session.exercises.length - 1) {
      Haptics.selectionAsync();
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetCurrentSet();
    }
  };

  /**
   * Resets current set inputs.
   */
  const resetCurrentSet = () => {
    setCurrentSet({
      weightKg: 0,
      reps: 0,
      rpe: null,
    });
  };

  // Validation
  const canCompleteSet =
    currentSet.weightKg > 0 && currentSet.reps > 0 && currentSet.rpe !== null;

  // Loading state
  if (!isInitialized || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>INITIALIZING SESSION...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SessionHeader
        exerciseName={currentExercise.name}
        currentSet={currentSetNumber}
        totalSets={completedSets.length + 1}
        onFinish={handleFinish}
      />

      {/* Controls row */}
      <View style={styles.controlsRow}>
        <TempoToggle
          enabled={tempoEnabled}
          onToggle={handleTempoToggle}
          isPlaying={tempoVoice.isPlaying}
        />

        {/* Exercise navigation */}
        <View style={styles.exerciseNav}>
          <Pressable
            style={[
              styles.navButton,
              currentExerciseIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevExercise}
            disabled={currentExerciseIndex === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                currentExerciseIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              PREV
            </Text>
          </Pressable>

          <Text style={styles.exerciseCounter}>
            {currentExerciseIndex + 1}/{session.exercises.length}
          </Text>

          <Pressable
            style={[
              styles.navButton,
              currentExerciseIndex === session.exercises.length - 1 &&
                styles.navButtonDisabled,
            ]}
            onPress={handleNextExercise}
            disabled={currentExerciseIndex === session.exercises.length - 1}
          >
            <Text
              style={[
                styles.navButtonText,
                currentExerciseIndex === session.exercises.length - 1 &&
                  styles.navButtonTextDisabled,
              ]}
            >
              NEXT
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main content */}
      <ScrollView style={styles.scrollContent}>
        {/* Completed sets (read-only) */}
        {completedSets.map((set: SetData, index: number) => (
          <View key={index} style={styles.completedSetRow}>
            <Text style={styles.completedSetNumber}>#{set.setNumber}</Text>
            <Text style={styles.completedSetText}>
              {set.weightKg.toFixed(1)} kg
            </Text>
            <Text style={styles.completedSetSeparator}>x</Text>
            <Text style={styles.completedSetText}>{set.reps} reps</Text>
            <Text style={styles.completedSetSeparator}>@</Text>
            <Text style={styles.completedSetText}>RPE {set.rpe}</Text>
          </View>
        ))}

        {/* Current set input */}
        <View style={styles.currentSetSection}>
          <Text style={styles.currentSetLabel}>SET #{currentSetNumber}</Text>

          <View style={styles.inputGrid}>
            {/* Weight */}
            <View style={styles.inputColumn}>
              <Text style={styles.inputLabel}>WEIGHT</Text>
              <WeightInput
                value={currentSet.weightKg}
                onChange={(v) => setCurrentSet((s) => ({ ...s, weightKg: v }))}
                step={2.5}
                min={0}
                max={500}
              />
            </View>

            {/* Reps */}
            <View style={styles.inputColumn}>
              <RepsInput
                value={currentSet.reps}
                onChange={(v) => setCurrentSet((s) => ({ ...s, reps: v }))}
              />
            </View>

            {/* RPE */}
            <View style={styles.inputColumn}>
              <RPESelector
                value={currentSet.rpe}
                onChange={(v) => setCurrentSet((s) => ({ ...s, rpe: v }))}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Complete set button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[
            styles.completeButton,
            canCompleteSet
              ? styles.completeButtonEnabled
              : styles.completeButtonDisabled,
          ]}
          onPress={handleCompleteSet}
          disabled={!canCompleteSet}
        >
          <Text
            style={[
              styles.completeButtonText,
              canCompleteSet
                ? styles.completeButtonTextEnabled
                : styles.completeButtonTextDisabled,
            ]}
          >
            COMPLETE SET
          </Text>
        </Pressable>
      </View>

      {/* Rest timer overlay */}
      {showRestTimer && (
        <RestTimerOverlay
          duration={DEFAULT_REST_DURATION}
          onComplete={handleRestComplete}
          onSkip={handleRestSkip}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  loadingText: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 100,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  exerciseNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
  },
  navButtonDisabled: {
    borderColor: colors.zone.cold,
  },
  navButtonText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.ember[500],
    letterSpacing: 1,
  },
  navButtonTextDisabled: {
    color: colors.text.muted,
  },
  exerciseCounter: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.secondary,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  completedSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    opacity: 0.6,
    borderWidth: 1,
    borderColor: colors.success,
  },
  completedSetNumber: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.muted,
    marginRight: 12,
  },
  completedSetText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.secondary,
  },
  completedSetSeparator: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.muted,
    marginHorizontal: 8,
  },
  currentSetSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.zone.cold,
  },
  currentSetLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ember[500],
    letterSpacing: 2,
    marginBottom: 16,
  },
  inputGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    flexWrap: 'wrap',
  },
  inputColumn: {
    minWidth: 120,
  },
  inputLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.zone.cold,
    backgroundColor: colors.bg.card,
  },
  completeButton: {
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  completeButtonEnabled: {
    backgroundColor: colors.ember[500],
  },
  completeButtonDisabled: {
    backgroundColor: colors.zone.cold,
  },
  completeButtonText: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 2,
  },
  completeButtonTextEnabled: {
    color: '#FFFFFF',
  },
  completeButtonTextDisabled: {
    color: colors.text.muted,
  },
});
