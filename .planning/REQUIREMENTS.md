# Requirements: Chizld

**Defined:** 2026-03-08
**Core Value:** The character screen must feel like a game — tapping zones, seeing RPG stats, and launching workouts.

## v1 Requirements

### Foundation

- [ ] **FOUN-01**: Project file structure matches PRD spec (src/navigation, src/screens, src/components, src/db, src/hooks, src/constants, src/types, src/services)
- [ ] **FOUN-02**: Design system constants created (colors.ts with full palette, fonts.ts with font family names, zones.ts with 8 zone configs, xp.ts with level thresholds)
- [ ] **FOUN-03**: TypeScript type definitions created for all domain entities (Zone, Exercise, WorkoutSession, WorkoutSet, ZoneStats, XPHistory)
- [ ] **FOUN-04**: SQLite database initialized with all tables from PRD schema on first app launch
- [ ] **FOUN-05**: Seed data loaded — exercises for all 8 zones, zone_stats initialized with defaults
- [ ] **FOUN-06**: MMKV key-value store initialized with default preference values
- [ ] **FOUN-07**: Custom fonts loaded at app startup (Chakra Petch, Barlow Condensed, JetBrains Mono)
- [ ] **FOUN-08**: React Navigation set up with bottom tabs (Home, Train, Sleep placeholder, Fuel placeholder) + native stack
- [ ] **FOUN-09**: Expo Router replaced with React Navigation throughout the app
- [ ] **FOUN-10**: App locked to landscape orientation globally on startup via expo-screen-orientation

### Character Overview

- [ ] **CHAR-01**: Skia BodyCanvas renders background (#0A0A0F), hex grid pattern at ~5% opacity, teal scan frame behind character
- [ ] **CHAR-02**: Character SVG (muscle-front.svg) rendered centered in BodyCanvas via Skia
- [ ] **CHAR-03**: Platform glow line rendered under character feet (horizontal, ember glow)
- [ ] **CHAR-04**: 8 zone cards positioned symmetrically around the body (4 left: traps, biceps, forearms, tibialis; 4 right: neck, shoulders, abs, quads)
- [ ] **CHAR-05**: Each zone card shows zone name (Barlow Condensed), level (JetBrains Mono), and "+" photo slot
- [ ] **CHAR-06**: Dashed connecting lines drawn from each zone card toward the character body
- [ ] **CHAR-07**: Cold zones display 1px #2A2A3A border, #8888A0 text, no glow
- [ ] **CHAR-08**: Warm zones (trained within 3 days) display 1px #FF8C1A border, #FF8C1A text, ember glow shadow
- [ ] **CHAR-09**: Top bar shows "CHIZLD" branding left (Chakra Petch), system text right (JetBrains Mono)
- [ ] **CHAR-10**: Bottom bar shows system status text (JetBrains Mono, e.g., "ZONES: 8 / ACTIVE: 3/8 / UPTIME: 12d 07h")

### Character Detail

- [ ] **DETL-01**: Tapping a zone card transitions screen to detail state
- [ ] **DETL-02**: Character slides LEFT to ~30% of screen width using Reanimated animation
- [ ] **DETL-03**: Selected zone highlighted ember-orange on the character figure
- [ ] **DETL-04**: RPG stat card slides in from RIGHT, occupying ~60% of screen width
- [ ] **DETL-05**: Connection line drawn from highlighted zone to stat card
- [ ] **DETL-06**: Stat card header: fire icon + zone name (Chakra Petch 26px bold), level badge (JetBrains Mono 13px #FF8C1A)
- [ ] **DETL-07**: XP progress bar: ember-orange fill on #2A2A3A track, with XP text (e.g., "800 / 1,200")
- [ ] **DETL-08**: 3x2 stats grid showing: STREAK, VOLUME 7D, SESSIONS, TOTAL SETS, MAX, LAST
- [ ] **DETL-09**: Photo history row with 5 placeholder thumbnail slots (55x40px, dashed border)
- [ ] **DETL-10**: TRAIN button: full width, #FF8C1A background, white bold uppercase text
- [ ] **DETL-11**: Bottom bar changes to "BUILD 2.4.1 / ESC TO RETURN"
- [ ] **DETL-12**: Tapping outside card or pressing back returns to overview state

### Workout

- [ ] **WORK-01**: Exercise selection screen shows exercises filtered by the tapped zone
- [ ] **WORK-02**: Exercise list is searchable by name
- [ ] **WORK-03**: Active workout session screen displays selected exercises with set rows
- [ ] **WORK-04**: User can log sets with weight (kg), reps, and RPE per exercise
- [ ] **WORK-05**: Voice tempo mode per exercise using expo-speech (configurable eccentric/pause-bottom/concentric/pause-top durations)
- [ ] **WORK-06**: Voice announces phase countdown ("Eccentric... 5... 4... 3... 2... 1... Hold... Concentric...")
- [ ] **WORK-07**: Rest timer between sets with default 90s, configurable, ±30s quick adjust buttons
- [ ] **WORK-08**: Session summary screen shows total XP earned, exercises completed, sets completed
- [ ] **WORK-09**: Workout session data saved to workout_sessions and workout_sets tables
- [ ] **WORK-10**: User can add multiple exercises to a single workout session

### XP & Leveling

- [ ] **XPLV-01**: XP earned per completed set: 10 XP base
- [ ] **XPLV-02**: Volume bonus: +1 XP per 100kg total volume (weight x reps)
- [ ] **XPLV-03**: Tempo mode multiplier: 1.5x when tempo is used
- [ ] **XPLV-04**: New PR bonus: +50 XP when personal record is set
- [ ] **XPLV-05**: Consistency bonus: +20 XP if zone was trained in last 7 days
- [ ] **XPLV-06**: Level thresholds implemented (1-10: 0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500 XP)
- [ ] **XPLV-07**: Zone stats (total_xp, level, current_streak, last_trained_at) updated after each workout
- [ ] **XPLV-08**: XP transactions written to xp_history table with source tracking

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
| FOUN-01 | Phase 1 | Pending |
| FOUN-02 | Phase 1 | Pending |
| FOUN-03 | Phase 1 | Pending |
| FOUN-04 | Phase 1 | Pending |
| FOUN-05 | Phase 1 | Pending |
| FOUN-06 | Phase 1 | Pending |
| FOUN-07 | Phase 1 | Pending |
| FOUN-08 | Phase 1 | Pending |
| FOUN-09 | Phase 1 | Pending |
| FOUN-10 | Phase 1 | Pending |
| CHAR-01 | TBD | Pending |
| CHAR-02 | TBD | Pending |
| CHAR-03 | TBD | Pending |
| CHAR-04 | TBD | Pending |
| CHAR-05 | TBD | Pending |
| CHAR-06 | TBD | Pending |
| CHAR-07 | TBD | Pending |
| CHAR-08 | TBD | Pending |
| CHAR-09 | TBD | Pending |
| CHAR-10 | TBD | Pending |
| DETL-01 | TBD | Pending |
| DETL-02 | TBD | Pending |
| DETL-03 | TBD | Pending |
| DETL-04 | TBD | Pending |
| DETL-05 | TBD | Pending |
| DETL-06 | TBD | Pending |
| DETL-07 | TBD | Pending |
| DETL-08 | TBD | Pending |
| DETL-09 | TBD | Pending |
| DETL-10 | TBD | Pending |
| DETL-11 | TBD | Pending |
| DETL-12 | TBD | Pending |
| WORK-01 | TBD | Pending |
| WORK-02 | TBD | Pending |
| WORK-03 | TBD | Pending |
| WORK-04 | TBD | Pending |
| WORK-05 | TBD | Pending |
| WORK-06 | TBD | Pending |
| WORK-07 | TBD | Pending |
| WORK-08 | TBD | Pending |
| WORK-09 | TBD | Pending |
| WORK-10 | TBD | Pending |
| XPLV-01 | TBD | Pending |
| XPLV-02 | TBD | Pending |
| XPLV-03 | TBD | Pending |
| XPLV-04 | TBD | Pending |
| XPLV-05 | TBD | Pending |
| XPLV-06 | TBD | Pending |
| XPLV-07 | TBD | Pending |
| XPLV-08 | TBD | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 10 (Foundation to Phase 1)
- Unmapped: 30 (TBD — roadmapper will assign)

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after initial definition*
