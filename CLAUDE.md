# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chizld is a personal fitness RPG app with a Cyberpunk 2077 game UI aesthetic. Built with Expo React Native and React Native Skia. Android-only, landscape-only orientation.

## Commands

```bash
npm start          # Start Expo development server
npm run lint       # Run ESLint via expo lint
npm run android    # Run on Android device/emulator
npm run web        # Start web version (not primary target)
```

**Important**: Do NOT run build commands — the user handles builds.

## Architecture

**Layered structure:**
- `src/screens/` — Screen components organized by feature (character, workout, sleep, diet)
- `src/components/` — Reusable UI components; `character/` contains Skia canvas components
- `src/hooks/` — Custom React hooks for state and effects
- `src/services/` — External integrations and storage
- `src/db/` — SQLite database queries and schema
- `src/constants/` — Design tokens (colors, fonts, zones, xp thresholds)
- `src/navigation/` — React Navigation setup (RootNavigator, MainTabs)

**Key files:**
- `src/App.tsx` — Root component: font loading, orientation lock, SQLite/MMKV initialization
- `src/navigation/RootNavigator.tsx` — Native stack navigator
- `src/navigation/MainTabs.tsx` — Bottom tab navigator
- `src/components/character/BodyCanvas.tsx` — Skia canvas for character rendering

**Data flow:**
- SQLite (`expo-sqlite`) for domain data (workouts, zones, exercises, XP)
- MMKV (`react-native-mmkv`) for preferences
- No Redux/Zustand — components fetch fresh data on demand

## Critical Constraints

1. **No new packages** — All dependencies are pre-installed. Do NOT run `npm install`
2. **StyleSheet only** — No NativeWind, Tailwind, or styled-components
3. **React Navigation only** — No Expo Router (project uses React Navigation despite Expo scaffold)
4. **Custom fonts only** — Use Chakra Petch, Barlow Condensed, JetBrains Mono. Never system fonts
5. **Ember-orange accent** — Primary color is `#FF8C1A`. Never use red or purple as accents
6. **Landscape only** — Locked globally on startup; all components assume landscape

## Code Conventions

**Files:** kebab-case (e.g., `zone-card.tsx`), exports use PascalCase for components

**Imports:** Use path aliases (`@/components`, `@/constants`, `@/hooks`)

**Styles:** Always use `StyleSheet.create()` at bottom of file, named `styles`

**Colors:** Import from `@/constants/colors.ts`:
```typescript
import { colors } from '@/constants/colors';
// colors.bg.primary, colors.ember[500], colors.text.primary
```

**Fonts:** Import from `@/constants/fonts.ts`:
```typescript
import { fonts } from '@/constants/fonts';
// fonts.display (Chakra Petch), fonts.label (Barlow Condensed), fonts.mono (JetBrains Mono)
```

## UI Development Workflow

After making any UI changes, use `/expo-emulator-screenshot` to capture the Android emulator screen and verify your changes visually before declaring the task done.

## Maestro UI Automation

Maestro is configured for navigating the app before taking screenshots. Flows are in `.maestro/`.

**Prerequisites** (must be running):
1. Windows ADB server: `adb -a nodaemon server start` (in PowerShell, keep open)
2. Android emulator with app installed
3. App running via `npx expo run:android`

**Available flows:**
- `launch.yml` — Just launch the app
- `go-to-home.yml` — Navigate to Home/Character screen
- `go-to-train.yml` — Navigate to Train/Workout screen
- `go-to-sleep.yml` — Navigate to Sleep screen
- `go-to-fuel.yml` — Navigate to Fuel/Diet screen

**Run a flow from Claude Code:**
```bash
wsl bash -c 'export PATH="$PATH:$HOME/.maestro/bin" && cd /mnt/d/projects/chizld/chizld-app && maestro --host 172.24.112.1 test .maestro/go-to-train.yml'
```

**Tab names in flows:** Use uppercase (HOME, TRAIN, SLEEP, FUEL) — matches rendered text.

## Planning Documents

The `.planning/` directory contains project context:
- `PROJECT.md` — Requirements and key decisions
- `ROADMAP.md` — Development phases
- `codebase/ARCHITECTURE.md` — Detailed architecture documentation
- `codebase/CONVENTIONS.md` — Full coding conventions
