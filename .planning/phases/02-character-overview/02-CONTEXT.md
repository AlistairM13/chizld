# Phase 2: Character Overview - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Render the full character overview screen — Skia canvas with hex grid background, anatomical figure in teal scan frame, 8 zone cards positioned symmetrically around the body with connecting lines, HUD bars top and bottom, and warm/cold glow states driven by real zone_stats data. Zone tapping and detail view are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Zone card design
- Beveled/angular card shape — clipped corners or angled edges for cyberpunk HUD aesthetic
- Standard info density: zone name, level number, and "+" photo slot per card
- Dashed connecting lines from card edge to body region — blueprint/schematic feel
- Cards scale proportionally to screen dimensions — consistent across phone/tablet landscape

### Glow & color states
- Warm (trained) zones: pulsing ember-orange glow that subtly breathes — feels alive, like a heartbeat
- Cold (untrained) zones: dim but clear — grey borders and muted text, visibly present but not highlighted
- Glow intensity decays gradually over the 3-day window — trained today = bright pulse, 2 days ago = dimmer pulse
- Body regions also glow: the corresponding muscle area on the character gets a faint ember glow when warm

### Hex grid & scan frame
- Hex grid at medium visibility — clearly a hex pattern but stays in background, sci-fi tactical display feel
- Scan frame has subtle animation — a faint scan line sweeps vertically through the frame periodically, body scanner effect
- Hex grid reacts to training state — hexes near warm zones get a faint ember tint
- Teal circular platform glow at character's feet — like standing on a scanner pad

### HUD bars
- Top bar: "CHIZLD" branding left, cryptic system codes/version text right — pure cyberpunk aesthetic
- Bottom bar: "X/8 ZONES ACTIVE" count and session uptime counter
- Typewriter effect on screen load — text types in character-by-character, terminal boot feel
- Bordered panel style — thin border lines above/below bar content, defined HUD panel regions

### Claude's Discretion
- Exact hex grid cell size and line weight
- Scan line animation speed and opacity
- Typewriter animation timing
- Specific system code text for top-right HUD
- Pulse animation easing curve and frequency
- Connecting line dash pattern and opacity
- Exact card bevel angle and corner clip size

</decisions>

<specifics>
## Specific Ideas

- Zone cards should feel like game UI elements — beveled edges, not rounded consumer-app cards
- The pulsing warm glow should feel organic/alive, not mechanical — think heartbeat, not blinking LED
- Hex grid reacting to warm zones creates a sense that the whole screen reflects your training progress
- Scan frame animation should be subtle and slow — ambient, not distracting
- Terminal boot typewriter effect on HUD text sets the tone when you open the screen
- The overall feel: tactical body scanner from a cyberpunk RPG

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-character-overview*
*Context gathered: 2026-03-08*
