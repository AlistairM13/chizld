# Phase 4: Workout Module - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

The complete workout loop — exercise selection filtered by zone, active session screen for logging sets (weight, reps, RPE), voice tempo countdown via expo-speech, configurable rest timer, and a session summary screen showing completion data. XP calculation is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Exercise Selection Flow
- List style: Claude's discretion (fit the cyberpunk aesthetic)
- Tap to add instantly — single tap adds exercise, visual confirmation, keep browsing
- Search bar only for filtering (no equipment filters)
- Bottom bar shows count ("3 exercises selected") with Start Workout button

### Set Logging Interaction
- Weight input: number pad + stepper buttons
- Weight step size: ±2.5 kg
- RPE input: tap number row (buttons 6-10)
- Confirmation: quick flash + sound, then rest timer auto-starts

### Rest Timer Behavior
- Auto-start with cancel — timer begins after logging, "Skip Rest" button visible
- Full screen takeover — large countdown fills screen
- Alert: vibrate + sound when rest complete
- Quick adjust: ±15 second buttons

### Voice Tempo Experience
- Session-wide toggle — one switch enables tempo for all exercises
- Full phases spoken: "Eccentric... 5... 4... 3... 2... 1... Hold... Concentric"
- User taps "Done" to end set (cycles repeat until done)
- Per-exercise tempo presets stored in database

### Claude's Discretion
- Exercise list visual design (cards vs simple list, info shown)
- Session summary screen layout
- Sound/haptic feedback specifics
- Animation details for screen transitions

</decisions>

<specifics>
## Specific Ideas

- Bottom bar pattern similar to shopping cart ("3 items — Checkout") — clear count and action
- Rest timer takes over screen but session visible behind it (semi-transparent)
- Voice tempo should feel like a coach counting you through the rep

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-workout-module*
*Context gathered: 2026-03-08*
