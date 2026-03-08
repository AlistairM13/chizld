import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

interface StatsGridProps {
  streak: number;
  volume7d: number;
  sessions: number;
  totalSets: number;
  maxWeight: number | null;
  lastTrained: string | null; // ISO date string
}

/**
 * Format volume with kg suffix and thousands separator.
 */
function formatVolume(volume: number): string {
  return `${volume.toLocaleString()}kg`;
}

/**
 * Format last trained date as relative text.
 */
function formatLast(lastTrained: string | null): string {
  if (!lastTrained) return '-';

  const last = new Date(lastTrained);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return last.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * 3x2 grid of zone statistics: STREAK, VOLUME 7D, SESSIONS, TOTAL SETS, MAX, LAST.
 */
export function StatsGrid({
  streak,
  volume7d,
  sessions,
  totalSets,
  maxWeight,
  lastTrained,
}: StatsGridProps) {
  const stats = [
    { label: 'STREAK', value: streak.toString() },
    { label: 'VOLUME 7D', value: formatVolume(volume7d) },
    { label: 'SESSIONS', value: sessions.toString() },
    { label: 'TOTAL SETS', value: totalSets.toString() },
    { label: 'MAX', value: maxWeight !== null ? `${maxWeight}kg` : '-' },
    { label: 'LAST', value: formatLast(lastTrained) },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.cell}>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={styles.value}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  cell: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontFamily: fonts.mono,
    fontSize: 22,
    color: colors.text.primary,
  },
});
