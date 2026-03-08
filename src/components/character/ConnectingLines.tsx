import React, { useMemo } from 'react';
import { Path, Skia, DashPathEffect, Group } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { type ZoneWithIntensity } from '../../hooks/useZoneStats';
import { ZONE_CARD_POSITIONS } from '../../constants/layout';
import { colors } from '../../constants/colors';

interface ConnectingLinesProps {
  zones: ZoneWithIntensity[];
  screenWidth: number;
  screenHeight: number;
  selectedZone?: string | null;
  detailMode?: boolean;      // When true, draw line to stat card
  statCardX?: number;        // Left edge X position of stat card
}

// Dash pattern: 4px dash, 4px gap
const DASH_INTERVALS = [4, 4] as const;

// Colors for warm, cold, and selected lines
const WARM_LINE_COLOR = 'rgba(255,140,26,0.6)';
const COLD_LINE_COLOR = 'rgba(136,136,160,0.4)';
const SELECTED_LINE_COLOR = colors.zone.selected;

// PhotoSlot size (must match PhotoSlot component)
const PHOTO_SLOT_SIZE = 50;
const HALF_SLOT = PHOTO_SLOT_SIZE / 2;

/**
 * ConnectingLines renders dashed lines from zone cards to body anchor points.
 *
 * Uses Skia DashPathEffect for blueprint/schematic aesthetic.
 * Warm zones get ember-orange lines, cold zones get grey lines.
 * Selected zones have animated marching ants effect.
 */

// Animated line with its own animation loop
function AnimatedLine({
  path,
  color,
}: {
  path: ReturnType<typeof Skia.Path.Make>;
  color: string;
}) {
  const phase = useSharedValue(0);

  // Start animation on mount
  React.useEffect(() => {
    phase.value = withRepeat(
      withTiming(8, { duration: 500, easing: Easing.linear }),
      -1,
      false
    );
  }, [phase]);

  return (
    <Path path={path} style="stroke" color={color} strokeWidth={1}>
      <DashPathEffect intervals={[...DASH_INTERVALS]} phase={phase} />
    </Path>
  );
}

// Static line component for non-selected state
function StaticLine({
  path,
  color,
}: {
  path: ReturnType<typeof Skia.Path.Make>;
  color: string;
}) {
  return (
    <Path path={path} style="stroke" color={color} strokeWidth={1}>
      <DashPathEffect intervals={[...DASH_INTERVALS]} phase={0} />
    </Path>
  );
}

export function ConnectingLines({
  zones,
  screenWidth,
  screenHeight,
  selectedZone,
  detailMode = false,
  statCardX,
}: ConnectingLinesProps) {
  // In detail mode, draw only the selected zone's line to the stat card
  if (detailMode && selectedZone) {
    const zone = zones.find((z) => z.zoneId === selectedZone);
    if (zone) {
      const positions = ZONE_CARD_POSITIONS[zone.zoneId];
      if (positions) {
        // Card center position
        const cardX = positions.x * screenWidth;
        const cardY = positions.y * screenHeight;

        // Photo slot center (offset from card center)
        const slotCenterX = cardX + positions.slotOffsetX;

        // Line starts from slot EDGE
        const isLeftSide = positions.slotOffsetX > 0;
        const edgeOffset = isLeftSide ? HALF_SLOT + 10 : -HALF_SLOT;
        const lineStartX = slotCenterX + edgeOffset;
        const lineStartY = cardY;

        // End at stat card left edge, vertically centered
        const lineEndX = statCardX ?? screenWidth * 0.4;
        const lineEndY = screenHeight / 2;

        const path = Skia.Path.Make();
        path.moveTo(lineStartX, lineStartY);
        path.lineTo(lineEndX, lineEndY);

        return (
          <Group>
            <AnimatedLine path={path} color={SELECTED_LINE_COLOR} />
          </Group>
        );
      }
    }
    return null;
  }

  // Normal mode: render lines from all zones to body anchors
  // Pre-compute all line paths
  const linePaths = useMemo(() => {
    return zones.map((zone) => {
      const positions = ZONE_CARD_POSITIONS[zone.zoneId];
      if (!positions) return null;

      // Card center position
      const cardX = positions.x * screenWidth;
      const cardY = positions.y * screenHeight;

      // Photo slot center (offset from card center)
      const slotCenterX = cardX + positions.slotOffsetX;
      const slotY = cardY; // Same Y position

      // Line starts from slot EDGE, not center
      // Left-side zones (positive slotOffsetX): start from right edge + extra clearance
      // Right-side zones (negative slotOffsetX): start from left edge
      const isLeftSide = positions.slotOffsetX > 0;
      const edgeOffset = isLeftSide ? HALF_SLOT + 10 : -HALF_SLOT;
      const lineStartX = slotCenterX + edgeOffset;

      // Anchor position on body
      const anchorX = positions.anchorX * screenWidth;
      const anchorY = positions.anchorY * screenHeight;

      // Create line path from PHOTO SLOT EDGE to anchor
      const path = Skia.Path.Make();
      path.moveTo(lineStartX, slotY); // Start from slot edge
      path.lineTo(anchorX, anchorY);

      return {
        path,
        isWarm: zone.isWarm,
        zoneId: zone.zoneId,
      };
    }).filter(Boolean);
  }, [zones, screenWidth, screenHeight]);

  // Get line color based on selection and warm state
  const getLineColor = (zoneId: string, isWarm: boolean) => {
    if (selectedZone === zoneId) return SELECTED_LINE_COLOR;
    if (isWarm) return WARM_LINE_COLOR;
    return COLD_LINE_COLOR;
  };

  return (
    <Group>
      {linePaths.map((lineData) => {
        if (!lineData) return null;

        const isSelected = selectedZone === lineData.zoneId;
        const color = getLineColor(lineData.zoneId, lineData.isWarm);

        if (isSelected) {
          return (
            <AnimatedLine
              key={lineData.zoneId}
              path={lineData.path}
              color={color}
            />
          );
        }

        return (
          <StaticLine
            key={lineData.zoneId}
            path={lineData.path}
            color={color}
          />
        );
      })}
    </Group>
  );
}
