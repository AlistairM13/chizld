import React from 'react';
import { Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import { colors } from '../../constants/colors';

interface PlatformGlowProps {
  cx: number;
  cy: number;
  characterWidth: number;
}

/**
 * PlatformGlow renders an elliptical ember glow at the character's feet.
 * Creates the effect of standing on a scanner platform/pad.
 *
 * Uses radial gradient from ember center to transparent edge.
 */
export function PlatformGlow({ cx, cy, characterWidth }: PlatformGlowProps) {
  // Platform radius proportional to character width
  const radius = characterWidth * 0.35;

  return (
    <Circle cx={cx} cy={cy} r={radius}>
      <RadialGradient
        c={vec(cx, cy)}
        r={radius}
        colors={[colors.ember.glow, 'rgba(255,140,26,0)']}
      />
    </Circle>
  );
}
