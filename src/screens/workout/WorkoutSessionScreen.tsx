import { ScreenBackground } from '@/components/common/ScreenBackground';
import { RepsInput } from '@/components/workout/RepsInput';
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay';
import { RPEInput } from '@/components/workout/RPEInput';
import { TempoToggle } from '@/components/workout/TempoToggle';
import { WeightInput } from '@/components/workout/WeightInput';
import { XPFloater } from '@/components/workout/XPFloater';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { useTempoVoice, type TempoConfig } from '@/hooks/useTempoVoice';
import { useWorkoutSession, type SetData } from '@/hooks/useWorkoutSession';
import { useXPService } from '@/hooks/useXPService';
import { type RootStackParamList } from '@/navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

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
  // Removed showCompletedSets - always visible in new layout

  // XP display state
  const [showXPFloater, setShowXPFloater] = useState(false);
  const [lastXPAmount, setLastXPAmount] = useState(0);


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
   * Handles weight input change.
   */
  const handleWeightChange = (v: number) => {
    setCurrentSet((s) => ({ ...s, weightKg: v }));
  };

  /**
   * Handles reps input change.
   */
  const handleRepsChange = (v: number) => {
    setCurrentSet((s) => ({ ...s, reps: v }));
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

  // Build exercise name display with position like "(1/3)"
  const exercisePosition = `(${currentExerciseIndex + 1}/${session.exercises.length})`;
  const exerciseNameDisplay = `${currentExercise.name.toUpperCase()} ${exercisePosition}`;
  const exerciseProgressDisplay = `${currentExerciseIndex + 1}/${session.exercises.length} EXERCISE PROGRESS`;
  const setDisplay = `SET #${currentSetNumber}`;

  // Calculate total volume for footer
  const totalVolume = completedSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
  const totalSetsCompleted = completedSets.length;

  return (
    <ScreenBackground>
      {/* XP Floater */}
      <XPFloater
        xp={lastXPAmount}
        visible={showXPFloater}
        onComplete={() => setShowXPFloater(false)}
      />

      {/* Top header bar: Close + time left, FINISH + XP right */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderLeft}>
          <Pressable onPress={showExitConfirmation} hitSlop={8}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
          <Text style={styles.elapsedTime}>{elapsedTimer.formatted}</Text>
        </View>
        <View style={styles.topHeaderRight}>
          <Pressable onPress={handleFinish} style={styles.finishButton}>
            <Text style={styles.finishText}>FINISH</Text>
          </Pressable>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>
              XP: {session.getSessionXP().toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Main two-column layout */}
      <View style={styles.mainContent}>
        {/* LEFT COLUMN: Exercise info, tempo, completed sets */}
        <View style={styles.leftColumn}>
          {/* Exercise name with inline navigation */}
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseNavRow}>
              <Pressable
                onPress={handlePrevExercise}
                disabled={currentExerciseIndex === 0}
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.inlineArrow,
                    currentExerciseIndex === 0 && styles.inlineArrowDisabled,
                  ]}
                >
                  {'<'}
                </Text>
              </Pressable>
              <Text style={styles.exerciseName}>{exerciseNameDisplay}</Text>
              <Pressable
                onPress={handleNextExercise}
                disabled={currentExerciseIndex === session.exercises.length - 1}
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.inlineArrow,
                    currentExerciseIndex === session.exercises.length - 1 &&
                      styles.inlineArrowDisabled,
                  ]}
                >
                  {'>'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.exerciseProgress}>{exerciseProgressDisplay}</Text>
          </View>

          {/* Large tempo display */}
          <View style={styles.tempoArea}>
            {tempoEnabled ? (
              tempoVoice.isPlaying && tempoVoice.currentPhase ? (
                <View style={styles.tempoLiveRow}>
                  <Text
                    style={[
                      styles.tempoPhase,
                      tempoVoice.currentPhase === 'UP'
                        ? styles.tempoPhaseUp
                        : styles.tempoPhaseDown,
                    ]}
                  >
                    {tempoVoice.currentPhase}
                  </Text>
                  <Text style={styles.tempoCountdown}>{tempoVoice.countdown}</Text>
                </View>
              ) : (
                <Text style={styles.tempoStatic}>{getTempoConfigString()}</Text>
              )
            ) : (
              <Text style={styles.tempoOff}>TEMPO OFF</Text>
            )}
          </View>

          {/* Completed sets section */}
          <View style={styles.completedSetsSection}>
            <Text style={styles.completedSetsLabel}>COMPLETED SETS</Text>
            {completedSets.length === 0 ? (
              <Text style={styles.noSetsText}>No sets yet</Text>
            ) : (
              completedSets.map((set: SetData, index: number) => (
                <View key={index} style={styles.completedSetRow}>
                  <Text style={styles.setNumber}>#{set.setNumber}</Text>
                  <Text style={styles.setWeight}>{set.weightKg.toFixed(0)}kg</Text>
                  <Text style={styles.setReps}>
                    <Text style={styles.setRepsX}>×</Text> {set.reps}
                  </Text>
                  <Text style={styles.setRpeLabel}>RPE</Text>
                  <Text style={styles.setRpeValue}>{set.rpe}</Text>
                </View>
              ))
            )}
          </View>

          {/* Footer stats */}
          <View style={styles.footerStats}>
            <Text style={styles.footerText}>
              VOLUME: {totalVolume.toFixed(0)} KG  •  SETS: {totalSetsCompleted}
            </Text>
          </View>
        </View>

        {/* RIGHT COLUMN: Set label + Input cards row */}
        <View style={styles.rightColumn}>
          {/* SET #N label above cards */}
          <View style={styles.setDisplayBox}>
            <Text style={styles.setDisplayText}>{setDisplay}</Text>
          </View>

          {/* Input cards row: Weight, Reps, RPE */}
          <View style={styles.inputCardsRow}>
            {/* Weight card */}
            <View style={[styles.inputCard, styles.inputCardWeight]}>
              <Text style={styles.inputCardLabel}>WEIGHT</Text>
              <View style={styles.inputCardValueRow}>
                <Text style={styles.inputCardValue}>
                  {currentSet.weightKg.toFixed(1)}
                </Text>
                <Text style={styles.inputCardUnit}>kg</Text>
              </View>
              <View style={styles.inputCardButtons}>
                <Pressable
                  style={styles.inputCardBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    handleWeightChange(Math.max(0, currentSet.weightKg - 2.5));
                  }}
                >
                  <Text style={styles.inputCardBtnText}>-2.5</Text>
                </Pressable>
                <Pressable
                  style={styles.inputCardBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    handleWeightChange(Math.min(500, currentSet.weightKg + 2.5));
                  }}
                >
                  <Text style={styles.inputCardBtnText}>+2.5</Text>
                </Pressable>
              </View>
            </View>

            {/* Reps card */}
            <View style={styles.inputCard}>
              <Text style={styles.inputCardLabel}>REPS</Text>
              <Text style={styles.inputCardValue}>{currentSet.reps}</Text>
              <View style={styles.inputCardButtons}>
                <Pressable
                  style={styles.inputCardBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    handleRepsChange(Math.max(0, currentSet.reps - 1));
                  }}
                >
                  <Text style={styles.inputCardBtnText}>-</Text>
                </Pressable>
                <Pressable
                  style={styles.inputCardBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    handleRepsChange(currentSet.reps + 1);
                  }}
                >
                  <Text style={styles.inputCardBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* RPE card */}
            <View style={styles.inputCard}>
              <Text style={styles.inputCardLabel}>RPE</Text>
              <Text style={styles.inputCardValue}>
                {currentSet.rpe !== null ? currentSet.rpe : '-'}
              </Text>
              <View style={styles.inputCardButtons}>
                <Pressable
                  style={styles.inputCardBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const newRpe = currentSet.rpe !== null ? Math.max(1, currentSet.rpe - 1) : 5;
                    setCurrentSet((s) => ({ ...s, rpe: newRpe }));
                  }}
                >
                  <Text style={styles.inputCardBtnText}>-</Text>
                </Pressable>
                <Pressable
                  style={styles.inputCardBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const newRpe = currentSet.rpe !== null ? Math.min(10, currentSet.rpe + 1) : 5;
                    setCurrentSet((s) => ({ ...s, rpe: newRpe }));
                  }}
                >
                  <Text style={styles.inputCardBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Voice tempo toggle */}
          <View style={styles.tempoToggleRow}>
            <TempoToggle
              enabled={tempoEnabled}
              onToggle={handleTempoToggle}
              isPlaying={tempoVoice.isPlaying}
            />
          </View>

          {/* Complete set button */}
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
      </View>

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
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 100,
  },

  // Top header bar
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  closeButton: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text.muted,
  },
  elapsedTime: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Main two-column layout
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 16,
    paddingBottom: 16,
  },

  // Left column - takes more space (~60%)
  leftColumn: {
    flex: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 24,
  },
  exerciseHeader: {
    marginBottom: 8,
  },
  exerciseNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineArrow: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ember[500],
    paddingHorizontal: 4,
  },
  inlineArrowDisabled: {
    color: colors.text.muted,
  },
  exerciseName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  exerciseProgress: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },

  // Tempo area
  tempoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tempoLiveRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  tempoPhase: {
    fontFamily: fonts.mono,
    fontSize: 64,
    letterSpacing: 4,
  },
  tempoPhaseUp: {
    color: '#22C55E',
  },
  tempoPhaseDown: {
    color: colors.ember[500],
  },
  tempoCountdown: {
    fontFamily: fonts.mono,
    fontSize: 64,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  tempoStatic: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.ember[700],
    letterSpacing: 2,
  },
  tempoOff: {
    fontFamily: fonts.monoLight,
    fontSize: 24,
    color: colors.text.muted,
    letterSpacing: 2,
  },

  // Completed sets
  completedSetsSection: {
    marginBottom: 16,
  },
  completedSetsLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  noSetsText: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.muted,
  },
  completedSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2d33',
    borderLeftWidth: 3,
    borderLeftColor: colors.ember[500],
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 6,
  },
  setNumber: {
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.muted,
    minWidth: 40,
  },
  setWeight: {
    fontFamily: fonts.mono,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 70,
  },
  setReps: {
    fontFamily: fonts.mono,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    minWidth: 60,
  },
  setRepsX: {
    color: colors.text.muted,
  },
  setRpeLabel: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 'auto',
    marginRight: 8,
  },
  setRpeValue: {
    fontFamily: fonts.mono,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Footer stats
  footerStats: {
    alignSelf: 'stretch',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.zone.cold,
  },
  footerText: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Right column - compact input area
  rightColumn: {
    flex: 3,
    paddingLeft: 16,
    paddingRight: 8,
  },
  setDisplayBox: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  setDisplayText: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ember[500],
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Input cards row (3 columns)
  inputCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  inputCard: {
    flex: 1,
    backgroundColor: colors.bg.card,
    borderWidth: 1.5,
    borderColor: '#3a3a3e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  inputCardWeight: {
    flex: 1.4,
  },
  inputCardLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  inputCardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  inputCardValue: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  inputCardUnit: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.muted,
    marginLeft: 2,
  },
  inputCardButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    width: '100%',
    paddingHorizontal: 4,
  },
  inputCardBtn: {
    flex: 1,
    backgroundColor: '#232327',
    borderWidth: 1.5,
    borderColor: '#3a3a3e',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inputCardBtnText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Voice tempo toggle row
  tempoToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  // Complete set button
  completeButton: {
    marginTop: 'auto',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  completeButtonEnabled: {
    backgroundColor: colors.ember[500],
  },
  completeButtonDisabled: {
    backgroundColor: colors.zone.cold,
  },
  completeButtonText: {
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 2,
  },
  completeButtonTextEnabled: {
    color: '#FFFFFF',
  },
  completeButtonTextDisabled: {
    color: colors.text.muted,
  },

  finishButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  finishText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ember[500],
    letterSpacing: 2,
  },
  xpBadge: {
    backgroundColor: colors.ember[500],
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  xpBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
