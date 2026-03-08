import { type ZoneId } from '../types/index';

// Character image dimensions (3x of 185x372 SVG viewBox)
const CHARACTER_WIDTH = 555;
const CHARACTER_HEIGHT = 1116;
const CHARACTER_ASPECT = CHARACTER_WIDTH / CHARACTER_HEIGHT; // ~0.497

/**
 * Calculate responsive character positioning based on screen dimensions.
 * Character is scaled to ~80% of screen height while maintaining aspect ratio.
 */
export function getCharacterLayout(screenWidth: number, screenHeight: number) {
  const characterHeight = screenHeight * 0.8;
  const characterWidth = characterHeight * CHARACTER_ASPECT;
  const characterX = (screenWidth - characterWidth) / 2;
  const characterY = (screenHeight - characterHeight) / 2;
  const scanFramePadding = Math.min(screenWidth, screenHeight) * 0.02;

  return {
    characterWidth,
    characterHeight,
    characterX,
    characterY,
    scanFramePadding,
  };
}

export interface ZoneCardPosition {
  x: number;      // Card center X position (percentage of screen width)
  y: number;      // Card center Y position (percentage of screen height)
  anchorX: number; // Anchor point on character body (percentage of screen width)
  anchorY: number; // Anchor point on character body (percentage of screen height)
}

/**
 * Zone card positions mapped for landscape layout.
 * Left zones (traps, biceps, forearms, tibialis): cards positioned left of center
 * Right zones (neck, shoulders, abs, quads): cards positioned right of center
 *
 * Positions are percentages of screen dimensions for responsiveness.
 * Anchors are approximate center points of each muscle region on the character.
 */
export const ZONE_CARD_POSITIONS: Record<ZoneId, ZoneCardPosition> = {
  // Left side zones - cards on left edge
  traps: {
    x: 0.12,       // Left edge
    y: 0.20,       // Upper region
    anchorX: 0.42, // Left shoulder area
    anchorY: 0.22,
  },
  biceps: {
    x: 0.12,
    y: 0.40,       // Mid-upper region
    anchorX: 0.35,
    anchorY: 0.35,
  },
  forearms: {
    x: 0.12,
    y: 0.60,       // Mid-lower region
    anchorX: 0.33,
    anchorY: 0.50,
  },
  tibialis: {
    x: 0.12,
    y: 0.80,       // Lower region
    anchorX: 0.44,
    anchorY: 0.82,
  },

  // Right side zones - cards on right edge
  neck: {
    x: 0.88,       // Right edge
    y: 0.20,       // Upper region
    anchorX: 0.50, // Neck center
    anchorY: 0.15,
  },
  shoulders: {
    x: 0.88,
    y: 0.40,       // Mid-upper region
    anchorX: 0.58,
    anchorY: 0.22,
  },
  abs: {
    x: 0.88,
    y: 0.60,       // Mid-lower region
    anchorX: 0.50,
    anchorY: 0.50,
  },
  quads: {
    x: 0.88,
    y: 0.80,       // Lower region
    anchorX: 0.56,
    anchorY: 0.70,
  },
};
