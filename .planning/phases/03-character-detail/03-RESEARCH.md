# Phase 3: Character Detail - Research

**Researched:** 2026-03-08
**Domain:** React Native animations (Reanimated) + Skia effects + state management
**Confidence:** HIGH

## Summary

This phase implements the detail view state for the character screen. When a zone card is tapped, the character slides left while a stat card slides in from the right showing zone XP, level, stats grid, and a TRAIN button. The implementation uses react-native-reanimated 4.2.1 for choreographed slide animations and @shopify/react-native-skia 2.5.1 for the pulsing ember glow highlight on the selected zone. Both libraries are already installed with compatible versions.

The architecture pattern is a single-screen state machine: CharacterScreen manages `selectedZone` state, and derived values drive all animations. No additional navigation screens are needed for the detail view itself — it's a visual mode transition within the same screen. The TRAIN button navigates to the existing Train tab with zone context.

**Primary recommendation:** Use useSharedValue + useAnimatedStyle for the slide animations with withSequence/withDelay for choreography. Skia animations integrate directly with Reanimated shared values for the pulsing glow effect.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | 4.2.1 | UI thread animations for slides/fades | Industry standard, runs on UI thread for 60fps |
| @shopify/react-native-skia | 2.5.1 | Ember glow effect on selected zone | Already used for canvas, direct Reanimated integration |
| expo-sqlite | 55.0.10 | Zone stats data (XP, level, streak, etc.) | Already integrated via useZoneStats hook |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native BackHandler | built-in | Android back button handling | Dismiss detail view on back press |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| State machine lib | useState | useState is sufficient for binary overview/detail state |
| Entering/exiting props | useAnimatedStyle | useAnimatedStyle gives more control over choreography |

**Installation:**
```bash
# All packages already installed - NO npm install needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── screens/character/
│   └── CharacterScreen.tsx      # State machine: overview vs detail mode
├── components/character/
│   ├── BodyCanvas.tsx           # MODIFY: accept offsetX for character slide
│   ├── ZoneCard.tsx             # MODIFY: accept fade animation
│   ├── StatCard.tsx             # NEW: RPG stat card component
│   ├── StatsGrid.tsx            # NEW: 3x2 stats grid sub-component
│   └── XPProgressBar.tsx        # NEW: XP progress bar sub-component
├── hooks/
│   ├── useZoneStats.ts          # EXISTS: zone data fetching
│   └── useDetailStats.ts        # NEW: fetch full zone_stats for selected zone
└── constants/
    └── xp.ts                    # EXISTS: level thresholds
```

### Pattern 1: State-Driven Animation Controller
**What:** Single state value drives all animations via derived values
**When to use:** Multiple coordinated animations that respond to same trigger
**Example:**
```typescript
// Source: Reanimated docs + pattern from existing codebase
const [selectedZone, setSelectedZone] = useState<string | null>(null);
const isDetailMode = selectedZone !== null;

// Animation driver
const detailProgress = useSharedValue(0);

useEffect(() => {
  detailProgress.value = withTiming(isDetailMode ? 1 : 0, {
    duration: 500,
    easing: Easing.out(Easing.cubic),
  });
}, [isDetailMode]);

// Character slide style
const characterAnimatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: interpolate(detailProgress.value, [0, 1], [0, -screenWidth * 0.3]) }
  ],
}));

// Stat card slide style
const statCardAnimatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: interpolate(detailProgress.value, [0, 1], [screenWidth, 0]) }
  ],
  opacity: interpolate(detailProgress.value, [0, 0.3, 1], [0, 0, 1]),
}));
```

### Pattern 2: Choreographed Entry with withSequence
**What:** Character slides first, then stat card enters after delay
**When to use:** Sequential animation choreography
**Example:**
```typescript
// Source: Reanimated docs - withSequence + withDelay
const enterDetailMode = () => {
  // Character starts moving immediately
  characterOffset.value = withTiming(-screenWidth * 0.3, {
    duration: 350,
    easing: Easing.out(Easing.cubic),
  });

  // Stat card enters after 100ms delay
  statCardOffset.value = withDelay(
    100,
    withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  );
};

const exitDetailMode = () => {
  // Reverse: stat card exits first
  statCardOffset.value = withTiming(screenWidth, {
    duration: 350,
    easing: Easing.in(Easing.cubic),
  });

  // Character slides back after delay
  characterOffset.value = withDelay(
    100,
    withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  );
};
```

### Pattern 3: Skia + Reanimated Glow Effect
**What:** Pulsing ember glow on selected zone using Skia Shadow with Reanimated values
**When to use:** Animated visual effects on canvas elements
**Example:**
```typescript
// Source: Skia docs - animations, Shadow component
// Reanimated shared values work directly as Skia props
const pulseProgress = useSharedValue(0);

useEffect(() => {
  if (isSelected) {
    pulseProgress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sine) }),
      -1,
      true
    );
  } else {
    pulseProgress.value = withTiming(0, { duration: 200 });
  }
}, [isSelected]);

const glowOpacity = useDerivedValue(() => {
  return 0.4 + 0.4 * pulseProgress.value; // 0.4 to 0.8 pulse
});

// In Skia Canvas
<Circle cx={cx} cy={cy} r={radius} opacity={glowOpacity}>
  <Shadow dx={0} dy={0} blur={20} color="rgba(255,140,26,0.8)" />
</Circle>
```

### Pattern 4: Android Back Button Handler
**What:** Intercept back button to dismiss detail view before navigation
**When to use:** Custom back behavior within a screen
**Example:**
```typescript
// Source: React Navigation docs - custom back handling
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      if (selectedZone !== null) {
        setSelectedZone(null); // Dismiss detail view
        return true; // Handled - don't navigate
      }
      return false; // Not handled - let navigation proceed
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();
  }, [selectedZone])
);
```

### Anti-Patterns to Avoid
- **Inline animation configs:** Don't recalculate withTiming configs on every render. Define duration/easing as constants.
- **Multiple animation drivers:** Don't use separate shared values when one progress value can drive all animations via interpolate.
- **Animating layout props:** Avoid animating width/height/margin. Use transform (translateX/Y) and opacity for best performance.
- **Re-mounting on state change:** Don't conditionally render StatCard. Always render it and animate opacity/position.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XP progress calculation | Manual division | `(currentXp - levelMinXp) / (levelMaxXp - levelMinXp)` with LEVEL_THRESHOLDS | Edge cases at level boundaries |
| Easing curves | Bezier math | `Easing.out(Easing.cubic)` from Reanimated | Tested, performant, readable |
| Dashed connecting line | Custom stroke | DashPathEffect from Skia | Already implemented in ConnectingLines.tsx |
| Glow effect | Custom blur shader | Shadow component from Skia | Hardware accelerated |
| Back button handling | Manual BackHandler | useFocusEffect + BackHandler pattern | Handles screen focus lifecycle |

**Key insight:** Reanimated 4.x and Skia have deep integration. Shared values pass directly to Skia props without createAnimatedComponent or useAnimatedProps wrappers.

## Common Pitfalls

### Pitfall 1: Animation Jank on Android
**What goes wrong:** Choppy animations, especially on mid-range devices
**Why it happens:** Running animations on JS thread instead of UI thread
**How to avoid:**
- Use withTiming/withSpring (runs on UI thread)
- Use transform properties, not layout properties
- Avoid reading shared values in render (use useDerivedValue)
**Warning signs:** FPS drops below 60, animations feel sluggish

### Pitfall 2: Connecting Line Origin Mismatch
**What goes wrong:** Dashed line doesn't connect to stat card correctly in detail mode
**Why it happens:** ConnectingLines calculates endpoints based on overview positions
**How to avoid:**
- Pass detail mode state to ConnectingLines
- Interpolate line endpoint from zone anchor to stat card edge
- Or: hide overview connecting lines in detail mode, draw new ember line
**Warning signs:** Line floats in wrong position during transition

### Pitfall 3: Back Button Race Condition
**What goes wrong:** Back button sometimes navigates instead of dismissing detail
**Why it happens:** BackHandler listener not properly scoped to focus state
**How to avoid:**
- Use useFocusEffect, not useEffect
- Check selectedZone in callback, not closure
- Return subscription.remove in cleanup
**Warning signs:** Inconsistent back behavior, especially after tab switching

### Pitfall 4: Stat Card Data Flash
**What goes wrong:** Stats briefly show old/wrong values during entry animation
**Why it happens:** Data fetch happens after animation starts
**How to avoid:**
- Prefetch zone_stats data in useZoneStats hook
- Or: delay stat card visibility until data loaded (opacity interpolation)
- Keep stat card mounted but invisible to avoid remount flicker
**Warning signs:** Numbers visibly change during slide-in

### Pitfall 5: Zone Card Fade Timing
**What goes wrong:** Zone cards fade out too early or too late vs character slide
**Why it happens:** Separate animation drivers not synchronized
**How to avoid:**
- Use same detailProgress shared value for all animations
- Interpolate fade opacity from same driver as character slide
**Warning signs:** Visual "pop" when cards suddenly appear/disappear

## Code Examples

Verified patterns from official sources:

### Stat Card Component Structure
```typescript
// Source: Existing codebase patterns + Reanimated docs
interface StatCardProps {
  zone: ZoneWithIntensity;
  stats: ZoneDetailStats; // Full stats from zone_stats table
  onTrain: () => void;
  onDismiss: () => void;
}

export function StatCard({ zone, stats, onTrain, onDismiss }: StatCardProps) {
  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {/* Header: Icon + Zone Name + Level Badge + XP Bar */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="fire" size={20} color={colors.ember[500]} />
        <Text style={styles.zoneName}>{zone.name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LV.{stats.level}</Text>
        </View>
        <XPProgressBar current={stats.totalXp} level={stats.level} />
      </View>

      {/* 3x2 Stats Grid */}
      <StatsGrid stats={stats} />

      {/* TRAIN Button */}
      <Pressable style={styles.trainButton} onPress={onTrain}>
        <Text style={styles.trainText}>TRAIN</Text>
      </Pressable>
    </Animated.View>
  );
}
```

### XP Progress Calculation
```typescript
// Source: Existing xp.ts + standard progress bar pattern
import { LEVEL_THRESHOLDS } from '@/constants/xp';

function getXPProgress(totalXp: number, level: number): { progress: number; current: number; max: number } {
  const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === level);
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);

  const minXp = currentThreshold?.xpRequired ?? 0;
  const maxXp = nextThreshold?.xpRequired ?? minXp + 1000; // Cap at current + 1000 if max level

  const xpInLevel = totalXp - minXp;
  const xpNeeded = maxXp - minXp;
  const progress = Math.min(1, xpInLevel / xpNeeded);

  return { progress, current: xpInLevel, max: xpNeeded };
}
```

### Tap Outside Dismiss Handler
```typescript
// Source: React Native Pressable + gesture handling pattern
// Wrap entire screen in Pressable, stat card stops propagation
<Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
  {/* Canvas and zone cards */}
  <BodyCanvas ... />

  {/* Stat card - stops event propagation */}
  {selectedZone && (
    <Pressable onPress={(e) => e.stopPropagation()}>
      <StatCard ... />
    </Pressable>
  )}
</Pressable>
```

### 3x2 Stats Grid Layout
```typescript
// Source: Design reference + StyleSheet patterns
const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  statCell: {
    width: '33.33%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontFamily: fonts.mono,
    fontSize: 24,
    color: colors.text.primary,
  },
});

// Stats mapping from zone_stats table:
// STREAK = current_streak
// VOLUME 7D = calculated from workout_sets (last 7 days)
// SESSIONS = count from workout_sessions
// TOTAL SETS = count from workout_sets
// MAX = personal_records JSON (max weight/reps)
// LAST = last_trained_at formatted as "Today" / "2d ago" / date
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Reanimated 2 Extrapolate enum | Extrapolation enum | Reanimated 3.x | Import from 'react-native-reanimated' |
| createAnimatedComponent for Skia | Direct shared value props | Skia 0.1.x | No wrapper needed, cleaner code |
| useAnimatedGestureHandler | Gesture.Pan().onUpdate() | Gesture Handler 2.x | More composable gestures |

**Deprecated/outdated:**
- `Animated` from react-native: Use Reanimated for performance
- `interpolate` with string extrapolation: Use Extrapolation enum

## Open Questions

Things that couldn't be fully resolved:

1. **Volume 7D calculation**
   - What we know: Needs sum of (weight * reps) from workout_sets in last 7 days
   - What's unclear: Whether to filter by zone or show total volume
   - Recommendation: Filter by selected zone for relevance; implement in useDetailStats hook

2. **Navigation to Train tab with zone context**
   - What we know: TRAIN button should navigate to workout screen filtered by zone
   - What's unclear: Current Train tab structure, how to pass zone filter
   - Recommendation: Navigation params or context; check Train tab implementation in Phase 4

3. **Photo slot in stat card**
   - What we know: CONTEXT.md says "small thumbnail, not the focus"
   - What's unclear: Source of photo (most recent from zone? or placeholder?)
   - Recommendation: Placeholder for now since photo capture is v2 deferred

## Sources

### Primary (HIGH confidence)
- React Native Reanimated docs - withTiming, interpolate, Easing
  - https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/
  - https://docs.swmansion.com/react-native-reanimated/docs/utilities/interpolate/
  - https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/animating-styles-and-props/
  - https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/applying-modifiers/
- React Native Skia docs - Shadow, animations with Reanimated
  - https://shopify.github.io/react-native-skia/docs/image-filters/shadows/
  - https://shopify.github.io/react-native-skia/docs/animations/animations/
- React Navigation docs - Android back button handling
  - https://reactnavigation.org/docs/custom-android-back-button-handling/

### Secondary (MEDIUM confidence)
- Existing codebase patterns (ZoneGlow.tsx, ConnectingLines.tsx) - Skia + Reanimated integration
- Package.json versions confirmed: reanimated 4.2.1, skia 2.5.1

### Tertiary (LOW confidence)
- None - all patterns verified with official docs or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified in package.json, APIs verified in official docs
- Architecture: HIGH - pattern matches existing codebase structure (ZoneGlow, ConnectingLines)
- Pitfalls: MEDIUM - based on common issues from GitHub discussions and docs warnings

**Research date:** 2026-03-08
**Valid until:** 30 days (stable libraries, established patterns)
