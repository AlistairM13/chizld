import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface RPESliderProps {
  value: number | null;
  onChange: (value: number) => void;
}

const RPE_MIN = 6;
const RPE_MAX = 10;
const RPE_RANGE = RPE_MAX - RPE_MIN; // 4

const TRACK_WIDTH = 200;
const THUMB_SIZE = 28;
const TRACK_HEIGHT = 4;

const RPE_VALUES = [6, 7, 8, 9, 10] as const;

/** Map RPE value to x position on track (center of thumb). */
function rpeToX(rpe: number): number {
  'worklet';
  const ratio = (rpe - RPE_MIN) / RPE_RANGE;
  return ratio * (TRACK_WIDTH - THUMB_SIZE) + THUMB_SIZE / 2;
}

/** Map x position (from left edge of track) to snapped RPE value. */
function xToRpe(x: number): number {
  'worklet';
  const clampedX = Math.max(0, Math.min(x, TRACK_WIDTH));
  const ratio = clampedX / TRACK_WIDTH;
  const raw = ratio * RPE_RANGE + RPE_MIN;
  return Math.round(Math.max(RPE_MIN, Math.min(RPE_MAX, raw)));
}

/**
 * Horizontal RPE slider for selecting RPE 6–10.
 * Uses Gesture Handler v2 pan gesture for drag interaction.
 * Provides haptic + visual pulse feedback on value change.
 */
export function RPESlider({ value, onChange }: RPESliderProps) {
  const thumbScale = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const dragStartX = useSharedValue(0);
  const currentRpe = useSharedValue(value ?? RPE_MIN);

  // Sync shared value when controlled prop changes externally
  useEffect(() => {
    if (value !== null && !isDragging.value) {
      currentRpe.value = value;
    }
  }, [value, currentRpe, isDragging]);

  const pulseThumb = useCallback(() => {
    thumbScale.value = withSequence(
      withTiming(1.15, { duration: 80 }),
      withTiming(1, { duration: 80 })
    );
  }, [thumbScale]);

  const triggerHaptic = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const handleValueChange = useCallback(
    (newRpe: number) => {
      onChange(newRpe);
      pulseThumb();
    },
    [onChange, pulseThumb]
  );

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      dragStartX.value = e.x;
    })
    .onUpdate((e) => {
      const newRpe = xToRpe(e.x);
      if (newRpe !== currentRpe.value) {
        currentRpe.value = newRpe;
        runOnJS(triggerHaptic)();
        runOnJS(handleValueChange)(newRpe);
      }
    })
    .onEnd((e) => {
      isDragging.value = false;
      const finalRpe = xToRpe(e.x);
      currentRpe.value = finalRpe;
      runOnJS(triggerHaptic)();
      runOnJS(handleValueChange)(finalRpe);
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const tappedRpe = xToRpe(e.x);
    currentRpe.value = tappedRpe;
    runOnJS(triggerHaptic)();
    runOnJS(handleValueChange)(tappedRpe);
  });

  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  const thumbStyle = useAnimatedStyle(() => {
    const xCenter = rpeToX(currentRpe.value);
    return {
      transform: [
        { translateX: xCenter - THUMB_SIZE / 2 },
        { scale: thumbScale.value },
      ],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const xCenter = rpeToX(currentRpe.value);
    return {
      width: xCenter,
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <View style={styles.trackContainer}>
          {/* Track background */}
          <View style={styles.track}>
            {/* Fill */}
            <Animated.View style={[styles.fill, fillStyle]} />
          </View>
          {/* Thumb */}
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>

      {/* RPE number labels */}
      <View style={styles.labels}>
        {RPE_VALUES.map((rpe) => {
          const isSelected = value === rpe;
          return (
            <Text
              key={rpe}
              style={[styles.labelText, isSelected && styles.labelTextSelected]}
            >
              {rpe}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TRACK_WIDTH,
    paddingTop: THUMB_SIZE / 2,
  },
  trackContainer: {
    width: TRACK_WIDTH,
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    backgroundColor: colors.zone.cold,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: colors.ember[500],
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    top: (THUMB_SIZE - THUMB_SIZE) / 2, // centered vertically in trackContainer
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.ember[500],
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  labelText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.text.muted,
    width: TRACK_WIDTH / RPE_VALUES.length,
    textAlign: 'center',
  },
  labelTextSelected: {
    color: colors.ember[500],
  },
});
