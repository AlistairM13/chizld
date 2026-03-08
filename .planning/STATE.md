# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** The character screen must feel like a game — tapping zones, seeing RPG stats, and launching workouts.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 5 (Foundation)
Plan: 3 of 3 in current phase (01-01 and 01-02 complete; 01-03 at human-verify checkpoint)
Status: Awaiting checkpoint — human verification of visual output required
Last activity: 2026-03-08 — Executed 01-03 Tasks 1+2; paused at Task 3 human-verify checkpoint

Progress: [███░░░░░░░] ~20% (2.5/15 plans — 01-03 pending final verification)

## Performance Metrics

**Velocity:**
- Total plans completed: 2 (+ 01-03 at checkpoint)
- Average duration: 2 min
- Total execution time: ~7 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2/3 complete + 1 at checkpoint | ~7 min | ~2.3 min |

**Recent Trend:**
- Last 5 plans: 01-03 (2 min, at checkpoint), 01-02 (2 min), 01-01 (3 min)
- Trend: Fast foundation setup

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: ~~muscle-front.png missing~~ RESOLVED — assets/images/characters/muscle-front.png now exists (555x1116, 73KB)
- [Phase 1]: ~~Expo Router driving entry point~~ RESOLVED — src/main.tsx with registerRootComponent is now the entry point
- [Phase 1]: ~~app.json portrait orientation~~ RESOLVED — orientation is now "landscape", ScreenOrientation.lockAsync also called in useEffect
- [01-03 checkpoint]: Human verification of app visual output needed before Phase 1 can be marked complete

## Session Continuity

Last session: 2026-03-08T07:25:18Z
Stopped at: 01-03 Task 3 checkpoint (human-verify) — Tasks 1+2 committed, awaiting visual verification
Resume file: .planning/phases/01-foundation/01-03-PLAN.md (Task 3 — resume after user approves)
