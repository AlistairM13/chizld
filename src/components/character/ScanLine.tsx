import React, { useEffect } from 'react';
import { Line, vec, Blur } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../../constants/colors';

interface ScanLineProps {
  width: number;
  height: number;
}

/**
 * ScanLine renders an animated horizontal line that sweeps vertically
 * through the frame. Creates a subtle body scanner effect.
 *
 * Animation: 4000ms sweep from top to bottom, continuous loop.
 * Blur effect creates a soft, ambient appearance.
 */
export function ScanLine({ width, height }: ScanLineProps) {
  const scanY = useSharedValue(0);

  useEffect(() => {
    // Slow sweep from top to bottom, continuous loop
    scanY.value = withRepeat(
      withTiming(height, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1, // infinite
      false // no reverse, restart from top
    );
  }, [height, scanY]);

  return (
    <Line
      p1={vec(0, scanY)}
      p2={vec(width, scanY)}
      color={colors.hud.scanLine}
      strokeWidth={3}
    >
      <Blur blur={6} />
    </Line>
  );
}
