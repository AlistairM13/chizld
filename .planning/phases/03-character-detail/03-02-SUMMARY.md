---
phase: 03-character-detail
plan: 02
subsystem: character-ui
tags: [stat-card, xp-bar, stats-grid, photo-history, detail-mode, dismiss-behavior]
completed: 2026-03-08
duration: 3 min

dependency_graph:
  requires: [03-01]
  provides: [stat-card-component, detail-stats-hook, dismiss-interactions, hud-bar-modes]
  affects: [03-03, 04-workout-flow]

tech_stack:
  added: []
  patterns: [reanimated-slide-animation, shared-value-interpolation, useFocusEffect-back-handler]

key_files:
  created:
    - src/components/character/XPProgressBar.tsx
    - src/components/character/StatsGrid.tsx
    - src/components/character/PhotoHistoryRow.tsx
    - src/components/character/StatCard.tsx
    - src/hooks/useDetailStats.ts
  modified:
    - src/screens/character/CharacterScreen.tsx
    - src/components/character/HudBar.tsx

decisions:
  - id: "03-02-01"
    choice: "XP bar uses toLocaleString for number formatting"
    reason: "Consistent with stats grid volume formatting"
  - id: "03-02-02"
    choice: "Photo history row uses dashed border with colors.text.muted"
    reason: "colors.border.default does not exist in palette"
  - id: "03-02-03"
    choice: "StatCard positioned with explicit top/bottom offsets (44px/108px)"
    reason: "Fits between HudBarTop and HudBarBottom/tab bar"

metrics:
  tasks: 3/3
  commits: 3
  files_created: 5
  files_modified: 2
---

# Phase 03 Plan 02: Stat Card Component Summary

**One-liner:** Stat card with zone stats, XP progress bar, 3x2 stats grid, 5 photo placeholders, TRAIN button, and dismiss interactions.

## What Was Built

### Task 1: Stat Card Subcomponents
Created the three UI subcomponents that StatCard composes:

1. **XPProgressBar** - Calculates XP progress using LEVEL_THRESHOLDS, shows fill bar and "{current} / {needed} XP" text
2. **StatsGrid** - 3x2 grid: STREAK, VOLUME 7D, SESSIONS / TOTAL SETS, MAX, LAST with formatVolume and formatLast helpers
3. **PhotoHistoryRow** - Row of 5 dashed-border placeholder slots with "+" icons for future photo thumbnails

### Task 2: useDetailStats Hook and StatCard Component
- **useDetailStats** - Queries zone_stats table for zone data, returns ZoneDetailStats interface with placeholder workout values (Phase 4)
- **StatCard** - Animated card that slides in from right using statCardProgress shared value, contains:
  - Header with fire emoji, zone name (Chakra Petch), level badge (LV.X)
  - XPProgressBar
  - StatsGrid
  - PhotoHistoryRow
  - TRAIN button (full-width, ember-orange)

### Task 3: CharacterScreen Integration
Wired everything together:
- Added HudBarTop and HudBarBottom to CharacterScreen (were missing)
- HudBarBottom gains isDetailMode prop, shows "BUILD 2.4.1 / ESC TO RETURN" in detail mode
- Pressable wrapper dismisses detail view on tap outside stat card
- useFocusEffect handles Android back button to dismiss detail view
- StatCard receives statCardProgress for staggered animation (character first, then card)

## Commits

| Hash | Type | Description |
|------|------|-------------|
| ef16cf0 | feat | Create stat card subcomponents |
| 01bef5f | feat | Create useDetailStats hook and StatCard component |
| 32f62ee | feat | Wire stat card to CharacterScreen with dismiss behavior |

## Key Decisions

1. **XP number formatting** - Used toLocaleString() for consistent formatting with thousands separators
2. **Photo slot border color** - Used colors.text.muted since colors.border.default doesn't exist
3. **StatCard positioning** - Used absolute positioning with top: 44px (below HudBarTop) and bottom: 108px (above HudBarBottom + tab bar)

## Deviations from Plan

None - plan executed exactly as written.

## What's Missing (Deferred to Future Phases)

- Workout stats (totalSets, sessions, volume7d, maxWeight) are placeholders (Phase 4)
- TRAIN button navigation to workout screen (Phase 4)
- Actual photo URIs in PhotoHistoryRow (v2 feature)

## Next Phase Readiness

**Phase 03 Plan 03:** Zone glow & selection polish
- Stat card component is ready
- Animation choreography is working
- All dismiss interactions functional
- Ready for visual polish pass
