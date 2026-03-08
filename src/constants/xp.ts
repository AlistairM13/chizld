import { type LevelThreshold } from '../types/index';

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1,  xpRequired: 0,    title: 'Untrained' },
  { level: 2,  xpRequired: 100,  title: 'Beginner' },
  { level: 3,  xpRequired: 300,  title: 'Novice' },
  { level: 4,  xpRequired: 600,  title: 'Intermediate' },
  { level: 5,  xpRequired: 1000, title: 'Dedicated' },
  { level: 6,  xpRequired: 1500, title: 'Advanced' },
  { level: 7,  xpRequired: 2200, title: 'Veteran' },
  { level: 8,  xpRequired: 3000, title: 'Elite' },
  { level: 9,  xpRequired: 4000, title: 'Master' },
  { level: 10, xpRequired: 5500, title: 'Chizld' },
] as const;
