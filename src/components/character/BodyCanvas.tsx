import React, { useCallback } from 'react';
import { StyleSheet, useWindowDimensions, Pressable, GestureResponderEvent } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Group,
} from '@shopify/react-native-skia';
import { HexGrid } from './HexGrid';
import { ScanFrame } from './ScanFrame';
import { ScanLine } from './ScanLine';
import { ConnectingLines } from './ConnectingLines';
import { ZoneGlows } from './ZoneGlow';
import { getCharacterLayout } from '../../constants/layout';
import { type ZoneWithIntensity } from '../../hooks/useZoneStats';
import { ZONE_FULL_PATHS } from '../ui/body-svg';
import { colors } from '../../constants/colors';

// SVG viewBox dimensions from the original SVG
const SVG_WIDTH = 185;
const SVG_HEIGHT = 372;
const CHARACTER_ASPECT = SVG_WIDTH / SVG_HEIGHT;


interface BodyCanvasProps {
  zones?: ZoneWithIntensity[];
  selectedZone?: string | null;
  onSelectZone?: (zoneId: string | null) => void;
  detailMode?: boolean;  // When true, draw connection to stat card
  statCardX?: number;    // Left edge X position of stat card
}

/**
 * BodyCanvas is the main Skia canvas composing all visual layers for
 * the character overview screen.
 *
 * Render order (back to front):
 * 1. HexGrid - subtle background pattern
 * 2. ScanFrame - teal corner brackets around character
 * 3. Interactive body parts - SVG paths from body-svg.tsx (tappable)
 * 4. PlatformGlow - ember glow at character feet
 * 5. ZoneGlows - pulsing ember glows for warm zones on body
 * 6. ConnectingLines - dashed lines from cards to body anchors
 * 7. ScanLine - animated vertical sweep
 */
// Pre-parse all zone paths for better performance
const parsedZonePaths: Record<string, ReturnType<typeof Skia.Path.MakeFromSVGString>[]> = {};
Object.entries(ZONE_FULL_PATHS).forEach(([zone, pathStrings]) => {
  parsedZonePaths[zone] = pathStrings
    .map((d) => Skia.Path.MakeFromSVGString(d))
    .filter((p): p is NonNullable<typeof p> => p !== null);
});

export function BodyCanvas({
  zones = [],
  selectedZone = null,
  onSelectZone,
  detailMode = false,
  statCardX,
}: BodyCanvasProps) {
  const { width, height } = useWindowDimensions();

  const layout = getCharacterLayout(width, height);

  // Use layout values for character positioning
  const { characterWidth, characterHeight, characterX, characterY } = layout;

  // Scale factor to transform SVG coordinates to screen coordinates
  const scale = characterHeight / SVG_HEIGHT;


  // Check if a point is inside any path of a zone
  const getZoneAtPoint = useCallback(
    (x: number, y: number): string | null => {
      // Convert screen coordinates to SVG coordinates
      const svgX = (x - characterX) / scale;
      const svgY = (y - characterY) / scale;

      for (const [zone, paths] of Object.entries(parsedZonePaths)) {
        for (const path of paths) {
          if (path.contains(svgX, svgY)) {
            return zone;
          }
        }
      }
      return null;
    },
    [characterX, characterY, scale]
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      // In detail mode, body taps are handled by dismiss handler (not here)
      if (selectedZone !== null) {
        return;
      }
      const { locationX, locationY } = event.nativeEvent;
      const zone = getZoneAtPoint(locationX, locationY);
      onSelectZone?.(zone);
    },
    [getZoneAtPoint, onSelectZone, selectedZone]
  );

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={handlePress}>
      <Canvas style={StyleSheet.absoluteFill}>
          {/* Layer 1: Hex grid background */}
          <HexGrid width={width} height={height} />

          {/* Layer 2: Scan frame brackets */}
          <ScanFrame
            x={characterX}
            y={characterY}
            width={characterWidth}
            height={characterHeight}
            padding={layout.scanFramePadding}
          />

          {/* Layer 3: Interactive body parts */}
          <Group
            transform={[
              { translateX: characterX },
              { translateY: characterY },
              { scale },
            ]}
          >
            {Object.entries(parsedZonePaths).map(([zone, paths]) =>
              paths.map((path, idx) => (
                <Path
                  key={`${zone}-${idx}`}
                  path={path}
                  color={
                    selectedZone === zone
                      ? colors.zone.selected
                      : colors.text.secondary
                  }
                  style="fill"
                />
              ))
            )}
          </Group>


          {/* Layer 5: Zone glows for warm zones */}
          {zones.length > 0 && (
            <ZoneGlows
              zones={zones}
              screenWidth={width}
              screenHeight={height}
              selectedZone={selectedZone}
            />
          )}

          {/* Layer 6: Connecting lines from cards to body */}
          {zones.length > 0 && (
            <ConnectingLines
              zones={zones}
              screenWidth={width}
              screenHeight={height}
              selectedZone={selectedZone}
              detailMode={detailMode}
              statCardX={statCardX}
            />
          )}

          {/* Layer 7: Animated scan line */}
          <ScanLine width={width} height={height} />
      </Canvas>
    </Pressable>
  );
}
