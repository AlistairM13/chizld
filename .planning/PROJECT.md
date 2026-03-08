# Chizld

## What This Is

A personal fitness RPG app with a Cyberpunk 2077 game UI aesthetic. Landscape-only, Android-only. The home screen is a character inspection screen where tapping muscle zones reveals RPG stat cards and lets you launch workouts. Built with Expo React Native and React Native Skia.

## Core Value

The character screen is the heart of the app — tapping zones, seeing your RPG stats, and launching workouts must feel like a game, not a fitness app.

## Requirements

### Validated

- ✓ Expo React Native project scaffolded with all dependencies installed — existing
- ✓ React Navigation (native-stack + bottom-tabs) available in dependencies — existing
- ✓ Custom fonts (Chakra Petch, Barlow Condensed, JetBrains Mono) available — existing
- ✓ React Native Skia, Reanimated, Gesture Handler installed — existing
- ✓ expo-sqlite, react-native-mmkv installed — existing
- ✓ expo-speech, expo-av, expo-haptics installed — existing

### Active

**Foundation:**
- [ ] Project file structure matches PRD spec (src/navigation, src/screens, src/components, src/db, etc.)
- [ ] Design system constants (colors.ts, fonts.ts, zones.ts, xp.ts, types)
- [ ] SQLite database initialized with all tables, seed exercises, seed zone stats
- [ ] MMKV key-value store initialized
- [ ] Custom fonts loaded at app startup
- [ ] React Navigation set up (bottom tabs + stack) — replace current Expo Router
- [ ] App locked to landscape orientation on startup

**Character Overview Screen:**
- [ ] Skia BodyCanvas component (background #0A0A0F, hex grid pattern, teal scan frame, character SVG)
- [ ] 8 zone cards positioned symmetrically around the body (4 left, 4 right)
- [ ] Each zone card shows: zone name, level, "+" slot
- [ ] Dashed connecting lines from each card toward the character body
- [ ] Warm zones glow ember-orange; cold zones are dim grey (based on last_trained_at)
- [ ] Top bar: "CHIZLD" branding left, system text right
- [ ] Bottom bar: system status text ("ZONES: 8 / ACTIVE: 3/8 / UPTIME: 12d 07h")

**Character Detail Screen (same screen, state toggle):**
- [ ] Tapping a zone card transitions to detail state
- [ ] Character slides LEFT to ~30% of screen (Reanimated animation)
- [ ] Selected zone highlighted ember-orange on the character
- [ ] RPG stat card slides in from RIGHT, ~60% of screen
- [ ] Connection line from highlighted zone to stat card
- [ ] Stat card: zone name, level badge, XP bar, 3x2 stat grid, photo history row (placeholder), TRAIN button
- [ ] Bottom bar changes to "BUILD 2.4.1 / ESC TO RETURN"
- [ ] Tapping outside card or pressing back returns to overview state

**Workout Module:**
- [ ] Exercise selection screen filtered by tapped zone, searchable
- [ ] Active workout session screen: add exercises, log sets (weight, reps, RPE)
- [ ] Voice tempo mode per exercise using expo-speech (configurable eccentric/pause/concentric/pause)
- [ ] Rest timer between sets (default 90s, configurable, ±30s quick adjust)
- [ ] Session summary screen with XP calculation
- [ ] XP earned written back to zone_stats

**XP & Leveling:**
- [ ] XP earned per set (10 XP base + volume bonus + tempo multiplier + PR bonus + consistency bonus)
- [ ] Level thresholds (1-10, Untrained through Chizld)
- [ ] Zone stats update after each workout session

### Out of Scope

- Sleep module — deferred to v2
- Diet module — deferred to v2
- Progress photo capture/history — deferred to v2
- Onboarding flow — deferred to v2
- Level-up celebration animations — deferred to v2
- Particle effects on high-level zones — deferred to v2
- Push notifications — deferred to v2
- Backend/auth/social features — personal use only, not planned

## Context

- This is a brownfield project: Expo scaffolding exists but uses Expo Router instead of React Navigation (PRD specifies React Navigation). The router setup needs to be replaced.
- The SVG for the character figure is at `designs/muscle-front.svg` — this needs to be rendered via Skia or converted to a usable format.
- Design reference screenshots are at `designs/overview.png` and `designs/details.png`.
- The PRD (`prd.md`) contains the full database schema, XP tables, color system, font specs, and navigation architecture.
- All npm dependencies are already installed. No packages should be installed during development.

## Constraints

- **Styling**: StyleSheet API only — no NativeWind, no Tailwind, no styled-components
- **Navigation**: React Navigation only — no Expo Router
- **Packages**: All dependencies pre-installed — do NOT install any packages
- **Builds**: Do NOT run build commands — the user handles builds
- **Orientation**: Landscape for the entire app — lock on startup, never toggle
- **Fonts**: Chakra Petch, Barlow Condensed, JetBrains Mono only — never system fonts
- **Colors**: Ember-orange (#FF8C1A) is primary accent — never red, never purple
- **Platform**: Android only
- **Design reference**: Match the attached screenshots as closely as possible

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace Expo Router with React Navigation | PRD specifies React Navigation with bottom tabs + stack; existing Expo Router setup conflicts | — Pending |
| Use Skia Canvas for character rendering with RN Views overlaid for cards/text | Skia handles hex grid, glow effects, character image efficiently; RN handles text/layout | — Pending |
| SVG character figure via Skia | muscle-front.svg at designs/ needs to be rendered in Skia canvas layer | — Pending |
| v1 = Character screen + Workout only | User wants to start using the app for workout tracking; sleep/diet deferred | — Pending |

---
*Last updated: 2026-03-08 after initialization*
