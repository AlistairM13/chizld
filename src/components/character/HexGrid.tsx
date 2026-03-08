import React, { useMemo } from 'react';
import { Skia, Path } from '@shopify/react-native-skia';

// Hex grid configuration
const HEX_SIZE = 20;
const HEX_LINE_WEIGHT = 0.5;

/**
 * Generate hex grid path for the given viewport dimensions.
 * Pre-computed via useMemo to avoid per-frame calculation.
 */
function generateHexGrid(width: number, height: number) {
  const path = Skia.Path.Make();
  const hexWidth = HEX_SIZE * 2;
  const hexHeight = HEX_SIZE * Math.sqrt(3);

  // Generate hexagon grid covering viewport with margin
  const rows = Math.ceil(height / hexHeight) + 2;
  const cols = Math.ceil(width / hexWidth) + 2;

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      // Offset every other row for honeycomb pattern
      const offsetX = row % 2 === 0 ? 0 : hexWidth / 2;
      const cx = col * hexWidth + offsetX;
      const cy = row * hexHeight;

      // Draw hexagon with 6 vertices
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + HEX_SIZE * Math.cos(angle);
        const y = cy + HEX_SIZE * Math.sin(angle);

        if (i === 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      path.close();
    }
  }

  return path;
}

interface HexGridProps {
  width: number;
  height: number;
}

/**
 * HexGrid renders a subtle hex pattern background using Skia Path.
 * The grid is pre-computed and renders at ~5% opacity for ambient effect.
 */
export function HexGrid({ width, height }: HexGridProps) {
  const hexPath = useMemo(
    () => generateHexGrid(width, height),
    [width, height]
  );

  return (
    <Path
      path={hexPath}
      style="stroke"
      color="rgba(255,255,255,0.05)"
      strokeWidth={HEX_LINE_WEIGHT}
    />
  );
}
