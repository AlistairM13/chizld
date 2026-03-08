import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
}: ZoneCardProps) {
  // Calculate absolute position (position is percentage-based)
  const cardX = position.x * screenWidth;
  const cardY = position.y * screenHeight;

  // Left-side zones: label left, slot right
  // Right-side zones: slot left, label right
  const isLeftSide = zone.side === 'left';

  return (
    <Pressable
      style={[
        styles.container,
        {
          left: cardX,
          top: cardY,
          flexDirection: isLeftSide ? 'row' : 'row-reverse',
        },
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
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    // Transform to center on position point
    transform: [{ translateX: -65 }, { translateY: -25 }],
  },
  gap: {
    width: 8, // Space between label and slot
  },
});
