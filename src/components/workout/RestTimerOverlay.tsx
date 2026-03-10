import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useRestTimer } from '@/hooks/useRestTimer';

interface RestTimerOverlayProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Full-black rest timer overlay with large countdown number.
 * Shows -15s / SKIP / +15s controls during countdown.
 * On completion, shows "REST COMPLETE" — user taps to dismiss.
 *
 * NOTE: No FadeIn/FadeOut animation here — the parent (WorkoutSessionScreen)
 * wraps this component in an Animated.View with fade transitions (Plan 04).
 */
export function RestTimerOverlay({
  duration,
  onComplete,
  onSkip,
}: RestTimerOverlayProps) {
  const timer = useRestTimer(duration);
  const [isComplete, setIsComplete] = useState(false);

  // Start timer on mount
  useEffect(() => {
    timer.start(duration);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timer completion
  useEffect(() => {
    if (!timer.isRunning && timer.remaining === 0 && duration > 0) {
      setIsComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Do NOT auto-call onComplete — user must tap
    }
  }, [timer.isRunning, timer.remaining, duration]);

  const handleAdjust = (delta: number) => {
    Haptics.selectionAsync();
    timer.adjustTime(delta);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timer.skip();
    onSkip();
  };

  const handleDismiss = () => {
    if (isComplete) {
      onComplete();
    }
  };

  return (
    <Pressable style={styles.overlay} onPress={handleDismiss}>
      {isComplete ? (
        // REST COMPLETE state
        <View style={styles.completeContainer}>
          <Text style={styles.completeText}>REST COMPLETE</Text>
          <Text style={styles.tapToContinueText}>TAP TO CONTINUE</Text>
        </View>
      ) : (
        // Active countdown state
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{timer.remaining}</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.adjustButton}
              onPress={() => handleAdjust(-15)}
            >
              <Text style={styles.adjustButtonText}>-15s</Text>
            </Pressable>
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>SKIP</Text>
            </Pressable>
            <Pressable
              style={styles.adjustButton}
              onPress={() => handleAdjust(15)}
            >
              <Text style={styles.adjustButtonText}>+15s</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  // Active countdown
  countdownContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontFamily: fonts.mono,
    fontSize: 120,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 48,
    alignItems: 'center',
  },
  adjustButton: {
    borderWidth: 1,
    borderColor: colors.ember[700],
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  adjustButtonText: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.ember[500],
  },
  skipButton: {
    borderWidth: 1,
    borderColor: colors.ember[700],
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipButtonText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  // REST COMPLETE state
  completeContainer: {
    alignItems: 'center',
  },
  completeText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ember[500],
    letterSpacing: 4,
  },
  tapToContinueText: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
    marginTop: 16,
  },
});
