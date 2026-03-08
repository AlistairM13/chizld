# Phase 3: Character Detail - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Tapping a zone card triggers the detail state — character slides left, selected zone highlights ember-orange, and the RPG stat card slides in from the right showing real zone data (XP, level, stats grid, TRAIN button). Tapping outside or pressing back returns to overview.

**Reference design:** `designs/details.png`

</domain>

<decisions>
## Implementation Decisions

### Transition choreography
- Sequence: Character slides left FIRST, then stat card enters after brief delay
- Slide amount: Character moves ~50% left (nearly off-screen), stat card dominates right half
- Easing: Smooth ease-out (starts fast, decelerates smoothly)
- Duration: ~500ms total for the full transition

### Stat card layout
- Photo slot: Yes, but subtle — small thumbnail, not the focus
- XP progress bar: In header row, right of zone name near level badge (matches design)
- Stats grid: 3x2 exactly as design — STREAK, VOLUME 7D, SESSIONS (top row), TOTAL SETS, MAX, LAST (bottom row)
- Card border: Glowing ember edge (ember-orange accent border)
- TRAIN button: Full-width, ember-orange, at bottom of card

### Zone highlight behavior
- Selected zone: Pulsing ember glow effect on the character figure
- Other zone cards: Fade out to near-invisible when one is selected
- Zone switching: Must dismiss detail view first — no direct switching between zones
- Connecting line: Ember-colored dashed line connects selected zone to stat card

### Dismiss interaction
- Tap outside: Any tap outside stat card dismisses to overview state
- Swipe gestures: None — only tap and back button work
- Exit animation: Reverse of enter (stat card slides out right, then character slides back) — same ~500ms duration
- TRAIN button: Navigates immediately to workout screen for selected zone (no confirmation)

### Claude's Discretion
- Exact pulse timing/intensity for zone highlight
- Fade opacity level for non-selected zone cards
- Precise delay between character slide and stat card enter
- Loading states if zone_stats data takes time

</decisions>

<specifics>
## Specific Ideas

- Reference design at `designs/details.png` shows exact layout: zone name left, level badge right, 3x2 stats grid, TRAIN button
- Transitions should feel polished and deliberate, not snappy/game-like
- The stat card should feel like an RPG character sheet sliding in

</specifics>

<workflow>
## Workflow Requirements

**Visual verification:** Every plan task that modifies UI must include a step to run `/expo-emulator-screenshot` after the change. This ensures each agent visually verifies their UI work before marking the task complete.

</workflow>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-character-detail*
*Context gathered: 2026-03-08*
