---
phase: 05-xp-leveling
plan: 01
subsystem: xp
tags: [xp, leveling, calculation, sqlite, hooks]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: SQLite database with zone_stats and xp_history tables
  - phase: 04-workout-module
    provides: Workout session flow that will call XP service
provides:
  - Pure XP calculation functions (calculateSetXP, getLevelFromXP, getXPProgress)
  - XP service hook with PR detection and consistency checks
  - Atomic zone_stats + xp_history persistence
affects: [05-02, 05-03, session-summary]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure calculation service (no React/DB dependencies)
    - Hook wraps pure functions + DB operations
    - withExclusiveTransactionAsync for multi-table atomicity

key-files:
  created:
    - src/services/xp-calculator.ts
    - src/hooks/useXPService.ts
  modified: []

key-decisions:
  - "Consistency bonus controlled by applyConsistencyBonus flag - caller decides timing (once per session)"
  - "awardSetXP calculates but does NOT write to DB - accumulation happens in caller"
  - "finalizeSession writes accumulated XP atomically with streak management"

patterns-established:
  - "XP formula: (10 + volumeBonus + prBonus + consistencyBonus) * tempoMultiplier"
  - "PR detection: weight exceeds MAX at same or higher reps"
  - "Streak logic: increment if trained within 7 days, else reset to 1"

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 5 Plan 1: XP Engine Summary

**Pure XP calculator with base/volume/PR/consistency bonuses and tempo multiplier, plus database service hook for atomic zone stats persistence**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T05:32:49Z
- **Completed:** 2026-03-09T05:34:49Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Created pure XP calculator with all bonus types (base 10, volume, PR 50, consistency 20)
- Tempo multiplier (1.5x) applies to full subtotal as specified
- XP service hook with checkIsPR querying historical max weight at same or higher reps
- Atomic finalizeSession updates zone_stats + inserts xp_history in single transaction
- Streak management: increment if warm (trained within 7 days), reset to 1 if cold

## Task Commits

Each task was committed atomically:

1. **Task 1: Create XP calculator service** - `68f9bd5` (feat)
2. **Task 2: Create XP service hook** - `56e1bf2` (feat)

## Files Created

- `src/services/xp-calculator.ts` - Pure XP calculation functions (calculateSetXP, getLevelFromXP, getXPProgress, wasTrainedWithin7Days)
- `src/hooks/useXPService.ts` - Database operations hook (checkIsPR, getZoneConsistency, awardSetXP, finalizeSession)

## Decisions Made

1. **Consistency bonus timing controlled by caller** - The applyConsistencyBonus flag lets the caller decide when to apply the 20 XP bonus (typically once per session, not per set)
2. **awardSetXP does not write to database** - Caller accumulates XP across sets, then calls finalizeSession once at session end
3. **PR detection uses reps >= comparison** - A PR at 5 reps must beat all prior sets at 5+ reps (can't claim PR at lower reps)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- XP calculation engine ready for integration
- useXPService hook ready to replace placeholder XP in session summary
- Plan 05-02 (Zone XP Display) can now show real XP/level data
- Plan 05-03 (Session Integration) will wire awardSetXP + finalizeSession into workout flow

---
*Phase: 05-xp-leveling*
*Completed: 2026-03-09*
