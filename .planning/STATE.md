# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** The character screen must feel like a game — tapping zones, seeing RPG stats, and launching workouts.
**Current focus:** Phase 3.1 — Workout Splits (COMPLETE)

## Current Position

Phase: 4.1 of 5 (Workout Session Polish - INSERTED)
Plan: 3 of 4 in current phase (04.1-01, 04.1-03 complete)
Status: In progress
Last activity: 2026-03-11 — Completed 04.1-03-PLAN.md (Rest Timer Simplification)

Progress: [████████████████████████░] 96% (24/25 plans complete)
Note: Phase 4.1 plans 1 and 3 complete (plan 2 and 4 remain)

## Performance Metrics

**Velocity:**
- Total plans completed: 19 (Phase 1 + Phase 2 + Phase 2.1 + Phase 3 + Phase 4 + Phase 5)
- Average duration: ~3.0 min
- Total execution time: ~56.3 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3/3 complete | ~9 min | ~3 min |
| 02-character-overview | 3/3 complete | ~12 min | ~4 min |
| 02.1-overview-polish | 3/3 complete | ~5.5 min | ~1.8 min |
| 03-character-detail | 2/2 complete | ~7 min | ~3.5 min |
| 04-workout-module | 4/4 complete | ~12.3 min | ~3.1 min |
| 05-xp-leveling | 4/4 complete | ~10 min | ~2.5 min |

**Recent Trend:**
- Last 5 plans: 03.1-04 (2 min), 03.1-03 (2 min), 03.1-02 (2 min), 03.1-01 (2 min), 05-04 (1 min)
- Trend: UI component plans consistently fast

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Replace Expo Router with React Navigation — DONE in 01-03; entry point is now src/main.tsx with registerRootComponent
- [Init]: Use Skia Canvas as base layer, RN Views overlaid for cards/text — Skia handles hex grid, glow, character image; RN handles all text and layout components
- [Init]: Character SVG must be converted/handled for Skia — muscle-front.svg is at designs/; needs to be used as PNG or rendered via Skia Image
- [01-01]: @expo-google-fonts underscore convention for font names — ChakraPetch_700Bold not ChakraPetch-Bold; PRD names are wrong and would fail silently
- [01-01]: PNG at 555x1116 (3x SVG viewBox) for crisp landscape Android display via Skia
- [01-01]: ZonePaths.ts uses bounding box estimates for Phase 1; Phase 2 BodyCanvas refines with actual SVG path inspection
- [Init]: v1 = Foundation + Character Screen + Workout + XP only — sleep/diet/photos/polish deferred to v2
- [01-02]: withExclusiveTransactionAsync for bulk seeding — prevents database locked errors during parallel inserts
- [01-02]: MMKV defaults: 4 values set (onboarding_complete, character_preset, rest_timer_default, tempo_defaults); user-set keys (diet_targets, sleep_schedule, current_photo_path) left unset
- [01-02]: database.ts and storage.ts kept self-contained (no imports from src/constants/ or src/types/) — parallel wave constraint
- [01-03]: SplashScreen.hideAsync called on both fontsLoaded and fontError — prevents indefinite splash on font load failure
- [01-03]: SQLiteProvider wraps NavigationContainer (outermost) — all screens can call useSQLiteContext()
- [01-03]: src/app/ left in place as dead code — registerRootComponent takes over, less risk than deleting
- [02-01]: Hex size 20px, line weight 0.5px for subtle background pattern
- [02-01]: Scan line duration 4000ms for slow ambient sweep
- [02-01]: Zone card positions defined as percentages (0.0-1.0) for responsive layout
- [02-02]: ZoneCard hybrid approach: Skia Path for beveled border, RN Text for content
- [02-02]: Warmth decay: intensity 1.0 (just trained) to 0.0 (at 3 days), linear
- [02-02]: Dash pattern [4,4] for connecting lines, pulse duration 2000ms for glow
- [02-03]: TypewriterText default delay 40ms for fast but readable animation
- [02-03]: useUptimeCounter format: Xm Xs (< 1h), Xh Ym (< 1d), Xd Yh (>= 1d)
- [02.1-01]: ZoneLabel left-side zones align text right, right-side zones align left (text flows toward body)
- [02.1-01]: PhotoSlot accepts solid border on Android as dashed border fallback
- [02.1-02]: System status single-line format with Unicode bullet separators
- [02.1-02]: CHIZLD letter-spacing 3px for wider cyberpunk aesthetic
- [02.1-03]: ZoneCard composes ZoneLabel + PhotoSlot (no Skia/beveled border)
- [02.1-03]: Left zones row direction (label-slot), right zones row-reverse (slot-label)
- [02.1-03]: slotOffsetX = +40px for left zones, -40px for right zones
- [03-01]: Character slides 50% left (not 30%) per user decision for more dramatic effect
- [03-01]: Choreography: character slides FIRST, then stat card enters after 100ms delay
- [03-01]: Non-selected cards fade out at 50% detailProgress (early in animation)
- [03-01]: Selected zone glow: full intensity override, 1.5x radius, 1000ms pulse (vs 2000ms normal)
- [03-02]: XP bar uses toLocaleString for number formatting
- [03-02]: Photo history row uses colors.text.muted for dashed border (colors.border.default doesn't exist)
- [03-02]: StatCard positioned top: 44px (below HudBarTop), bottom: 108px (above HudBarBottom + tab bar)
- [04-01]: Set<string> for multi-select exercise state — O(1) toggle operations
- [04-01]: Session ID via Date.now().toString(36) + random suffix — unique per workout
- [04-02]: Drift-free timer via absolute end time tracking — avoids setInterval timing drift
- [04-02]: WeightInput dual mode — number pad for exact entry, steppers for quick +/-2.5kg
- [04-02]: RepsInput steppers only — small integers faster with steppers than number pad
- [04-03]: Voice tempo phrases "Down" and "Up" with countdown numbers — clear and matches gym conventions
- [04-03]: Tempo cancellation via isActiveRef.current check before each speak — allows immediate stop
- [04-03]: useFocusEffect + BackHandler for Android back button confirmation — React Navigation pattern
- [04-04]: XP placeholder totalSets * 10 — Phase 5 replaces with real XP calculation
- [04-04]: Navigation reset to Main after summary — prevents back navigation to workout
- [05-01]: Consistency bonus controlled by applyConsistencyBonus flag — caller decides timing (once per session)
- [05-01]: awardSetXP calculates but does NOT write to DB — accumulation happens in caller
- [05-01]: PR detection uses reps >= comparison — weight must beat all prior sets at same or higher reps
- [05-02]: XPFloater animation 800ms upward float with 400ms fade-out
- [05-02]: Consistency bonus applied on first set of session only
- [05-02]: XP badge in controls row between tempo toggle and exercise nav
- [05-03]: Pre-calculated XP passed via route params from WorkoutSession to Summary
- [05-03]: Finalization runs once via useRef hasFinalized flag
- [05-03]: Level-up card positioned above duration card for prominence
- [05-04]: refetch exposed from hook, useFocusEffect stays in screen (screen-level concern)
- [05-04]: XP bar animation duration 600ms for smooth but responsive feedback
- [03.1-01]: PRAGMA foreign_keys = ON at database init for cascade deletes
- [03.1-01]: split_exercises uses sort_order for exercise ordering within split
- [03.1-01]: getSplitExercises JOINs with exercises table to include names
- [03.1-02]: Placeholder screens inline in RootNavigator for type safety before real implementation
- [03.1-02]: Empty state has both inline CREATE SPLIT button and header + NEW button
- [03.1-03]: Map<exerciseId, {sets, reps}> for selection state preserves config across zone filter changes
- [03.1-03]: Inline SQLite query for all exercises (simpler than modifying useExercises hook)
- [03.1-03]: Side-by-side layout (exercises left, selected right) for landscape orientation
- [03.1-04]: Primary zone calculated from most common zone in split exercises
- [03.1-04]: Delete split with confirmation (no edit functionality in v1)
- [03.1-04]: Optional splitId param for tracking split-sourced workouts
- [04.1-01]: GestureHandlerRootView outermost (outside SQLiteProvider) — prerequisite for all Gesture.Pan() components
- [04.1-01]: useElapsedTimer uses Date.now() diff not accumulation — prevents drift over long sessions
- [04.1-01]: RPESlider uses Gesture.Race(pan, tap) — drag takes priority, tap-to-jump also works
- [04.1-01]: Gesture v2 pattern: Gesture.Pan() + GestureDetector + runOnJS for callbacks from worklets
- [04.1-03]: isComplete state gate for rest timer — timer reaching zero sets state, user taps to call onComplete (not auto-dismiss)
- [04.1-03]: RestTimerOverlay uses pure #000000 (not colors.bg.primary) for stark visual break from active set view
- [04.1-03]: No FadeIn/FadeOut inside RestTimerOverlay — parent WorkoutSessionScreen (Plan 04) owns fade transitions

### Pending Todos

None yet.

### Roadmap Evolution

- Phase 2.1 inserted after Phase 2: Overview screen polish — card redesign with photo slots, warm/cold zone states, tab bar and system text (URGENT)
- Phase 3.1 inserted after Phase 3: Workout Splits — custom workout templates with multi-zone support, split names (Push/Pull/Legs), preset sets/reps (URGENT)
- Phase 4.1 inserted after Phase 4: Workout Session Polish — improve look and feel of workout session screen (URGENT)

### Blockers/Concerns

- [Phase 1]: ~~muscle-front.png missing~~ RESOLVED — assets/images/characters/muscle-front.png now exists (555x1116, 73KB)
- [Phase 1]: ~~Expo Router driving entry point~~ RESOLVED — src/main.tsx with registerRootComponent is now the entry point
- [Phase 1]: ~~app.json portrait orientation~~ RESOLVED — orientation is now "landscape", ScreenOrientation.lockAsync also called in useEffect
- [Phase 1]: ~~Human verification of app visual output~~ RESOLVED — user verified on device: 4 tabs, correct fonts, landscape locked, Cyberpunk HUD screens rendering correctly
- [Phase 2]: tsc --noEmit shows Skia type declaration errors (esModuleInterop) — does not affect Expo build/runtime, known issue in library types

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Add tempo configuration to workout splits | 2026-03-10 | ae5d696 | [001-add-tempo-to-splits](./quick/001-add-tempo-to-splits/) |

## Session Continuity

Last session: 2026-03-11
Stopped at: Completed 04.1-03-PLAN.md (Rest Timer Simplification)
Resume file: None

## Project Status

All phases complete:
- Phase 1: Foundation (database, fonts, navigation) - 3 plans
- Phase 2: Character Overview (hex grid, body canvas, zone cards) - 3 plans
- Phase 2.1: Overview Polish (zone labels, photo slots, HUD) - 3 plans
- Phase 3: Character Detail (stat card, animations) - 2 plans
- Phase 3.1: Workout Splits (COMPLETE - 4/4 plans)
- Phase 4: Workout Module (exercise selection, set logging, summary) - 4 plans
- Phase 5: XP & Leveling (XP calculation, floaters, persistence, refresh) - 4 plans

Total execution time: ~63 minutes across 23 plans.
