# Codebase Concerns

**Analysis Date:** 2026-03-08

## Critical Architecture Mismatch

**Issue: Expo Router vs React Navigation**
- **Problem:** The PRD specifies a bottom-tab React Navigation architecture (`@react-navigation/bottom-tabs`, `@react-navigation/native-stack`), but the codebase is currently built with Expo Router's file-based routing and `NativeTabs` component.
- **Files:**
  - `src/app/_layout.tsx`
  - `src/components/app-tabs.tsx`
  - `package.json` has both `expo-router` and React Navigation packages installed
- **Impact:** The character screen, stat cards, and zone detail UI specified in the PRD cannot be properly implemented using Expo Router's routing structure. The PRD-specified navigation architecture (root stack with main tabs + modal stack screens) is incompatible with the current file-based routing approach.
- **Fix approach:** Complete architectural rebuild required:
  1. Remove Expo Router from active use (keep in package.json for dependencies)
  2. Implement RootNavigator using React Navigation Stack
  3. Create MainTabs with BottomTabNavigator for Home, Train, Sleep, Fuel
  4. Implement modal/stack screens (WorkoutSession, TempoScreen, ExerciseSelectScreen, etc.) as specified in PRD
  5. Migrate all existing screens to the new navigation structure

---

## Missing Core Infrastructure

**Database: No SQLite Implementation**
- **Issue:** SQLite database is completely unimplemented. No tables, schema initialization, or seed data.
- **Files:** No `src/db/database.ts` or related database modules exist
- **Impact:** Cannot log workouts, meals, sleep, or track zone stats. All the core gameplay mechanics depend on this.
- **Fix approach:**
  1. Create `src/db/database.ts` with `openDatabaseSync()` initialization
  2. Create all 9 tables from PRD (exercises, workout_sessions, workout_sets, progress_photos, meals, diet_targets, sleep_logs, sunlight_sessions, zone_stats, xp_history, sleep_reminders)
  3. Create `src/db/exercises.ts`, `src/db/workouts.ts`, `src/db/meals.ts`, `src/db/sleep.ts`, `src/db/xp.ts` for query functions
  4. Create seed function for 40+ exercises and 8 zone_stats rows

**MMKV Key-Value Storage: Not Set Up**
- **Issue:** MMKV is installed but never initialized or used. No preference storage for onboarding, character presets, diet targets, sleep schedule, or tempo defaults.
- **Files:** Package installed but no usage in `src/`
- **Impact:** User preferences cannot be persisted. App will lose state on restart.
- **Fix approach:**
  1. Create `src/services/storage.ts` with MMKV initialization
  2. Define and export storage keys matching PRD constants
  3. Create getter/setter functions for all MMKV_KEYS

---

## Missing Required Components (Phase 2-5)

**Character Screen Not Implemented**
- **Missing:** `src/screens/character/CharacterScreen.tsx`
  - No Skia canvas with hex grid pattern
  - No character muscle image rendering (`muscle-front.png` asset not in assets/)
  - No zone cards positioned around character
  - No overview → detail state transition
  - No zone glow effects (cold/warm/selected)
- **Missing:** `src/components/character/BodyCanvas.tsx`, `ZoneCard.tsx`, `ZoneDetailPanel.tsx`, `HexGrid.tsx`, `ZonePaths.ts`
- **Impact:** Primary app hook (character inspection screen) is missing entirely. Users see blank Expo welcome screen.
- **Files affected:** `src/app/index.tsx` currently shows Expo welcome template
- **Fix approach:** Implement Phase 2 per PRD

**Workout Module Not Implemented**
- **Missing:**
  - `src/screens/workout/ExerciseSelectScreen.tsx` (exercise filtering by zone)
  - `src/screens/workout/WorkoutSessionScreen.tsx` (set logging: weight, reps, RPE)
  - `src/screens/workout/TempoScreen.tsx` (voice countdown using expo-speech)
  - `src/screens/workout/SessionSummaryScreen.tsx` (XP calculation)
  - `src/components/workout/VoiceCountdown.tsx`, `RestTimer.tsx`, `SetRow.tsx`
- **Impact:** Cannot log any workouts. Primary gameplay loop is broken.
- **Fix approach:** Implement Phase 3 per PRD

**Sleep Module Not Implemented**
- **Missing:**
  - `src/screens/sleep/SleepDashboardScreen.tsx`
  - `src/screens/sleep/SunlightTimerScreen.tsx`
  - `src/screens/sleep/SleepLogScreen.tsx`
  - `src/components/sleep/SunlightTimer.tsx`
  - Push notification reminders setup
- **Impact:** Cannot track sleep or recovery optimization. Head zone XP cannot be earned.
- **Fix approach:** Implement Phase 4 per PRD

**Diet Module Not Implemented**
- **Missing:**
  - `src/screens/diet/DailyViewScreen.tsx` (macro tracking with target bars)
  - `src/screens/diet/AddMealScreen.tsx` (manual meal entry)
  - `src/components/diet/MealCard.tsx`, `MacroBar.tsx`, `NutritionResult.tsx`
- **Impact:** Cannot log meals. Abs zone XP cannot be earned.
- **Fix approach:** Implement Phase 4 per PRD

---

## Missing Design System & Constants

**Color Tokens Not Defined**
- **Issue:** PRD specifies exact colors (ember #FF8C1A, cold zone #2A2A3A, bg #0A0A0F, etc.) but `src/constants/colors.ts` doesn't exist. The app uses generic light/dark theme colors instead.
- **Files:** `src/constants/theme.ts` has generic colors, not Chizld-specific tokens
- **Impact:** UI will not match PRD design. Cannot implement glow effects, zone states, or proper visual hierarchy.
- **Fix approach:** Create `src/constants/colors.ts` with exact token values per PRD section 4.1

**Custom Fonts Not Loaded**
- **Issue:** PRD requires Chakra Petch, Barlow Condensed, JetBrains Mono. These are installed (`@expo-google-fonts/*`) but never loaded.
- **Files:** No font initialization in app startup
- **Impact:** App will render in system fonts or defaults. Typography won't match design.
- **Fix approach:**
  1. Create font loading function in app startup (app.tsx or _layout.tsx)
  2. Use `expo-font` to load three fonts before rendering UI
  3. Create `src/constants/fonts.ts` with font family mapping per PRD section 4.2

**Missing Zone & XP Constants**
- **Issue:** No `src/constants/zones.ts` or `src/constants/xp.ts`
- **Impact:** Cannot implement zone-specific data (names, positions, equipment) or XP calculation logic
- **Fix approach:** Create constant files matching PRD sections 3.2 and 7

---

## Configuration & Setup Issues

**Orientation Not Locked to Landscape**
- **Issue:** `app.json` has `"orientation": "portrait"` instead of landscape
- **Files:** `app.json` line 6
- **Impact:** App will start in portrait. Character screen design requires landscape. PRD explicitly states "LANDSCAPE for the entire app" and "lock on startup, never toggle".
- **Fix approach:**
  1. Change `app.json` orientation to `"landscape"` or `"landscapeLeft"`
  2. Add `expo-screen-orientation` call in app startup to lock orientation
  3. Verify Android manifest is set for landscape-only

**Wrong Main Entry Point**
- **Issue:** `package.json` points to `"main": "expo-router/entry"` but app structure should use React Navigation
- **Impact:** App boots with Expo Router instead of proper navigation stack
- **Fix approach:** Change main entry to `expo/entry` (standard Expo entry) and manually initialize React Navigation in root component

---

## Missing Custom Assets

**Character Image Missing**
- **Issue:** PRD references `muscle-front.png` character figure asset but it doesn't exist in `/assets/images/`
- **Files:** Should be at `assets/images/characters/muscle-front.png`
- **Impact:** BodyCanvas component cannot render the anatomical figure, breaking the entire character screen visual
- **Fix approach:** Ensure muscle-front.png is added to assets before implementing BodyCanvas

**Sound Assets Not Implemented**
- **Issue:** `src/assets/sounds/` directory specified in PRD (phase_chime.wav, level_up.wav) doesn't exist
- **Impact:** Cannot implement level-up celebrations, feedback sounds, or audio cues
- **Fix approach:** Create sound assets or placeholder audio files

---

## Type Definitions & Hooks

**Missing Type Definitions**
- **Issue:** No `src/types/index.ts` exists. No types for Zone, WorkoutSet, Meal, SleepLog, etc.
- **Impact:** Cannot safely implement database queries, components, or state management
- **Fix approach:** Create comprehensive types file with all data models from PRD schema

**Missing Custom Hooks**
- **Missing:**
  - `useDatabase.ts` — SQLite query wrapper
  - `useZoneStats.ts` — Zone stats and XP tracking
  - `useVoiceCountdown.ts` — Voice tempo countdown state
  - `useSunlightTimer.ts` — Sunlight tracking timer
  - `useDailyMacros.ts` — Meal macro aggregation
- **Impact:** Cannot share complex stateful logic across screens. Will lead to code duplication.
- **Fix approach:** Implement hooks as Phase 1 part of foundation

---

## Navigation Structure Errors

**Bottom Tab Icons Missing**
- **Issue:** `app-tabs.tsx` references `@/assets/images/tabIcons/{home,explore}.png` but these don't align with PRD tab structure
- **Impact:** Tab bar will break or show wrong icons. PRD specifies 4 tabs (Home/Character, Train, Sleep, Fuel) with specific icons
- **Fix approach:** Replace tab implementation with React Navigation bottom-tabs + correct icons

**No Navigation Type Definitions**
- **Issue:** PRD specifies complete navigation hierarchy (`RootNavigator.tsx`, `MainTabs.tsx`, `types.ts`) but none exist
- **Impact:** Cannot safely navigate between screens with typed params
- **Fix approach:** Implement navigation structure per PRD section 8

---

## Potential Runtime Issues

**No Error Boundaries**
- **Issue:** No error handling infrastructure. Crashes in Skia rendering or async operations will crash entire app.
- **Files:** No error boundary components implemented
- **Impact:** Development friction. Bad user experience if critical screens crash.
- **Fix approach:** Add ErrorBoundary component for screens; add try/catch in async operations

**Unhandled Permissions**
- **Issue:** App uses expo-camera, expo-image-picker, expo-notifications without permission requests
- **Files:** No permissions setup
- **Impact:** Features will silently fail on Android without user having granted permissions. Confusing UX.
- **Fix approach:** Add permission requests in relevant screens using expo-permissions (or expo-application-services)

**No Loading/Empty States**
- **Issue:** Database queries and async operations will have no loading indicators or empty state fallbacks
- **Impact:** UI freezes waiting for database reads. Confusing if data missing.
- **Fix approach:** Add loading spinners and empty state components per screen

---

## Testing & Quality

**No Tests Implemented**
- **Issue:** No test files (*.test.ts, *.spec.ts) or test configuration (jest.config, vitest.config)
- **Impact:** Cannot verify XP calculation logic, database schema, workout set logging, or macro calculation
- **Priority:** Medium — becomes critical as features are implemented

**No Linting or Type Checking**
- **Issue:** `package.json` has `"lint": "expo lint"` script but ESLint not configured. TypeScript in strict mode but no CI/pre-commit checks.
- **Impact:** Code quality degradation. Type errors may accumulate.
- **Fix approach:** Set up ESLint rules + TypeScript strict mode enforcement

---

## Performance Considerations

**SQLite Queries Not Optimized**
- **Issue:** Database layer not implemented yet, but should use prepared statements and batch operations
- **Impact:** Zone stats calculations and history queries could be slow with large datasets
- **Priority:** Low initially, becomes High after Phase 1-2 implementation. Monitor when real data exists.

**Skia Canvas Performance**
- **Issue:** Hex grid pattern and glow effects may be expensive. Not yet implemented.
- **Impact:** Character screen could stutter on lower-end Android devices
- **Fix approach:** Profile and optimize Skia rendering paths. Consider pre-rendering grid as image texture.

**State Management Complexity**
- **Issue:** No state management library (Redux, Zustand, etc.). Complex state (zone stats, workout progress, daily macros) will be thread through props or multiple useContext calls.
- **Impact:** Prop drilling. Hard to debug state changes across screens.
- **Priority:** Medium — acceptable for MVP if hooks are well-designed, becomes concern if state tree grows

---

## Integration Gaps

**No Push Notifications Setup**
- **Issue:** `expo-notifications` installed but no notification service or permission handling
- **Files:** Should be `src/services/notifications.ts`
- **Impact:** Sleep reminders (caffeine cutoff, wind-down, bedtime) cannot be implemented
- **Fix approach:** Implement notification service with daily scheduling per PRD section 10

**No Progress Photo Service**
- **Issue:** `expo-camera` and `expo-image-picker` installed but no photo capture/storage logic
- **Files:** Should be `src/services/photos.ts`
- **Impact:** Cannot implement progress photo timeline or photo compare feature
- **Fix approach:** Implement photo service with file storage + progress_photos table queries

**Voice Speech Not Tested**
- **Issue:** `expo-speech` installed but no VoiceCountdown component or timing verification
- **Impact:** Tempo mode (signature feature) will be difficult to implement without testing
- **Fix approach:** Prototype voice countdown timing early in Phase 3 to verify accuracy

---

## Documentation & Clarity

**No Comments in Existing Code**
- **Issue:** Existing components (AnimatedIcon, ThemedText, etc.) have minimal documentation
- **Impact:** New developer onboarding harder. But low priority since most code will be rewritten anyway.

**PRD Implementation Tracking**
- **Issue:** No checklist or progress tracking against 32-item build order
- **Impact:** Easy to miss or duplicate work across phases
- **Fix approach:** Create phase implementation tracker (could be in CI/GitHub issues)

---

## Summary of Blockers by Severity

### **CRITICAL (Must fix before Phase 1 complete)**
1. Navigation: Switch from Expo Router to React Navigation structure
2. Database: Implement SQLite schema + seed data
3. MMKV: Initialize preference storage
4. Type definitions: Define all data models
5. Constants: Define colors, fonts, zones, XP
6. Orientation: Lock to landscape in app.json

### **HIGH (Must fix before Phase 2)**
1. Custom fonts: Load all three fonts on startup
2. BodyCanvas & zone components: Implement character screen
3. Asset: Ensure muscle-front.png exists

### **MEDIUM (Can fix in Phase 3-5)**
1. Workout module screens & voice countdown
2. Sleep module screens & notifications
3. Diet module screens
4. Error boundaries & permission handling
5. Progress photo service

### **LOW (Polish/optimization)**
1. Skia rendering performance profiling
2. Test coverage
3. State management library consideration

---

*Concerns audit: 2026-03-08*
