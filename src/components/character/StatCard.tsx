import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { XPProgressBar } from './XPProgressBar';
import { StatsGrid } from './StatsGrid';
import { PhotoHistoryRow } from './PhotoHistoryRow';
import { type ZoneWithIntensity } from '../../hooks/useZoneStats';
import { type ZoneDetailStats } from '../../hooks/useDetailStats';

interface StatCardProps {
  zone: ZoneWithIntensity;
  stats: ZoneDetailStats;
  statCardProgress: SharedValue<number>;
  onTrain: () => void;
  onDismiss: () => void;
  screenWidth: number;
}

/**
 * Animated stat card that slides in from the right displaying zone stats.
 * Shows zone name, level badge, XP bar, stats grid, photo history, and TRAIN button.
 */
export function StatCard({
  zone,
  stats,
  statCardProgress,
  onTrain,
  onDismiss,
  screenWidth,
}: StatCardProps) {
  // Slide in from off-screen right to ~40% from left
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          statCardProgress.value,
          [0, 1],
          [screenWidth * 0.6, 0], // Slide from off-screen to final position
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      statCardProgress.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={() => {
          // Swallow taps to prevent dismiss propagation
        }}
        style={styles.inner}
      >
        {/* Header row */}
        <View style={styles.header}>
          <Text style={styles.fireIcon}>🔥</Text>
          <Text style={styles.zoneName}>{stats.zoneName}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LV.{stats.level}</Text>
          </View>
        </View>

        {/* XP Progress */}
        <XPProgressBar currentXp={stats.totalXp} level={stats.level} />

        {/* Stats Grid */}
        <StatsGrid
          streak={stats.currentStreak}
          volume7d={stats.volume7d}
          sessions={stats.sessions}
          totalSets={stats.totalSets}
          maxWeight={stats.maxWeight}
          lastTrained={stats.lastTrainedAt}
        />

        {/* Photo History */}
        <PhotoHistoryRow photos={[]} maxSlots={5} />

        {/* Spacer to push TRAIN button to bottom */}
        <View style={styles.spacer} />

        {/* TRAIN Button */}
        <Pressable style={styles.trainButton} onPress={onTrain}>
          <Text style={styles.trainButtonText}>TRAIN</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 44, // Below HudBarTop
    bottom: 108, // Above HudBarBottom and tab bar
    width: '55%',
    backgroundColor: colors.bg.card,
    borderLeftWidth: 2,
    borderLeftColor: colors.ember[500],
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fireIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  zoneName: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text.primary,
    flex: 1,
  },
  levelBadge: {
    backgroundColor: colors.ember[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.bg.primary,
    fontWeight: 'bold',
  },
  spacer: {
    flex: 1,
  },
  trainButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.ember[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  trainButtonText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
