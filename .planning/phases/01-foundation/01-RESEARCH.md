# Phase 1: Foundation - Research

**Researched:** 2026-03-08
**Domain:** React Navigation v7, expo-sqlite v2, react-native-mmkv v4, expo-font, expo-screen-orientation, SVG asset handling
**Confidence:** HIGH (verified against installed packages and official docs)

## Summary

Phase 1 sets up the entire project infrastructure that all downstream phases depend on. The stack is already fully installed and verified — no `npm install` calls are needed. The main challenges are: (1) migrating from Expo Router to React Navigation by changing `package.json main` and creating a proper entry file with `registerRootComponent`, (2) removing the current Expo Router-based `src/app/` structure and replacing it with the PRD-specified `src/navigation/` + `src/screens/` layout, and (3) handling the SVG-to-PNG asset conversion for the muscle-front.svg.

All three font families are pre-installed via `@expo-google-fonts/*` packages. The exact font family name strings to use in `fontFamily:` styles must match the export names from the packages (e.g., `ChakraPetch_700Bold`, not `ChakraPetch-Bold` as the PRD shows — this is a critical discrepancy). expo-sqlite v2's async API (`openDatabaseAsync`, `SQLiteProvider`, `runAsync`, `getAllAsync`) is in use. react-native-mmkv v4 has switched from `new MMKV()` (v3) to `createMMKV()` (v4, Nitro-based).

The SVG file (`designs/muscle-front.svg`) is 185×372px, has 68 ungrouped paths, no IDs, all similar grey fills — meaning automated zone path extraction is not possible from the file structure alone. The approach is: (1) convert to high-res PNG using sharp (verified working) for Phase 2 character rendering, (2) extract approximate zone SVG path data manually/by zone bounding box for `ZonePaths.ts`.

**Primary recommendation:** Build the entry point first (registerRootComponent + NavigationContainer), get one tab rendering, then layer in DB, fonts, MMKV, and orientation lock in sequence. Convert the SVG asset early so it's ready for Phase 2.

---

## Standard Stack

All libraries are pre-installed. Do NOT run any install commands.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@react-navigation/native` | 7.1.33 | NavigationContainer, core hooks | PRD spec; replaces Expo Router |
| `@react-navigation/bottom-tabs` | 7.15.5 | createBottomTabNavigator for 4 tabs | PRD spec bottom tab structure |
| `@react-navigation/native-stack` | 7.14.4 | createNativeStackNavigator for stack screens | PRD spec stack screens |
| `expo-sqlite` | 55.0.10 | SQLite database for all app data | PRD spec; async API v2 |
| `react-native-mmkv` | 4.2.0 | Key-value storage for preferences | PRD spec; v4 Nitro-based API |
| `expo-font` | 55.0.4 | Font loading at startup | Required for custom fonts |
| `expo-screen-orientation` | 55.0.8 | Landscape lock | PRD spec global lock |
| `expo-splash-screen` | 55.0.10 | Prevent splash from hiding during init | Loading state management |

### Supporting (Font Packages)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@expo-google-fonts/chakra-petch` | 0.4.1 | Chakra Petch font family | Titles, branding, zone names, buttons |
| `@expo-google-fonts/barlow-condensed` | 0.4.1 | Barlow Condensed font family | Zone labels, stat labels, captions |
| `@expo-google-fonts/jetbrains-mono` | 0.4.1 | JetBrains Mono font family | Stat values, level numbers, system text |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `expo-sqlite` SQLiteProvider | Manual `openDatabaseAsync` singleton | Both work; SQLiteProvider is cleaner for React context access |
| `createMMKV()` global | Multiple named MMKV instances | Single default instance is sufficient for this app |

**Installation:** None needed — all packages pre-installed.

---

## Architecture Patterns

### Recommended Project Structure

The PRD specifies a different structure than what currently exists in `src/`. The current Expo Router structure (`src/app/`, `src/components/` with Expo boilerplate) must be completely replaced.

**Current state (to be removed/replaced):**
```
src/
├── app/           ← Expo Router routes — REPLACED by navigation + screens
│   ├── _layout.tsx
│   ├── index.tsx
│   └── explore.tsx
├── components/    ← Expo boilerplate — REPLACED with PRD components
│   ├── animated-icon.tsx
│   ├── app-tabs.tsx
│   └── ...
└── constants/
    └── theme.ts   ← KEPT but supplemented/replaced
```

**Target state (PRD spec):**
```
src/
├── navigation/
│   ├── RootNavigator.tsx    # Stack navigator wrapping MainTabs
│   ├── MainTabs.tsx         # Bottom tab navigator (4 tabs)
│   └── types.ts             # Navigation type declarations
├── screens/
│   ├── character/
│   │   └── CharacterScreen.tsx    # Phase 2 — placeholder for Phase 1
│   ├── workout/
│   │   └── WorkoutListScreen.tsx  # Placeholder for Phase 1
│   ├── sleep/
│   │   └── SleepDashboardScreen.tsx  # Placeholder for Phase 1
│   └── diet/
│       └── DailyViewScreen.tsx       # Placeholder for Phase 1
├── components/
│   ├── character/
│   │   └── ZonePaths.ts     # SVG path data for zones (Phase 1)
│   └── shared/
│       ├── EmberButton.tsx
│       └── ProgressBar.tsx
├── db/
│   ├── database.ts          # openDatabaseAsync, table creation, seed data
│   ├── exercises.ts
│   ├── workouts.ts
│   ├── sleep.ts
│   ├── meals.ts
│   └── xp.ts
├── services/
│   └── orientation.ts       # Screen orientation lock
├── hooks/
│   └── useDatabase.ts       # useSQLiteContext wrapper
├── constants/
│   ├── colors.ts            # Full PRD color palette
│   ├── fonts.ts             # Font family name mappings
│   ├── zones.ts             # 8 zone configs
│   └── xp.ts               # Level thresholds
└── types/
    └── index.ts             # All domain interfaces
```

### Pattern 1: Entry Point Without Expo Router

**What:** Replace `expo-router/entry` with a custom entry file using `registerRootComponent`.
**When to use:** Required to use React Navigation instead of Expo Router.

```typescript
// src/main.tsx (new entry file)
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

```json
// package.json — change this line:
"main": "src/main.tsx"
```

```typescript
// src/App.tsx (root component)
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFonts } from '@expo-google-fonts/chakra-petch';
import { RootNavigator } from './navigation/RootNavigator';
import { initDatabase } from './db/database';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({ /* see font pattern below */ });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  // Hide splash when fonts loaded
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SQLiteProvider databaseName="chizld.db" onInit={initDatabase}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SQLiteProvider>
  );
}
```

**Source:** Verified via official Expo docs (registerRootComponent) and installed package inspection.

### Pattern 2: React Navigation Bottom Tabs with Cyberpunk Styling

**What:** Create bottom tabs with game-HUD aesthetic.
**When to use:** Main navigator setup.

```typescript
// src/navigation/MainTabs.tsx
// Source: @react-navigation/bottom-tabs 7.15.5 installed package
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.primary,       // '#0A0A0F'
          borderTopColor: colors.zone.cold,          // '#2A2A3A'
          borderTopWidth: 1,
          height: 52,
        },
        tabBarActiveTintColor: colors.ember[500],    // '#FF8C1A'
        tabBarInactiveTintColor: colors.text.muted,  // '#555566'
        tabBarLabelStyle: {
          fontFamily: 'BarlowCondensed_600SemiBold',
          fontSize: 10,
          letterSpacing: 1,
        },
      }}
    >
      <Tab.Screen name="Home" component={CharacterScreen}
        options={{ tabBarIcon: ({ color }) => /* icon */ }} />
      <Tab.Screen name="Train" component={WorkoutListScreen}
        options={{ tabBarIcon: ({ color }) => /* icon */ }} />
      <Tab.Screen name="Sleep" component={SleepDashboardScreen}
        options={{ tabBarIcon: ({ color }) => /* icon */ }} />
      <Tab.Screen name="Fuel" component={DailyViewScreen}
        options={{ tabBarIcon: ({ color }) => /* icon */ }} />
    </Tab.Navigator>
  );
}
```

### Pattern 3: Tab Bar Icon Recommendation

**What:** Use `@expo/vector-icons` (MaterialCommunityIcons) for game-appropriate icons.
**When to use:** Claude's discretion per CONTEXT.md — recommending vector icons for simplicity and game aesthetic alignment.

Recommended icons:
- Home (character screen): `account-box` or `human` from MaterialCommunityIcons
- Train: `dumbbell` from MaterialCommunityIcons
- Sleep: `moon-waning-crescent` from MaterialCommunityIcons
- Fuel: `fire` from MaterialCommunityIcons

`@expo/vector-icons` is included with Expo and requires no additional installation. For Phase 1, use simple vector icons. Custom Skia-drawn icons are a Phase 5 polish item.

### Pattern 4: SQLite Initialization with SQLiteProvider

**What:** Use `SQLiteProvider` at app root with `onInit` callback for table creation and seeding.
**When to use:** All SQLite setup.

```typescript
// src/db/database.ts
// Source: expo-sqlite 55.0.10 installed package (SQLiteDatabase.js)
import { type SQLiteDatabase } from 'expo-sqlite';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      primary_zone TEXT NOT NULL,
      secondary_zones TEXT,
      equipment TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    -- ... all 11 tables from PRD schema
  `);

  // Seed only if empty
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises'
  );
  if (count?.count === 0) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await seedExercises(txn);
      await seedZoneStats(txn);
    });
  }
}
```

Access db in components via:
```typescript
import { useSQLiteContext } from 'expo-sqlite';
const db = useSQLiteContext();
const rows = await db.getAllAsync<Exercise>('SELECT * FROM exercises WHERE primary_zone = ?', zoneId);
```

### Pattern 5: MMKV v4 Initialization (Breaking Change from v3)

**What:** v4 uses `createMMKV()` instead of `new MMKV()`.
**When to use:** Key-value preferences storage setup.

```typescript
// src/services/storage.ts
// Source: react-native-mmkv 4.2.0 installed package (createMMKV.js)
import { createMMKV } from 'react-native-mmkv';

// Create singleton — export and reuse everywhere
export const storage = createMMKV();
// createMMKV() with no args uses default ID 'mmkv.default'

// Default preferences initialization
export function initMMKVDefaults(): void {
  if (!storage.contains('rest_timer_default')) {
    storage.set('rest_timer_default', 90);
  }
  if (!storage.contains('onboarding_complete')) {
    storage.set('onboarding_complete', false);
  }
  // ... other defaults from PRD MMKV_KEYS
}
```

MMKV v4 API (verified from installed MMKV.nitro.d.ts):
- `storage.set(key, value)` — value can be `boolean | string | number | ArrayBuffer`
- `storage.getString(key)` → `string | undefined`
- `storage.getBoolean(key)` → `boolean | undefined`
- `storage.getNumber(key)` → `number | undefined`
- `storage.contains(key)` → `boolean`
- `storage.remove(key)` → `boolean`

### Pattern 6: Font Loading with Exact Font Family Names

**What:** Load fonts at startup and use exact export names as fontFamily strings.
**When to use:** Typography setup.

**CRITICAL:** The PRD's `fonts.ts` shows font names like `'ChakraPetch-Bold'` — these are WRONG. The actual registered font names are the export constant names from the packages.

```typescript
// src/constants/fonts.ts
// Exact fontFamily strings to use in StyleSheet
export const fonts = {
  display: 'ChakraPetch_700Bold',        // was: 'ChakraPetch-Bold' (wrong)
  heading: 'BarlowCondensed_600SemiBold', // was: 'BarlowCondensed-SemiBold' (wrong)
  label: 'BarlowCondensed_500Medium',     // was: 'BarlowCondensed-Medium' (wrong)
  mono: 'JetBrainsMono_700Bold',          // was: 'JetBrainsMono-Bold' (wrong)
  monoLight: 'JetBrainsMono_400Regular',  // was: 'JetBrainsMono-Regular' (wrong)
};
```

```typescript
// Font loading in App.tsx — combine all three packages
// Source: @expo-google-fonts/chakra-petch 0.4.1 (useFonts.js), verified via package inspection
import {
  ChakraPetch_700Bold,
  ChakraPetch_600SemiBold,
  ChakraPetch_400Regular,
} from '@expo-google-fonts/chakra-petch';
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_500Medium,
  BarlowCondensed_400Regular,
} from '@expo-google-fonts/barlow-condensed';
import {
  JetBrainsMono_700Bold,
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import { loadAsync } from 'expo-font';

// In App component:
const [fontsLoaded] = useFonts({
  ChakraPetch_700Bold,
  ChakraPetch_600SemiBold,
  ChakraPetch_400Regular,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_500Medium,
  BarlowCondensed_400Regular,
  JetBrainsMono_700Bold,
  JetBrainsMono_400Regular,
});
// Key IS the fontFamily string (e.g., 'ChakraPetch_700Bold' → fontFamily: 'ChakraPetch_700Bold')
```

The `useFonts` hook from `@expo-google-fonts` packages calls `expo-font`'s `loadAsync` internally, returning `[loaded: boolean, error: Error | null]`. Use from any single package or call expo-font's `loadAsync` directly with all fonts in one map.

### Pattern 7: Landscape Orientation Lock

**What:** Lock globally in App startup, set app.json orientation to landscape.
**When to use:** Required for game UI.

```typescript
// In App.tsx useEffect or at module level:
// Source: expo-screen-orientation 55.0.8 installed package (ScreenOrientation.js)
import * as ScreenOrientation from 'expo-screen-orientation';

// Call once on mount — NEVER toggle per-screen
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
// OrientationLock.LANDSCAPE allows both LEFT and RIGHT landscape
```

```json
// app.json — also set orientation here (belt-and-suspenders approach)
{
  "expo": {
    "orientation": "landscape"
  }
}
```

### Pattern 8: SVG to PNG Conversion

**What:** Convert `designs/muscle-front.svg` (185×372 viewBox, 68 ungrouped paths) to PNG.
**When to use:** Phase 1 asset preparation for Phase 2 BodyCanvas.

**Method:** Use `sharp` (installed locally — `npm install --no-save sharp` if not present, verified working in this project).

```javascript
// scripts/convert-svg.js (one-time conversion script)
const sharp = require('sharp');
const path = require('path');

async function convertMuscleAnatomy() {
  // 3x resolution for crisp Retina/landscape display on Android
  await sharp('./designs/muscle-front.svg')
    .resize(555, 1116)  // 3x of 185×372
    .png()
    .toFile('./assets/images/characters/muscle-front.png');

  console.log('Converted: muscle-front.png (555×1116)');
}

convertMuscleAnatomy().catch(console.error);
```

Run: `node scripts/convert-svg.js`

**Output location:** `assets/images/characters/muscle-front.png` (as per PRD spec)

**Zone paths:** The SVG has 68 paths with no IDs and no groups — automated zone extraction is NOT possible from file structure. `ZonePaths.ts` must contain manually defined SVG path strings or bounding-box regions per zone, to be authored in Phase 2 when BodyCanvas is built. For Phase 1, create `ZonePaths.ts` with placeholder empty arrays per zone; fill in Phase 2.

### Pattern 9: app.json Changes Required

```json
{
  "expo": {
    "orientation": "landscape",
    "plugins": [
      "expo-splash-screen",
      "expo-sqlite",
      "expo-font"
    ],
    "experiments": {
      "reactCompiler": true
    }
  }
}
```

Remove from plugins: `"expo-router"` (no longer used).
Remove from experiments: `"typedRoutes": true` (Expo Router specific).
Change orientation: `"portrait"` → `"landscape"`.

### Anti-Patterns to Avoid

- **Using `new MMKV()`**: MMKV v4 removed the constructor — use `createMMKV()`. Will throw at runtime.
- **Using PRD font name strings directly**: `'ChakraPetch-Bold'` will fail silently (text renders with system font). Must use `'ChakraPetch_700Bold'`.
- **Calling `useFonts` from multiple packages separately**: Each call uses its own `useEffect` and `useState` — combine all fonts in one `loadAsync` call to avoid multiple loading states.
- **Keeping expo-router plugin in app.json**: Causes build errors when `main` no longer points to `expo-router/entry`.
- **Using `export default` instead of `registerRootComponent`**: When using a custom entry file, `export default` is ignored; the component won't mount.
- **Calling `ScreenOrientation.lockAsync` inside render**: Must be in `useEffect` or at module top level — async call in render causes issues.
- **`withTransactionAsync` for write-heavy seeding**: Use `withExclusiveTransactionAsync` for seeding to prevent "database is locked" errors.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading state | Custom loading hook | `useFonts` from `@expo-google-fonts/*` | Handles async, errors, caching |
| DB initialization state | Manual flag + useEffect | `SQLiteProvider` with `onInit` | React context, error handling, Suspense support |
| MMKV instance management | Singleton pattern | `createMMKV()` exported module | Built-in thread safety, memory management |
| SVG to PNG conversion | Manual pixel manipulation | `sharp` via node script | Handles SVG rendering, alpha, resolution |
| Navigation container | Custom navigation | `NavigationContainer` from React Navigation | Deep linking, back button, history |
| Splash screen management | setTimeout delay | `expo-splash-screen` `preventAutoHideAsync/hideAsync` | Tied to native splash, no flash |

**Key insight:** All the infrastructure pieces have first-class library support. The only custom code needed is the configuration glue (constants, types, schema SQL).

---

## Common Pitfalls

### Pitfall 1: Font Family Name Mismatch

**What goes wrong:** Text renders with system font (no error thrown).
**Why it happens:** PRD shows names like `'ChakraPetch-Bold'` using hyphen convention, but `@expo-google-fonts` registers fonts using underscore convention matching the export name (`'ChakraPetch_700Bold'`).
**How to avoid:** Use the exact export constant name as the `fontFamily` string. Verify by checking `@expo-google-fonts/chakra-petch/index.js` — the exported constant name IS the font family name.
**Warning signs:** All text appears to use system font (sans-serif) instead of the intended typeface.

### Pitfall 2: MMKV v4 Constructor Removal

**What goes wrong:** `TypeError: MMKV is not a constructor` at runtime.
**Why it happens:** MMKV v3 used `new MMKV()`, v4 (Nitro-based) replaced this with `createMMKV()`.
**How to avoid:** Use `createMMKV()` exclusively. Never import `MMKV` as a constructor.
**Warning signs:** App crashes on first launch with a constructor error.

### Pitfall 3: expo-router Remnants After Migration

**What goes wrong:** Build errors or "no route found" runtime error.
**Why it happens:** `app.json` still has `"expo-router"` plugin, or `src/app/` folder exists alongside React Navigation setup.
**How to avoid:** Remove the `expo-router` plugin from `app.json` plugins array; delete or move `src/app/` contents (or leave as dead code and ensure `registerRootComponent` in the new entry file takes over).
**Warning signs:** Metro bundler error: `ExpoRoot is not a component`, or "Unable to resolve module 'expo-router'".

### Pitfall 4: SQLiteProvider Placement

**What goes wrong:** `useSQLiteContext()` throws "must be used within SQLiteProvider".
**Why it happens:** SQLiteProvider must wrap ALL components that call `useSQLiteContext`, including the NavigationContainer. If NavigationContainer is outside SQLiteProvider, any screen using `useSQLiteContext` will throw.
**How to avoid:** Wrap `<SQLiteProvider>` around `<NavigationContainer>` in `App.tsx` (SQLiteProvider outermost, then NavigationContainer, then navigators).
**Warning signs:** Crash when any screen mounts that calls `useSQLiteContext`.

### Pitfall 5: Splash Screen Not Hiding

**What goes wrong:** App shows splash screen indefinitely.
**Why it happens:** `SplashScreen.preventAutoHideAsync()` was called but `hideAsync()` is never called (e.g., because fonts never finish loading due to an error, or because the condition check is wrong).
**How to avoid:** Always have a fallback timeout or error path that calls `SplashScreen.hideAsync()`. Check for both `fontsLoaded` success AND `error` from `useFonts`.
**Warning signs:** Splash persists past 3 seconds.

### Pitfall 6: Orientation Lock Too Late

**What goes wrong:** App briefly shows in portrait before locking to landscape.
**Why it happens:** `lockAsync` called inside a component `useEffect` that fires after render.
**How to avoid:** Call `ScreenOrientation.lockAsync(...)` as early as possible — either at module level (outside the component function) or immediately in the App component's first `useEffect` with no dependencies.
**Warning signs:** Brief orientation flash on app launch.

### Pitfall 7: SVG Path Zone Data

**What goes wrong:** `ZonePaths.ts` has no usable data for Phase 2.
**Why it happens:** The SVG has 68 anonymous paths with no IDs, labels, or grouping by zone. Zone boundaries cannot be inferred from the file programmatically.
**How to avoid:** For Phase 1, create `ZonePaths.ts` with an explicit `TODO: populate in Phase 2` structure. Zone paths are relative to the 185×372 SVG viewBox. Phase 2 will need to manually define hit-test regions (bounding boxes or simplified path approximations) per zone by visual inspection.
**Warning signs:** Phase 2 cannot implement zone tap detection without this data.

---

## Code Examples

### App Entry Point (Full Pattern)

```typescript
// src/main.tsx
// Source: Official Expo docs (registerRootComponent) + installed expo package inspection
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

### SQLite execAsync for Multi-Statement Schema

```typescript
// Source: expo-sqlite 55.0.10 SQLiteDatabase.js (installed)
// execAsync supports multiple statements separated by semicolons
await db.execAsync(`
  PRAGMA journal_mode = WAL;
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
`);
```

### Seed Data Pattern (Insert-If-Empty)

```typescript
// Source: expo-sqlite 55.0.10 (runAsync, getFirstAsync)
const existing = await db.getFirstAsync<{ count: number }>(
  'SELECT COUNT(*) as count FROM exercises'
);
if ((existing?.count ?? 0) === 0) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    const exercises = [
      { id: 'traps-01', name: 'Barbell Shrug', zone: 'traps' },
      // ... all exercises from PRD
    ];
    for (const ex of exercises) {
      await txn.runAsync(
        'INSERT INTO exercises (id, name, primary_zone) VALUES (?, ?, ?)',
        ex.id, ex.name, ex.zone
      );
    }
    // Seed zone_stats for all 8 zones
    const zones = ['traps', 'biceps', 'forearms', 'tibialis', 'neck', 'shoulders', 'abs', 'quads'];
    for (const zone of zones) {
      await txn.runAsync(
        'INSERT OR IGNORE INTO zone_stats (zone_id) VALUES (?)',
        zone
      );
    }
  });
}
```

### MMKV v4 Setup

```typescript
// Source: react-native-mmkv 4.2.0 createMMKV.js (installed)
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

// Access methods
storage.set('onboarding_complete', false);
const isComplete = storage.getBoolean('onboarding_complete');

// JSON objects
storage.set('diet_targets', JSON.stringify({ calories: 2500, protein_g: 180 }));
const targets = JSON.parse(storage.getString('diet_targets') ?? '{}');
```

### ZonePaths.ts Placeholder Structure

```typescript
// src/components/character/ZonePaths.ts
// SVG viewBox: 0 0 185 372 (from designs/muscle-front.svg)
// Zone path data to be populated in Phase 2 when BodyCanvas is implemented

export type ZoneId = 'traps' | 'biceps' | 'forearms' | 'tibialis' | 'neck' | 'shoulders' | 'abs' | 'quads';

export interface ZoneBounds {
  // Approximate bounding box in SVG coordinate space (0 0 185 372)
  x: number;
  y: number;
  width: number;
  height: number;
}

// TODO Phase 2: Replace with actual path data from muscle-front.svg inspection
export const zoneBounds: Record<ZoneId, ZoneBounds> = {
  traps:     { x: 60, y: 45,  width: 65,  height: 30 },
  biceps:    { x: 15, y: 80,  width: 35,  height: 50 },
  forearms:  { x: 8,  y: 135, width: 30,  height: 50 },
  tibialis:  { x: 55, y: 280, width: 30,  height: 55 },
  neck:      { x: 80, y: 15,  width: 25,  height: 30 },
  shoulders: { x: 110,y: 45,  width: 50,  height: 35 },
  abs:       { x: 70, y: 150, width: 45,  height: 60 },
  quads:     { x: 60, y: 210, width: 65,  height: 70 },
};
```

### Placeholder Screen Pattern (Cyberpunk HUD Style)

```typescript
// src/screens/sleep/SleepDashboardScreen.tsx (example placeholder)
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

export function SleepDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>// SLEEP MODULE</Text>
      <Text style={styles.status}>[ LOCKED ]</Text>
      <Text style={styles.subtext}>COMING SOON</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  status: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ember[500],
    letterSpacing: 4,
  },
  subtext: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 3,
  },
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `new MMKV()` constructor | `createMMKV()` function | MMKV v4 (Nitro) | Breaking — must update all MMKV initialization |
| Expo Router file-based routing | Manual `registerRootComponent` + React Navigation | Phase 1 migration | Entry point and app structure changes |
| `expo-sqlite` sync API | `openDatabaseAsync` / `SQLiteProvider` | expo-sqlite v2 | Fully async, React context patterns |
| `expo-font` with font name guessing | Import font constants, use as fontFamily key | Current | No guessing — export name = fontFamily string |

**Deprecated/outdated in this project:**
- `expo-router/entry`: Replaced by `src/main.tsx` with `registerRootComponent`
- `src/app/_layout.tsx` (Expo Router root): Replaced by `src/App.tsx` + `src/navigation/`
- `src/app/index.tsx` (Expo Router home): Replaced by `src/screens/character/CharacterScreen.tsx`
- `NativeTabs` from `expo-router/unstable-native-tabs` (currently in app-tabs.tsx): Not used
- `src/components/app-tabs.tsx` and other Expo boilerplate: Deleted

---

## Open Questions

1. **ZonePaths.ts zone boundaries**
   - What we know: SVG is 185×372, 68 ungrouped anonymous paths, no IDs
   - What's unclear: Exact pixel coordinates for each of the 8 zones
   - Recommendation: Create placeholder bounds in Phase 1 using visual estimates from overview.png design reference; refine in Phase 2 during BodyCanvas implementation

2. **Tab bar icon exact selection**
   - What we know: Claude has discretion on icon source and specific icons
   - What's unclear: Whether expo-symbols has better game-aesthetic icons than MaterialCommunityIcons
   - Recommendation: Use `@expo/vector-icons` MaterialCommunityIcons with `dumbbell`, `moon-waning-crescent`, `fire`, and `human` — all available, no install needed, game-appropriate

3. **Splash screen loading behavior**
   - What we know: Font loading is async; DB initialization is async
   - What's unclear: Whether to show loading state between splash and NavigationContainer mount
   - Recommendation: Hold splash screen until fonts loaded (DB init happens within SQLiteProvider which has its own loading state via `onInit`). Return `null` from App while fonts loading to keep splash visible.

4. **sharp cleanup after conversion**
   - What we know: `npm install --no-save sharp` installs to node_modules but shouldn't affect production
   - What's unclear: Whether sharp should be a devDependency or just run once then removed
   - Recommendation: Install `--no-save`, run the conversion script once, commit the PNG, then optionally `npm uninstall sharp` since the PNG is committed and the script only needs to run once

---

## Sources

### Primary (HIGH confidence)
- Installed packages inspected directly:
  - `node_modules/react-native-mmkv/lib/` (v4.2.0) — createMMKV API, MMKV interface
  - `node_modules/expo-sqlite/build/` (55.0.10) — openDatabaseAsync, SQLiteProvider, runAsync/getAllAsync
  - `node_modules/@react-navigation/bottom-tabs/lib/module/` (7.15.5) — createBottomTabNavigator
  - `node_modules/@react-navigation/native-stack/lib/module/` (7.14.4) — createNativeStackNavigator
  - `node_modules/expo-screen-orientation/build/` (55.0.8) — lockAsync, OrientationLock enum
  - `node_modules/@expo-google-fonts/chakra-petch/` (0.4.1) — exact font export names
  - `node_modules/@expo-google-fonts/barlow-condensed/` (0.4.1) — exact font export names
  - `node_modules/@expo-google-fonts/jetbrains-mono/` (0.4.1) — exact font export names
  - `node_modules/@shopify/react-native-skia/lib/module/` (2.5.1) — useSVG, useImage APIs
- Official docs verified:
  - https://reactnavigation.org/docs/bottom-tab-navigator/ — tabBarStyle, screenOptions, v7 animation API
  - https://docs.expo.dev/versions/latest/sdk/sqlite/ — SQLiteProvider pattern, execAsync, runAsync
  - https://docs.expo.dev/versions/latest/sdk/expo/ — registerRootComponent usage
  - https://docs.expo.dev/versions/latest/sdk/screen-orientation/ — lockAsync, OrientationLock.LANDSCAPE
  - https://shopify.github.io/react-native-skia/docs/images-svg/ — useSVG, ImageSVG component
- `designs/muscle-front.svg` — 185×372 viewBox, 68 ungrouped paths, no IDs confirmed by direct file inspection
- `sharp` conversion verified: `node -e "require('sharp')(...).resize(555,1116).png().toFile(...)"` succeeded

### Secondary (MEDIUM confidence)
- https://github.com/mrousavy/react-native-mmkv — V4 upgrade guide (createMMKV API confirmed by package inspection)
- https://dev.to/matthewzruiz/using-react-navigation-instead-of-expo-router-49bl — registerRootComponent entry file pattern (confirmed by Expo official docs)

### Tertiary (LOW confidence)
- None — all critical claims verified against installed packages or official documentation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from installed node_modules
- Architecture: HIGH — entry point and navigation patterns verified against official docs and installed package APIs
- Font names: HIGH — verified directly from installed package export names (critical discrepancy with PRD found)
- MMKV v4 API: HIGH — verified from installed package source
- SQLite API: HIGH — verified from installed package source + official docs
- Orientation lock: HIGH — verified from installed ScreenOrientation.types.js
- SVG conversion: HIGH — sharp tested and working for this exact file
- Zone path extraction: LOW — SVG has no structural metadata; manual work needed in Phase 2

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable libraries; font packages rarely change)
