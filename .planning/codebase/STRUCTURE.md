# Codebase Structure

**Analysis Date:** 2026-03-08

## Directory Layout

```
chizld-app/
├── src/
│   ├── app/                      # Expo Router file-based routes
│   │   ├── _layout.tsx           # Root layout (fonts, DB init, navigation setup)
│   │   ├── index.tsx             # CharacterScreen (character overview, zone select)
│   │   ├── explore.tsx           # Placeholder for secondary tab
│   │   ├── character/
│   │   │   ├── detail.tsx        # Zone detail state with stat card
│   │   │   └── photo-compare.tsx # Progress photo timeline
│   │   ├── workout/
│   │   │   ├── list.tsx          # Workout history dashboard
│   │   │   ├── session.tsx       # Active workout logging
│   │   │   ├── exercise-select.tsx # Exercise picker filtered by zone
│   │   │   ├── tempo.tsx         # Voice countdown timer
│   │   │   └── summary.tsx       # Session summary & XP result
│   │   ├── sleep/
│   │   │   ├── dashboard.tsx     # Sleep metrics & sunlight tracking
│   │   │   ├── sunlight.tsx      # Count-up timer for sunlight exposure
│   │   │   └── log.tsx           # Quick sleep entry form
│   │   ├── diet/
│   │   │   ├── daily.tsx         # Daily calorie/macro tracking
│   │   │   └── add-meal.tsx      # Manual meal entry form
│   │   └── settings/
│   │       └── index.tsx         # Reminders, targets, preferences
│   │
│   ├── components/               # Reusable UI components
│   │   ├── character/
│   │   │   ├── BodyCanvas.tsx    # Skia canvas for character rendering
│   │   │   ├── ZonePaths.ts      # Skia paths for zone hitboxes
│   │   │   ├── ZoneCard.tsx      # Zone label card (cold/warm/selected states)
│   │   │   ├── ZoneDetailPanel.tsx # Stat grid, XP bar, photo history, TRAIN button
│   │   │   ├── HexGrid.tsx       # Background hex pattern (Skia or tiled PNG)
│   │   │   └── EmberParticles.tsx # Glow effects for warm zones
│   │   ├── workout/
│   │   │   ├── SetRow.tsx        # Weight/reps/RPE input row
│   │   │   ├── ExerciseCard.tsx  # Exercise display in session
│   │   │   ├── RestTimer.tsx     # Countdown timer with notifications
│   │   │   └── VoiceCountdown.tsx # expo-speech tempo countdown
│   │   ├── sleep/
│   │   │   ├── SunlightTimer.tsx # Visual timer (color transitions)
│   │   │   └── SleepQualityPicker.tsx # 1-5 rating selector
│   │   ├── diet/
│   │   │   ├── MealCard.tsx      # Single meal display
│   │   │   ├── MacroBar.tsx      # Calorie/protein/carb progress bar
│   │   │   └── NutritionResult.tsx # Daily totals vs targets
│   │   └── shared/
│   │       ├── EmberButton.tsx   # #FF8C1A button with glow
│   │       ├── ProgressBar.tsx   # XP progress bar
│   │       ├── ThemedView.tsx    # View with dark theme background
│   │       └── ThemedText.tsx    # Text with typography tokens
│   │
│   ├── db/                       # SQLite database layer
│   │   ├── database.ts           # Connection init, table creation, seed data
│   │   ├── exercises.ts          # queries: getExercisesByZone, insertExercise
│   │   ├── workouts.ts           # queries: insertSession, insertSet, completeSession
│   │   ├── meals.ts              # queries: insertMeal, getMealsForDate, getDailyTotals
│   │   ├── sleep.ts              # queries: insertSleepLog, getSleepWeekly
│   │   └── xp.ts                 # queries: awardXP, getZoneStats, updateLevel
│   │
│   ├── services/                 # External API & system integrations
│   │   ├── notifications.ts      # expo-notifications scheduling & delivery
│   │   ├── photos.ts             # expo-image-picker & expo-file-system
│   │   ├── voice.ts              # expo-speech TTS coordination
│   │   ├── orientation.ts        # expo-screen-orientation lock to landscape
│   │   └── haptics.ts            # expo-haptics feedback (optional)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useDatabase.ts        # Singleton DB connection
│   │   ├── useZoneStats.ts       # Fetch zone_stats, calculate warm/cold/selected
│   │   ├── useVoiceCountdown.ts  # expo-speech sequencing for tempo
│   │   ├── useSunlightTimer.ts   # Count-up timer with milestone notifications
│   │   ├── useDailyMacros.ts     # Query meals for today, calculate totals
│   │   ├── useWorkoutSession.ts  # State machine for active session
│   │   └── useXPCalculation.ts   # XP rules engine for all sources
│   │
│   ├── constants/                # Design tokens & metadata
│   │   ├── colors.ts             # Chizld color palette (#0A0A0F, #FF8C1A, etc.)
│   │   ├── fonts.ts              # Font family mappings (Chakra Petch, Barlow, JetBrains)
│   │   ├── zones.ts              # Zone definitions (id, name, side, position)
│   │   ├── xp.ts                 # XP rules & level thresholds
│   │   └── theme.ts              # (existing) Layout spacing, theme colors
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # All interfaces (Zone, WorkoutSet, Meal, etc.)
│   │
│   ├── assets/                   # (future) Character presets, sounds
│   │   ├── images/
│   │   │   └── characters/
│   │   │       ├── muscle-front.png # Main anatomical figure
│   │   │       ├── muscle-back.png  # (future) back view preset
│   │   │       └── [other presets]
│   │   └── sounds/
│   │       ├── level-up.wav
│   │       └── phase-chime.wav
│   │
│   └── global.css                # Global styles (web only)
│
├── assets/                       # (existing) Icon assets for Expo build
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   ├── android-icon-*.png
│   │   └── tabIcons/
│   └── expo.icon/
│
├── android/                      # Android native build files (generated by `expo prebuild`)
├── .expo/                        # Expo dev client metadata (git-ignored)
├── .planning/
│   ├── codebase/
│   │   ├── ARCHITECTURE.md       # This document
│   │   ├── STRUCTURE.md          # Codebase layout and organization
│   │   ├── CONVENTIONS.md        # (future) Code style, naming patterns
│   │   ├── TESTING.md            # (future) Test structure, patterns
│   │   ├── STACK.md              # (future) Tech dependencies
│   │   ├── INTEGRATIONS.md       # (future) External services
│   │   └── CONCERNS.md           # (future) Tech debt, issues
│   └── phases/                   # Build phase tracking
│
├── app.json                      # Expo config (orientation set to portrait currently; will be set to landscape in Phase 1)
├── package.json                  # Dependencies (all pre-installed)
├── tsconfig.json                 # Path aliases: @/* → ./src/*, @/assets/* → ./assets/*
├── expo-env.d.ts                 # Expo type definitions
└── README.md                     # Project overview
```

## Directory Purposes

**`src/app/`:**
- Purpose: File-based routing routes (Expo Router convention)
- Contains: One `.tsx` file per route; each file exports a default React component
- Key files: `_layout.tsx` is the root, `index.tsx` is home (/), subdirectories create route structure
- Pattern: `src/app/workout/session.tsx` → navigable at `/workout/session`

**`src/components/`:**
- Purpose: Reusable, composable UI components organized by feature domain
- Contains: React Native components (Views, Text, Pressable, ScrollView, etc.)
- Key files: Each subdirectory (character/, workout/, sleep/, diet/, shared/) groups components by domain
- Pattern: Components are stateless or use only local state; logic pushed to parent screen or hooks

**`src/db/`:**
- Purpose: Database abstraction layer—all SQLite queries centralized here
- Contains: CRUD functions, schema creation, seed data loaders
- Key files: `database.ts` manages connection and initialization; specific files per domain (exercises.ts, workouts.ts, etc.)
- Pattern: Each function is async, returns Promise of data or void; errors bubble up to caller

**`src/services/`:**
- Purpose: Encapsulate external library integrations (Expo APIs, file system, notifications)
- Contains: Initialization logic, async operations, event listeners
- Key files: One file per external system (notifications.ts, photos.ts, voice.ts)
- Pattern: Stateful singletons or factories; exposed as default export

**`src/hooks/`:**
- Purpose: Custom React hooks for state logic and side effects
- Contains: useEffect, useState, database queries, animations
- Key files: Domain-specific hooks (useZoneStats, useSunlightTimer, useXPCalculation)
- Pattern: Hooks are composable; they fetch fresh data or manage local state

**`src/constants/`:**
- Purpose: Single source of truth for design tokens, configuration, metadata
- Contains: Exported const objects (colors, fonts, zones, XP thresholds)
- Key files: Each file exports a named export (e.g., `export const colors = {...}`)
- Pattern: Never import from constants conditionally; always export static values

**`src/types/`:**
- Purpose: TypeScript interface definitions
- Contains: All domain types (Zone, WorkoutSession, WorkoutSet, Meal, SleepLog, etc.)
- Key files: `index.ts` (barrel export of all types)
- Pattern: One interface per table (WorkoutSession, WorkoutSet); use readonly properties

## Key File Locations

**Entry Points:**

- `src/app/_layout.tsx`: Root layout, font loading, DB init, orientation lock
- `src/app/index.tsx`: HomeScreen (CharacterScreen), default route
- `assets/images/characters/muscle-front.png`: Main character figure asset

**Configuration:**

- `tsconfig.json`: Path aliases (@/* → src/*, @/assets/* → assets/*)
- `app.json`: Expo configuration (orientation, plugins, icons)
- `package.json`: Dependencies (all pre-installed, do NOT modify)

**Core Logic:**

- `src/components/character/BodyCanvas.tsx`: Skia rendering, zone hitboxes
- `src/hooks/useXPCalculation.ts`: XP award rules for all sources
- `src/db/database.ts`: SQLite init, table creation, seed data
- `src/constants/colors.ts`: Chizld color palette
- `src/constants/zones.ts`: Zone metadata (id, name, position)

**Testing:**

- `src/__tests__/` (directory): Test files (Jest/Vitest) — to be created
- Pattern: `*.test.ts` or `*.spec.ts` co-located with source files or in `__tests__/` subdirectory

## Naming Conventions

**Files:**

- Route files (`src/app/`): Lowercase with hyphens: `index.tsx`, `session.tsx`, `add-meal.tsx`
- Component files: PascalCase: `BodyCanvas.tsx`, `ZoneCard.tsx`, `EmberButton.tsx`
- Hook files: camelCase with `use` prefix: `useDatabase.ts`, `useZoneStats.ts`
- Database files: camelCase: `exercises.ts`, `workouts.ts`, `meals.ts`
- Utility/service files: camelCase: `notifications.ts`, `photos.ts`
- Type/constant files: Either camelCase or PascalCase, but exported const is camelCase: `zones.ts` (exports `const zones`)

**Directories:**

- Feature domains (lowercase): `character/`, `workout/`, `sleep/`, `diet/`, `shared/`
- Root-level: `app/`, `components/`, `db/`, `services/`, `hooks/`, `constants/`, `types/`

## Where to Add New Code

**New Feature (e.g., "Stretching Module"):**

1. **Route**: Create `src/app/stretching/dashboard.tsx` for the main screen
2. **Components**: Add files to `src/components/stretching/` (StretchingTimer.tsx, StretchCard.tsx, etc.)
3. **Hooks**: Add `src/hooks/useStretchingSession.ts` for state management
4. **Database**: Add `src/db/stretching.ts` for queries; update `src/db/database.ts` to create tables
5. **Constants**: Add constants to `src/constants/xp.ts` if XP is involved
6. **Types**: Add interfaces to `src/types/index.ts`
7. **Navigation**: Update route structure in `src/app/` to add stretching to tabs or stack

**New Component (e.g., "HexBackground"):**

1. Create `src/components/shared/HexBackground.tsx` if reusable, or domain-specific (e.g., `src/components/character/HexBackground.tsx`)
2. Import constants from `src/constants/colors.ts`
3. Use StyleSheet from `react-native`
4. Export as default

**New Hook (e.g., "useStretchingTimer"):**

1. Create `src/hooks/useStretchingTimer.ts`
2. Return state (value, isRunning) and controls (start, pause, reset)
3. Use `useState`, `useEffect`, `useRef` as needed
4. Call database queries via `useDatabase()` hook if needed

**New Database Query (e.g., "Get stretching PRs"):**

1. Add function to `src/db/stretching.ts` (create file if doesn't exist)
2. Use `useDatabase()` in the hook to get DB connection
3. Return Promise with typed result
4. Call from hook or screen

**New Constant (e.g., "STRETCHING_ZONE_ID"):**

1. Add to `src/constants/zones.ts` if it's a zone variant
2. Add to `src/constants/xp.ts` if it's XP-related
3. Or create new file `src/constants/stretching.ts` if domain is large

**New Type (e.g., "StretchSession interface"):**

1. Add to `src/types/index.ts` with barrel export
2. Use `readonly` for properties
3. Import where needed

## Special Directories

**`src/assets/` (future):**

- Purpose: App-specific assets (character presets, sound effects)
- Generated: No—manually created images and audio files
- Committed: Yes—small assets checked in; large assets may be streamed from server (future)

**`.planning/codebase/` (documentation):**

- Purpose: Architecture, structure, conventions, and concerns for Claude Code planning
- Generated: No—manually written by humans/Claude agents
- Committed: Yes—version-controlled for consistency

**`android/` (native):**

- Purpose: Android native build files generated by `expo prebuild`
- Generated: Yes—from Expo config
- Committed: No—typically git-ignored, regenerated on clone

**`.expo/`:**

- Purpose: Expo dev client metadata
- Generated: Yes—automatically by Expo CLI
- Committed: No—git-ignored

**`.claude/`:**

- Purpose: Claude Code session artifacts (temporary)
- Generated: Yes—by Claude Code during development
- Committed: No—git-ignored

## Important: Landscape-Only Orientation

All screens, components, and layouts assume **landscape orientation** (width > height):

- Lock set globally in `src/app/_layout.tsx` via `expo-screen-orientation.lockAsync(Orientation.LANDSCAPE)`
- All FlexBox layouts use `flexDirection: 'row'` as default
- Character screen: Character centered/left, cards right
- Stat panel: Horizontal stat grid (3 columns × 2 rows)
- Tab bar: Bottom horizontal tabs

Do NOT use `flexDirection: 'column'` unless intentional for vertical stacking within a landscape parent.

---

*Structure analysis: 2026-03-08*
