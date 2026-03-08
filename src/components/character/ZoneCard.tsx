import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { type ZoneWithIntensity } from '../../hooks/useZoneStats';

interface ZoneCardProps {
  zone: ZoneWithIntensity;
  position: { x: number; y: number };
  screenWidth: number;
  screenHeight: number;
}

// Card dimensions
const CARD_WIDTH = 100;
const CARD_HEIGHT = 60;
const BEVEL = 8; // Corner bevel size

/**
 * Creates a beveled/angular path for cyberpunk HUD aesthetic.
 * Clips the top-left and bottom-right corners.
 */
function createBeveledPath(w: number, h: number, bevel: number) {
  const path = Skia.Path.Make();
  // Start at top-left bevel
  path.moveTo(bevel, 0);
  // Top edge to top-right
  path.lineTo(w, 0);
  // Right edge to bottom-right bevel
  path.lineTo(w, h - bevel);
  // Bottom-right bevel
  path.lineTo(w - bevel, h);
  // Bottom edge to bottom-left
  path.lineTo(0, h);
  // Left edge to top-left bevel
  path.lineTo(0, bevel);
  // Top-left bevel back to start
  path.lineTo(bevel, 0);
  path.close();
  return path;
}

/**
 * ZoneCard displays a beveled card with zone information.
 *
 * - Warm zones: ember-orange border and text
 * - Cold zones: grey border and muted text
 * - Shows zone name, level number, and + photo slot
 */
export function ZoneCard({ zone, position, screenWidth, screenHeight }: ZoneCardProps) {
  const beveledPath = useMemo(() => createBeveledPath(CARD_WIDTH, CARD_HEIGHT, BEVEL), []);

  // Calculate absolute position (position is percentage-based)
  const cardX = position.x * screenWidth - CARD_WIDTH / 2;
  const cardY = position.y * screenHeight - CARD_HEIGHT / 2;

  const borderColor = zone.isWarm ? colors.ember[500] : colors.zone.cold;
  const textColor = zone.isWarm ? colors.ember[500] : colors.text.secondary;

  return (
    <Pressable
      style={[
        styles.card,
        {
          left: cardX,
          top: cardY,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        },
      ]}
      onPress={() => {
        // No-op for Phase 2 - tapping will be implemented in Phase 3
      }}
    >
      {/* Beveled border rendered via Skia */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Path
          path={beveledPath}
          style="stroke"
          color={borderColor}
          strokeWidth={1.5}
        />
      </Canvas>

      {/* Card content */}
      <View style={styles.content}>
        {/* Zone name */}
        <Text
          style={[
            styles.zoneName,
            { color: textColor },
          ]}
          numberOfLines={1}
        >
          {zone.name}
        </Text>

        {/* Level and photo slot row */}
        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.levelNumber,
              { color: textColor },
            ]}
          >
            LV{zone.level}
          </Text>

          {/* Photo slot placeholder */}
          <View style={[styles.photoSlot, { borderColor }]}>
            <Text style={[styles.plusIcon, { color: textColor }]}>+</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    backgroundColor: 'rgba(10,10,15,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  zoneName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    letterSpacing: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelNumber: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  photoSlot: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 16,
  },
});
