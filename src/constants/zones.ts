import { type ZoneId, type Zone } from '../types/index';

export const ZONE_IDS: ZoneId[] = [
  'traps',
  'biceps',
  'forearms',
  'tibialis',
  'neck',
  'shoulders',
  'abs',
  'quads',
] as const;

export const zones: Zone[] = [
  { id: 'traps',     name: 'TRAPS',     side: 'left',  position: 'upper' },
  { id: 'biceps',    name: 'BICEPS',    side: 'left',  position: 'mid-upper' },
  { id: 'forearms',  name: 'FOREARMS',  side: 'left',  position: 'mid-lower' },
  { id: 'tibialis',  name: 'TIBIALIS',  side: 'left',  position: 'lower' },
  { id: 'neck',      name: 'NECK',      side: 'right', position: 'upper' },
  { id: 'shoulders', name: 'SHOULDERS', side: 'right', position: 'mid-upper' },
  { id: 'abs',       name: 'ABS',       side: 'right', position: 'mid-lower' },
  { id: 'quads',     name: 'QUADS',     side: 'right', position: 'lower' },
] as const;
