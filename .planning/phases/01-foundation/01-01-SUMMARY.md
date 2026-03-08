---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [react-native, typescript, expo, skia, constants, design-system, svg, png]

# Dependency graph
requires: []
provides:
  - src/constants/colors.ts with full PRD color palette (as const)
  - src/constants/fonts.ts with correct @expo-google-fonts underscore font names
  - src/constants/zones.ts with 8 zone configs (ZONE_IDS + zones array)
  - src/constants/xp.ts with 10 level thresholds from PRD section 7
  - src/types/index.ts with all domain interfaces (ZoneId, Zone, Exercise, WorkoutSession, WorkoutSet, ZoneStats, XPHistory, LevelThreshold)
  - assets/images/characters/muscle-front.png at 555x1116 (3x SVG resolution)
  - src/components/character/ZonePaths.ts with ZoneBounds interface and placeholder zone data
  - All PRD-specified src/ subdirectories created
affects:
  - 01-02 (database uses ZoneId from types)
  - 01-03 (navigation/screens use constants and types)
  - 02-character-screen (BodyCanvas uses muscle-front.png, ZonePaths.ts, colors, fonts)
  - all-phases (constants and types used throughout entire app)

# Tech tracking
tech-stack:
  added: [sharp (temporary - used for one-time SVG conversion then removed)]
  patterns:
    - "as const on all exported constant objects for TypeScript type safety"
    - "Underscore convention for @expo-google-fonts font family strings (ChakraPetch_700Bold not ChakraPetch-Bold)"
    - "ZoneId string literal union as central type, imported by constants and components"
    - "ZoneBounds Record<ZoneId, ZoneBounds> for SVG coordinate space hit regions"

key-files:
  created:
    - src/constants/colors.ts
    - src/constants/fonts.ts
    - src/constants/zones.ts
    - src/constants/xp.ts
    - src/types/index.ts
    - src/components/character/ZonePaths.ts
    - assets/images/characters/muscle-front.png
    - scripts/convert-svg.js
  modified: []

key-decisions:
  - "Use @expo-google-fonts underscore convention for font names (ChakraPetch_700Bold) not PRD's hyphenated names which would fail silently"
  - "PNG at 555x1116 (3x of 185x372 SVG viewBox) for crisp landscape Android display"
  - "ZonePaths.ts uses bounding box estimates for Phase 1; Phase 2 refines with actual SVG path inspection"
  - "Empty directories tracked via .gitkeep files"

patterns-established:
  - "Pattern: All design tokens exported as const objects with as const for type inference"
  - "Pattern: ZoneId string literal union flows from types/index.ts to all other modules"
  - "Pattern: SVG-to-PNG via sharp node script (one-time, not a build step)"

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 1 Plan 01: File Structure, Constants, Types, SVG-to-PNG Summary

**Design system constants (colors, fonts, zones, xp), domain TypeScript types, 555x1116 muscle-front.png asset, and ZonePaths zone bounds placeholder — foundation for all downstream phases**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-08T07:18:00Z
- **Completed:** 2026-03-08T07:20:44Z
- **Tasks:** 2
- **Files modified:** 8 created

## Accomplishments

- Created all PRD-specified src/ subdirectories (navigation, screens/{character,workout,sleep,diet}, components/{character,shared}, db, services)
- Created 5 TypeScript constant/type files (colors, fonts, zones, xp, types/index) all compiling cleanly
- Converted designs/muscle-front.svg to assets/images/characters/muscle-front.png at 555x1116 (3x resolution, 73KB)
- Created src/components/character/ZonePaths.ts with ZoneBounds interface and 8 zone placeholder bounding boxes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create directory structure, constants, and types** - `0cb894d` (feat)
   - Note: constants/types were already committed via 01-02 parallel wave; this commit adds directory .gitkeep files
2. **Task 2: Convert SVG to PNG and create ZonePaths placeholder** - `d7b63be` (feat)

**Plan metadata:** (created below)

## Files Created/Modified

- `src/constants/colors.ts` - Full PRD color palette as const (bg, ember, zone, hud, text, success, warning, danger)
- `src/constants/fonts.ts` - Font family name mappings using @expo-google-fonts underscore convention
- `src/constants/zones.ts` - 8 zone configs with IDs, names, sides, positions; imports ZoneId from types
- `src/constants/xp.ts` - 10 level thresholds (Untrained → Chizld) from PRD section 7
- `src/types/index.ts` - All domain interfaces: ZoneId, Zone, Exercise, WorkoutSession, WorkoutSet, ZoneStats, XPHistory, LevelThreshold
- `src/components/character/ZonePaths.ts` - ZoneBounds interface + zoneBounds Record<ZoneId, ZoneBounds> placeholder
- `assets/images/characters/muscle-front.png` - 555x1116 PNG (73572 bytes) converted from designs/muscle-front.svg
- `scripts/convert-svg.js` - One-time sharp conversion script (sharp itself uninstalled after use)
- `src/navigation/.gitkeep` + `src/screens/*/. gitkeep` + `src/components/*/. gitkeep` + `src/services/.gitkeep`

## Decisions Made

- **Font name convention:** Used @expo-google-fonts underscore names (`ChakraPetch_700Bold`) not PRD's hyphenated names (`ChakraPetch-Bold`) which would fail silently — this is a critical discrepancy documented in research
- **PNG resolution:** 555x1116 (3x of 185x372 SVG viewBox) for crisp display on landscape Android screens
- **ZonePaths placeholder:** Created bounding box estimates for Phase 1; Phase 2 BodyCanvas implementation will refine with actual visual inspection of SVG coordinates
- **sharp lifecycle:** Installed with `--no-save`, used for conversion, then uninstalled — PNG is committed, script is kept for reproducibility

## Deviations from Plan

### Context: Parallel Wave Overlap

**Situation (not a deviation, just context):**
- Found during: Task 1 start
- Issue: Plan 01-02 (running in parallel Wave 1) had already committed `src/constants/colors.ts`, `src/constants/fonts.ts`, `src/constants/xp.ts`, `src/constants/zones.ts`, and `src/types/index.ts` before this plan executed
- Resolution: Verified the 01-02 versions matched this plan's spec exactly (same content). Committed only the new directory structure (.gitkeep files) for Task 1 rather than re-committing identical file content
- Impact: None — all required files exist with correct content

None - plan executed exactly as written (accounting for parallel wave pre-completion of constants/types by 01-02).

## Issues Encountered

None — all tasks completed without errors. TypeScript compilation clean on all files.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All design system constants ready for 01-03 (navigation + screens)
- muscle-front.png asset ready for Phase 2 BodyCanvas Skia rendering
- ZonePaths.ts placeholder ready; Phase 2 will replace bounds with actual visual inspection data
- STATE.md blocker resolved: "muscle-front.png is missing from assets/images/characters/" is now fixed
- Directories are empty placeholders; Phase 1 plans 01-02 and 01-03 will populate them

---
*Phase: 01-foundation*
*Completed: 2026-03-08*
