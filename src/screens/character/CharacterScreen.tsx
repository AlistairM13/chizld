import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Pressable, BackHandler, useWindowDimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { StatCard } from '../../components/character/StatCard';
import { HudBarTop } from '../../components/character/HudBar';
import { useZoneStats } from '../../hooks/useZoneStats';
import { useDetailStats } from '../../hooks/useDetailStats';
import { ZONE_CARD_POSITIONS } from '../../constants/layout';
import { type RootStackParamList } from '../../navigation/types';

export function CharacterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stats, warmCount, refetch } = useZoneStats();
  const { width, height } = useWindowDimensions();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Fetch detailed stats for selected zone
  const detailStats = useDetailStats(selectedZone);

  // Find the zone object for selected zone
  const selectedZoneData = selectedZone
    ? stats.find((z) => z.zoneId === selectedZone)
    : null;

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

  // Character slides left when detail mode is active
  // Target: center character in left ~40% of screen (so translate ~25% left)
  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          detailProgress.value,
          [0, 1],
          [0, -width * 0.25],
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

  // Handle TRAIN button press
  const handleTrain = useCallback(() => {
    if (selectedZone) {
      navigation.navigate('ExerciseSelect', { zoneId: selectedZone });
    }
  }, [navigation, selectedZone]);

  // Refresh zone stats when screen gains focus (after workout completion)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Handle Android back button to dismiss detail view
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (selectedZone !== null) {
          setSelectedZone(null);
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [selectedZone])
  );

  // Calculate whether we're in detail mode for ConnectingLines
  const isDetailMode = selectedZone !== null;
  // Stat card left edge position (will be refined in Plan 02)
  const statCardX = width * 0.4;

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        if (selectedZone !== null) {
          setSelectedZone(null);
        }
      }}
    >
      {/* Animated wrapper for character slide - includes body canvas AND zone cards */}
      <Animated.View style={[StyleSheet.absoluteFill, characterAnimatedStyle]}>
        {/* Base canvas: hex grid, character, glows, connecting lines */}
        <BodyCanvas
          zones={stats}
          selectedZone={selectedZone}
          onSelectZone={handleSelectZone}
          detailMode={isDetailMode}
          statCardX={statCardX}
        />

        {/* Zone cards overlaid on canvas - must be inside animated wrapper to slide with character */}
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
      </Animated.View>

      {/* StatCard - rendered when selectedZone exists */}
      {selectedZoneData && detailStats && (
        <StatCard
          zone={selectedZoneData}
          stats={detailStats}
          statCardProgress={statCardProgress}
          onTrain={handleTrain}
          onDismiss={() => setSelectedZone(null)}
          screenWidth={width}
        />
      )}

      {/* HUD bar */}
      <HudBarTop />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
