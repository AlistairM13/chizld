# Requirements: Chizld

**Defined:** 2026-03-08
**Core Value:** The character screen must feel like a game — tapping zones, seeing RPG stats, and launching workouts.

## v1 Requirements

### Foundation

- [x] **FOUN-01**: Project file structure matches PRD spec (src/navigation, src/screens, src/components, src/db, src/hooks, src/constants, src/types, src/services)
- [x] **FOUN-02**: Design system constants created (colors.ts with full palette, fonts.ts with font family names, zones.ts with 8 zone configs, xp.ts with level thresholds)
- [x] **FOUN-03**: TypeScript type definitions created for all domain entities (Zone, Exercise, WorkoutSession, WorkoutSet, ZoneStats, XPHistory)
- [x] **FOUN-04**: SQLite database initialized with all tables from PRD schema on first app launch
- [x] **FOUN-05**: Seed data loaded — exercises for all 8 zones, zone_stats initialized with defaults
- [x] **FOUN-06**: MMKV key-value store initialized with default preference values
- [x] **FOUN-07**: Custom fonts loaded at app startup (Chakra Petch, Barlow Condensed, JetBrains Mono)
- [x] **FOUN-08**: React Navigation set up with bottom tabs (Home, Train, Sleep placeholder, Fuel placeholder) + native stack
- [x] **FOUN-09**: Expo Router replaced with React Navigation throughout the app
- [x] **FOUN-10**: App locked to landscape orientation globally on startup via expo-screen-orientation

### Character Overview

- [x] **CHAR-01**: Skia BodyCanvas renders background (#0A0A0F), hex grid pattern at ~5% opacity, teal scan frame behind character
- [x] **CHAR-02**: Character SVG (muscle-front.svg) rendered centered in BodyCanvas via Skia
- [x] **CHAR-03**: Platform glow line rendered under character feet (horizontal, ember glow)
- [x] **CHAR-04**: 8 zone cards positioned symmetrically around the body (4 left: traps, biceps, forearms, tibialis; 4 right: neck, shoulders, abs, quads)
- [x] **CHAR-05**: Each zone card shows zone name (Barlow Condensed), level (JetBrains Mono), and "+" photo slot
- [x] **CHAR-06**: Dashed connecting lines drawn from each zone card toward the character body
- [x] **CHAR-07**: Cold zones display 1px #2A2A3A border, #8888A0 text, no glow
- [x] **CHAR-08**: Warm zones (trained within 3 days) display 1px #FF8C1A border, #FF8C1A text, ember glow shadow
- [x] **CHAR-09**: Top bar shows "CHIZLD" branding left (Chakra Petch), system text right (JetBrains Mono)
- [x] **CHAR-10**: Bottom bar shows system status text (JetBrains Mono, e.g., "ZONES: 8 / ACTIVE: 3/8 / UPTIME: 12d 07h")

### Character Detail

- [x] **DETL-01**: Tapping a zone card transitions screen to detail state
- [x] **DETL-02**: Character slides LEFT to ~30% of screen width using Reanimated animation
- [x] **DETL-03**: Selected zone highlighted ember-orange on the character figure
- [x] **DETL-04**: RPG stat card slides in from RIGHT, occupying ~60% of screen width
- [x] **DETL-05**: Connection line drawn from highlighted zone to stat card
- [x] **DETL-06**: Stat card header: fire icon + zone name (Chakra Petch 26px bold), level badge (JetBrains Mono 13px #FF8C1A)
- [x] **DETL-07**: XP progress bar: ember-orange fill on #2A2A3A track, with XP text (e.g., "800 / 1,200")
- [x] **DETL-08**: 3x2 stats grid showing: STREAK, VOLUME 7D, SESSIONS, TOTAL SETS, MAX, LAST
- [x] **DETL-09**: Photo history row with 5 placeholder thumbnail slots (55x40px, dashed border)
- [x] **DETL-10**: TRAIN button: full width, #FF8C1A background, white bold uppercase text
- [x] **DETL-11**: Bottom bar changes to "BUILD 2.4.1 / ESC TO RETURN"
- [x] **DETL-12**: Tapping outside card or pressing back returns to overview state

### Workout

- [x] **WORK-01**: Exercise selection screen shows exercises filtered by the tapped zone
- [x] **WORK-02**: Exercise list is searchable by name
- [x] **WORK-03**: Active workout session screen displays selected exercises with set rows
- [x] **WORK-04**: User can log sets with weight (kg), reps, and RPE per exercise
- [x] **WORK-05**: Voice tempo mode per exercise using expo-speech (configurable eccentric/pause-bottom/concentric/pause-top durations)
- [x] **WORK-06**: Voice announces phase countdown ("Eccentric... 5... 4... 3... 2... 1... Hold... Concentric...")
- [x] **WORK-07**: Rest timer between sets with default 90s, configurable, ±30s quick adjust buttons
- [x] **WORK-08**: Session summary screen shows total XP earned, exercises completed, sets completed
- [x] **WORK-09**: Workout session data saved to workout_sessions and workout_sets tables
- [x] **WORK-10**: User can add multiple exercises to a single workout session

### XP & Leveling

- [x] **XPLV-01**: XP earned per completed set: 10 XP base
- [x] **XPLV-02**: Volume bonus: +1 XP per 100kg total volume (weight x reps)
- [x] **XPLV-03**: Tempo mode multiplier: 1.5x when tempo is used
- [x] **XPLV-04**: New PR bonus: +50 XP when personal record is set
- [x] **XPLV-05**: Consistency bonus: +20 XP if zone was trained in last 7 days
- [x] **XPLV-06**: Level thresholds implemented (1-10: 0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500 XP)
- [x] **XPLV-07**: Zone stats (total_xp, level, current_streak, last_trained_at) updated after each workout
- [x] **XPLV-08**: XP transactions written to xp_history table with source tracking

## v2 Requirements

### Sleep Module

- **SLEP-01**: Sleep dashboard with weekly sleep debt tracking
- **SLEP-02**: Quick sleep log (bedtime, wake time, quality rating)
- **SLEP-03**: Sunlight timer with streak tracking
- **SLEP-04**: Push notification reminders (caffeine cutoff, wind-down, bedtime)

### Diet Module

- **DIET-01**: Manual meal entry (name, calories, protein, carbs, fat)
- **DIET-02**: Daily view with running macro totals and target bars
- **DIET-03**: Quick-add from frequently logged meals

### Polish

- **PLSH-01**: Progress photo capture with ghost overlay
- **PLSH-02**: Photo history timeline
- **PLSH-03**: Level-up celebration animations
- **PLSH-04**: Ember particle effects on high-level zones

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / API | Personal-use app, all data local |
| Authentication | Single user, no accounts needed |
| Social features | Personal use only |
| Claude API / AI diet analysis | Manual entry only for now |
| iOS support | Android only |
| Portrait orientation | Landscape-only game UI |
| NativeWind / Tailwind | StyleSheet API only per constraint |
| Expo Router | React Navigation per PRD spec |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| FOUN-07 | Phase 1 | Complete |
| FOUN-08 | Phase 1 | Complete |
| FOUN-09 | Phase 1 | Complete |
| FOUN-10 | Phase 1 | Complete |
| CHAR-01 | Phase 2 | Complete |
| CHAR-02 | Phase 2 | Complete |
| CHAR-03 | Phase 2 | Complete |
| CHAR-04 | Phase 2 | Complete |
| CHAR-05 | Phase 2 | Complete |
| CHAR-06 | Phase 2 | Complete |
| CHAR-07 | Phase 2 | Complete |
| CHAR-08 | Phase 2 | Complete |
| CHAR-09 | Phase 2 | Complete |
| CHAR-10 | Phase 2 | Complete |
| DETL-01 | Phase 3 | Complete |
| DETL-02 | Phase 3 | Complete |
| DETL-03 | Phase 3 | Complete |
| DETL-04 | Phase 3 | Complete |
| DETL-05 | Phase 3 | Complete |
| DETL-06 | Phase 3 | Complete |
| DETL-07 | Phase 3 | Complete |
| DETL-08 | Phase 3 | Complete |
| DETL-09 | Phase 3 | Complete |
| DETL-10 | Phase 3 | Complete |
| DETL-11 | Phase 3 | Complete |
| DETL-12 | Phase 3 | Complete |
| WORK-01 | Phase 4 | Complete |
| WORK-02 | Phase 4 | Complete |
| WORK-03 | Phase 4 | Complete |
| WORK-04 | Phase 4 | Complete |
| WORK-05 | Phase 4 | Complete |
| WORK-06 | Phase 4 | Complete |
| WORK-07 | Phase 4 | Complete |
| WORK-08 | Phase 4 | Complete |
| WORK-09 | Phase 4 | Complete |
| WORK-10 | Phase 4 | Complete |
| XPLV-01 | Phase 5 | Complete |
| XPLV-02 | Phase 5 | Complete |
| XPLV-03 | Phase 5 | Complete |
| XPLV-04 | Phase 5 | Complete |
| XPLV-05 | Phase 5 | Complete |
| XPLV-06 | Phase 5 | Complete |
| XPLV-07 | Phase 5 | Complete |
| XPLV-08 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40/40
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-09 — all v1 requirements complete*
