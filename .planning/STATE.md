# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** The character screen must feel like a game — tapping zones, seeing RPG stats, and launching workouts.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 5 (Foundation)
Plan: 2 of 3 in current phase (01-01 and 01-02 complete)
Status: In progress
Last activity: 2026-03-08 — Completed 01-01-PLAN.md (file structure, constants, types, SVG-to-PNG)

Progress: [██░░░░░░░░] ~13% (2/15 plans across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 2-3 min
- Total execution time: ~5 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2/3 | ~5 min | ~2.5 min |

**Recent Trend:**
- Last 5 plans: 01-02 (2 min), 01-01 (3 min)
- Trend: Fast foundation setup

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Replace Expo Router with React Navigation — Expo Router currently drives the app but conflicts with PRD nav spec; entry point must change from expo-router/entry to expo/entry
- [Init]: Use Skia Canvas as base layer, RN Views overlaid for cards/text — Skia handles hex grid, glow, character image; RN handles all text and layout components
- [Init]: Character SVG must be converted/handled for Skia — muscle-front.svg is at designs/; needs to be used as PNG or rendered via Skia Image
- [01-01]: @expo-google-fonts underscore convention for font names — ChakraPetch_700Bold not ChakraPetch-Bold; PRD names are wrong and would fail silently
- [01-01]: PNG at 555x1116 (3x SVG viewBox) for crisp landscape Android display via Skia
- [01-01]: ZonePaths.ts uses bounding box estimates for Phase 1; Phase 2 BodyCanvas refines with actual SVG path inspection
- [Init]: v1 = Foundation + Character Screen + Workout + XP only — sleep/diet/photos/polish deferred to v2
- [01-02]: withExclusiveTransactionAsync for bulk seeding — prevents database locked errors during parallel inserts
- [01-02]: MMKV defaults: 4 values set (onboarding_complete, character_preset, rest_timer_default, tempo_defaults); user-set keys (diet_targets, sleep_schedule, current_photo_path) left unset
- [01-02]: database.ts and storage.ts kept self-contained (no imports from src/constants/ or src/types/) — parallel wave constraint

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: ~~muscle-front.png missing~~ RESOLVED — assets/images/characters/muscle-front.png now exists (555x1116, 73KB)
- [Phase 1]: Expo Router currently drives the main entry point (package.json "main": "expo-router/entry") — must be changed to "expo/entry" as part of navigation replacement
- [Phase 1]: app.json has orientation set to "portrait" — must be changed to "landscape" or landscape lock before Phase 2

## Session Continuity

Last session: 2026-03-08T07:20:44Z
Stopped at: Completed 01-01-PLAN.md (file structure, constants, types, SVG-to-PNG)
Resume file: None
