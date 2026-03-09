import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

/**
 * Props for the XPBreakdown component.
 */
interface XPBreakdownProps {
  total: number;
  breakdown: {
    base: number;
    volumeBonus: number;
    prBonus: number;
    consistencyBonus: number; // 20 or 0 (once per session)
    tempoBonus: number;
  };
  totalSets: number; // For "10 x {sets}" display
}

/**
 * Formats a number with thousands separators.
 */
function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

/**
 * XP breakdown display component.
 *
 * Shows total XP earned prominently with itemized breakdown below.
 * Only displays bonus rows that have non-zero values.
 *
 * Layout:
 * +----------------------------------+
 * |       +{total} XP                |  <- Large ember text
 * |       XP EARNED                  |  <- Muted label
 * +----------------------------------+
 * |  BASE           10 x {sets}  +{base}  |
 * |  VOLUME BONUS              +{volume}  |
 * |  PR BONUS                  +{pr}      |  <- Only if > 0
 * |  CONSISTENCY               +{consist} |  <- Only if > 0
 * |  TEMPO BONUS               +{tempo}   |  <- Only if > 0
 * +----------------------------------+
 */
export function XPBreakdown({ total, breakdown, totalSets }: XPBreakdownProps) {
  return (
    <View style={styles.container}>
      {/* Total XP section */}
      <View style={styles.totalSection}>
        <Text style={styles.totalValue}>+{formatNumber(total)} XP</Text>
        <Text style={styles.totalLabel}>XP EARNED</Text>
      </View>

      {/* Breakdown section */}
      <View style={styles.breakdownSection}>
        {/* Base XP - always shown */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>BASE</Text>
          <Text style={styles.rowFormula}>10 x {totalSets}</Text>
          <Text style={styles.rowValue}>+{formatNumber(breakdown.base)}</Text>
        </View>

        {/* Volume bonus - always shown */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>VOLUME BONUS</Text>
          <View style={styles.spacer} />
          <Text style={styles.rowValue}>+{formatNumber(breakdown.volumeBonus)}</Text>
        </View>

        {/* PR bonus - only if > 0 */}
        {breakdown.prBonus > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>PR BONUS</Text>
            <View style={styles.spacer} />
            <Text style={styles.rowValueHighlight}>+{formatNumber(breakdown.prBonus)}</Text>
          </View>
        )}

        {/* Consistency bonus - only if > 0 */}
        {breakdown.consistencyBonus > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>CONSISTENCY</Text>
            <View style={styles.spacer} />
            <Text style={styles.rowValueHighlight}>+{formatNumber(breakdown.consistencyBonus)}</Text>
          </View>
        )}

        {/* Tempo bonus - only if > 0 */}
        {breakdown.tempoBonus > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>TEMPO BONUS</Text>
            <View style={styles.spacer} />
            <Text style={styles.rowValueHighlight}>+{formatNumber(breakdown.tempoBonus)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 2,
    borderColor: colors.ember[500],
    borderRadius: 8,
    overflow: 'hidden',
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.ember[700],
  },
  totalValue: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.ember[500],
    letterSpacing: 2,
  },
  totalLabel: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.muted,
    letterSpacing: 2,
    marginTop: 8,
  },
  breakdownSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLabel: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  rowFormula: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    marginLeft: 12,
  },
  spacer: {
    flex: 1,
  },
  rowValue: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'right',
    marginLeft: 16,
    minWidth: 60,
  },
  rowValueHighlight: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.ember[500],
    textAlign: 'right',
    marginLeft: 16,
    minWidth: 60,
  },
});
