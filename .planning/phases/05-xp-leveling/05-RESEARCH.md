# Phase 5: XP & Leveling - Research

**Researched:** 2026-03-09
**Domain:** XP calculation engine, zone stats persistence, animated feedback
**Confidence:** HIGH

## Summary

This phase implements the XP calculation engine that awards experience points for completed workout sets, applies various bonuses (base, volume, tempo, PR, consistency), updates zone levels, and records all transactions. The codebase already has the foundation in place: `LEVEL_THRESHOLDS` in `src/constants/xp.ts`, `zone_stats` and `xp_history` tables in SQLite, and placeholder XP calculation in `useSessionSummary`.

The standard approach is a pure calculation service that computes XP for each set, a write-back hook that atomically updates `zone_stats` and inserts `xp_history` records, and animated UI components for real-time feedback during workouts. React Native Reanimated (already installed at v4.2.1) handles all animations using the patterns already established in `ZoneGlow.tsx` and `StatCard.tsx`.

**Primary recommendation:** Create a stateless `calculateXP()` function for pure XP math, a `useXPService` hook for database operations, and animate XP display using Reanimated's `useAnimatedStyle` with `withTiming`.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-sqlite | (installed) | Persist zone_stats, xp_history | Already used for all domain data |
| react-native-reanimated | 4.2.1 | Animated XP bar, floating text | Already used throughout codebase |
| expo-haptics | ~55.0.8 | Level-up tactile feedback | Already imported in WorkoutSessionScreen |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-speech | (installed) | Could announce level-ups | Optional - only if user enables audio cues |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom XP calc | External XP library | No benefit - domain-specific formulas need custom logic |
| SQLite transactions | MMKV for XP | Wrong tool - XP needs relational queries, history |

**Installation:** No new packages needed - all dependencies pre-installed per project constraints.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   └── xp-calculator.ts       # Pure XP calculation functions (no state, no DB)
├── hooks/
│   └── useXPService.ts        # DB write-back, level calculation, history insert
├── components/
│   └── workout/
│       ├── XPFloater.tsx      # Floating +XP text animation
│       └── XPBreakdown.tsx    # Session summary XP breakdown card
```

### Pattern 1: Pure Calculation Service
**What:** Stateless functions that compute XP values given inputs
**When to use:** Always for XP math - separates business logic from React/DB concerns
**Example:**
```typescript
// src/services/xp-calculator.ts
export interface SetXPInput {
  weightKg: number;
  reps: number;
  tempoEnabled: boolean;
  isPR: boolean;
  zoneTrainedInLast7Days: boolean;
}

export interface XPResult {
  base: number;
  volumeBonus: number;
  tempoMultiplier: number;
  prBonus: number;
  consistencyBonus: number;
  total: number;
}

export function calculateSetXP(input: SetXPInput): XPResult {
  // Base: 10 XP per set
  const base = 10;

  // Volume bonus: +1 XP per 100kg total volume
  const volume = input.weightKg * input.reps;
  const volumeBonus = Math.floor(volume / 100);

  // PR bonus: +50 XP when personal record
  const prBonus = input.isPR ? 50 : 0;

  // Consistency bonus: +20 XP if zone trained in last 7 days
  const consistencyBonus = input.zoneTrainedInLast7Days ? 20 : 0;

  // Subtotal before tempo multiplier
  const subtotal = base + volumeBonus + prBonus + consistencyBonus;

  // Tempo multiplier: 1.5x when tempo mode used
  const tempoMultiplier = input.tempoEnabled ? 1.5 : 1.0;
  const total = Math.floor(subtotal * tempoMultiplier);

  return {
    base,
    volumeBonus,
    tempoMultiplier,
    prBonus,
    consistencyBonus,
    total,
  };
}
```

### Pattern 2: Atomic Database Write-back
**What:** Use `withExclusiveTransactionAsync` for multi-table updates
**When to use:** Updating zone_stats AND inserting xp_history together
**Example:**
```typescript
// Ensures zone_stats and xp_history update atomically
await db.withExclusiveTransactionAsync(async (txn) => {
  // Update zone_stats
  await txn.runAsync(
    `UPDATE zone_stats
     SET total_xp = total_xp + ?,
         level = ?,
         current_streak = ?,
         last_trained_at = ?,
         updated_at = datetime('now')
     WHERE zone_id = ?`,
    [xpAmount, newLevel, newStreak, trainedAt, zoneId]
  );

  // Insert xp_history record
  await txn.runAsync(
    `INSERT INTO xp_history (id, zone_id, xp_amount, source, source_id, earned_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [generateId(), zoneId, xpAmount, source, sourceId, earnedAt]
  );
});
```

### Pattern 3: Animated Number Display
**What:** Use Reanimated's `useDerivedValue` and `withTiming` for smooth XP counters
**When to use:** XP bar fills, floating +XP text, level displays
**Example:**
```typescript
// Animated XP bar width
const xpProgress = useSharedValue(0);

useEffect(() => {
  xpProgress.value = withTiming(targetProgress, { duration: 600 });
}, [targetXP]);

const animatedBarStyle = useAnimatedStyle(() => ({
  width: `${xpProgress.value * 100}%`,
}));
```

### Anti-Patterns to Avoid
- **Calculating XP in components:** Mixes business logic with rendering - use pure service
- **Multiple separate DB calls:** Use transactions for atomicity, not individual runAsync calls
- **Polling for XP updates:** Push-based updates via hook state, not interval polling
- **Hardcoded XP values in multiple places:** Single source of truth in xp-calculator.ts

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Level calculation | Binary search or iteration | `LEVEL_THRESHOLDS.findIndex()` | Thresholds already defined, O(1) lookup |
| Animated numbers | Manual requestAnimationFrame | Reanimated `withTiming` | Runs on UI thread, 60fps guaranteed |
| Haptic patterns | Custom vibration sequences | `Haptics.notificationAsync` | Pre-defined success/warning/error patterns |
| ID generation | UUID library | `Date.now().toString(36) + Math.random().toString(36)` | Already used throughout codebase |

**Key insight:** The codebase already has working patterns for animation (see `ZoneGlow.tsx`), haptics (see `WorkoutSessionScreen.tsx`), and ID generation (see `useWorkoutSession.ts`). Reuse these exactly.

## Common Pitfalls

### Pitfall 1: Tempo Multiplier Order
**What goes wrong:** Applying tempo multiplier to base only, not full subtotal
**Why it happens:** Ambiguity in "1.5x when tempo is used"
**How to avoid:** Multiply AFTER adding all bonuses: `(base + volume + PR + consistency) * 1.5`
**Warning signs:** XP totals seem low when tempo mode is enabled

### Pitfall 2: Volume Bonus Integer Division
**What goes wrong:** Getting 0 XP for 99kg volume
**Why it happens:** Forgetting floor division, or using float division
**How to avoid:** `Math.floor(weightKg * reps / 100)` - explicit floor
**Warning signs:** Small sets give unexpectedly zero volume bonus

### Pitfall 3: Streak Reset Timing
**What goes wrong:** Streak resets to 0 when user takes a 6-day break
**Why it happens:** Not considering 7-day window properly
**How to avoid:** Compare `last_trained_at` to current date with 7-day threshold
**Warning signs:** Users lose streaks unexpectedly

### Pitfall 4: Race Condition on Zone Stats
**What goes wrong:** Two sets complete rapidly, second overwrites first's XP
**Why it happens:** Read-modify-write without transaction
**How to avoid:** Use `withExclusiveTransactionAsync` and `UPDATE ... SET total_xp = total_xp + ?`
**Warning signs:** XP counts are lower than expected after fast set logging

### Pitfall 5: PR Detection Without History
**What goes wrong:** Every set is detected as PR
**Why it happens:** Not querying `workout_sets` for historical max weight
**How to avoid:** Query `MAX(weight_kg)` WHERE exercise_id AND reps >= current reps BEFORE current set
**Warning signs:** +50 XP PR bonus on every single set

### Pitfall 6: Level-up Detection After-the-fact
**What goes wrong:** User sees level 2 but no celebration happened
**Why it happens:** Level recalculated only on screen mount, not immediately after XP add
**How to avoid:** Calculate new level immediately after XP update, compare to previous
**Warning signs:** Missing level-up celebrations, delayed level display

## Code Examples

Verified patterns from existing codebase:

### Level Calculation from XP
```typescript
// Source: src/constants/xp.ts + src/components/character/StatCard.tsx
import { LEVEL_THRESHOLDS } from '@/constants/xp';

export function getLevelFromXP(totalXp: number): number {
  // Find highest level where XP meets threshold
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1; // Default to level 1
}

export function getXPProgress(totalXp: number, level: number): { current: number; needed: number; progress: number } {
  const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === level);
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);

  if (!nextThreshold) {
    // Max level
    return { current: 0, needed: 0, progress: 1 };
  }

  const current = totalXp - (currentThreshold?.xpRequired ?? 0);
  const needed = nextThreshold.xpRequired - (currentThreshold?.xpRequired ?? 0);
  const progress = Math.min(1, Math.max(0, current / needed));

  return { current, needed, progress };
}
```

### Animated Pulse Effect (for level-up)
```typescript
// Source: Adapted from src/components/character/ZoneGlow.tsx
import { useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function useLevelUpPulse() {
  const pulseScale = useSharedValue(1);

  const triggerPulse = () => {
    // Quick scale up and back, repeated 2x
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 150 }),
        withTiming(1.0, { duration: 150 })
      ),
      2, // repeat twice
      false // don't reverse
    );
  };

  return { pulseScale, triggerPulse };
}
```

### Consistency Check (7-day window)
```typescript
// Check if zone was trained within last 7 days
function wasTrainedWithin7Days(lastTrainedAt: string | null): boolean {
  if (!lastTrainedAt) return false;

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const lastTrained = new Date(lastTrainedAt).getTime();
  const now = Date.now();

  return (now - lastTrained) < SEVEN_DAYS_MS;
}
```

### PR Detection Query
```typescript
// Check if current weight exceeds historical max for same exercise and rep count
async function isPR(
  db: SQLiteDatabase,
  exerciseId: string,
  weightKg: number,
  reps: number
): Promise<boolean> {
  const result = await db.getFirstAsync<{ max_weight: number | null }>(
    `SELECT MAX(weight_kg) as max_weight
     FROM workout_sets
     WHERE exercise_id = ? AND reps >= ?`,
    [exerciseId, reps]
  );

  // PR if no prior sets OR weight exceeds max
  return result?.max_weight === null || weightKg > result.max_weight;
}
```

## Recommendations for Claude's Discretion Items

### Bonus Stacking Rules
**Recommendation:** Additive first, then multiplicative tempo
```
XP = (base + volumeBonus + prBonus + consistencyBonus) * tempoMultiplier
```
**Rationale:** Matches gaming industry standard (Diablo, ESO). Multiplicative applied last rewards tempo usage meaningfully.

### PR Bonus Scope
**Recommendation:** Per-set, not per-session
**Rationale:** Multiple PRs in one session are possible (different exercises, different rep ranges). Each deserves recognition.

### Volume Calculation Method
**Recommendation:** Tonnage (weight x reps) per set
**Rationale:** Simple, measurable, already captured in `workout_sets`. Working sets vs warmups is user's responsibility.

### Volume Bonus Reference
**Recommendation:** Absolute threshold (per 100kg volume)
**Rationale:** Simple mental math for users, no historical query complexity.

### Bodyweight Exercise Handling
**Recommendation:** Treat as 0kg weight (no volume bonus)
**Rationale:** Simplest approach for v1. Users can enter estimated weight if desired.

### Volume Bonus Cap
**Recommendation:** No cap
**Rationale:** Heavy lifters should be rewarded. 200kg x 5 = 1000kg = +10 XP is reasonable.

### Consistency Definition
**Recommendation:** Zone-specific 7-day rolling window
```
If last_trained_at for THIS zone is within 7 days: +20 XP
```
**Rationale:** Encourages balanced training across zones, not just daily workouts.

### Streak Calculation
**Recommendation:** Count consecutive weeks with at least 1 session per zone
**Rationale:** Weekly granularity is more forgiving than daily, matches user expectation.

### Streak Break Forgiveness
**Recommendation:** 7-day grace period (full week missed = streak reset)
**Rationale:** Life happens, but extended breaks reset progress.

### Haptic Feedback on Level-up
**Recommendation:** Yes - `Haptics.notificationAsync(NotificationFeedbackType.Success)`
**Rationale:** Already imported, single line of code, satisfying feedback.

### Milestone Level Effects
**Recommendation:** Defer to v2 (enhanced celebrations for level 5, 10)
**Rationale:** Out of scope for "subtle pulse effect" requirement. Basic pulse covers v1.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Animated API | React Native Reanimated 4.x | 2025 | CSS animations now supported, but existing patterns work fine |
| expo-sqlite classic API | New async API with contexts | 2024 | Use `useSQLiteContext()` and async methods |

**Deprecated/outdated:**
- `Animated` from react-native core: Still works but Reanimated is standard for 60fps
- `transaction` callback style: Use `withExclusiveTransactionAsync` for async/await

## Open Questions

1. **Secondary Zone XP**
   - What we know: Exercises have `secondary_zones` column in database
   - What's unclear: Should XP be awarded to secondary zones too?
   - Recommendation: v1 awards XP to primary zone only. Secondary zone XP is a v2 feature.

2. **XP History Source Tracking**
   - What we know: `xp_history.source` column exists, `source_id` for reference
   - What's unclear: Exact source type strings to use
   - Recommendation: Use enum-like strings: 'SET_COMPLETE', 'PR_BONUS', 'CONSISTENCY_BONUS', 'TEMPO_BONUS'

3. **Real-time XP During Workout vs Batch at End**
   - What we know: User decision says "XP bar fills incrementally as each set is marked complete"
   - What's unclear: Should zone_stats update immediately or at session completion?
   - Recommendation: Update zone_stats at session completion (atomic), but show running total in UI during workout.

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns: `src/hooks/useZoneStats.ts`, `src/components/character/ZoneGlow.tsx`
- Existing XP constants: `src/constants/xp.ts`
- Existing DB schema: `src/db/database.ts`
- Project constraints: `CLAUDE.md`, `.planning/PROJECT.md`

### Secondary (MEDIUM confidence)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/) - Transaction API
- [Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/) - Animation patterns
- [Gaming XP Forums](https://forums.elderscrollsonline.com/en/discussion/257027/anniversary-xp-bonus-stacking-additive-or-multiplicative) - Additive vs multiplicative stacking patterns

### Tertiary (LOW confidence)
- General web search for streak algorithms - conceptual guidance only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used
- Architecture: HIGH - Patterns derived from existing codebase
- XP formulas: HIGH - Requirements explicitly defined (10 base, +1 per 100kg, 1.5x tempo, +50 PR, +20 consistency)
- Pitfalls: MEDIUM - Based on domain experience and common patterns

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (30 days - stable domain, no external dependencies)
