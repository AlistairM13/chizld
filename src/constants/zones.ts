import { type ZoneId, type Zone } from '../types/index';

export const ZONE_IDS: ZoneId[] = [
  'traps',
  'biceps',
  'forearms',
  'back',
  'chest',
  'shoulders',
  'abs',
  'quads',
] as const;

export const zones: Zone[] = [
  { id: 'traps',     name: 'TRAPS',     side: 'left',  position: 'upper' },
  { id: 'biceps',    name: 'BICEPS',    side: 'left',  position: 'mid-upper' },
  { id: 'forearms',  name: 'FOREARMS',  side: 'left',  position: 'mid-lower' },
  { id: 'back',      name: 'BACK',      side: 'left',  position: 'lower' },
  { id: 'shoulders', name: 'SHOULDERS', side: 'right', position: 'upper' },
  { id: 'chest',     name: 'CHEST',     side: 'right', position: 'mid-upper' },
  { id: 'abs',       name: 'ABS',       side: 'right', position: 'mid-lower' },
  { id: 'quads',     name: 'QUADS',     side: 'right', position: 'lower' },
] as const;
