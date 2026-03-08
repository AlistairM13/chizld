# Roadmap: Chizld

## Overview

Chizld is built bottom-up: a rock-solid foundation first, then the character screen that is the heart of the app, then the workout loop that feeds it. The roadmap follows the natural dependency chain — each phase delivers a complete, verifiable capability that unblocks the next. v1 ships when a user can open the app, tap a muscle zone, log a workout, and see their XP grow.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project structure, design system, database, navigation, orientation
- [x] **Phase 2: Character Overview** - Skia canvas, zone cards, HUD bars, glow states
- [ ] **Phase 3: Character Detail** - Zone tap transition, stat card, TRAIN button
- [ ] **Phase 4: Workout Module** - Exercise select, session logging, voice tempo, rest timer, summary
- [ ] **Phase 5: XP & Leveling** - XP calculation, level thresholds, zone stats write-back

## Phase Details

### Phase 1: Foundation
**Goal**: The app boots with the correct navigation structure, landscape orientation, custom fonts, initialized database, and all design system constants in place — everything downstream phases depend on is ready.
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, FOUN-08, FOUN-09, FOUN-10
**Success Criteria** (what must be TRUE):
  1. App opens in landscape orientation and stays landscape — no portrait rotation possible
  2. React Navigation bottom tabs render with 4 tabs (Home, Train, Sleep placeholder, Fuel placeholder) — Expo Router is gone
  3. Custom fonts (Chakra Petch, Barlow Condensed, JetBrains Mono) render on screen — no system font fallback
  4. SQLite database contains all tables and seed data — 8 zone_stats rows exist, 30+ exercises seeded across all zones
  5. File structure matches PRD spec with all src/ subdirectories present and constants files created
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — File structure, design system constants, TypeScript types, SVG-to-PNG conversion
- [x] 01-02-PLAN.md — SQLite database schema, seed data, MMKV initialization
- [x] 01-03-PLAN.md — React Navigation setup (replace Expo Router), font loading, orientation lock, placeholder screens

### Phase 2: Character Overview
**Goal**: The character overview screen is fully rendered — the Skia canvas with hex grid background, the anatomical figure centered in a teal scan frame, 8 zone cards positioned symmetrically around the body with connecting lines, HUD bars top and bottom, and warm/cold glow states driven by real data.
**Depends on**: Phase 1
**Requirements**: CHAR-01, CHAR-02, CHAR-03, CHAR-04, CHAR-05, CHAR-06, CHAR-07, CHAR-08, CHAR-09, CHAR-10
**Success Criteria** (what must be TRUE):
  1. Character screen renders the anatomical figure on a dark (#0A0A0F) background with a visible hex grid texture and teal scan frame bracket
  2. All 8 zone cards appear symmetrically around the body (4 left: TRAPS, BICEPS, FOREARMS, TIBIALIS; 4 right: NECK, SHOULDERS, ABS, QUADS) with dashed connecting lines
  3. Each zone card shows zone name, level number, and "+" photo slot using the correct fonts (Barlow Condensed for name, JetBrains Mono for level)
  4. Zones trained within 3 days display ember-orange (#FF8C1A) borders, text, and glow; untrained zones display cold grey (#2A2A3A border, #8888A0 text)
  5. Top bar shows "CHIZLD" branding left and system text right; bottom bar shows active zone count and uptime — both using JetBrains Mono
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Skia BodyCanvas with hex grid, scan frame, character image, platform glow, scan line animation
- [x] 02-02-PLAN.md — Zone cards, connecting lines, warm/cold glow states wired to zone_stats
- [x] 02-03-PLAN.md — HUD bars (top/bottom), typewriter text animation, uptime counter

### Phase 3: Character Detail
**Goal**: Tapping a zone card triggers the detail state — character slides left, selected zone highlights ember-orange, and the RPG stat card slides in from the right showing real zone data (XP, level, stats grid, TRAIN button). Tapping outside or pressing back returns to overview.
**Depends on**: Phase 2
**Requirements**: DETL-01, DETL-02, DETL-03, DETL-04, DETL-05, DETL-06, DETL-07, DETL-08, DETL-09, DETL-10, DETL-11, DETL-12
**Success Criteria** (what must be TRUE):
  1. Tapping any zone card smoothly slides the character left (Reanimated) and slides the stat card in from the right — no jank, no flash
  2. The tapped zone is highlighted ember-orange on the character figure; other zones return to their warm/cold state
  3. The stat card displays: zone name (Chakra Petch bold), level badge, XP progress bar with XP numbers, and the 3x2 stats grid (STREAK, VOLUME 7D, SESSIONS, TOTAL SETS, MAX, LAST) populated from zone_stats
  4. The TRAIN button is full-width, ember-orange background, and navigates to the workout flow for the selected zone
  5. Tapping outside the stat card or pressing the Android back button returns smoothly to overview state
**Plans**: TBD

Plans:
- [ ] 03-01: Overview-to-detail state machine, Reanimated slide animations, zone highlight on character
- [ ] 03-02: Stat card UI (header, XP bar, stats grid, photo placeholders, TRAIN button), bottom bar change, back navigation

### Phase 4: Workout Module
**Goal**: The complete workout loop is functional — exercise selection filtered by zone, active session screen for logging sets (weight, reps, RPE), voice tempo countdown via expo-speech, configurable rest timer, and a session summary screen showing completion data.
**Depends on**: Phase 3
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06, WORK-07, WORK-08, WORK-09, WORK-10
**Success Criteria** (what must be TRUE):
  1. Tapping TRAIN from the stat card opens the exercise selection screen showing only exercises for that zone, filterable by search text
  2. User can add multiple exercises to a session and log sets with weight (kg), reps, and RPE — each logged set persists to SQLite
  3. Enabling voice tempo mode speaks the countdown sequence ("Eccentric... 5... 4... 3... 2... 1... Hold... Concentric...") via expo-speech during a set
  4. Rest timer starts automatically between sets at 90s default, counts down visibly, and supports ±30s quick adjust
  5. Session summary screen appears on completion showing total sets, exercises completed, and total XP earned (seed XP values before Phase 5 wires real calculation)
**Plans**: TBD

Plans:
- [ ] 04-01: ExerciseSelectScreen (zone filter, search), navigation from TRAIN button
- [ ] 04-02: WorkoutSessionScreen (set logging, add exercises, session data persistence)
- [ ] 04-03: Voice tempo mode (expo-speech countdown), RestTimer component
- [ ] 04-04: SessionSummaryScreen (completion data display, XP placeholder)

### Phase 5: XP & Leveling
**Goal**: The XP calculation engine is wired up end-to-end — every completed set earns the correct XP (base + volume bonus + tempo multiplier + PR bonus + consistency bonus), level thresholds are enforced, zone stats update after each session, and all XP transactions are recorded in xp_history. The character screen now reflects real earned XP.
**Depends on**: Phase 4
**Requirements**: XPLV-01, XPLV-02, XPLV-03, XPLV-04, XPLV-05, XPLV-06, XPLV-07, XPLV-08
**Success Criteria** (what must be TRUE):
  1. Completing a set awards XP: 10 base + volume bonus + 50 for PR + 20 for consistency — session summary shows correct total
  2. Using tempo mode multiplies XP by 1.5x — summary reflects this multiplier
  3. Zone level (1-10) updates correctly after a session — a zone at 0 XP reaching 100 XP shows as Level 2 on the character screen
  4. After completing a workout, returning to the character screen shows the trained zone now glowing ember-orange (warm state) with updated XP and level data
  5. Each XP award is recorded in xp_history with its source type — database contains readable transaction history
**Plans**: TBD

Plans:
- [ ] 05-01: XP calculation hook (useXPCalculation) with all bonus rules
- [ ] 05-02: Zone stats write-back (total_xp, level recalculation, streak, last_trained_at, xp_history insert)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-08 |
| 2. Character Overview | 3/3 | Complete | 2026-03-08 |
| 3. Character Detail | 0/2 | Not started | - |
| 4. Workout Module | 0/4 | Not started | - |
| 5. XP & Leveling | 0/2 | Not started | - |
