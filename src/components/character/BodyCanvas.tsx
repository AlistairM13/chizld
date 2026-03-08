import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, useImage, Image } from '@shopify/react-native-skia';
import { HexGrid } from './HexGrid';
import { ScanFrame } from './ScanFrame';
import { ScanLine } from './ScanLine';
import { PlatformGlow } from './PlatformGlow';
import { getCharacterLayout } from '../../constants/layout';

// Character image dimensions (3x of 185x372 SVG viewBox)
const CHARACTER_ASPECT = 555 / 1116;

/**
 * BodyCanvas is the main Skia canvas composing all visual layers for
 * the character overview screen.
 *
 * Render order (back to front):
 * 1. HexGrid - subtle background pattern
 * 2. ScanFrame - teal corner brackets around character
 * 3. Character Image - muscle-front.png centered
 * 4. PlatformGlow - ember glow at character feet
 * 5. ScanLine - animated vertical sweep
 */
export function BodyCanvas() {
  const { width, height } = useWindowDimensions();
  const image = useImage(require('../../../assets/images/characters/muscle-front.png'));

  // Handle async image loading
  if (!image) {
    return null;
  }

  const layout = getCharacterLayout(width, height);

  // Calculate character positioning
  const characterHeight = height * 0.8;
  const characterWidth = characterHeight * CHARACTER_ASPECT;
  const characterX = (width - characterWidth) / 2;
  const characterY = (height - characterHeight) / 2;

  // Platform glow position (bottom center of character)
  const platformCx = characterX + characterWidth / 2;
  const platformCy = characterY + characterHeight * 0.95;

  return (
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

      {/* Layer 3: Character image */}
      <Image
        image={image}
        x={characterX}
        y={characterY}
        width={characterWidth}
        height={characterHeight}
        fit="contain"
      />

      {/* Layer 4: Platform glow at feet */}
      <PlatformGlow
        cx={platformCx}
        cy={platformCy}
        characterWidth={characterWidth}
      />

      {/* Layer 5: Animated scan line */}
      <ScanLine width={width} height={height} />
    </Canvas>
  );
}
