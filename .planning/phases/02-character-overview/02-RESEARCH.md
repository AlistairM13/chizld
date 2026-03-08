# Phase 2: Character Overview - Research

**Researched:** 2026-03-08
**Domain:** React Native Skia canvas rendering, Reanimated animations, hybrid Skia/RN Views architecture
**Confidence:** HIGH

## Summary

Phase 2 implements a cyberpunk-style character overview screen combining Skia canvas rendering with React Native Views. The screen displays a hex grid background, anatomical character figure (555x1116 PNG), 8 zone cards with connecting lines, HUD bars, and animated warm/cold glow states driven by SQLite zone_stats data.

The standard approach is a **hybrid architecture**: Skia Canvas as the base layer for hex grid, glow effects, character image, scan frame, and connecting lines; React Native Views overlaid via absolute positioning for zone cards and HUD text. This leverages Skia's GPU-accelerated drawing for visual effects while using RN's proven text rendering and layout capabilities.

**Primary recommendation:** Use Canvas with direct Reanimated shared values for animations (no createAnimatedComponent needed), RN Views with absolute positioning for text/cards, and a custom hook (useZoneStats) to derive warm/cold state from zone_stats.last_trained_at timestamps.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @shopify/react-native-skia | 2.5.1 | GPU-accelerated 2D canvas | Official Shopify library, direct Reanimated integration, handles hex grid/glow/image efficiently |
| react-native-reanimated | 4.2.1 | UI thread animations | Direct shared value support in Skia props, no wrapper functions needed |
| expo-sqlite | 55.0.10 | Zone stats data | Already initialized with zone_stats table containing last_trained_at |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-mmkv | 4.2.0 | Session uptime tracking | Bottom HUD uptime counter persistence |

### Already Installed (No Additional Packages Needed)

All dependencies are pre-installed per project constraints. No npm install commands required.

## Architecture Patterns

### Recommended Project Structure

```
src/
  components/
    character/
      BodyCanvas.tsx       # Skia canvas: hex grid, character image, glow, scan frame
      ZoneCard.tsx         # RN View: beveled card with zone info
      ZoneCardConnector.tsx # Skia path for dashed connecting lines
      HudBar.tsx           # RN View: top/bottom HUD bars
      ScanLineAnimation.tsx # Skia: animated vertical scan line
  screens/
    character/
      CharacterScreen.tsx  # Orchestrates layout, data fetching, state
  hooks/
    useZoneStats.ts        # Fetch zone_stats, compute warm/cold/intensity
    useUptimeCounter.ts    # Session uptime calculation
  constants/
    layout.ts              # Screen dimensions, card positions, sizing
```

### Pattern 1: Hybrid Skia/RN Views Architecture

**What:** Skia Canvas as base layer with RN Views overlaid via absolute positioning.
**When to use:** Complex visual effects (glow, hex grid) combined with text-heavy UI (zone cards, HUD).
**Example:**

```typescript
// Source: Official React Native Skia docs - Canvas + Gestures guide
// https://shopify.github.io/react-native-skia/docs/canvas/overview/

export function CharacterScreen() {
  const { width, height } = useWindowDimensions();
  const zoneStats = useZoneStats();

  return (
    <View style={styles.container}>
      {/* Base layer: Skia canvas */}
      <Canvas style={StyleSheet.absoluteFill}>
        <HexGrid width={width} height={height} warmZones={zoneStats.warmZones} />
        <ScanFrame width={width} height={height} />
        <CharacterImage />
        <PlatformGlow />
        <ConnectingLines zones={zoneStats.all} />
      </Canvas>

      {/* Overlay: RN Views for text */}
      <View style={styles.hudTop}>
        <HudBar position="top" />
      </View>
      <View style={styles.cardsContainer}>
        {zoneStats.all.map(zone => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </View>
      <View style={styles.hudBottom}>
        <HudBar position="bottom" activeCount={zoneStats.warmCount} />
      </View>
    </View>
  );
}
```

### Pattern 2: Direct Reanimated Shared Values in Skia

**What:** Pass Reanimated shared values directly to Skia component props without wrappers.
**When to use:** Any animated Skia property (opacity, position, color).
**Example:**

```typescript
// Source: https://shopify.github.io/react-native-skia/docs/animations/animations/

const pulseOpacity = useSharedValue(0.4);

useEffect(() => {
  pulseOpacity.value = withRepeat(
    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
    -1, // infinite
    true // reverse
  );
}, []);

// Direct usage - no createAnimatedComponent needed
<Circle cx={100} cy={100} r={50} opacity={pulseOpacity} color="#FF8C1A" />
```

### Pattern 3: Warm/Cold Zone Detection

**What:** Compute zone warmth from last_trained_at timestamp with decay.
**When to use:** Zone card styling, glow intensity.
**Example:**

```typescript
// Hook pattern for warm zone detection with intensity decay
function useZoneStats() {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<ZoneWithIntensity[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const rows = await db.getAllAsync<ZoneStats>(
        'SELECT * FROM zone_stats'
      );

      const now = Date.now();
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

      const processed = rows.map(row => {
        const lastTrained = row.last_trained_at ? new Date(row.last_trained_at).getTime() : 0;
        const elapsed = now - lastTrained;
        const isWarm = elapsed < THREE_DAYS_MS;
        // Decay: 1.0 (just trained) -> 0.0 (3 days ago)
        const intensity = isWarm ? 1 - (elapsed / THREE_DAYS_MS) : 0;

        return { ...row, isWarm, intensity };
      });

      setStats(processed);
    };

    fetchStats();
  }, [db]);

  return stats;
}
```

### Pattern 4: Beveled Card Shape with Clipped Corners

**What:** Create cyberpunk beveled cards using Path clipping.
**When to use:** Zone card shapes.
**Example:**

```typescript
// Beveled rectangle path for cyberpunk card aesthetic
function createBeveledPath(x: number, y: number, w: number, h: number, bevel: number): SkPath {
  const path = Skia.Path.Make();
  path.moveTo(x + bevel, y);
  path.lineTo(x + w - bevel, y);
  path.lineTo(x + w, y + bevel);
  path.lineTo(x + w, y + h - bevel);
  path.lineTo(x + w - bevel, y + h);
  path.lineTo(x + bevel, y + h);
  path.lineTo(x, y + h - bevel);
  path.lineTo(x, y + bevel);
  path.close();
  return path;
}

// Usage in RN View with Skia border
<View style={[styles.card, { clipPath: ... }]}>
  <Canvas style={StyleSheet.absoluteFill}>
    <Path path={beveledPath} style="stroke" color={isWarm ? '#FF8C1A' : '#2A2A3A'} strokeWidth={1} />
  </Canvas>
  <Text style={styles.zoneName}>{zone.name}</Text>
</View>
```

### Anti-Patterns to Avoid

- **Using createAnimatedComponent with Skia:** Unnecessary - Skia accepts shared values directly as props.
- **Rendering text in Skia when RN Text works:** Use RN Text for zone names, HUD text - better font rendering, accessibility.
- **Drawing hex grid imperatively on every frame:** Pre-compute hex positions, use static paths or Picture for caching.
- **Fetching zone_stats on every render:** Use useFocusEffect or polling interval, not continuous fetches.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hex grid geometry | Manual hex math | Pre-computed path array | Hex spacing formulas are error-prone; compute once, reuse |
| Pulsing glow animation | setInterval + state | withRepeat + withTiming | Reanimated runs on UI thread, won't drop frames |
| Image loading in Skia | Manual asset loading | useImage hook | Handles async loading, returns null while loading |
| Dashed lines | Manual dash rendering | DashPathEffect component | Skia native dash implementation with intervals prop |
| Color interpolation | interpolateColor (Reanimated) | interpolateColors (Skia) | Skia uses different color format; Reanimated function incompatible |
| Font loading for Skia | Manual font file loading | useFont / useFonts hook | Handles async, provides SkFont for Text component |
| Responsive layout | Hard-coded positions | useWindowDimensions + ratios | Landscape phone vs tablet requires proportional scaling |

**Key insight:** Skia provides declarative components (DashPathEffect, Shadow, Blur) that handle GPU-optimized rendering internally. Hand-rolling these effects with manual drawing loops wastes GPU cycles and creates maintenance burden.

## Common Pitfalls

### Pitfall 1: Text Y-Origin in Skia

**What goes wrong:** Text appears above expected position or clipped.
**Why it happens:** Skia Text y-coordinate is the baseline (bottom of text), not top.
**How to avoid:** Set y to fontSize value for top-left positioning: `<Text x={0} y={fontSize} ... />`
**Warning signs:** Text cut off at top, inconsistent vertical alignment.

### Pitfall 2: useImage Returns Null While Loading

**What goes wrong:** App crashes or image area blank with "Cannot read property 'width' of null".
**Why it happens:** useImage is async; returns null until loaded.
**How to avoid:** Always check `if (!image) return null;` or render placeholder.
**Warning signs:** Intermittent crashes on screen load, blank image areas.

### Pitfall 3: Reanimated interpolateColor vs Skia interpolateColors

**What goes wrong:** Color animations produce wrong colors or crash.
**Why it happens:** Skia stores colors differently than Reanimated expects.
**How to avoid:** Use Skia's `interpolateColors` for color animations in Canvas.
**Warning signs:** Colors appear as wrong hue, animation produces black/white instead of gradient.

### Pitfall 4: Heavy Computation in Skia Render

**What goes wrong:** Frame drops, laggy animations, hot device.
**Why it happens:** Skia render function runs every frame; expensive computations block GPU.
**How to avoid:** Pre-compute paths, positions, and colors outside render. Use useMemo for path generation.
**Warning signs:** Choppy animations, device heating up, battery drain.

### Pitfall 5: Z-Index Between Skia Canvas and RN Views

**What goes wrong:** RN Views appear behind Skia canvas despite absolute positioning.
**Why it happens:** Skia Canvas is a native view; RN zIndex doesn't apply across native boundaries.
**How to avoid:** Render Skia Canvas first, then RN Views in DOM order (later = on top).
**Warning signs:** Cards invisible, touch not responding, HUD hidden.

### Pitfall 6: Forgetting StyleSheet.absoluteFill for Overlay

**What goes wrong:** Canvas or overlay takes wrong size or position.
**Why it happens:** Flex layout conflicts with absolute positioning expectations.
**How to avoid:** Use `StyleSheet.absoluteFill` for full-screen canvas, explicit absolute positioning for overlays.
**Warning signs:** Canvas not filling screen, overlay offset incorrectly.

## Code Examples

### Hex Grid Pattern Generation

```typescript
// Source: Geometric calculation pattern
// Generate hex grid points for a given viewport

const HEX_SIZE = 20; // Claude's discretion: cell size
const HEX_LINE_WEIGHT = 0.5; // Claude's discretion: line weight

function generateHexGrid(width: number, height: number): SkPath {
  const path = Skia.Path.Make();
  const hexWidth = HEX_SIZE * 2;
  const hexHeight = HEX_SIZE * Math.sqrt(3);

  for (let row = -1; row < height / hexHeight + 1; row++) {
    for (let col = -1; col < width / hexWidth + 1; col++) {
      const offsetX = row % 2 === 0 ? 0 : hexWidth / 2;
      const cx = col * hexWidth + offsetX;
      const cy = row * hexHeight;

      // Draw hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + HEX_SIZE * Math.cos(angle);
        const y = cy + HEX_SIZE * Math.sin(angle);

        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.close();
    }
  }

  return path;
}

// Usage
const hexPath = useMemo(() => generateHexGrid(width, height), [width, height]);

<Path
  path={hexPath}
  style="stroke"
  color="rgba(255,255,255,0.05)"
  strokeWidth={HEX_LINE_WEIGHT}
/>
```

### Character Image with Centered Positioning

```typescript
// Source: https://shopify.github.io/react-native-skia/docs/images/

const characterImage = useImage(require('../../assets/images/characters/muscle-front.png'));

// Image dimensions: 555 x 1116 (3x of 185x372 SVG viewBox)
// Scale to fit screen height while maintaining aspect ratio
const IMG_ASPECT = 555 / 1116; // ~0.497

function CharacterImage({ screenWidth, screenHeight }: { screenWidth: number; screenHeight: number }) {
  const image = useImage(require('../../assets/images/characters/muscle-front.png'));

  if (!image) return null;

  // Scale to ~80% of screen height, center horizontally
  const targetHeight = screenHeight * 0.8;
  const targetWidth = targetHeight * IMG_ASPECT;
  const x = (screenWidth - targetWidth) / 2;
  const y = (screenHeight - targetHeight) / 2;

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={targetWidth}
      height={targetHeight}
      fit="contain"
    />
  );
}
```

### Dashed Connecting Line

```typescript
// Source: https://shopify.github.io/react-native-skia/docs/path-effects/

function ConnectingLine({
  from,
  to,
  isWarm
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isWarm: boolean;
}) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(from.x, from.y);
    p.lineTo(to.x, to.y);
    return p;
  }, [from, to]);

  const color = isWarm ? 'rgba(255,140,26,0.6)' : 'rgba(136,136,160,0.4)';

  return (
    <Path path={path} style="stroke" color={color} strokeWidth={1}>
      <DashPathEffect intervals={[4, 4]} phase={0} />
    </Path>
  );
}
```

### Pulsing Glow Effect with Breathing Animation

```typescript
// Source: https://shopify.github.io/react-native-skia/docs/animations/animations/
// Breathing pulse: organic heartbeat feel, not mechanical

function PulsingGlow({ cx, cy, radius, intensity }: {
  cx: number;
  cy: number;
  radius: number;
  intensity: number; // 0-1 based on recency
}) {
  const pulseProgress = useSharedValue(0);

  useEffect(() => {
    // Breathing animation: ease in-out for organic feel
    pulseProgress.value = withRepeat(
      withTiming(1, {
        duration: 2000, // ~30 BPM breathing rate
        easing: Easing.bezier(0.4, 0, 0.2, 1) // smooth ease-in-out
      }),
      -1, // infinite
      true // reverse
    );
  }, []);

  // Derived animated opacity based on pulse and intensity
  const animatedOpacity = useDerivedValue(() => {
    const pulseMin = 0.2;
    const pulseMax = 0.6;
    const pulse = pulseMin + (pulseMax - pulseMin) * pulseProgress.value;
    return pulse * intensity; // Scale by recency intensity
  });

  return (
    <Circle cx={cx} cy={cy} r={radius}>
      <RadialGradient
        c={vec(cx, cy)}
        r={radius}
        colors={['rgba(255,140,26,0.4)', 'rgba(255,140,26,0)']}
      />
      <BlendMode mode="screen" />
    </Circle>
  );
}
```

### Typewriter Text Animation (RN View)

```typescript
// Pattern: Character-by-character reveal using state + interval
// For HUD terminal boot effect

function TypewriterText({ text, delayMs = 50 }: { text: string; delayMs?: number }) {
  const [displayedChars, setDisplayedChars] = useState(0);

  useEffect(() => {
    setDisplayedChars(0);
    const interval = setInterval(() => {
      setDisplayedChars(prev => {
        if (prev >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, delayMs);

    return () => clearInterval(interval);
  }, [text, delayMs]);

  return (
    <Text style={styles.hudText}>
      {text.slice(0, displayedChars)}
      {displayedChars < text.length && <Text style={styles.cursor}>_</Text>}
    </Text>
  );
}
```

### Scan Line Animation

```typescript
// Vertical scan line that sweeps through the frame periodically

function ScanLine({ width, height }: { width: number; height: number }) {
  const scanY = useSharedValue(0);

  useEffect(() => {
    scanY.value = withRepeat(
      withTiming(height, {
        duration: 4000, // Slow sweep: ambient, not distracting
        easing: Easing.linear
      }),
      -1, // infinite
      false // no reverse, restart from top
    );
  }, [height]);

  return (
    <Line
      p1={vec(0, scanY)}
      p2={vec(width, scanY)}
      color="rgba(255,255,255,0.02)" // Very subtle
      strokeWidth={2}
    >
      <Blur blur={4} />
    </Line>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| createAnimatedComponent for Skia | Direct shared value props | Skia v0.1.x -> v1.0 | Simpler code, better performance |
| SVG rendering via react-native-svg | PNG via Skia useImage | Project decision | Simpler, avoids SVG parsing complexity |
| useFont for all text | Paragraph API for complex text | Skia v1.0 | Better line breaking, font mixing |
| Manual glow with multiple circles | Shadow + Blur components | Stable | Declarative, GPU-optimized |

**Current best practices (2025-2026):**
- Skia version 2.5.1 is production-ready with stable API
- Direct Reanimated 4.x shared values work without wrappers
- Paragraph API preferred for multi-line/styled text in Skia
- Hybrid Skia/RN Views is the standard for text-heavy UIs

## Open Questions

1. **Exact zone card positions for 8 zones**
   - What we know: 4 left (traps, biceps, forearms, tibialis), 4 right (neck, shoulders, abs, quads)
   - What's unclear: Exact pixel positions for landscape layout across device sizes
   - Recommendation: Calculate positions proportionally from screen dimensions, reference design screenshot ratios

2. **Hex grid warm zone highlighting**
   - What we know: Context says "hexes near warm zones get a faint ember tint"
   - What's unclear: How to efficiently determine which hexes are "near" warm zones
   - Recommendation: Compute zone center points, tint hexes within a radius threshold

3. **Zone card touch area for Phase 3**
   - What we know: Phase 2 is display only; Phase 3 adds tapping
   - What's unclear: Whether to add Pressable now for forward compatibility
   - Recommendation: Wrap cards in Pressable now with no-op onPress; simplifies Phase 3

## Sources

### Primary (HIGH confidence)

- [React Native Skia Canvas Overview](https://shopify.github.io/react-native-skia/docs/canvas/overview/) - Canvas component API, onSize, accessibility
- [React Native Skia Images](https://shopify.github.io/react-native-skia/docs/images/) - useImage hook, Image component, fit modes
- [React Native Skia Shadows](https://shopify.github.io/react-native-skia/docs/image-filters/shadows/) - Shadow, DropShadow, inner shadows
- [React Native Skia Path Effects](https://shopify.github.io/react-native-skia/docs/path-effects/) - DashPathEffect, DiscretePathEffect, intervals
- [React Native Skia Animations](https://shopify.github.io/react-native-skia/docs/animations/animations/) - Reanimated integration, direct shared values
- [React Native Skia Group](https://shopify.github.io/react-native-skia/docs/group/) - Clipping, transforms, layer effects
- [React Native Skia Paragraph](https://shopify.github.io/react-native-skia/docs/text/paragraph/) - useFonts, text styling
- [React Native Skia Text](https://shopify.github.io/react-native-skia/docs/text/text/) - useFont, baseline positioning
- [React Native Skia Blur](https://shopify.github.io/react-native-skia/docs/image-filters/blur/) - Gaussian blur, tile modes
- [React Native Skia Atlas](https://shopify.github.io/react-native-skia/docs/shapes/atlas/) - Efficient tile rendering
- [React Native Skia Box](https://shopify.github.io/react-native-skia/docs/shapes/box/) - BoxShadow for fast inner shadows
- [React Native Reanimated Your First Animation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation/) - withTiming, withSpring, withRepeat

### Secondary (MEDIUM confidence)

- [Shopify Engineering: Getting Started with React Native Skia](https://shopify.engineering/getting-started-with-react-native-skia) - Architecture overview
- [GitHub Discussion: Glow Border Animation](https://github.com/Shopify/react-native-skia/discussions/2025) - Community glow patterns

### Project-Specific Context

- Existing code: `src/constants/colors.ts` - ember palette (#FF8C1A), zone cold (#2A2A3A)
- Existing code: `src/constants/zones.ts` - 8 zones with side/position metadata
- Existing code: `src/types/index.ts` - ZoneStats interface with last_trained_at
- Existing code: `src/db/database.ts` - zone_stats table schema
- Existing code: `src/components/character/ZonePaths.ts` - ZoneBounds for hit testing
- Existing asset: `assets/images/characters/muscle-front.png` - 555x1116 PNG (3x scale)
- Design reference: `designs/overview.png` - Visual target for layout

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs, already installed
- Architecture patterns: HIGH - Hybrid Skia/RN pattern documented in official guides, verified
- Animations: HIGH - Direct shared value integration confirmed in Skia docs
- Pitfalls: HIGH - All documented in official docs or GitHub issues
- Code examples: MEDIUM - Patterns derived from official docs, hex grid geometry is standard math

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (30 days - Skia API is stable)
