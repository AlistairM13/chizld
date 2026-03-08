import { type ZoneId } from '../../types/index';

export type { ZoneId };

export interface ZoneBounds {
  // Approximate bounding box in SVG coordinate space (0 0 185 372)
  x: number;
  y: number;
  width: number;
  height: number;
}

// TODO Phase 2: Replace with actual path data from muscle-front.svg visual inspection
// These are placeholder estimates based on the 185x372 SVG viewBox.
// Phase 2 BodyCanvas implementation will refine these bounding boxes.
export const zoneBounds: Record<ZoneId, ZoneBounds> = {
  traps:     { x: 60,  y: 45,  width: 65, height: 30 },
  biceps:    { x: 15,  y: 80,  width: 35, height: 50 },
  forearms:  { x: 8,   y: 135, width: 30, height: 50 },
  tibialis:  { x: 55,  y: 280, width: 30, height: 55 },
  neck:      { x: 80,  y: 15,  width: 25, height: 30 },
  shoulders: { x: 110, y: 45,  width: 50, height: 35 },
  abs:       { x: 70,  y: 150, width: 45, height: 60 },
  quads:     { x: 60,  y: 210, width: 65, height: 70 },
};
