import React from 'react';
import { Skia, Path } from '@shopify/react-native-skia';
import { colors } from '../../constants/colors';

interface ScanFrameProps {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
}

/**
 * ScanFrame draws teal L-shaped corner brackets around the character area.
 * Creates a tactical scanner/blueprint aesthetic without a full rectangle.
 */
export function ScanFrame({ x, y, width, height, padding }: ScanFrameProps) {
  const frameX = x - padding;
  const frameY = y - padding;
  const frameWidth = width + padding * 2;
  const frameHeight = height + padding * 2;

  // Corner bracket length (15% of smaller dimension)
  const bracketLength = Math.min(frameWidth, frameHeight) * 0.15;
  const strokeWidth = 1.5;

  // Create path with 4 L-shaped corners
  const path = Skia.Path.Make();

  // Top-left corner
  path.moveTo(frameX, frameY + bracketLength);
  path.lineTo(frameX, frameY);
  path.lineTo(frameX + bracketLength, frameY);

  // Top-right corner
  path.moveTo(frameX + frameWidth - bracketLength, frameY);
  path.lineTo(frameX + frameWidth, frameY);
  path.lineTo(frameX + frameWidth, frameY + bracketLength);

  // Bottom-right corner
  path.moveTo(frameX + frameWidth, frameY + frameHeight - bracketLength);
  path.lineTo(frameX + frameWidth, frameY + frameHeight);
  path.lineTo(frameX + frameWidth - bracketLength, frameY + frameHeight);

  // Bottom-left corner
  path.moveTo(frameX + bracketLength, frameY + frameHeight);
  path.lineTo(frameX, frameY + frameHeight);
  path.lineTo(frameX, frameY + frameHeight - bracketLength);

  return (
    <Path
      path={path}
      style="stroke"
      color={colors.hud.teal}
      strokeWidth={strokeWidth}
      strokeCap="square"
    />
  );
}
