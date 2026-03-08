import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  Extrapolation,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { BodyCanvas } from '../../components/character/BodyCanvas';
import { ZoneCard } from '../../components/character/ZoneCard';
import { useZoneStats } from '../../hooks/useZoneStats';
import { ZONE_CARD_POSITIONS } from '../../constants/layout';

export function CharacterScreen() {
  const { stats } = useZoneStats();
  const { width, height } = useWindowDimensions();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Animation drivers - character slides FIRST, stat card enters after delay
  const detailProgress = useSharedValue(0);
  const statCardProgress = useSharedValue(0);

  // Drive animations based on selectedZone state changes
  useEffect(() => {
    if (selectedZone !== null) {
      // Character slides first
      detailProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      // Stat card enters after ~100ms delay
      statCardProgress.value = withDelay(
        100,
        withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        })
      );
    } else {
      // Reverse: stat card exits first, then character slides back
      statCardProgress.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      detailProgress.value = withDelay(
        100,
        withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, [selectedZone, detailProgress, statCardProgress]);

  // Character slides ~50% left when detail mode is active
  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          detailProgress.value,
          [0, 1],
          [0, -width * 0.5],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // Derived value for card opacity (cards fade out early in transition)
  const cardOpacity = useDerivedValue(() =>
    interpolate(detailProgress.value, [0, 0.3], [1, 0], Extrapolation.CLAMP)
  );

  const handleSelectZone = useCallback((zoneId: string | null) => {
    setSelectedZone(zoneId);
  }, []);

  // Calculate whether we're in detail mode for ConnectingLines
  const isDetailMode = selectedZone !== null;
  // Stat card left edge position (will be refined in Plan 02)
  const statCardX = width * 0.4;

  return (
    <View style={styles.container}>
      {/* Animated wrapper for character slide */}
      <Animated.View style={[StyleSheet.absoluteFill, characterAnimatedStyle]}>
        {/* Base canvas: hex grid, character, glows, connecting lines */}
        <BodyCanvas
          zones={stats}
          selectedZone={selectedZone}
          onSelectZone={handleSelectZone}
          detailMode={isDetailMode}
          statCardX={statCardX}
        />
      </Animated.View>

      {/* Zone cards overlaid on canvas (RN Views for text rendering) */}
      {stats.map((zone) => (
        <ZoneCard
          key={zone.zoneId}
          zone={zone}
          position={ZONE_CARD_POSITIONS[zone.zoneId]}
          screenWidth={width}
          screenHeight={height}
          isSelected={selectedZone === zone.zoneId}
          onPress={() => handleSelectZone(zone.zoneId)}
          detailProgress={detailProgress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
