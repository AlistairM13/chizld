import { createMMKV } from 'react-native-mmkv';

// MMKV singleton — created via createMMKV() (v4 Nitro API, NOT new MMKV() which was v3)
export const storage = createMMKV();

// Type-safe key constants for all MMKV preferences
export const MMKV_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  CHARACTER_PRESET: 'character_preset',
  CURRENT_PHOTO_PATH: 'current_photo_path',
  DIET_TARGETS: 'diet_targets',
  SLEEP_SCHEDULE: 'sleep_schedule',
  TEMPO_DEFAULTS: 'tempo_defaults',
  REST_TIMER_DEFAULT: 'rest_timer_default',
} as const;

/**
 * Initialize default MMKV preferences on first launch.
 * Only sets values that are not already present — safe to call on every startup.
 *
 * Defaults set:
 *   - onboarding_complete: false
 *   - character_preset: 'medium'
 *   - rest_timer_default: 90 (seconds)
 *   - tempo_defaults: JSON with eccentric/pause/concentric/pause values
 *
 * NOT set (no meaningful default, must be user-configured):
 *   - current_photo_path
 *   - diet_targets
 *   - sleep_schedule
 */
export function initMMKVDefaults(): void {
  if (!storage.contains(MMKV_KEYS.ONBOARDING_COMPLETE)) {
    storage.set(MMKV_KEYS.ONBOARDING_COMPLETE, false);
  }

  if (!storage.contains(MMKV_KEYS.CHARACTER_PRESET)) {
    storage.set(MMKV_KEYS.CHARACTER_PRESET, 'medium');
  }

  if (!storage.contains(MMKV_KEYS.REST_TIMER_DEFAULT)) {
    storage.set(MMKV_KEYS.REST_TIMER_DEFAULT, 90);
  }

  if (!storage.contains(MMKV_KEYS.TEMPO_DEFAULTS)) {
    storage.set(
      MMKV_KEYS.TEMPO_DEFAULTS,
      JSON.stringify({
        eccentric: 3,
        pause_bottom: 1,
        concentric: 2,
        pause_top: 1,
      })
    );
  }
}
