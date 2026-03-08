# CHIZLD — Implementation PRD for Claude Code

## READ FIRST

I have attached two screenshot images showing the finalized UI design for the character screen:
1. **overview-screen.png** — The main character overview (character centered, 8 zone cards symmetrically placed)
2. **detail-screen.png** — The zone detail view (character shifted left, RPG stat card on the right)

These screenshots ARE the design reference. Match them as closely as possible using React Native Skia + StyleSheet API. The character figure image (muscle-front.png) is included in the project assets.

**All dependencies are already installed.** Do NOT install any packages or run any build commands. Just write code.

---

## 1. What is Chizld?

A personal fitness RPG app with a Cyberpunk 2077 game UI aesthetic. **LANDSCAPE orientation for the entire app** — this is a game, not a standard mobile app. The home screen is a character inspection screen where tapping muscle zones reveals RPG stat cards and lets you launch workouts.

Three modules: **Workout** (get jacked), **Sleep** (optimize recovery), **Diet** (fuel the machine).

Personal-use only. No auth, no backend, no social features.

---

## 2. Tech Stack (All Pre-installed)

| Layer | Package |
|-------|---------|
| Framework | Expo React Native (development build) |
| Navigation | @react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/native-stack |
| Styling | StyleSheet API only (NOT NativeWind, NOT Tailwind) |
| Graphics | @shopify/react-native-skia |
| Animations | react-native-reanimated, react-native-gesture-handler |
| Local DB | expo-sqlite |
| Key-Value | react-native-mmkv |
| Camera | expo-camera, expo-image-picker |
| File System | expo-file-system |
| Notifications | expo-notifications |
| TTS | expo-speech |
| Audio | expo-av |
| Fonts | expo-font, @expo-google-fonts/chakra-petch, @expo-google-fonts/barlow-condensed, @expo-google-fonts/jetbrains-mono |
| Orientation | expo-screen-orientation |
| Haptics | expo-haptics |

**Platform:** Android only.

---

## 3. Character Screen — The Heart of the App

The character screen is the heart of the app. It is always in LANDSCAPE like every other screen.

### 3.1 Two Views (Same Screen, State Toggle)

**Overview State (default):**
- Anatomical muscle figure centered
- 8 zone cards arranged symmetrically around the body (4 left, 4 right)
- Each card shows: zone name, level, a "+" slot (for future progress photos)
- Dashed connecting lines from each card toward the character body
- "Warm" zones (recently trained) glow ember-orange; "cold" zones are dim grey
- Top bar: "CHIZLD" branding left, system text right
- Bottom bar: system status text ("ZONES: 8 • ACTIVE: 3/8 • UPTIME: 12d 07h")
- Background: #0A0A0F with subtle hex grid pattern, teal scan frame behind character

**Detail State (after tapping a zone):**
- Character slides LEFT to occupy ~30% of screen
- Selected zone highlighted ember-orange on the character
- RPG stat card slides in from RIGHT, occupying ~60% of screen
- Connection line from highlighted zone to stat card
- Stat card shows: zone name, level, XP bar, 3×2 stat grid, photo history row, TRAIN button
- Bottom bar changes to "BUILD 2.4.1 • ESC TO RETURN"
- Tapping outside the card or pressing back returns to overview state

### 3.2 Zone Configuration

8 tappable zones with their positions relative to the character figure:

| Zone ID | Name | Side | Vertical Position |
|---------|------|------|-------------------|
| traps | TRAPS | Left | Upper (near neck/shoulders) |
| biceps | BICEPS | Left | Mid-upper (near mid-arm) |
| forearms | FOREARMS | Left | Mid-lower (near lower arm) |
| tibialis | TIBIALIS | Left | Lower (near shins) |
| neck | NECK | Right | Upper (near head/neck) |
| shoulders | SHOULDERS | Right | Mid-upper (near shoulders) |
| abs | ABS | Right | Mid-lower (near core) |
| quads | QUADS | Right | Lower (near upper legs) |

### 3.3 Zone Card States

| State | Border | Text Color | Glow | Trigger |
|-------|--------|------------|------|---------|
| Cold (untrained) | 1px #2A2A3A | #8888A0 | None | No workout in 7+ days |
| Warm (active) | 1px #FF8C1A | #FF8C1A | box-shadow ember glow | Trained within 3 days |
| Selected | 2px #FF8C1A | #FF8C1A | Bright glow | User tapped this zone |

### 3.4 RPG Stat Card (Detail View)

When a zone is selected, the stat card shows:

**Header row:**
- Fire icon + zone name (Chakra Petch, 26px, bold, #F0F0F5)
- Level badge (JetBrains Mono, 13px, #FF8C1A) — e.g., "LV.7"
- XP text (JetBrains Mono, 10px, #555566) — e.g., "800 / 1,200"
- XP progress bar: ember-orange fill on #2A2A3A track

**Stats grid (3×2):**

| STREAK | VOLUME 7D | SESSIONS |
|--------|-----------|----------|
| 12 days | 3,000 kg | 12 this week |

| TOTAL SETS | MAX | LAST |
|------------|-----|------|
| 36 sets | 100 kg bench | Today (green) |

**Photo history row:**
- 5 thumbnail slots (55×40px each, dashed border)
- Camera icon placeholder in each
- Date label below each

**TRAIN button:**
- Full width, #FF8C1A background, white bold uppercase text
- Navigates to workout session for this zone

### 3.5 Skia Rendering Approach

The character screen uses a Skia Canvas as the base layer:

```
Layer stack (bottom to top):
1. Background fill (#0A0A0F)
2. Hex grid pattern (Skia paths or image, ~5% opacity)
3. Teal scan frame (rectangle/bracket behind character, rgba(26,92,92,0.15))
4. Platform glow line (horizontal line under feet, ember glow)
5. Character image (the muscle-front.png)
6. Zone highlight overlays (Skia paths with ember fill for active/selected zones)
7. Zone glow effects (ImageFilter.MakeBlur on active zones)
```

Zone cards, connecting lines, stat panels, and text labels are React Native Views/Text overlaid on top of the Skia canvas (not drawn in Skia), positioned absolutely to align with the character.

Touch handling: Zone cards are Pressable components. Optionally, the character itself can detect taps using Skia path.contains() for direct body-part tapping.

---

## 4. Design System

### 4.1 Colors

```typescript
export const colors = {
  bg: {
    primary: '#0A0A0F',
    card: '#141419',
    elevated: '#1C1C24',
  },
  ember: {
    100: '#FFF0E0',
    300: '#FFB366',
    500: '#FF8C1A',    // Primary accent
    700: '#CC6600',
    glow: 'rgba(255,140,26,0.4)',
  },
  zone: {
    cold: '#2A2A3A',
    warm: 'rgba(255,140,26,0.25)',
  },
  hud: {
    teal: 'rgba(26,92,92,0.15)',
    scanLine: 'rgba(255,255,255,0.02)',
  },
  text: {
    primary: '#F0F0F5',
    secondary: '#8888A0',
    muted: '#555566',
    system: '#333344',
  },
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#EF4444',
};
```

### 4.2 Typography

Load these fonts using expo-font at app startup:
- **Chakra Petch** — titles, branding, zone names in stat cards, buttons
- **Barlow Condensed** — zone labels, stat labels, captions
- **JetBrains Mono** — stat values, level numbers, system/flavor text

NEVER use system fonts, Inter, Roboto, or Arial anywhere in the app.

```typescript
export const fonts = {
  display: 'ChakraPetch-Bold',        // 24-32px, titles
  heading: 'BarlowCondensed-SemiBold', // 20-24px, section headers
  label: 'BarlowCondensed-Medium',     // 11-14px, labels
  mono: 'JetBrainsMono-Bold',          // 22-28px, stat values
  monoLight: 'JetBrainsMono-Regular',  // 9-12px, system text
};
```

### 4.3 Shared Styles

- Card backgrounds: #141419 with 1px border #2A2A3A
- Border radius: 4px max (sharp, game-like — NOT rounded)
- Ember glow shadow: `{ shadowColor: '#FF8C1A', shadowOffset: {width:0, height:0}, shadowOpacity: 0.3, shadowRadius: 12 }` (use elevation on Android)
- Background texture: hex grid at 5% opacity (can be a tiled small PNG or Skia-drawn pattern)

---

## 5. Database Schema (SQLite)

Initialize all tables on first app launch. Use `expo-sqlite`.

```sql
-- Exercise library
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  primary_zone TEXT NOT NULL,
  secondary_zones TEXT,
  equipment TEXT,
  is_custom INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Workout sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  notes TEXT,
  photo_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Individual sets within a session
CREATE TABLE IF NOT EXISTS workout_sets (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES workout_sessions(id),
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  weight_kg REAL,
  reps INTEGER,
  rpe REAL,
  tempo_eccentric INTEGER,
  tempo_pause_bottom INTEGER,
  tempo_concentric INTEGER,
  tempo_pause_top INTEGER,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Progress photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  view_type TEXT DEFAULT 'front',
  taken_at TEXT NOT NULL,
  session_id TEXT REFERENCES workout_sessions(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Meal logging
CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meal_type TEXT,
  calories REAL NOT NULL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  fiber_g REAL,
  input_method TEXT NOT NULL,
  photo_path TEXT,
  logged_at TEXT NOT NULL,
  servings REAL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Diet targets
CREATE TABLE IF NOT EXISTS diet_targets (
  id TEXT PRIMARY KEY,
  calories REAL NOT NULL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  effective_from TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sleep logs
CREATE TABLE IF NOT EXISTS sleep_logs (
  id TEXT PRIMARY KEY,
  bed_time TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  quality_rating INTEGER,
  tags TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sunlight exposure sessions
CREATE TABLE IF NOT EXISTS sunlight_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Zone stats (XP, levels, streaks)
CREATE TABLE IF NOT EXISTS zone_stats (
  zone_id TEXT PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_trained_at TEXT,
  personal_records TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- XP transaction history
CREATE TABLE IF NOT EXISTS xp_history (
  id TEXT PRIMARY KEY,
  zone_id TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  earned_at TEXT DEFAULT (datetime('now'))
);

-- Sleep reminder settings
CREATE TABLE IF NOT EXISTS sleep_reminders (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  time TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Seed Data — Exercises

On first launch, seed these exercises:

**traps:** Barbell Shrug, Dumbbell Shrug, Face Pulls, Upright Row
**biceps:** Barbell Curl, Hammer Curl, Preacher Curl, Concentration Curl
**forearms:** Wrist Curl, Reverse Wrist Curl, Farmer's Walk, Dead Hang
**tibialis:** Tibialis Raise, Toe Walk, Ankle Dorsiflexion
**neck:** Neck Curl, Neck Extension, Neck Side Raise, Jaw Clench (mastic gum)
**shoulders:** Overhead Press, Lateral Raise, Front Raise, Arnold Press, Reverse Fly
**abs:** Plank, Cable Crunch, Hanging Leg Raise, Ab Rollout, Russian Twist
**quads:** Barbell Squat, Leg Press, Leg Extension, Bulgarian Split Squat, Hip Thrust, Calf Raise

### Seed Data — Zone Stats

Initialize zone_stats for all 8 zones with default values (xp=0, level=1, streak=0).

---

## 6. MMKV Key-Value Storage

```typescript
// Preferences stored in MMKV
const MMKV_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',       // boolean
  CHARACTER_PRESET: 'character_preset',              // 'light' | 'medium' | 'dark' | 'deep'
  CURRENT_PHOTO_PATH: 'current_photo_path',          // string
  DIET_TARGETS: 'diet_targets',                      // JSON: { calories, protein_g, carbs_g, fat_g }
  SLEEP_SCHEDULE: 'sleep_schedule',                  // JSON: { bedtime, wake_time, reminder_times }
  TEMPO_DEFAULTS: 'tempo_defaults',                  // JSON: { eccentric, pause_bottom, concentric, pause_top }
  REST_TIMER_DEFAULT: 'rest_timer_default',          // number (seconds)
};
```

---

## 7. XP & Leveling System

### XP Earning Rules

**Workout (per zone):**
- Complete a set: 10 XP
- Volume bonus: +1 XP per 100kg total volume (weight × reps)
- Tempo mode used: 1.5× multiplier
- New PR: +50 XP
- Consistency (trained this zone in last 7 days): +20 XP

**Sleep (Head zone):**
- Log sleep: 15 XP
- 7+ hours: +10 XP
- Sunlight 10+ min: 20 XP
- On-time bedtime: +10 XP

**Diet (Abs zone):**
- Log meal: 10 XP
- Hit calorie target ±10%: +25 XP
- Hit protein target ±10%: +25 XP
- Log all meals: +15 XP

### Level Thresholds

| Level | Cumulative XP | Title |
|-------|--------------|-------|
| 1 | 0 | Untrained |
| 2 | 100 | Beginner |
| 3 | 300 | Novice |
| 4 | 600 | Intermediate |
| 5 | 1,000 | Dedicated |
| 6 | 1,500 | Advanced |
| 7 | 2,200 | Veteran |
| 8 | 3,000 | Elite |
| 9 | 4,000 | Master |
| 10 | 5,500 | Chizld |

---

## 8. Navigation Architecture

```
Root (Stack Navigator)
  ├── Main (Bottom Tab Navigator)
  │    ├── Tab: Home — Character screen (LANDSCAPE)
  │    ├── Tab: Train — Workout session history (LANDSCAPE)
  │    ├── Tab: Sleep — Sleep dashboard (LANDSCAPE)
  │    └── Tab: Fuel — Diet daily view (LANDSCAPE)
  │
  ├── Stack Screens:
  │    ├── WorkoutSession — Active workout (LANDSCAPE, full screen)
  │    ├── TempoScreen — Voice countdown (LANDSCAPE, keep screen awake)
  │    ├── ExerciseSelect — Exercise picker
  │    ├── AddMeal — Meal entry (manual)
  │    ├── Camera — Progress photo capture
  │    ├── PhotoHistory — Timeline
  │    ├── SunlightTimer — Full-screen timer
  │    └── Settings — Reminders, targets
  │
  └── Onboarding (shown once):
       ├── Select character preset
       └── Set diet targets
```

**Tab bar:** Dark (#0A0A0F), active tab in ember-500 (#FF8C1A), inactive in text-muted (#555566). Icons: body silhouette (Home), dumbbell (Train), moon (Sleep), flame (Fuel).

**Orientation:** The entire app is locked to LANDSCAPE. Set this globally on app startup using `expo-screen-orientation` — lock to `LANDSCAPE` once and never toggle.

---

## 9. Workout Module

### Screen Flow

```
Tap zone on character → Stat card appears → Press TRAIN
  → Exercise selection (filtered by tapped zone)
    → Active workout session
      → For each exercise: log sets (weight, reps, RPE)
      → Optional: voice tempo mode per exercise
      → Rest timer between sets
    → Session complete → Summary → Optional photo → Back to character
```

### Voice Tempo (Signature Feature)

Uses `expo-speech` for text-to-speech countdown:

**Configurable per exercise:**
- Eccentric: 1-10 seconds (default 5)
- Pause bottom: 0-5 seconds (default 1)
- Concentric: 1-10 seconds (default 5)
- Pause top: 0-5 seconds (default 1)

**Flow:** Voice announces "Eccentric... 5... 4... 3... 2... 1... Hold... Concentric... 5... 4... 3... 2... 1... Hold..." and repeats.

Use `Speech.speak()` with `rate: 1.2` for crisp delivery. Schedule against `Date.now()` for timing accuracy (don't chain setTimeout). Must work with screen off and over headphones — set audio session to `playback` mode via expo-av.

### Rest Timer

Default 90 seconds between sets, configurable. Countdown with push notification when complete. Quick adjust ±30s buttons.

---

## 10. Sleep Module

### Features
- **Sunlight timer:** Count-up timer, target 10-15 min. Blue → amber → green as thresholds pass. Streak tracking.
- **Sleep logging:** Quick log (bedtime, wake time, 1-5 quality rating, optional tags). Must take <10 seconds.
- **Push notifications:** Configurable reminders for caffeine cutoff (1 PM), last meal (8 PM), wind-down (9:30 PM), bedtime (10:30 PM). Repeat wind-down every 10 min if phone still in use.
- **Sleep debt tracking:** Weekly target vs actual hours.

---

## 11. Diet Module

### Features
- **Manual meal entry:** Name, calories, protein, carbs, fat.
- **Daily view:** Running calorie/protein/carbs/fat totals with target bars. Meal list with time, name, macros.
- **Quick-add:** Frequently logged meals auto-suggested from history.

---

## 12. File Structure

```
src/
├── navigation/
│   ├── RootNavigator.tsx
│   ├── MainTabs.tsx
│   └── types.ts
├── screens/
│   ├── character/
│   │   ├── CharacterScreen.tsx
│   │   └── PhotoCompareScreen.tsx
│   ├── workout/
│   │   ├── WorkoutListScreen.tsx
│   │   ├── WorkoutSessionScreen.tsx
│   │   ├── ExerciseSelectScreen.tsx
│   │   ├── TempoScreen.tsx
│   │   └── SessionSummaryScreen.tsx
│   ├── sleep/
│   │   ├── SleepDashboardScreen.tsx
│   │   ├── SunlightTimerScreen.tsx
│   │   └── SleepLogScreen.tsx
│   ├── diet/
│   │   ├── DailyViewScreen.tsx
│   │   └── AddMealScreen.tsx
│   └── settings/
│       └── SettingsScreen.tsx
├── components/
│   ├── character/
│   │   ├── BodyCanvas.tsx
│   │   ├── ZonePaths.ts
│   │   ├── ZoneCard.tsx
│   │   ├── ZoneDetailPanel.tsx
│   │   ├── HexGrid.tsx
│   │   └── EmberParticles.tsx
│   ├── workout/
│   │   ├── SetRow.tsx
│   │   ├── ExerciseCard.tsx
│   │   ├── RestTimer.tsx
│   │   └── VoiceCountdown.tsx
│   ├── sleep/
│   │   ├── SunlightTimer.tsx
│   │   └── SleepQualityPicker.tsx
│   ├── diet/
│   │   ├── MealCard.tsx
│   │   ├── MacroBar.tsx
│   │   └── NutritionResult.tsx
│   └── shared/
│       ├── EmberButton.tsx
│       └── ProgressBar.tsx
├── db/
│   ├── database.ts
│   ├── exercises.ts
│   ├── workouts.ts
│   ├── meals.ts
│   ├── sleep.ts
│   └── xp.ts
├── services/
│   ├── notifications.ts
│   └── photos.ts
├── hooks/
│   ├── useDatabase.ts
│   ├── useZoneStats.ts
│   ├── useVoiceCountdown.ts
│   ├── useSunlightTimer.ts
│   └── useDailyMacros.ts
├── constants/
│   ├── colors.ts
│   ├── fonts.ts
│   ├── zones.ts
│   └── xp.ts
├── types/
│   └── index.ts
└── assets/
    ├── sounds/
    │   ├── phase_chime.wav
    │   └── level_up.wav
    └── characters/
        ├── muscle-front.png
        └── (additional presets)
```

---

## 13. Build Order

### Phase 1 — Foundation (START HERE)

1. Set up file structure as specified above
2. Create constants (colors.ts, fonts.ts, zones.ts, xp.ts, types)
3. Initialize SQLite database with all tables + seed exercises + seed zone stats
4. Set up MMKV
5. Load custom fonts (Chakra Petch, Barlow Condensed, JetBrains Mono)
6. Set up React Navigation (bottom tabs + stack)
7. Create placeholder screens for all four tabs

### Phase 2 — Character Screen (The Hook)

8. Build the Skia BodyCanvas component (background, hex grid, character image, zone overlays)
9. Build ZoneCard components positioned around the character
10. Implement overview → detail state transition (character slides left, stat card slides right)
11. Build ZoneDetailPanel with stat grid, photo history placeholders, TRAIN button
12. Wire up zone_stats from SQLite to populate stat cards with real data
13. Implement zone glow states (cold/warm/selected) based on last_trained_at
14. Lock entire app to landscape orientation on startup

### Phase 3 — Workout Logging

15. Build ExerciseSelectScreen (filtered by zone, searchable)
16. Build WorkoutSessionScreen (add exercises, log sets)
17. Build TempoScreen with expo-speech voice countdown
18. Build RestTimer component
19. Build SessionSummaryScreen with XP calculation
20. Wire XP earned back to zone_stats

### Phase 4 — Sleep & Diet

21. Build SleepDashboardScreen + SleepLogScreen
22. Build SunlightTimerScreen
23. Set up push notifications for sleep reminders
24. Build DailyViewScreen for diet
25. Build AddMealScreen (manual entry only)

### Phase 5 — Polish

28. Progress photo capture with ghost overlay
29. Photo history timeline
30. Level-up celebration animations
31. Particle effects on high-level zones
32. Progressive overload indicators

---

## CRITICAL RULES

1. **StyleSheet API ONLY** — no NativeWind, no Tailwind, no styled-components
2. **React Navigation ONLY** — no Expo Router
3. **Do NOT install any packages** — everything is pre-installed
4. **Do NOT run build commands** — I will handle builds
5. **LANDSCAPE for the entire app** — lock on startup, never toggle to portrait
6. **No Claude API** — diet module is manual entry only for now
6. **Use the exact fonts specified** — Chakra Petch, Barlow Condensed, JetBrains Mono. Never system fonts.
7. **Use the exact color tokens** — ember-orange (#FF8C1A) is the primary accent. Never red, never purple.
8. **Match the attached screenshots** — they are the definitive design reference