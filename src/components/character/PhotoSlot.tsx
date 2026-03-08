import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Canvas, RoundedRect, DashPathEffect } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

interface PhotoSlotProps {
  photoPath: string | null; // URI to photo or null for placeholder
  isWarm: boolean;          // drives border style and colors
  isSelected?: boolean;     // selected state highlight
  size?: number;            // slot dimensions, default 50
  onPress?: () => void;     // for future tap handling
}

/**
 * PhotoSlot displays an RPG equipment slot for zone progress photos.
 *
 * States:
 * - Default (no photo): Shows dashed border with centered "+" icon
 * - Cold: Grey border (dashed), grey + icon, no glow
 * - Warm: Ember solid border, ember + icon, subtle glow
 * - Photo: Image fills slot, same border styling
 *
 * Note: borderStyle 'dashed' works on iOS but is inconsistent on Android.
 * Accepted as visual polish limitation on Android.
 */
export function PhotoSlot({ photoPath, isWarm, isSelected = false, size = 50, onPress }: PhotoSlotProps) {
  const hasPhoto = photoPath !== null;

  // Animated phase for marching ants effect
  const dashPhase = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      dashPhase.value = withRepeat(
        withTiming(8, { duration: 500, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      dashPhase.value = 0;
    }
  }, [isSelected, dashPhase]);

  // Border styling: selected > warm > cold
  const borderColor = isSelected
    ? colors.zone.selected
    : isWarm
      ? colors.ember[500]
      : colors.text.muted;
  // Hide RN border when selected (Skia draws it instead)
  const borderStyle = isWarm ? 'solid' : 'dashed';
  const showRNBorder = !isSelected;

  // Icon color (only shown when no photo)
  const iconColor = isSelected
    ? colors.zone.selected
    : isWarm
      ? colors.ember[500]
      : colors.text.muted;

  // Shadow/glow for warm state (React Native shadows)
  const shadowStyle = isWarm
    ? {
        shadowColor: colors.ember[500],
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 6,
        shadowOpacity: 0.5,
        elevation: 4,
      }
    : {};

  return (
    <View style={[styles.shadowContainer, shadowStyle]}>
      <Pressable
        style={[
          styles.slot,
          {
            width: size,
            height: size,
            borderColor: showRNBorder ? borderColor : 'transparent',
            borderStyle,
          },
        ]}
        onPress={onPress}
      >
        {hasPhoto ? (
          <Image
            source={{ uri: photoPath }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.plusIcon, { color: iconColor }]}>+</Text>
        )}
      </Pressable>
      {/* Animated dashed border overlay when selected */}
      {isSelected && (
        <Canvas style={[StyleSheet.absoluteFill, { width: size, height: size }]} pointerEvents="none">
          <RoundedRect
            x={0.5}
            y={0.5}
            width={size - 1}
            height={size - 1}
            r={2}
            color={colors.zone.selected}
            style="stroke"
            strokeWidth={1}
          >
            <DashPathEffect intervals={[4, 4]} phase={dashPhase} />
          </RoundedRect>
        </Canvas>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    // Wrapper for shadow (Android elevation only works on View)
  },
  slot: {
    borderWidth: 1,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Clip image to slot bounds
    backgroundColor: 'transparent',
  },
  plusIcon: {
    fontFamily: fonts.monoLight, // JetBrains Mono Regular
    fontSize: 20,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
