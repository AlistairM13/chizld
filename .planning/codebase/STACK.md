# Technology Stack

**Analysis Date:** 2026-03-08

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code, components, services, database layer

**Secondary:**
- JavaScript (ES2022+) - React Native runtime and Expo framework

## Runtime

**Environment:**
- React Native 0.83.2 - Cross-platform mobile application runtime
- Node.js (implied by Expo) - Development toolchain

**Package Manager:**
- npm - Lock file: `package-lock.json` present (implied, standard for npm projects)

## Frameworks

**Core:**
- Expo 55.0.5 - React Native development platform with managed build service
- React 19.2.0 - UI component framework
- React Native 0.83.2 - Native mobile runtime

**Navigation:**
- @react-navigation/native 7.1.33 - Core navigation library
- @react-navigation/native-stack 7.14.4 - Stack navigator for screen transitions
- @react-navigation/bottom-tabs 7.15.5 - Bottom tab navigator for main app sections
- @react-navigation/elements 2.8.1 - Shared navigation components

**Graphics & Animations:**
- @shopify/react-native-skia 2.5.1 - High-performance graphics rendering (for character canvas, zone overlays, hex grid)
- react-native-reanimated 4.2.1 - Declarative animations framework
- react-native-gesture-handler 2.30.0 - Touch gesture detection and handling
- react-native-worklets 0.7.2 - Worklet support for Reanimated

**Testing:**
- No testing framework currently configured (test suite not yet implemented)

**Build/Dev:**
- expo-dev-client 55.0.11 - Custom Expo development client for local testing
- TypeScript 5.9.2 - Static type checking and compilation

## Key Dependencies

**Critical (App Core):**
- react-native-mmkv 4.2.0 - Key-value storage for app preferences and user settings
- expo-sqlite 55.0.10 - SQLite database for workout sessions, exercises, meals, sleep logs, XP tracking
- expo-font 55.0.4 - Font loading at runtime

**Device Hardware & Sensors:**
- expo-camera 55.0.9 - Camera access for progress photo capture
- expo-image-picker 55.0.11 - Photo library picker for image selection
- expo-image 55.0.6 - Optimized image loading and rendering
- expo-file-system 55.0.10 - File system access for storing progress photos
- expo-haptics 55.0.8 - Vibration feedback for workouts and level-ups
- expo-screen-orientation 55.0.8 - Lock app to landscape orientation globally
- expo-constants 55.0.7 - Access to Expo constants and build metadata

**Media & Audio:**
- expo-av 16.0.8 - Audio/video playback (background audio for voice tempo guidance)
- expo-speech 55.0.8 - Text-to-speech for voice countdown during workouts
- expo-notifications 55.0.11 - Push notifications for rest timer completion and sleep reminders

**Typography:**
- @expo-google-fonts/chakra-petch 0.4.1 - Chakra Petch font for titles and branding (#0.4.1)
- @expo-google-fonts/barlow-condensed 0.4.1 - Barlow Condensed font for labels and stat cards
- @expo-google-fonts/jetbrains-mono 0.4.1 - JetBrains Mono font for stat values and system text

**Utility:**
- expo-linking 55.0.7 - Deep linking and URL scheme handling
- expo-web-browser 55.0.9 - Web browser integration (fallback for external links)
- expo-system-ui 55.0.9 - System UI customization
- expo-status-bar 55.0.4 - Status bar styling
- expo-symbols 55.0.5 - Expo icon symbols
- expo-device 55.0.9 - Device information API
- expo-glass-effect 55.0.7 - Glass morphism UI effects (optional, not used in current design)
- react-native-safe-area-context 5.6.2 - Safe area insets for notches and home indicators
- react-native-screens 4.23.0 - Native screen stack optimization
- react-native-web 0.21.2 - Web platform support (not primary target but available)

**Development:**
- @types/react 19.2.2 - React type definitions

## Configuration

**Environment:**
- No .env file currently in use (personal-use app, no external API keys needed)
- Configuration stored in MMKV key-value store: `src/constants/mmkv-keys.ts` (to be created)
- Database schema and seed data in `src/db/database.ts` (to be created)

**Build:**
- `app.json` - Expo configuration with:
  - Package name: `com.thealister.chizldapp`
  - Platform: Android only
  - Version: 1.0.0
  - Orientation: Locked to LANDSCAPE via `expo-screen-orientation`
  - Plugins: expo-router, expo-splash-screen, expo-sqlite, expo-font
  - Experiments: typedRoutes, reactCompiler (enabled)
  - Icons: Android adaptive icons with foreground/background/monochrome variants

**TypeScript:**
- `tsconfig.json` - Strict mode enabled
  - Path aliases: `@/*` → `./src/*`, `@/assets/*` → `./assets/*`
  - Extends expo/tsconfig.base

## Platform Requirements

**Development:**
- Node.js 18+ (implied by React 19 and TypeScript 5.9)
- Android Studio or physical Android device (Android 12+)
- Expo development account (optional, for EAS builds)

**Production:**
- Android 12+ (minimum API level 31, based on Expo 55 support)
- Device form factor: Landscape-locked for full-screen gameplay experience
- Screen size: Tested on modern Android phones (6-7 inch displays)
- Available storage: ~100MB for app + SQLite database + progress photos

## Database & Storage Strategy

**SQLite:**
- Location: Managed by `expo-sqlite` (device-specific data directory)
- Schema: 11 tables for exercises, workouts, meals, sleep, zones, XP tracking
- Seed data: Exercise library + initial zone stats on first app launch
- Approach: Synchronous initialization in app startup flow

**MMKV (Key-Value Store):**
- Fast, lightweight persistence for app preferences
- Keys: onboarding_complete, character_preset, current_photo_path, diet_targets, sleep_schedule, tempo_defaults, rest_timer_default

**File System:**
- Progress photos stored locally via `expo-file-system`
- Base path: Device's app documents directory
- Structure: `/progress-photos/{sessionId}/{timestamp}.jpg`

## Entry Points

**App Entry:**
- `src/app/_layout.tsx` - Root navigator layout (Expo Router)
- `src/app/index.tsx` - Home/character screen (default tab)
- `src/app/explore.tsx` - Placeholder for additional navigation

**Navigation Structure:**
- Root: Expo Router
- Main: Bottom tab navigator with 4 tabs (Home/Train/Sleep/Fuel)
- Nested stacks: Workout session, settings, photo history screens

## Special Configuration Notes

**Orientation Lock:**
- Called via `expo-screen-orientation` on app startup (function: `ScreenOrientation.lockAsync(ScreenOrientation.Orientation.LANDSCAPE)`)
- Applied globally once - never toggle per-screen
- Persists across all app screens and tabs

**Styling Approach:**
- React Native StyleSheet API only (no NativeWind, Tailwind, or styled-components)
- Color tokens defined in constants file (e.g., `src/constants/colors.ts`)
- Skia Canvas for character graphics layer; React Native Views for overlaid UI

**Font Loading:**
- Happens at app startup via `expo-font.loadAsync()`
- Fonts: Chakra Petch (titles), Barlow Condensed (labels), JetBrains Mono (values)
- Never use system fonts, Inter, Roboto, or Arial

---

*Stack analysis: 2026-03-08*
