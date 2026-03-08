# Architecture

**Analysis Date:** 2026-03-08

## Pattern Overview

**Overall:** Expo Router-based layered architecture with Skia Canvas rendering for game UI.

**Key Characteristics:**
- File-based routing via Expo Router (not React Navigation as originally designed)
- Layered separation: screens → components → hooks → services → database
- Skia Canvas for character rendering and HUD overlays
- SQLite + MMKV dual storage (relational data + preferences)
- Landscape-only orientation locked globally on app startup
- React Native Reanimated for state transitions and animations

## Layers

**Presentation (Screens & Components):**
- Purpose: User-facing interfaces organized by feature domain (character, workout, sleep, diet)
- Location: `src/app/` (route definitions), `src/components/` (reusable UI components)
- Contains: Screen JSX files, component implementations, StyleSheet definitions
- Depends on: Hooks (for state/effects), components (for composition), constants (colors, fonts)
- Used by: Expo Router navigation system

**Business Logic (Hooks & Services):**
- Purpose: Encapsulate domain logic, async operations, state management
- Location: `src/hooks/` (custom React hooks), `src/services/` (external integrations)
- Contains: Data fetching, sensor integration, real-time operations (voice countdown, timers)
- Depends on: Database layer, constants, external libraries (expo-*)
- Used by: Screens and components via React hooks

**Data Access (Database & MMKV):**
- Purpose: Persistent storage abstraction and direct database operations
- Location: `src/db/` (SQLite queries and schema), MMKV (preferences via `react-native-mmkv`)
- Contains: CRUD operations, schema initialization, seed data
- Depends on: `expo-sqlite`, `react-native-mmkv`, type definitions
- Used by: All layers requiring state or preferences

**Constants & Types:**
- Purpose: Single source of truth for design tokens, configuration, and type definitions
- Location: `src/constants/` (colors, fonts, zones, XP tables), `src/types/` (TypeScript interfaces)
- Contains: Color palette, typography definitions, zone metadata, level thresholds
- Depends on: Nothing
- Used by: All other layers

## Data Flow

**Character Zone Interaction (Overview → Detail → Train):**

1. CharacterScreen renders BodyCanvas (Skia) with 8 zone cards around character
2. User taps zone card (Pressable component)
3. Screen state transitions: `selectedZone` updates, triggering layout animations
4. Character slides left (Reanimated.useSharedValue), stat card slides right
5. ZoneDetailPanel queries zone_stats from database, displays XP/level/stats
6. User taps TRAIN button → navigation push to WorkoutSessionScreen with `{ zone: 'biceps' }` param

**Workout Session Flow:**

1. WorkoutSessionScreen receives zone from route params
2. ExerciseSelectScreen filtered by zone using SQLite `exercises` table
3. For each exercise added to session: WorkoutSessionScreen logs sets (weight, reps, RPE, tempo)
4. Set completion triggers XP calculation in `src/hooks/useXPCalculation.ts`
5. On session end: SessionSummaryScreen shows total XP, saves to `workout_sessions` + `workout_sets`
6. XP transaction written to `xp_history`, zone_stats.total_xp + level recalculated
7. Navigation pops back to CharacterScreen, zone glow now reflects updated `last_trained_at`

**Sleep Module:**

1. SleepDashboardScreen displays weekly sleep debt, sunlight exposure streaks
2. SleepLogScreen (quick log): bedtime + wake time → calculates duration_minutes → saves to `sleep_logs`
3. Sunlight timer: ongoing timer with notifications at 10m and 15m thresholds
4. On sleep completion: XP earned to "neck" (head) zone via `useXPCalculation`

**Diet Module:**

1. DailyViewScreen queries `meals` for today, sums calories/macros
2. AddMealScreen (manual entry): name, cals, protein, carbs, fat → saved to `meals`
3. End-of-day: macro targets checked, XP awarded to "abs" zone if within ±10%

**State Management:**

- Persistent state: SQLite (all domain data), MMKV (preferences)
- Transient UI state: React component state, Reanimated shared values (animations)
- No Redux/Zustand—each layer fetches what it needs on demand
- Database queries are **not** cached; each screen/hook reads fresh data
- Animations use `Reanimated.useSharedValue` for gesture-driven state (character slide)

## Key Abstractions

**Zone (Physical + Conceptual):**
- Purpose: Represents a trainable muscle group or body area
- Examples: `traps`, `biceps`, `forearms`, `tibialis`, `neck`, `shoulders`, `abs`, `quads` (defined in `src/constants/zones.ts`)
- Pattern: Zones have their own XP track, level, streak, last_trained_at timestamp
- Uses: Zone IDs link workout_sets to zones via exercise → primary_zone relationship

**XP & Leveling:**
- Purpose: Gamification system that awards XP for workouts, sleep, diet compliance
- Examples: `src/hooks/useXPCalculation.ts`, `src/db/xp.ts`
- Pattern: XP earned per action type (set completion, volume bonus, PR, consistency, sleep, diet)
- Uses: Level thresholds defined in `src/constants/xp.ts` (cumulative XP at each level)

**Workout Session:**
- Purpose: Atomic unit of training work—one focused period on one zone
- Examples: "Chest day Monday 2pm: 3 exercises, 12 sets"
- Pattern: Session contains many exercises; each exercise contains many sets; each set has weight/reps/RPE/tempo
- Uses: `src/db/workouts.ts` provides queries to insert/update/complete sessions

**Skia Canvas Rendering:**
- Purpose: Efficiently render the character figure, zone highlights, HUD overlays
- Examples: `src/components/character/BodyCanvas.tsx`
- Pattern: Skia layer (bottom) with React Native Views overlaid (top) for text/cards
- Uses: Character image (`assets/images/muscle-front.png`), zone paths (Skia paths for tapping)

## Entry Points

**App Startup (`src/app/_layout.tsx`):**
- Location: Root layout file for Expo Router
- Triggers: App launch (always runs first)
- Responsibilities:
  - Load custom fonts (Chakra Petch, Barlow Condensed, JetBrains Mono)
  - Initialize SQLite database (create tables, seed data, check version)
  - Initialize MMKV storage
  - Lock app orientation to LANDSCAPE
  - Set up ThemeProvider for navigation

**HomeScreen (`src/app/index.tsx` → CharacterScreen):**
- Location: First tab in bottom tab navigator
- Triggers: User navigates to home or app opens to default tab
- Responsibilities:
  - Render Skia BodyCanvas with character figure
  - Fetch zone_stats for all 8 zones, calculate warm/cold/selected glow states
  - Render 8 ZoneCard components positioned around character
  - Handle zone selection → state transition → ZoneDetailPanel
  - Fetch and display XP/level/stats for selected zone

**WorkoutSessionScreen (`src/app/workout/session.tsx`):**
- Location: Stack navigator pushed from CharacterScreen TRAIN button
- Triggers: User selects a zone and taps TRAIN
- Responsibilities:
  - Render ExerciseSelectScreen or skip to active session if zone has default exercise
  - For each exercise: log sets (weight, reps, RPE, tempo)
  - Calculate XP on set completion
  - Display rest timer between sets
  - On session end: render SessionSummaryScreen with total XP, option to capture progress photo

## Error Handling

**Strategy:** Try-catch at service/hook boundaries; user-facing errors shown as toast or fallback UI.

**Patterns:**
- Database errors (corrupted schema, disk full): Show error toast, disable affected features
- Missing asset (character image not loaded): Render fallback Skia rectangle with error text
- Animation errors (Reanimated worklet failure): Fallback to instant state change
- Sensor errors (camera unavailable): Disable photo capture, show "camera not available" message
- External API failures (future): Graceful degradation, retry with exponential backoff

## Cross-Cutting Concerns

**Logging:**
- Development: `console.log` for debug info (removed in production via Metro bundler)
- Production: Error logging to `src/services/errorLogger.ts` (stub for future integration)
- Pattern: Log at service/hook boundaries, not in components

**Validation:**
- Numeric inputs (weight, reps, duration): Range checks in component `onChangeText`, database constraints
- Enum inputs (exercise zone, meal type): TypeScript enums in `src/types/index.ts`
- Database: NOT NULL constraints, FOREIGN KEY constraints on references
- Pattern: Validate early (component level), late (database constraint)

**Authentication:**
- Not applicable—personal-use app, no user accounts
- Future-proof: Pass `userId` parameter to all database queries (stub value for now)

**Landscape Orientation:**
- Enforced globally on app startup via `expo-screen-orientation`
- All screens, components, and layouts assume landscape (width > height)
- Flex layout with `flexDirection: 'row'` preferred for landscape composition

---

*Architecture analysis: 2026-03-08*
