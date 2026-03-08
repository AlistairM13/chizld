import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { TypewriterText } from './TypewriterText';
import { useUptimeCounter } from '../../hooks/useUptimeCounter';

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

      {/* Right: Cryptic system codes in JetBrains Mono */}
      <TypewriterText
        text="SYS::v0.1.0 // INIT::OK"
        delayMs={30}
        style={styles.systemCode}
      />
    </View>
  );
}

interface HudBarBottomProps {
  activeZoneCount: number;
  totalZones?: number;
}

/**
 * Bottom HUD bar displaying zone count and session uptime.
 * Single line format with bullet separators in system text color.
 */
export function HudBarBottom({
  activeZoneCount,
  totalZones = 8,
}: HudBarBottomProps) {
  const uptime = useUptimeCounter();

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
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
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
  systemCode: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 0.5,
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
