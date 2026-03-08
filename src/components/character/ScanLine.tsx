import { Blur, Group, Line, vec } from '@shopify/react-native-skia';
import React from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface ScanLineProps {
  width: number;
  height: number;
}

/**
 * ScanLine renders an animated horizontal line that sweeps vertically
 * through the frame. Creates a subtle body scanner effect.
 *
 * Animation: 4000ms sweep from top to bottom, continuous loop.
 */
export function ScanLine({ width, height }: ScanLineProps) {
  const progress = useSharedValue(0);

  // Start animation
  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, [progress]);

  // Calculate Y position from progress
  const y = useDerivedValue(() => progress.value * height);

  // Create point objects for Line
  const p1 = useDerivedValue(() => vec(0, y.value));
  const p2 = useDerivedValue(() => vec(width, y.value));

  return (
    <Group>
      {/* Soft outer glow */}
      <Line p1={p1} p2={p2} color="rgba(80,180,180,0.05)" strokeWidth={30}>
        <Blur blur={20} />
      </Line>
      {/* Core glow */}
      <Line p1={p1} p2={p2} color="rgba(100,200,200,0.15)" strokeWidth={4}>
        <Blur blur={6} />
      </Line>
    </Group>
  );
}
