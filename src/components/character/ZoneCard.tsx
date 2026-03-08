import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { ZoneLabel } from './ZoneLabel';
import { PhotoSlot } from './PhotoSlot';
import { type ZoneWithIntensity } from '../../hooks/useZoneStats';
import { type ZoneCardPosition } from '../../constants/layout';

interface ZoneCardProps {
  zone: ZoneWithIntensity;
  position: ZoneCardPosition;
  screenWidth: number;
  screenHeight: number;
  isSelected?: boolean;
  onPress?: () => void;
  detailProgress?: SharedValue<number>;  // From CharacterScreen for fade animation
}

/**
 * ZoneCard composes ZoneLabel + PhotoSlot side by side.
 *
 * Layout:
 * - Left-side zones: label left, slot right (row)
 * - Right-side zones: slot left, label right (row-reverse)
 *
 * The connecting lines originate from the PhotoSlot center,
 * creating visual connection to body anchor points.
 */
export function ZoneCard({
  zone,
  position,
  screenWidth,
  screenHeight,
  isSelected = false,
  onPress,
  detailProgress,
}: ZoneCardProps) {
  // Calculate absolute position (position is percentage-based)
  const cardX = position.x * screenWidth;
  const cardY = position.y * screenHeight;

  // Left-side zones: label left, slot right
  // Right-side zones: slot left, label right
  const isLeftSide = zone.side === 'left';

  // Animated opacity: ALL cards fade out during detail mode (StatCard takes over)
  const animatedStyle = useAnimatedStyle(() => {
    if (!detailProgress) return { opacity: 1 };

    // All cards fade out - the StatCard on the right shows the detail info
    const opacity = interpolate(detailProgress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP);

    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { left: cardX, top: cardY },
        animatedStyle,
      ]}
    >
      <Pressable
        style={[
          styles.container,
          { flexDirection: isLeftSide ? 'row' : 'row-reverse' },
        ]}
        onPress={onPress}
      >
        <ZoneLabel
          zoneName={zone.name}
          level={zone.level}
          isWarm={zone.isWarm}
          isSelected={isSelected}
          side={zone.side}
        />
        <View style={styles.gap} />
        <PhotoSlot
          photoPath={null} // No photos yet - future feature
          isWarm={zone.isWarm}
          isSelected={isSelected}
          size={50}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    // Transform to center on position point
    transform: [{ translateX: -65 }, { translateY: -25 }],
  },
  container: {
    alignItems: 'center',
  },
  gap: {
    width: 8, // Space between label and slot
  },
});
