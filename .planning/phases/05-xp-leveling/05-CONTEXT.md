# Phase 5: XP & Leveling - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Calculate and award XP for workout sets, apply bonuses (base, volume, tempo, PR, consistency), update zone levels, and record all XP transactions. The character screen reflects real earned XP after workouts.

</domain>

<decisions>
## Implementation Decisions

### XP Display
- Show XP per-set during workout (floating +XP text after each logged set)
- Show total breakdown at session summary
- XP bar fills incrementally as each set is marked complete — real-time visual feedback, not batch update at end

### Level-up Feedback
- Subtle pulse effect when zone levels up — noticed but not disruptive
- Level-up celebration appears at session summary (after workout complete)
- XP updates are animated everywhere they're shown (summary, character screen, stat cards)

### Claude's Discretion
- Bonus stacking rules (additive vs multiplicative, order of operations)
- PR bonus scope (per set vs per session)
- Whether tempo multiplier and PR bonus stack fully
- Volume calculation method (tonnage, working sets, total reps)
- Volume bonus reference (personal history vs absolute thresholds)
- Bodyweight exercise handling for volume
- Volume bonus caps/diminishing returns
- Consistency definition (daily streak, weekly target, zone streak)
- Consistency bonus scaling with streak length
- Streak break forgiveness rules
- Streak visibility in UI
- Haptic feedback on level-up
- Enhanced effects for milestone levels (5, 10)

</decisions>

<specifics>
## Specific Ideas

- "XP should fill up not after the session is completed but as the set is marked as completed" — real-time progression feels rewarding
- Level-up should be noticeable but not interrupt the workout flow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-xp-leveling*
*Context gathered: 2026-03-08*
