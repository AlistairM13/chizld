import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { LEVEL_THRESHOLDS } from '../../constants/xp';
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
  // Calculate XP progress
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === stats.level);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === stats.level + 1);
  const isMaxLevel = stats.level >= 10 || !nextThreshold;

  let xpProgress = 1;
  let xpInLevel = 0;
  let xpNeeded = 0;

  if (!isMaxLevel && currentThreshold && nextThreshold) {
    xpInLevel = stats.totalXp - currentThreshold.xpRequired;
    xpNeeded = nextThreshold.xpRequired - currentThreshold.xpRequired;
    xpProgress = Math.min(1, Math.max(0, xpInLevel / xpNeeded));
  } else if (currentThreshold) {
    xpInLevel = stats.totalXp - currentThreshold.xpRequired;
  }

  // Animated XP bar width
  const xpBarWidth = useSharedValue(0);

  useEffect(() => {
    xpBarWidth.value = withTiming(xpProgress, { duration: 600 });
  }, [xpProgress, xpBarWidth]);

  const xpBarAnimatedStyle = useAnimatedStyle(() => ({
    width: `${xpBarWidth.value * 100}%`,
  }));

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
        {/* Header row with inline XP */}
        <View style={styles.header}>
          <Text style={styles.zoneName}>{stats.zoneName}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LV.{stats.level}</Text>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>
              {isMaxLevel ? `${xpInLevel} XP` : `${xpInLevel} / ${xpNeeded} XP`}
            </Text>
            <View style={styles.xpBarContainer}>
              <Animated.View style={[styles.xpBarFill, xpBarAnimatedStyle]} />
            </View>
          </View>
        </View>

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
    bottom: 60, // Just above tab bar
    width: '55%',
    backgroundColor: colors.bg.card,
    borderLeftWidth: 2,
    borderLeftColor: colors.ember[500],
  },
  inner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneName: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text.primary,
  },
  levelBadge: {
    backgroundColor: colors.ember[500],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 10,
  },
  levelText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.bg.primary,
    fontWeight: 'bold',
  },
  xpContainer: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  xpText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.text.secondary,
  },
  xpBarContainer: {
    width: 80,
    height: 3,
    backgroundColor: colors.zone.cold,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginTop: 3,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.ember[500],
    borderRadius: 1.5,
  },
  trainButton: {
    height: 44,
    backgroundColor: colors.ember[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  trainButtonText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
