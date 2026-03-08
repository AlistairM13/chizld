import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

interface ZoneLabelProps {
  zoneName: string;       // e.g., "TRAPS"
  level: number;          // e.g., 5
  isWarm: boolean;        // drives color selection
  isSelected?: boolean;   // cyan highlight when selected
  side: 'left' | 'right'; // text alignment (left-side zones align right, right-side zones align left)
}

/**
 * ZoneLabel displays zone name and level as floating text.
 *
 * - No background or border - just text elements
 * - Selected zones: cyan text (highest priority)
 * - Warm zones: ember-orange text colors
 * - Cold zones: grey muted text colors
 * - Left-side zones align text to the right (flex-end)
 * - Right-side zones align text to the left (flex-start)
 */
export function ZoneLabel({ zoneName, level, isWarm, isSelected = false, side }: ZoneLabelProps) {
  // Color scheme: selected > warm (ember) > cold (grey)
  const nameColor = isSelected
    ? colors.zone.selected
    : isWarm
      ? colors.ember[500]
      : colors.text.secondary;
  const levelColor = isSelected
    ? colors.zone.selected
    : isWarm
      ? colors.ember[300]
      : colors.text.muted;

  // Text alignment: left-side zones align right, right-side zones align left
  const alignItems = side === 'left' ? 'flex-end' : 'flex-start';

  return (
    <View style={[styles.container, { alignItems }]}>
      <Text style={[styles.zoneName, { color: nameColor }]}>
        {zoneName.toUpperCase()}
      </Text>
      <Text style={[styles.level, { color: levelColor }]}>
        LV.{level}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Fixed width ensures PhotoSlots align vertically across all zone cards
    width: 80,
  },
  zoneName: {
    fontFamily: fonts.heading, // Barlow Condensed SemiBold
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  level: {
    fontFamily: fonts.monoLight, // JetBrains Mono Regular
    fontSize: 11,
    marginTop: 2,
  },
});
