# Phase 1: Foundation - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the project foundation: file structure matching PRD spec, design system constants (colors, fonts, zones, XP), SQLite database with all tables and seed data, MMKV key-value store, React Navigation (replacing Expo Router), custom font loading, and landscape orientation lock. Everything downstream phases depend on is ready.

</domain>

<decisions>
## Implementation Decisions

### Placeholder Screens
- Sleep, Fuel, and Train tabs all get themed "Coming Soon" placeholders — dark background with ember-orange text, Cyberpunk HUD aesthetic so they feel intentional, not broken
- Train tab is a placeholder in Phase 1; the workout list comes in Phase 4

### Tab Bar Icons & Styling
- Claude decides the best icon approach for the game UI feel (Expo vector icons, custom Skia-drawn, or hybrid)
- Tab bar styling: Claude decides what fits the Cyberpunk aesthetic — PRD spec (dark bg, ember active, muted inactive) is the baseline, with freedom to add subtle HUD touches if it looks good

### SVG Asset Handling
- Both PNG and SVG paths: convert muscle-front.svg to high-res PNG for base character render, and extract SVG path data for per-zone coloring/highlighting
- Handle the conversion in Phase 1 so the asset is ready for Phase 2 BodyCanvas implementation
- PNG goes to assets/images/characters/muscle-front.png
- Zone paths extracted to src/components/character/ZonePaths.ts (or similar)

### Claude's Discretion
- Tab bar icon source and specific icons chosen
- Tab bar additional HUD styling (thin border, scan-line, or plain)
- Loading/splash behavior during font + DB initialization
- Exact placeholder screen layout and messaging
- SVG-to-PNG export resolution and method

</decisions>

<specifics>
## Specific Ideas

- Placeholder screens should feel like locked sections of a game menu — "Coming Soon" in the HUD style, not a generic "under construction" message
- The PRD is the definitive design reference for colors (#0A0A0F bg, #FF8C1A ember, etc.), fonts (Chakra Petch, Barlow Condensed, JetBrains Mono), and database schema
- app.json orientation must change from "portrait" to "landscape"
- package.json "main" must change from "expo-router/entry" to "expo/entry"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-08*
