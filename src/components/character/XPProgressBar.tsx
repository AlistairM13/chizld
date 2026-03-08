import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { LEVEL_THRESHOLDS } from '../../constants/xp';

interface XPProgressBarProps {
  currentXp: number;
  level: number;
}

/**
 * XP progress bar showing progress toward next level.
 * Calculates XP within current level and displays fill percentage.
 */
export function XPProgressBar({ currentXp, level }: XPProgressBarProps) {
  // Find current and next level thresholds
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);

  // Handle max level (level 10)
  const isMaxLevel = level >= 10 || !nextThreshold;

  let progress = 1;
  let xpInLevel = 0;
  let xpNeeded = 0;

  if (!isMaxLevel && currentThreshold && nextThreshold) {
    const currentReq = currentThreshold.xpRequired;
    const nextReq = nextThreshold.xpRequired;
    xpInLevel = currentXp - currentReq;
    xpNeeded = nextReq - currentReq;
    progress = Math.min(1, Math.max(0, xpInLevel / xpNeeded));
  } else if (currentThreshold) {
    // Max level - show XP beyond threshold
    xpInLevel = currentXp - currentThreshold.xpRequired;
    xpNeeded = 0;
  }

  const progressText = isMaxLevel
    ? `${xpInLevel.toLocaleString()} XP (MAX)`
    : `${xpInLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{progressText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.zone.cold,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.ember[500],
    borderRadius: 3,
  },
  progressText: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
