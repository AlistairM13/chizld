---
phase: 04-workout-module
plan: 03
subsystem: workout
tags: [screens, voice-tempo, set-logging, rest-timer, sqlite, haptics]

dependency-graph:
  requires: [04-01, 04-02]
  provides: [WorkoutSessionScreen, useTempoVoice-hook, TempoToggle, SessionHeader]
  affects: [04-04]

tech-stack:
  added: []
  patterns: [expo-speech-voice-tempo, promise-based-speech, back-handler-confirm]

key-files:
  created:
    - src/hooks/useTempoVoice.ts
    - src/components/workout/TempoToggle.tsx
    - src/components/workout/SessionHeader.tsx
  modified:
    - src/screens/workout/WorkoutSessionScreen.tsx

decisions:
  - key: voice-tempo-phrases
    choice: "Use 'Down' and 'Up' for phase names, count down from tempo number"
    rationale: "Short words spoken clearly; counting down matches gym tempo conventions"
  - key: tempo-cancellation
    choice: "Check isActiveRef.current before each speak call"
    rationale: "Allows immediate stop without waiting for speech queue to drain"
  - key: back-handler-confirm
    choice: "useFocusEffect with BackHandler for Android back button confirmation"
    rationale: "React Navigation pattern for screen-specific back handling"

metrics:
  duration: "~3.5 min"
  completed: "2026-03-09"
---

# Phase 04 Plan 03: Workout Session Screen Summary

**One-liner:** Full workout session screen with voice-guided tempo, set logging to SQLite, and rest timer integration.

## What Was Built

### Voice Tempo Hook

**useTempoVoice** (115 lines)
- expo-speech wrapper for tempo countdown sequence
- `speakAndWait(text)`: Promise-based speech with timeout fallback
- `startTempo(config)`: Starts looping tempo cycle (Down... 3... 2... 1... Hold... Up... 3... 2... 1...)
- `stopTempo()`: Halts immediately via Speech.stop()
- `isPlaying`: Boolean state for UI indicator
- Configurable phases: eccentric, pauseBottom, concentric, pauseTop

### Session UI Components

**TempoToggle** (79 lines)
- Custom switch-like toggle for voice tempo
- Enabled: ember background, knob right
- Disabled: cold zone background, knob left
- Glow effect when actively playing
- Haptic feedback on toggle

**SessionHeader** (81 lines)
- Exercise name display (Chakra Petch 18px)
- Set counter: "SET X/Y" (JetBrains Mono)
- FINISH button with ember accent
- Ember border at bottom

### Main Session Screen

**WorkoutSessionScreen** (534 lines)
- Full workout session with all interactions wired
- Exercise navigation: PREV/NEXT buttons with counter
- Completed sets: Read-only rows with success border, dimmed
- Current set: Full input grid with WeightInput, RepsInput, RPESelector
- COMPLETE SET button: Validates weight > 0, reps > 0, RPE selected
- Rest timer overlay auto-appears after completing set
- Voice tempo starts after rest timer completes (if enabled)
- Back button: Alert confirmation before exit
- Session completes and navigates to SessionSummary

### Integration Points

- `useWorkoutSession`: Creates session on mount, adds sets to SQLite
- `useTempoVoice`: Voice tempo on toggle, stopped during rest
- `RestTimerOverlay`: Shown after set completion, callbacks for complete/skip
- `useFocusEffect` + `BackHandler`: Android back button handling

## Key Decisions Made

1. **Voice tempo phrases:** "Down" and "Up" for clear phase indication, countdown numbers for timing
2. **Tempo cancellation:** Check `isActiveRef.current` before each speak call for immediate stop capability
3. **Back button handling:** `useFocusEffect` with `BackHandler` for screen-specific interception

## Commits

| Hash | Description |
|------|-------------|
| e69eebc | Add useTempoVoice hook for voice-guided tempo |
| 4fe7889 | Add TempoToggle and SessionHeader components |
| a4b7d68 | Implement WorkoutSessionScreen with full set logging |

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

### Created
- `src/hooks/useTempoVoice.ts` (115 lines)
- `src/components/workout/TempoToggle.tsx` (79 lines)
- `src/components/workout/SessionHeader.tsx` (81 lines)

### Modified
- `src/screens/workout/WorkoutSessionScreen.tsx` (50 lines -> 534 lines)

## Next Phase Readiness

Ready for Plan 04 (Session Summary + XP):
- Workout session flow complete: select exercises -> log sets -> complete
- Each set persists to `workout_sets` table with weight, reps, RPE
- Session ends via FINISH button or back button confirmation
- SessionSummaryScreen receives sessionId for XP calculation
- All components follow cyberpunk aesthetic (ember accents, card backgrounds)
