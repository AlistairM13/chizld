import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface XPFloaterProps {
  /** XP amount to display */
  xp: number;
  /** Controls animation trigger */
  visible: boolean;
  /** Called when animation finishes */
  onComplete: () => void;
}

const ANIMATION_DURATION = 800;
const FADE_DURATION = 400;
const FLOAT_DISTANCE = -60;

/**
 * Animated floating XP display component.
 *
 * When visible becomes true:
 * - Text starts at opacity 1, translateY 0
 * - Animates upward (translateY -60) over 800ms
 * - Fades out (opacity 0) during last 400ms
 * - Calls onComplete when animation finishes
 */
export function XPFloater({ xp, visible, onComplete }: XPFloaterProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset position
      translateY.value = 0;
      opacity.value = 1;

      // Animate upward
      translateY.value = withTiming(
        FLOAT_DISTANCE,
        {
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        }
      );

      // Fade out during last portion
      opacity.value = withSequence(
        withTiming(1, { duration: FADE_DURATION }),
        withTiming(0, { duration: FADE_DURATION })
      );
    }
  }, [visible, translateY, opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>+{xp} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 24,
    color: colors.ember[500],
    textShadowColor: 'rgba(255, 140, 26, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
});
