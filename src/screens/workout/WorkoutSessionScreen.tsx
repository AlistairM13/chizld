import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  BackHandler,
  Alert,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { type RootStackParamList } from '@/navigation/types';
import { useWorkoutSession, type SetData } from '@/hooks/useWorkoutSession';
import { useTempoVoice, type TempoConfig } from '@/hooks/useTempoVoice';
import { useXPService } from '@/hooks/useXPService';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { TempoToggle } from '@/components/workout/TempoToggle';
import { WeightInput } from '@/components/workout/WeightInput';
import { RepsInput } from '@/components/workout/RepsInput';
import { RPESlider } from '@/components/workout/RPESlider';
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay';
import { XPFloater } from '@/components/workout/XPFloater';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSession'>;

const DEFAULT_TEMPO: TempoConfig = {
  eccentric: 3,
  pauseBottom: 1,
  concentric: 2,
  pauseTop: 0,
};

const DEFAULT_REST_DURATION = 90; // seconds

/**
 * Active workout session screen — focused "one set at a time" layout.
 *
 * Center block dominates: exercise name + set counter + live tempo.
 * Corner indicators: elapsed time (top-left), XP counter (top-right).
 * Edge arrows for exercise navigation.
 * Bottom row: Weight, Reps, RPE inputs.
 * Hidden-by-default completed sets summary.
 */
export function WorkoutSessionScreen({ route, navigation }: Props) {
  const { sessionId, exercises: exerciseIds, zoneId, tempoDefaults, defaultSets } = route.params;

  // Hooks
  const session = useWorkoutSession();
  const tempoVoice = useTempoVoice();
  const xpService = useXPService();
  const elapsedTimer = useElapsedTimer();

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
  const [showCompletedSets, setShowCompletedSets] = useState(false);

  // XP display state
  const [showXPFloater, setShowXPFloater] = useState(false);
  const [lastXPAmount, setLastXPAmount] = useState(0);

  // Input pulse animation
  const inputPulse = useSharedValue(1);
  const inputPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputPulse.value }],
  }));

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

  // Target sets for (X/Y) display — from split defaultSets param
  const currentExerciseId = currentExercise?.id ?? '';
  const targetSets = defaultSets?.[currentExerciseId] ?? null;

  // Get tempo for current exercise (from split defaults or use default)
  const getCurrentTempo = useCallback((): TempoConfig => {
    if (tempoDefaults && currentExercise) {
      const exerciseTempo = tempoDefaults.find(
        (t) => t.exerciseId === currentExercise.id
      );
      if (exerciseTempo) {
        return {
          eccentric: exerciseTempo.tempoEccentric,
          pauseBottom: exerciseTempo.tempoPauseBottom,
          concentric: exerciseTempo.tempoConcentric,
          pauseTop: exerciseTempo.tempoPauseTop,
        };
      }
    }
    return DEFAULT_TEMPO;
  }, [tempoDefaults, currentExercise]);

  // Get static tempo string (e.g. "3-1-2-0") for display when not playing
  const getTempoConfigString = useCallback((): string => {
    const t = getCurrentTempo();
    return `${t.eccentric}-${t.pauseBottom}-${t.concentric}-${t.pauseTop}`;
  }, [getCurrentTempo]);

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
    navigation.replace('SessionSummary', {
      sessionId: session.sessionId!,
      zoneId,
      totalXP: session.getSessionXP(),
    });
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

    // Check if consistency bonus applies (only once per session)
    const consistencyApplies =
      !session.isConsistencyApplied() &&
      (await xpService.getZoneConsistency(zoneId));

    if (consistencyApplies) {
      session.markConsistencyApplied();
    }

    // Calculate XP for this set
    const xpResult = await xpService.awardSetXP({
      zoneId,
      exerciseId: currentExercise.id,
      weightKg: currentSet.weightKg,
      reps: currentSet.reps,
      tempoEnabled,
      sessionId: session.sessionId!,
      applyConsistencyBonus: consistencyApplies,
    });

    // Show XP floater
    setLastXPAmount(xpResult.total);
    setShowXPFloater(true);

    // Save set to database with XP result
    await session.addSet(
      currentExercise.id,
      {
        weightKg: currentSet.weightKg,
        reps: currentSet.reps,
        rpe: currentSet.rpe,
      },
      xpResult
    );

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
      tempoVoice.startTempo(getCurrentTempo());
    }
  };

  /**
   * Called when rest is skipped.
   */
  const handleRestSkip = () => {
    setShowRestTimer(false);
    if (tempoEnabled) {
      tempoVoice.startTempo(getCurrentTempo());
    }
  };

  /**
   * Toggles voice tempo on/off.
   */
  const handleTempoToggle = () => {
    const newEnabled = !tempoEnabled;
    setTempoEnabled(newEnabled);

    if (newEnabled) {
      tempoVoice.startTempo(getCurrentTempo());
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
      if (tempoEnabled) {
        tempoVoice.stopTempo();
      }
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
      if (tempoEnabled) {
        tempoVoice.stopTempo();
      }
    }
  };

  // Restart tempo when exercise changes (if enabled)
  useEffect(() => {
    if (tempoEnabled && currentExercise) {
      tempoVoice.startTempo(getCurrentTempo());
    }
  }, [currentExerciseIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /**
   * Triggers a subtle scale pulse on the input row.
   */
  const triggerInputPulse = () => {
    inputPulse.value = withSequence(
      withTiming(1.05, { duration: 80 }),
      withTiming(1, { duration: 80 })
    );
  };

  /**
   * Handles weight input change with pulse feedback.
   */
  const handleWeightChange = (v: number) => {
    setCurrentSet((s) => ({ ...s, weightKg: v }));
    triggerInputPulse();
  };

  /**
   * Handles reps input change with pulse feedback.
   */
  const handleRepsChange = (v: number) => {
    setCurrentSet((s) => ({ ...s, reps: v }));
    triggerInputPulse();
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

  // Build exercise name display
  const exerciseNameDisplay = currentExercise.name.toUpperCase();
  const setProgressDisplay = targetSets !== null
    ? `(${currentSetNumber}/${targetSets})`
    : `(SET ${currentSetNumber})`;

  // Exercise counter (e.g. "2/4")
  const exerciseCounterDisplay = `${currentExerciseIndex + 1}/${session.exercises.length}`;

  return (
    <View style={styles.container}>
      {/* Top-left corner: Elapsed timer + Quit */}
      <View style={styles.cornerTopLeft}>
        <Text style={styles.elapsedText}>{elapsedTimer.formatted}</Text>
        <Pressable onPress={showExitConfirmation} style={styles.quitButton}>
          <Text style={styles.quitText}>X</Text>
        </Pressable>
      </View>

      {/* Top-right corner: XP counter + Finish */}
      <View style={styles.cornerTopRight}>
        <Pressable onPress={handleFinish} style={styles.finishButton}>
          <Text style={styles.finishText}>FINISH</Text>
        </Pressable>
        <Text style={styles.xpText}>
          XP: {session.getSessionXP().toLocaleString()}
        </Text>
      </View>

      {/* Left edge: Previous exercise arrow */}
      <Pressable
        style={styles.leftArrow}
        onPress={handlePrevExercise}
        disabled={currentExerciseIndex === 0}
      >
        <Text
          style={[
            styles.arrowText,
            currentExerciseIndex === 0 && styles.arrowTextDisabled,
          ]}
        >
          {'<'}
        </Text>
      </Pressable>

      {/* Right edge: Next exercise arrow */}
      <Pressable
        style={styles.rightArrow}
        onPress={handleNextExercise}
        disabled={currentExerciseIndex === session.exercises.length - 1}
      >
        <Text
          style={[
            styles.arrowText,
            currentExerciseIndex === session.exercises.length - 1 &&
              styles.arrowTextDisabled,
          ]}
        >
          {'>'}
        </Text>
      </Pressable>

      {/* XP Floater */}
      <XPFloater
        xp={lastXPAmount}
        visible={showXPFloater}
        onComplete={() => setShowXPFloater(false)}
      />

      {/* CENTER BLOCK — vertically centered, dominates the screen */}
      <View style={styles.centerBlock}>
        {/* Exercise name + set progress */}
        <View style={styles.exerciseNameRow}>
          <Text style={styles.exerciseName}>{exerciseNameDisplay}</Text>
          <Text style={styles.setProgress}>{' '}{setProgressDisplay}</Text>
        </View>

        {/* Exercise position counter */}
        <Text style={styles.exerciseCounter}>{exerciseCounterDisplay}</Text>

        {/* Live tempo display */}
        {tempoEnabled ? (
          tempoVoice.isPlaying && tempoVoice.currentPhase ? (
            <Text style={styles.tempoLive}>
              {tempoVoice.currentPhase} {tempoVoice.countdown}
            </Text>
          ) : (
            <Text style={styles.tempoStatic}>{getTempoConfigString()}</Text>
          )
        ) : (
          <Text style={styles.tempoOff}>TEMPO OFF</Text>
        )}

        {/* Tempo toggle */}
        <View style={styles.tempoToggleWrapper}>
          <TempoToggle
            enabled={tempoEnabled}
            onToggle={handleTempoToggle}
            isPlaying={tempoVoice.isPlaying}
          />
        </View>

        {/* Completed sets summary */}
        <Pressable
          style={styles.completedSummary}
          onPress={() => setShowCompletedSets((v) => !v)}
        >
          <Text style={styles.completedSummaryText}>
            {completedSets.length === 0
              ? 'no sets complete'
              : `${completedSets.length} set${completedSets.length === 1 ? '' : 's'} complete`}
            {completedSets.length > 0 ? (showCompletedSets ? '  ▲' : '  ▼') : ''}
          </Text>

          {showCompletedSets && completedSets.length > 0 && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
              {completedSets.map((set: SetData, index: number) => (
                <Text key={index} style={styles.completedSetRow}>
                  #{set.setNumber}{'  '}{set.weightKg.toFixed(1)}kg × {set.reps} reps @ RPE {set.rpe}
                </Text>
              ))}
            </Animated.View>
          )}
        </Pressable>
      </View>

      {/* Bottom input row */}
      <Animated.View style={[styles.inputRow, inputPulseStyle]}>
        <View style={styles.inputColumn}>
          <Text style={styles.inputLabel}>WEIGHT</Text>
          <WeightInput
            value={currentSet.weightKg}
            onChange={handleWeightChange}
            step={2.5}
            min={0}
            max={500}
          />
        </View>

        <View style={styles.inputColumn}>
          <RepsInput
            value={currentSet.reps}
            onChange={handleRepsChange}
          />
        </View>

        <View style={styles.inputColumn}>
          <Text style={styles.inputLabel}>RPE</Text>
          <RPESlider
            value={currentSet.rpe}
            onChange={(v) => setCurrentSet((s) => ({ ...s, rpe: v }))}
          />
        </View>
      </Animated.View>

      {/* Full-width COMPLETE SET button */}
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

      {/* Rest timer overlay */}
      {showRestTimer && (
        <Animated.View
          key="rest-view"
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(400)}
          style={StyleSheet.absoluteFill}
        >
          <RestTimerOverlay
            duration={DEFAULT_REST_DURATION}
            onComplete={handleRestComplete}
            onSkip={handleRestSkip}
          />
        </Animated.View>
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

  // Corner indicators
  cornerTopLeft: {
    position: 'absolute',
    top: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  elapsedText: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.muted,
  },
  quitButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quitText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.text.muted,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  finishButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  finishText: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.ember[500],
    letterSpacing: 1,
  },
  xpText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ember[500],
  },

  // Edge arrows
  leftArrow: {
    position: 'absolute',
    left: 8,
    top: '40%',
    zIndex: 10,
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  rightArrow: {
    position: 'absolute',
    right: 8,
    top: '40%',
    zIndex: 10,
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  arrowText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ember[500],
  },
  arrowTextDisabled: {
    color: colors.text.muted,
  },

  // Center block
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48, // room for edge arrows
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  setProgress: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.muted,
  },
  exerciseCounter: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 24,
  },
  tempoLive: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.ember[500],
    letterSpacing: 2,
    marginBottom: 16,
  },
  tempoStatic: {
    fontFamily: fonts.mono,
    fontSize: 32,
    color: colors.ember[700],
    letterSpacing: 2,
    marginBottom: 16,
  },
  tempoOff: {
    fontFamily: fonts.monoLight,
    fontSize: 16,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 16,
  },
  tempoToggleWrapper: {
    marginBottom: 24,
  },

  // Completed sets summary
  completedSummary: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  completedSummaryText: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.muted,
  },
  completedSetRow: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Bottom input row
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  inputColumn: {
    alignItems: 'center',
  },
  inputLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },

  // Complete set button
  completeButton: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
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
