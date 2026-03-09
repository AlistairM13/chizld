# Phase 4: Workout Module - Research

**Researched:** 2026-03-09
**Domain:** Workout session management, voice tempo countdown, rest timer, SQLite data persistence
**Confidence:** HIGH

## Summary

This phase implements the complete workout loop: exercise selection filtered by zone, active session screen for logging sets (weight, reps, RPE), voice tempo countdown via expo-speech, configurable rest timer, and session summary screen. The implementation uses expo-speech (already installed, v55.0.8) for voice tempo with onDone callbacks for sequencing, expo-haptics (v55.0.8) for tactile feedback, and expo-av (v16.0.8) for completion sounds. All libraries are pre-installed.

The architecture follows a multi-screen flow using React Navigation native stack: CharacterScreen TRAIN button pushes ExerciseSelectScreen, which pushes WorkoutSessionScreen on start. The session screen manages active workout state locally, persisting sets to SQLite on completion. A full-screen rest timer overlay appears between sets using Reanimated for the countdown animation.

**Primary recommendation:** Use a session context or local state machine in WorkoutSessionScreen to manage workout flow. Voice tempo uses sequential expo-speech calls with onDone callbacks. Rest timer is a modal overlay with Skia circle arc for visual countdown.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-speech | 55.0.8 | Voice tempo countdown | Pre-installed, provides speak() with onDone callback |
| expo-haptics | 55.0.8 | Vibration feedback on set completion, timer done | Pre-installed, impactAsync for subtle, notificationAsync for alerts |
| expo-sqlite | 55.0.10 | Persist workout_sessions and workout_sets | Already integrated, patterns established in useZoneStats |
| expo-av | 16.0.8 | Short completion sounds | Pre-installed, Audio.Sound.createAsync for one-shots |
| react-native-reanimated | 4.2.1 | Timer countdown animation, screen transitions | Already integrated, withTiming for smooth countdown |
| @shopify/react-native-skia | 2.5.1 | Circular timer progress arc | Already integrated, Arc path with end prop for progress |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native BackHandler | built-in | Android back button in workout session | Confirm exit from active session |
| react-native Vibration | built-in | Fallback if expo-haptics unavailable | Not recommended - use expo-haptics |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-speech | react-native-tts | More control but not pre-installed, adds complexity |
| Skia Arc progress | react-native-countdown-circle-timer | External dependency vs using existing Skia |
| Local state | Redux/Zustand | Overkill for single session scope; project uses on-demand data pattern |

**Installation:**
```bash
# All packages already installed - NO npm install needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── screens/workout/
│   ├── ExerciseSelectScreen.tsx    # NEW: Zone-filtered exercise list
│   ├── WorkoutSessionScreen.tsx    # NEW: Active session with set logging
│   └── SessionSummaryScreen.tsx    # NEW: Completion summary with XP
├── components/workout/
│   ├── ExerciseCard.tsx            # NEW: Exercise list item
│   ├── ExerciseBottomBar.tsx       # NEW: Selection count + Start button
│   ├── SetRow.tsx                  # NEW: Single set input row
│   ├── WeightInput.tsx             # NEW: Number pad + steppers
│   ├── RPESelector.tsx             # NEW: RPE 6-10 button row
│   ├── RestTimerOverlay.tsx        # NEW: Full-screen countdown
│   ├── TempoPlayer.tsx             # NEW: Voice tempo countdown logic
│   └── SessionHeader.tsx           # NEW: Exercise name, set count
├── hooks/
│   ├── useExercises.ts             # NEW: Fetch exercises by zone
│   ├── useWorkoutSession.ts        # NEW: Session state management
│   ├── useRestTimer.ts             # NEW: Countdown timer logic
│   └── useTempoVoice.ts            # NEW: expo-speech wrapper for tempo
└── navigation/
    └── types.ts                    # MODIFY: Add workout stack params
```

### Pattern 1: Workout Navigation Flow
**What:** Stack-based navigation from CharacterScreen through workout screens
**When to use:** Linear workflow with back navigation
**Example:**
```typescript
// Source: navigation/types.ts - extend RootStackParamList
export type RootStackParamList = {
  Main: undefined;
  ExerciseSelect: { zoneId: string };      // Zone filter
  WorkoutSession: { exercises: string[] }; // Selected exercise IDs
  SessionSummary: { sessionId: string };   // Completed session
};

// In CharacterScreen - onTrain handler
const handleTrain = useCallback(() => {
  navigation.navigate('ExerciseSelect', { zoneId: selectedZone });
}, [navigation, selectedZone]);
```

### Pattern 2: Exercise Selection with Bottom Bar
**What:** FlatList with multi-select, persistent bottom bar showing count
**When to use:** Shopping cart pattern for selection flows
**Example:**
```typescript
// Source: Design decision - tap to add instantly
const [selected, setSelected] = useState<Set<string>>(new Set());

const toggleExercise = (exerciseId: string) => {
  setSelected(prev => {
    const next = new Set(prev);
    if (next.has(exerciseId)) {
      next.delete(exerciseId);
    } else {
      next.add(exerciseId);
    }
    return next;
  });
  // Visual flash + haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Bottom bar always visible
<View style={styles.bottomBar}>
  <Text style={styles.countText}>{selected.size} EXERCISES</Text>
  <Pressable onPress={startWorkout} disabled={selected.size === 0}>
    <Text>START WORKOUT</Text>
  </Pressable>
</View>
```

### Pattern 3: Set Logging with Auto Rest Timer
**What:** Log set data, then auto-start rest timer
**When to use:** After each set completion
**Example:**
```typescript
// Source: Design decision - auto-start with cancel
const handleSetComplete = async (setData: SetData) => {
  // Flash confirmation + haptic
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  playCompletionSound();

  // Save to database
  await saveSet(sessionId, exerciseId, setData);

  // Auto-start rest timer (user decided: auto-start with cancel)
  setShowRestTimer(true);
  startRestTimer(restDuration);
};
```

### Pattern 4: Voice Tempo with Sequential Speak
**What:** expo-speech with onDone callback for phase sequencing
**When to use:** Voice-guided tempo during set
**Example:**
```typescript
// Source: expo-speech docs + design decision
import * as Speech from 'expo-speech';

interface TempoConfig {
  eccentric: number;   // seconds
  pauseBottom: number;
  concentric: number;
  pauseTop: number;
}

async function playTempoPhase(phase: string, duration: number): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(phase, {
      rate: 0.9,
      onDone: () => {
        // After announcing phase, count down
        countdownThenResolve(duration, resolve);
      },
    });
  });
}

async function playTempoCycle(config: TempoConfig): Promise<void> {
  await playTempoPhase('Eccentric', config.eccentric);
  if (config.pauseBottom > 0) {
    await playTempoPhase('Hold', config.pauseBottom);
  }
  await playTempoPhase('Concentric', config.concentric);
  if (config.pauseTop > 0) {
    await playTempoPhase('Hold', config.pauseTop);
  }
}

// Countdown numbers spoken
async function countdownThenResolve(seconds: number, resolve: () => void) {
  for (let i = seconds; i >= 1; i--) {
    await new Promise<void>((r) => {
      Speech.speak(String(i), { rate: 1.1, onDone: r });
    });
  }
  resolve();
}
```

### Pattern 5: Rest Timer Overlay with Skia Arc
**What:** Full-screen overlay with countdown circle
**When to use:** Between sets (auto-started)
**Example:**
```typescript
// Source: Skia docs + Reanimated + design decision
import { Canvas, Path, SweepGradient, vec } from '@shopify/react-native-skia';

const RestTimerOverlay = ({ duration, onComplete }: Props) => {
  const [remaining, setRemaining] = useState(duration);
  const progress = useSharedValue(1);

  useEffect(() => {
    // Animate progress from 1 to 0 over duration
    progress.value = withTiming(0, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          playTimerDoneSound();
          onComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  // Circle arc with animated end
  const arcPath = useAnimatedProps(() => {
    return { end: progress.value };
  });

  return (
    <View style={styles.overlay}>
      <Canvas style={styles.timerCanvas}>
        <Path path={circleArc} style="stroke" strokeWidth={12}>
          <SweepGradient
            c={vec(centerX, centerY)}
            colors={[colors.ember[500], colors.ember[700]]}
          />
        </Path>
      </Canvas>
      <Text style={styles.timeText}>{remaining}s</Text>
      <View style={styles.quickAdjust}>
        <Pressable onPress={() => adjustTime(-15)}>-15s</Pressable>
        <Pressable onPress={() => adjustTime(+15)}>+15s</Pressable>
      </View>
      <Pressable onPress={onComplete}>
        <Text>SKIP REST</Text>
      </Pressable>
    </View>
  );
};
```

### Anti-Patterns to Avoid
- **Storing workout state in global store:** Keep session state local to WorkoutSessionScreen; persist to SQLite on actions
- **Multiple simultaneous Speech.speak calls:** Queue utterances; use onDone callback for sequencing
- **Polling isSpeakingAsync in a loop:** Use onDone/onStopped callbacks instead
- **Raw setInterval for countdown:** Use Reanimated withTiming for visual, setInterval only for remaining display
- **Inline database operations in components:** Extract to hooks (useWorkoutSession, useExercises)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text-to-speech | Audio file + playback | expo-speech with speak() | Handles all voices, queuing, callbacks |
| Vibration feedback | Vibration.vibrate() | expo-haptics impactAsync | Better haptic feel, no permission on iOS |
| UUID generation | Manual random IDs | Date.now().toString(36) + random | Simple, unique enough for local DB |
| Circular timer progress | Canvas drawing math | Skia Path with end prop | Already using Skia, end animates naturally |
| Timer countdown | setTimeout chains | setInterval + Reanimated withTiming | Cleaner, visual synced with logic |

**Key insight:** expo-speech queues utterances automatically. Calling speak() while speaking adds to queue. Use onDone to sequence phases manually for predictable timing.

## Common Pitfalls

### Pitfall 1: Speech Queue Overflow
**What goes wrong:** Voice tempo gets out of sync, speaks over itself
**Why it happens:** Calling Speech.speak rapidly without waiting for completion
**How to avoid:**
- Always use onDone callback before speaking next phrase
- Call Speech.stop() when user cancels tempo mode
- Limit tempo cycle rate to actual rep speed
**Warning signs:** Overlapping voice, garbled speech, delayed phases

### Pitfall 2: Rest Timer Drift
**What goes wrong:** Visual countdown doesn't match actual time
**Why it happens:** setInterval drift over time, or visual not synced with state
**How to avoid:**
- Use single interval for state countdown
- Use Reanimated withTiming for visual (duration-based, not frame-based)
- Store absolute end time and calculate remaining from Date.now()
**Warning signs:** Timer shows 0 but callback hasn't fired, or visual jumps

### Pitfall 3: Android Back Button Exits Workout
**What goes wrong:** User accidentally loses workout by pressing back
**Why it happens:** No back handler to confirm exit
**How to avoid:**
- Use BackHandler to intercept in WorkoutSessionScreen
- Show confirmation modal: "Exit workout? Progress will be lost"
- Or: Auto-save session draft periodically
**Warning signs:** Lost workout data complaints, frustrated users

### Pitfall 4: Database Writes Block UI
**What goes wrong:** UI freezes when saving set
**Why it happens:** Synchronous database operations on main thread
**How to avoid:**
- Use async/await with expo-sqlite
- Show optimistic UI update immediately, persist in background
- Wrap multiple inserts in transaction for performance
**Warning signs:** Jank after tapping save, noticeable pause

### Pitfall 5: Weight Input Keyboard Covers RPE
**What goes wrong:** Can't see or tap RPE selector when keyboard open
**Why it happens:** Landscape layout + keyboard = very little visible area
**How to avoid:**
- Use custom number pad instead of system keyboard (per design decision)
- Position inputs above keyboard zone
- Or: Use KeyboardAvoidingView with proper behavior
**Warning signs:** User has to dismiss keyboard to tap RPE

### Pitfall 6: Tempo Voice Not Stopping on Set Complete
**What goes wrong:** Voice keeps counting after user taps Done
**Why it happens:** No cleanup when tempo mode ends
**How to avoid:**
- Call Speech.stop() in handleSetComplete
- Track isTempoCycleActive state, check before each phase
- Use AbortController pattern for cancellable async
**Warning signs:** Voice continues into rest timer, overlaps with next set

## Code Examples

Verified patterns from official sources:

### expo-speech Voice Tempo
```typescript
// Source: expo-speech docs (speak with onDone callback)
import * as Speech from 'expo-speech';

export function useTempoVoice(config: TempoConfig | null) {
  const isActive = useRef(false);

  const startTempo = useCallback(async () => {
    if (!config) return;
    isActive.current = true;

    while (isActive.current) {
      // Speak "Eccentric"
      await speakWithDelay('Eccentric', 0);
      if (!isActive.current) break;

      // Count down eccentric phase
      for (let i = config.eccentric; i >= 1; i--) {
        await speakWithDelay(String(i), 0);
        if (!isActive.current) break;
      }

      // Hold at bottom
      if (config.pauseBottom > 0 && isActive.current) {
        await speakWithDelay('Hold', 0);
        await delay(config.pauseBottom * 1000);
      }

      // Speak "Concentric"
      await speakWithDelay('Concentric', 0);
      if (!isActive.current) break;

      // Count down concentric phase
      for (let i = config.concentric; i >= 1; i--) {
        await speakWithDelay(String(i), 0);
        if (!isActive.current) break;
      }

      // Hold at top
      if (config.pauseTop > 0 && isActive.current) {
        await speakWithDelay('Hold', 0);
        await delay(config.pauseTop * 1000);
      }
    }
  }, [config]);

  const stopTempo = useCallback(() => {
    isActive.current = false;
    Speech.stop();
  }, []);

  return { startTempo, stopTempo };
}

function speakWithDelay(text: string, pauseMs: number): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, {
      rate: 1.0,
      onDone: () => {
        if (pauseMs > 0) {
          setTimeout(resolve, pauseMs);
        } else {
          resolve();
        }
      },
      onError: () => resolve(), // Don't block on errors
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### expo-haptics Feedback Patterns
```typescript
// Source: expo-haptics docs
import * as Haptics from 'expo-haptics';

// Light tap for exercise selection toggle
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium tap for set completion confirmation
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Success notification for session complete
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Warning notification for rest timer done
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Selection feedback for RPE picker
Haptics.selectionAsync();
```

### SQLite Session Persistence
```typescript
// Source: expo-sqlite docs + existing codebase pattern
import { useSQLiteContext } from 'expo-sqlite';

export function useWorkoutSession() {
  const db = useSQLiteContext();

  const createSession = async (): Promise<string> => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    await db.runAsync(
      'INSERT INTO workout_sessions (id, started_at) VALUES (?, ?)',
      [id, new Date().toISOString()]
    );
    return id;
  };

  const addSet = async (
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    data: { weightKg: number; reps: number; rpe: number }
  ): Promise<void> => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    await db.runAsync(
      `INSERT INTO workout_sets
       (id, session_id, exercise_id, set_number, weight_kg, reps, rpe, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sessionId,
        exerciseId,
        setNumber,
        data.weightKg,
        data.reps,
        data.rpe,
        new Date().toISOString(),
      ]
    );
  };

  const completeSession = async (sessionId: string, notes?: string): Promise<void> => {
    await db.runAsync(
      'UPDATE workout_sessions SET ended_at = ?, notes = ? WHERE id = ?',
      [new Date().toISOString(), notes ?? null, sessionId]
    );
  };

  return { createSession, addSet, completeSession };
}
```

### Custom Number Pad Component
```typescript
// Source: React Native patterns + design decision
interface NumberPadProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

export function WeightInput({ value, onChange, step = 2.5, min = 0, max = 500 }: NumberPadProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.container}>
      <Pressable onPress={decrement} style={styles.stepButton}>
        <Text style={styles.stepText}>-{step}</Text>
      </Pressable>

      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value.toFixed(1)}</Text>
        <Text style={styles.unitText}>kg</Text>
      </View>

      <Pressable onPress={increment} style={styles.stepButton}>
        <Text style={styles.stepText}>+{step}</Text>
      </Pressable>
    </View>
  );
}
```

### Rest Timer with Quick Adjust
```typescript
// Source: Design decision + Reanimated patterns
export function useRestTimer(initialDuration: number) {
  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef<number>(0);

  const start = useCallback((customDuration?: number) => {
    const d = customDuration ?? duration;
    endTimeRef.current = Date.now() + d * 1000;
    setRemaining(d);
    setIsRunning(true);
  }, [duration]);

  const skip = useCallback(() => {
    setIsRunning(false);
    setRemaining(0);
  }, []);

  const adjustTime = useCallback((delta: number) => {
    endTimeRef.current += delta * 1000;
    setRemaining((r) => Math.max(0, r + delta));
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newRemaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        setIsRunning(false);
        clearInterval(interval);
      }
    }, 100); // Update frequently for smooth countdown

    return () => clearInterval(interval);
  }, [isRunning]);

  return { remaining, isRunning, start, skip, adjustTime, setDuration };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-speech without callbacks | speak() with onDone/onError | Expo SDK 45+ | Reliable sequencing possible |
| Vibration.vibrate() | expo-haptics impactAsync | Expo SDK 40+ | Better haptic feel, typed constants |
| expo-sqlite callback API | Async/await with useSQLiteContext | expo-sqlite 12+ | Cleaner code, better error handling |
| Manual SQL strings | Parameterized queries | Always | SQL injection prevention |

**Deprecated/outdated:**
- `Speech.speakAsync()`: Use `Speech.speak()` - it's already async in behavior
- Synchronous expo-sqlite: Always use async methods to avoid UI blocking

## Open Questions

Things that couldn't be fully resolved:

1. **Tempo preset storage per exercise**
   - What we know: workout_sets has tempo columns (eccentric, pause_bottom, concentric, pause_top)
   - What's unclear: Should tempo presets be stored in exercises table or separate table?
   - Recommendation: Add tempo columns to exercises table as defaults; per-set values override

2. **Sound asset for completion beep**
   - What we know: expo-av can play sound files
   - What's unclear: No sound assets exist yet; need to create or find suitable sounds
   - Recommendation: Use system notification sound or a simple bundled beep.mp3; asset creation is out of scope

3. **Session recovery on app crash**
   - What we know: Sets save immediately to SQLite; session remains "open" until explicitly completed
   - What's unclear: How to detect and resume incomplete session on app restart?
   - Recommendation: Check for session without ended_at on app start; offer to resume or discard

4. **Max exercises in a session**
   - What we know: User can add multiple exercises (WORK-10)
   - What's unclear: Should there be a limit? Performance implications?
   - Recommendation: No hard limit initially; FlatList with proper keys handles many items

## Sources

### Primary (HIGH confidence)
- expo-speech NPM package and GitHub docs - speak(), onDone, onStopped callbacks
  - https://docs.expo.dev/versions/latest/sdk/speech/
  - https://github.com/expo/expo/blob/master/packages/expo-speech
- expo-haptics docs - impactAsync, notificationAsync, selectionAsync
  - https://docs.expo.dev/versions/latest/sdk/haptics/
- expo-sqlite docs - async patterns, useSQLiteContext
  - https://expo.dev/blog/modern-sqlite-for-react-native-apps
- Existing codebase patterns - useZoneStats, useDetailStats hooks
- React Native Skia docs - Path with end prop for arc animation
  - https://shopify.github.io/react-native-skia/docs/animations/animations/

### Secondary (MEDIUM confidence)
- Circular countdown timer with Skia pattern
  - https://www.linkedin.com/pulse/create-circular-progress-bar-countdown-timer-skia-romullo-bernardo
- Workout app UX patterns - rest timer, logging flows
  - https://medium.com/@penguinchilli/ui-design-time2rest-app-66321d75ff55
  - https://medium.com/@hwaijunyap/ui-ux-case-study-strong-workout-app-redesign-fc22afbada65

### Tertiary (LOW confidence)
- None - all critical patterns verified with official docs or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries pre-installed with verified versions in package.json
- Architecture: HIGH - navigation patterns match existing RootNavigator, hooks match existing pattern
- Voice tempo: MEDIUM - expo-speech callbacks verified but tempo sequencing is complex
- Rest timer: HIGH - Skia + Reanimated patterns well documented, similar to existing ZoneGlow
- Pitfalls: MEDIUM - based on common issues from GitHub issues and forum discussions

**Research date:** 2026-03-09
**Valid until:** 30 days (stable libraries, established patterns)
