import React, { useMemo } from 'react';
import { Path, Skia, DashPathEffect, Group } from '@shopify/react-native-skia';
import { type ZoneWithIntensity } from '../../hooks/useZoneStats';
import { ZONE_CARD_POSITIONS } from '../../constants/layout';

interface ConnectingLinesProps {
  zones: ZoneWithIntensity[];
  screenWidth: number;
  screenHeight: number;
}

// Dash pattern: 4px dash, 4px gap
const DASH_INTERVALS = [4, 4] as const;

// Colors for warm and cold lines
const WARM_LINE_COLOR = 'rgba(255,140,26,0.6)';
const COLD_LINE_COLOR = 'rgba(136,136,160,0.4)';

/**
 * ConnectingLines renders dashed lines from zone cards to body anchor points.
 *
 * Uses Skia DashPathEffect for blueprint/schematic aesthetic.
 * Warm zones get ember-orange lines, cold zones get grey lines.
 */
export function ConnectingLines({ zones, screenWidth, screenHeight }: ConnectingLinesProps) {
  // Pre-compute all line paths
  const linePaths = useMemo(() => {
    return zones.map((zone) => {
      const positions = ZONE_CARD_POSITIONS[zone.zoneId];
      if (!positions) return null;

      // Card center position
      const cardX = positions.x * screenWidth;
      const cardY = positions.y * screenHeight;

      // Photo slot center (offset from card center)
      const slotX = cardX + positions.slotOffsetX;
      const slotY = cardY; // Same Y position

      // Anchor position on body
      const anchorX = positions.anchorX * screenWidth;
      const anchorY = positions.anchorY * screenHeight;

      // Create line path from PHOTO SLOT to anchor
      const path = Skia.Path.Make();
      path.moveTo(slotX, slotY); // Start from slot, not card center
      path.lineTo(anchorX, anchorY);

      return {
        path,
        isWarm: zone.isWarm,
        zoneId: zone.zoneId,
      };
    }).filter(Boolean);
  }, [zones, screenWidth, screenHeight]);

  return (
    <Group>
      {linePaths.map((lineData) => {
        if (!lineData) return null;

        return (
          <Path
            key={lineData.zoneId}
            path={lineData.path}
            style="stroke"
            color={lineData.isWarm ? WARM_LINE_COLOR : COLD_LINE_COLOR}
            strokeWidth={1}
          >
            <DashPathEffect intervals={[...DASH_INTERVALS]} phase={0} />
          </Path>
        );
      })}
    </Group>
  );
}
