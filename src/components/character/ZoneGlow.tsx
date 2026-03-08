import React, { useEffect } from 'react';
import { Circle, RadialGradient, vec, Group } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { type ZoneWithIntensity } from '../../hooks/useZoneStats';
import { ZONE_CARD_POSITIONS } from '../../constants/layout';

interface ZoneGlowProps {
  zone: ZoneWithIntensity;
  screenWidth: number;
  screenHeight: number;
}

// Base glow radius for warm zones
const BASE_GLOW_RADIUS = 40;

// Pulse animation parameters
const PULSE_DURATION = 2000; // 2 seconds for organic breathing feel
const PULSE_MIN_OPACITY = 0.2;
const PULSE_MAX_OPACITY = 0.5;

/**
 * ZoneGlow renders a pulsing ember glow on the character body for warm zones.
 *
 * - Only renders if zone.isWarm is true
 * - Uses Reanimated withRepeat for breathing animation
 * - Glow intensity and radius scale with zone.intensity
 */
export function ZoneGlow({ zone, screenWidth, screenHeight }: ZoneGlowProps) {
  const pulseProgress = useSharedValue(0);

  // Start breathing animation
  useEffect(() => {
    pulseProgress.value = withRepeat(
      withTiming(1, {
        duration: PULSE_DURATION,
        easing: Easing.bezier(0.4, 0, 0.2, 1), // smooth ease-in-out for organic feel
      }),
      -1, // infinite repeat
      true // reverse direction
    );
  }, [pulseProgress]);

  // Don't render anything for cold zones
  if (!zone.isWarm) {
    return null;
  }

  // Get anchor position on body
  const positions = ZONE_CARD_POSITIONS[zone.zoneId];
  if (!positions) {
    return null;
  }

  const cx = positions.anchorX * screenWidth;
  const cy = positions.anchorY * screenHeight;

  // Scale radius by intensity (recently trained = larger glow)
  const radius = BASE_GLOW_RADIUS * (0.5 + zone.intensity * 0.5);

  // Calculate animated opacity based on pulse and intensity
  const animatedOpacity = useDerivedValue(() => {
    const pulse = PULSE_MIN_OPACITY + (PULSE_MAX_OPACITY - PULSE_MIN_OPACITY) * pulseProgress.value;
    return pulse * zone.intensity;
  });

  return (
    <Group blendMode="screen">
      <Circle cx={cx} cy={cy} r={radius} opacity={animatedOpacity}>
        <RadialGradient
          c={vec(cx, cy)}
          r={radius}
          colors={['rgba(255,140,26,0.6)', 'rgba(255,140,26,0)']}
        />
      </Circle>
    </Group>
  );
}

interface ZoneGlowsProps {
  zones: ZoneWithIntensity[];
  screenWidth: number;
  screenHeight: number;
}

/**
 * ZoneGlows renders glow effects for all warm zones.
 * Wraps multiple ZoneGlow components in a Group.
 */
export function ZoneGlows({ zones, screenWidth, screenHeight }: ZoneGlowsProps) {
  const warmZones = zones.filter((z) => z.isWarm);

  if (warmZones.length === 0) {
    return null;
  }

  return (
    <Group>
      {warmZones.map((zone) => (
        <ZoneGlow
          key={zone.zoneId}
          zone={zone}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      ))}
    </Group>
  );
}
