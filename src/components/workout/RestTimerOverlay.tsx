import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Vibration } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useRestTimer } from '@/hooks/useRestTimer';

interface RestTimerOverlayProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}

const RING_SIZE = 200;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CENTER = RING_SIZE / 2;

/**
 * Creates a circular arc path for the progress ring.
 */
function createArcPath(progress: number): string {
  // Progress: 1 = full circle, 0 = no arc
  const endAngle = progress * Math.PI * 2;
  const startAngle = -Math.PI / 2; // Start from top

  if (progress <= 0) {
    return '';
  }

  if (progress >= 1) {
    // Full circle
    return `M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 ${CENTER - 0.001} ${CENTER - RADIUS}`;
  }

  const endX = CENTER + RADIUS * Math.cos(startAngle + endAngle);
  const endY = CENTER + RADIUS * Math.sin(startAngle + endAngle);
  const largeArc = progress > 0.5 ? 1 : 0;

  return `M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endX} ${endY}`;
}

/**
 * Full-screen rest timer overlay with animated Skia progress ring.
 * Auto-starts on mount, supports +/-15s adjust and skip.
 */
export function RestTimerOverlay({
  duration,
  onComplete,
  onSkip,
}: RestTimerOverlayProps) {
  const timer = useRestTimer(duration);

  // Start timer on mount
  useEffect(() => {
    timer.start(duration);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timer completion
  useEffect(() => {
    if (!timer.isRunning && timer.remaining === 0 && duration > 0) {
      // Timer finished naturally
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Vibration.vibrate([0, 200, 100, 200]);
      onComplete();
    }
  }, [timer.isRunning, timer.remaining, duration, onComplete]);

  const handleAdjust = (delta: number) => {
    Haptics.selectionAsync();
    timer.adjustTime(delta);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timer.skip();
    onSkip();
  };

  // Calculate progress for arc (1 = full, 0 = empty)
  const progress = timer.remaining / duration;

  // Create the arc path
  const arcPathString = createArcPath(progress);
  const arcPath = arcPathString ? Skia.Path.MakeFromSVGString(arcPathString) : null;

  // Format remaining time as MM:SS
  const minutes = Math.floor(timer.remaining / 60);
  const seconds = timer.remaining % 60;
  const timeDisplay =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : seconds.toString();

  return (
    <View style={styles.overlay}>
      {/* Progress ring with Skia */}
      <View style={styles.ringContainer}>
        <Canvas style={styles.canvas}>
          {/* Background circle */}
          <Path
            path={Skia.Path.MakeFromSVGString(
              `M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 ${CENTER - 0.001} ${CENTER - RADIUS}`
            )!}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            color={colors.zone.cold}
          />
          {/* Progress arc */}
          {arcPath && (
            <Path
              path={arcPath}
              style="stroke"
              strokeWidth={STROKE_WIDTH}
              color={colors.ember[500]}
              strokeCap="round"
            />
          )}
        </Canvas>

        {/* Time display centered */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{timeDisplay}</Text>
          <Text style={styles.restLabel}>REST</Text>
        </View>
      </View>

      {/* Adjust buttons */}
      <View style={styles.adjustRow}>
        <Pressable
          style={styles.adjustButton}
          onPress={() => handleAdjust(-15)}
        >
          <Text style={styles.adjustButtonText}>-15s</Text>
        </Pressable>
        <Pressable
          style={styles.adjustButton}
          onPress={() => handleAdjust(15)}
        >
          <Text style={styles.adjustButtonText}>+15s</Text>
        </Pressable>
      </View>

      {/* Skip button */}
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>SKIP REST</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontFamily: fonts.mono,
    fontSize: 72,
    color: colors.ember[500],
  },
  restLabel: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.muted,
    letterSpacing: 2,
    marginTop: 4,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 40,
  },
  adjustButton: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.ember[700],
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  adjustButtonText: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.ember[500],
  },
  skipButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.muted,
    letterSpacing: 2,
  },
});
