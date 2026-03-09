---
phase: 04-workout-module
plan: 01
subsystem: workout
tags: [navigation, hooks, react-native, exercise-selection]

dependency-graph:
  requires: [03-character-detail]
  provides: [exercise-select-flow, useExercises-hook, workout-navigation]
  affects: [04-02, 04-03]

tech-stack:
  added: []
  patterns: [multi-select-state, zone-filtering, search-filter]

key-files:
  created:
    - src/hooks/useExercises.ts
    - src/components/workout/ExerciseCard.tsx
    - src/components/workout/ExerciseBottomBar.tsx
    - src/screens/workout/WorkoutSessionScreen.tsx
    - src/screens/workout/SessionSummaryScreen.tsx
  modified:
    - src/navigation/types.ts
    - src/navigation/RootNavigator.tsx
    - src/screens/character/CharacterScreen.tsx
    - src/screens/workout/ExerciseSelectScreen.tsx

decisions:
  - key: navigation-types
    choice: "ExerciseSelect, WorkoutSession, SessionSummary added to RootStackParamList"
    rationale: "Stack navigation for workout flow separate from tab navigation"
  - key: multi-select-pattern
    choice: "Set<string> for selectedExercises state"
    rationale: "O(1) lookup for toggle, easy conversion to array for navigation params"
  - key: search-implementation
    choice: "SQL LIKE query with debounced state"
    rationale: "SQLite handles filtering efficiently, minimal client-side processing"

metrics:
  duration: "~3.5 min"
  completed: "2026-03-09"
---

# Phase 04 Plan 01: Exercise Select Flow Summary

**One-liner:** Wired TRAIN button to navigate to ExerciseSelectScreen with zone-filtered exercise list, search, and multi-select.

## What Was Built

### Navigation Infrastructure
- Extended `RootStackParamList` with workout flow routes:
  - `ExerciseSelect: { zoneId: string }`
  - `WorkoutSession: { sessionId: string; exercises: string[] }`
  - `SessionSummary: { sessionId: string }`
- Added Stack.Screen entries for all three routes
- Created placeholder screens for WorkoutSession and SessionSummary

### Data Layer
- `useExercises` hook queries exercises table filtered by zone
- Supports optional search query via SQL LIKE pattern
- Returns `{ exercises: Exercise[], isLoading: boolean }`

### UI Components
- `ExerciseCard`: Pressable list item with selection state
  - Ember border + tinted background when selected
  - Haptic feedback on toggle
  - Shows exercise name and optional equipment
- `ExerciseBottomBar`: Fixed bottom bar
  - Shows "N EXERCISES SELECTED" count
  - START WORKOUT button (disabled when count=0)
  - Ember accent border

### Screen Implementation
- `ExerciseSelectScreen`: Full exercise selection flow
  - Header with back arrow and zone name
  - Search input with focus state styling
  - FlatList of ExerciseCard components
  - Multi-select via Set-based state
  - Navigates to WorkoutSession on Start

## Key Decisions Made

1. **Set-based selection:** Using `Set<string>` for exercise IDs provides O(1) toggle operations
2. **SQL filtering:** Search query passed to useExercises for efficient DB-level filtering
3. **Session ID generation:** `Date.now().toString(36) + Math.random().toString(36).substr(2)` for unique IDs

## Commits

| Hash | Description |
|------|-------------|
| f3f201b | Wire TRAIN navigation and add workout stack screens |
| 3dac035 | Add useExercises hook and ExerciseCard component |
| 72967d9 | Implement ExerciseSelectScreen with search and multi-select |

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

### Created
- `src/hooks/useExercises.ts` (59 lines)
- `src/components/workout/ExerciseCard.tsx` (73 lines)
- `src/components/workout/ExerciseBottomBar.tsx` (61 lines)
- `src/screens/workout/WorkoutSessionScreen.tsx` (49 lines)
- `src/screens/workout/SessionSummaryScreen.tsx` (49 lines)

### Modified
- `src/navigation/types.ts` - Added workout route types
- `src/navigation/RootNavigator.tsx` - Added screen registrations
- `src/screens/character/CharacterScreen.tsx` - Wired TRAIN button
- `src/screens/workout/ExerciseSelectScreen.tsx` - Full implementation

## Next Phase Readiness

Ready for Plan 02:
- ExerciseSelect navigates to WorkoutSession with exercise IDs
- Session ID generated for tracking
- WorkoutSessionScreen placeholder ready to receive params
