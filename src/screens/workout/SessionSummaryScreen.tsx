import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { type RootStackParamList } from '@/navigation/types';
import { useSessionSummary } from '@/hooks/useSessionSummary';
import { XPBreakdown } from '@/components/workout/XPBreakdown';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

/**
 * Formats duration in minutes to MM:SS string.
 */
function formatDuration(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a number with thousands separators.
 */
function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

/**
 * Session summary screen displayed after completing a workout.
 *
 * Shows:
 * - Session duration
 * - Total sets completed
 * - Exercises count
 * - Total volume (kg)
 * - XP breakdown with all bonuses
 * - Level-up celebration if zone leveled up
 * - Exercise breakdown with set counts
 * - Return to character button
 */
export function SessionSummaryScreen({ route, navigation }: Props) {
  const { sessionId, zoneId, totalXP, xpBreakdown } = route.params;
  const hasFinalized = useRef(false);

  // Prepare pre-calculated XP if provided
  const preCalculatedXP = totalXP !== undefined && xpBreakdown
    ? { total: totalXP, breakdown: xpBreakdown }
    : undefined;

  const { summary, isLoading, finalizeAndGetResult } = useSessionSummary({
    sessionId,
    zoneId,
    preCalculatedXP,
  });

  // Level-up animation values
  const levelUpScale = useSharedValue(1);
  const levelUpGlow = useSharedValue(0.5);

  // Finalize session on mount (only once)
  useEffect(() => {
    if (summary && !hasFinalized.current) {
      hasFinalized.current = true;
      finalizeAndGetResult();
    }
  }, [summary, finalizeAndGetResult]);

  // Trigger level-up celebration when detected
  useEffect(() => {
    if (summary?.leveledUp) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Scale pulse animation: 1.0 -> 1.1 -> 1.0, repeat 2x
      levelUpScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300 }),
          withTiming(1.0, { duration: 300 })
        ),
        2,
        false
      );

      // Glow pulse animation: 0.5 -> 1.0 -> 0.5
      levelUpGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 300 })
        ),
        2,
        false
      );
    }
  }, [summary?.leveledUp, levelUpScale, levelUpGlow]);

  // Animated styles for level-up card
  const levelUpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelUpScale.value }],
    borderColor: `rgba(255, 140, 26, ${levelUpGlow.value})`,
    shadowOpacity: levelUpGlow.value * 0.8,
  }));

  /**
   * Navigates back to character screen, resetting navigation stack.
   */
  const handleReturn = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Reset to Main tab, preventing back navigation to workout session
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ember[500]} />
          <Text style={styles.loadingText}>LOADING SUMMARY...</Text>
        </View>
      </ScreenBackground>
    );
  }

  // No data state
  if (!summary) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>SESSION NOT FOUND</Text>
          <Pressable style={styles.returnButton} onPress={handleReturn}>
            <Text style={styles.returnButtonText}>RETURN TO CHARACTER</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>// WORKOUT</Text>
          <Text style={styles.headerTitle}>SESSION COMPLETE</Text>
        </View>

        {/* Level-up celebration */}
        {summary.leveledUp && summary.newLevel !== null && (
          <Animated.View style={[styles.levelUpCard, levelUpAnimatedStyle]}>
            <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
            <Text style={styles.levelUpZone}>{summary.zoneName.toUpperCase()}</Text>
            <Text style={styles.levelUpLevel}>LEVEL {summary.newLevel}</Text>
          </Animated.View>
        )}

        {/* Duration */}
        <View style={styles.durationCard}>
          <Text style={styles.durationValue}>
            {formatDuration(summary.duration)}
          </Text>
          <Text style={styles.durationLabel}>DURATION</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.totalSets}</Text>
            <Text style={styles.statLabel}>SETS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.exercises.length}</Text>
            <Text style={styles.statLabel}>EXERCISES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatNumber(summary.totalVolume)}
            </Text>
            <Text style={styles.statLabel}>VOLUME (KG)</Text>
          </View>
        </View>

        {/* XP breakdown */}
        <View style={styles.xpSection}>
          <XPBreakdown
            total={summary.xpEarned}
            breakdown={summary.xpBreakdown}
            totalSets={summary.totalSets}
          />
        </View>

        {/* Exercise breakdown */}
        {summary.exercises.length > 0 && (
          <View style={styles.exerciseSection}>
            <Text style={styles.exerciseSectionTitle}>EXERCISE BREAKDOWN</Text>
            {summary.exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>
                  {exercise.name.toUpperCase()}
                </Text>
                <Text style={styles.exerciseSets}>
                  {exercise.setCount} {exercise.setCount === 1 ? 'SET' : 'SETS'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.returnButton} onPress={handleReturn}>
          <Text style={styles.returnButtonText}>RETURN TO CHARACTER</Text>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.danger,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLabel: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ember[500],
    letterSpacing: 4,
  },
  levelUpCard: {
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderWidth: 3,
    borderColor: colors.ember[500],
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 24,
    shadowColor: colors.ember[500],
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  levelUpTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ember[500],
    letterSpacing: 6,
    textShadowColor: colors.ember.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  levelUpZone: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.secondary,
    letterSpacing: 2,
    marginTop: 8,
  },
  levelUpLevel: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.text.primary,
    letterSpacing: 4,
    marginTop: 4,
  },
  durationCard: {
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.ember[700],
    borderRadius: 8,
    paddingVertical: 24,
    marginBottom: 24,
  },
  durationValue: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  durationLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 8,
    paddingVertical: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.mono,
    fontSize: 28,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.zone.cold,
  },
  xpSection: {
    marginBottom: 24,
  },
  exerciseSection: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 8,
    padding: 16,
  },
  exerciseSectionTitle: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
    marginBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  exerciseName: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  exerciseSets: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.ember[500],
    marginLeft: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.zone.cold,
  },
  returnButton: {
    backgroundColor: colors.ember[500],
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  returnButtonText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
