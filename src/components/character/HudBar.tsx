import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { useUptimeCounter } from '../../hooks/useUptimeCounter';
import { TypewriterText } from './TypewriterText';

/**
 * Top HUD bar displaying CHIZLD branding and system codes.
 * Uses TypewriterText for terminal boot animation.
 */
export function HudBarTop() {
  return (
    <View style={styles.topBar}>
      {/* Left: CHIZLD branding in Chakra Petch Bold */}
      <TypewriterText
        text="CHIZLD"
        delayMs={60}
        style={styles.branding}
      />

    </View>
  );
}

interface HudBarBottomProps {
  activeZoneCount: number;
  totalZones?: number;
  isDetailMode?: boolean;
}

/**
 * Bottom HUD bar displaying zone count and session uptime.
 * In detail mode, shows BUILD version and ESC TO RETURN.
 * Single line format with bullet separators in system text color.
 */
export function HudBarBottom({
  activeZoneCount,
  totalZones = 8,
  isDetailMode = false,
}: HudBarBottomProps) {
  const uptime = useUptimeCounter();

  // Hide in detail mode
  if (isDetailMode) {
    return null;
  }

  // Single line format with bullet separators
  const statusText = `ZONES: ${totalZones} \u2022 ACTIVE: ${activeZoneCount}/${totalZones} \u2022 UPTIME: ${uptime}`;

  return (
    <View style={styles.bottomBar}>
      <TypewriterText
        text={statusText}
        delayMs={25}
        style={styles.systemStatusText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 68,  // Above tab bar (60px) with margin
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  branding: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: 3,
  },
  statusText: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  systemStatusText: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.system,
    letterSpacing: 0.5,
  },
});
