---
phase: 04-workout-module
plan: 02
subsystem: workout
tags: [hooks, components, sqlite, skia, timer, input-controls]

dependency-graph:
  requires: [04-01]
  provides: [useWorkoutSession-hook, useRestTimer-hook, set-logging-components]
  affects: [04-03]

tech-stack:
  added: []
  patterns: [drift-free-timer, custom-numpad, skia-arc-animation]

key-files:
  created:
    - src/hooks/useWorkoutSession.ts
    - src/hooks/useRestTimer.ts
    - src/components/workout/WeightInput.tsx
    - src/components/workout/RPESelector.tsx
    - src/components/workout/SetRow.tsx
    - src/components/workout/RepsInput.tsx
    - src/components/workout/RestTimerOverlay.tsx
  modified: []

decisions:
  - key: timer-drift-prevention
    choice: "Track absolute end time with useRef, update remaining from delta"
    rationale: "setInterval drift accumulates over time; absolute timestamps stay accurate"
  - key: weight-input-dual-mode
    choice: "Number pad for direct entry + stepper buttons for quick adjust"
    rationale: "Users can tap exact weight or quickly increment by 2.5kg"
  - key: reps-input-steppers-only
    choice: "Steppers only for reps (no number pad)"
    rationale: "Rep counts are small integers; steppers are faster than typing"

metrics:
  duration: "~3.5 min"
  completed: "2026-03-09"
---

# Phase 04 Plan 02: Workout Session Hooks and Set Components Summary

**One-liner:** SQLite-backed session hooks with drift-free timer and cyberpunk input components for weight/reps/RPE logging.

## What Was Built

### Data Layer Hooks

**useWorkoutSession** (204 lines)
- SQLite-backed workout session state management
- `createSession(exerciseIds)`: Creates workout_sessions row, loads exercise names
- `addSet(exerciseId, data)`: INSERT INTO workout_sets with auto-incrementing set number
- `completeSession(notes?)`: UPDATE workout_sessions SET ended_at
- `getSessionSummary()`: Returns totalSets, exercisesCompleted, exercises with counts
- ID generation: `Date.now().toString(36) + random suffix`

**useRestTimer** (118 lines)
- Drift-free countdown using absolute end time tracking
- `start(customDuration?)`: Sets endTimeRef, starts 100ms interval
- `skip()`: Stops timer immediately
- `adjustTime(delta)`: Adds/removes seconds from end time
- `setDefaultDuration(seconds)`: Updates default for future starts
- Cleans up interval on unmount

### Input Components

**WeightInput** (245 lines)
- Main row: [-2.5] [value display] [+2.5]
- Tappable value opens inline custom number pad
- Number pad: 3x4 grid (0-9, decimal, done), clear button
- Steppers for quick +/- 2.5kg adjustments
- Min/max bounds with clamping
- Haptic feedback on all interactions

**RPESelector** (97 lines)
- Label + row of 5 buttons (6, 7, 8, 9, 10)
- Selected: ember background, white text
- Unselected: card background, ember border/text
- 44x44 touch targets

**RepsInput** (96 lines)
- Label + steppers row (simpler than WeightInput)
- +/- buttons with step=1
- Haptic feedback

### Composite Components

**SetRow** (133 lines)
- Row layout: #N label, WeightInput, RepsInput, RPESelector, LOG button
- LOG button enabled when weight > 0, reps > 0, RPE selected
- Completed sets show dim styling with success border
- Parent handles haptic + timer start on complete

**RestTimerOverlay** (216 lines)
- Full-screen semi-transparent overlay (rgba(10,10,15,0.95))
- Large countdown display (JetBrains Mono 72px, ember color)
- Skia progress ring: 200x200 canvas with 8px stroke arc
- Arc animates from full circle to empty as time decreases
- +/-15s adjust buttons
- SKIP REST text button
- Auto-starts on mount
- Haptic + vibration pattern on completion

## Key Decisions Made

1. **Drift-free timer:** Using `endTimeRef` with absolute timestamp avoids setInterval timing drift over long rest periods
2. **Dual weight input:** Number pad for entering exact weights (e.g., 72.5kg), steppers for quick plate math (+2.5kg)
3. **Steppers only for reps:** Small integers don't benefit from number pad; steppers are faster

## Commits

| Hash | Description |
|------|-------------|
| b092526 | Add workout session and rest timer hooks |
| 7b6408d | Add WeightInput and RPESelector components |
| d11c621 | Add SetRow and RestTimerOverlay components |

## Deviations from Plan

### Auto-added Missing Components

**1. [Rule 2 - Missing Critical] RepsInput component**
- **Found during:** Task 3
- **Issue:** SetRow required RepsInput but plan only specified WeightInput
- **Fix:** Created RepsInput.tsx with stepper-only design
- **Files created:** src/components/workout/RepsInput.tsx (96 lines)
- **Commit:** d11c621

## Files Changed

### Created
- `src/hooks/useWorkoutSession.ts` (204 lines)
- `src/hooks/useRestTimer.ts` (118 lines)
- `src/components/workout/WeightInput.tsx` (245 lines)
- `src/components/workout/RPESelector.tsx` (97 lines)
- `src/components/workout/RepsInput.tsx` (96 lines)
- `src/components/workout/SetRow.tsx` (133 lines)
- `src/components/workout/RestTimerOverlay.tsx` (216 lines)

### Modified
None - all new files

## Next Phase Readiness

Ready for Plan 03:
- useWorkoutSession provides session state + SQLite persistence
- useRestTimer provides accurate countdown with adjust/skip
- SetRow composes all inputs for set logging
- RestTimerOverlay provides full-screen rest timer UI
- All components follow cyberpunk aesthetic (ember accents, card backgrounds)
