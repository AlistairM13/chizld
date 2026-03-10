# Plan: Add Tempo Configuration to Workout Splits

## Context
Users want to save tempo settings per exercise in their workout splits, so they don't have to configure tempo every time they train. Currently splits only store sets/reps.

Tempo format: 4 numbers representing seconds for each phase:
- Eccentric (lowering)
- Pause at bottom
- Concentric (lifting)
- Pause at top

Example: 3-1-2-0 = 3s down, 1s pause, 2s up, 0s pause

## Files to Modify

### 1. `src/db/database.ts`
Add 4 tempo columns to `split_exercises` table:

```sql
CREATE TABLE IF NOT EXISTS split_exercises (
  id TEXT PRIMARY KEY,
  split_id TEXT NOT NULL REFERENCES workout_splits(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  default_tempo_eccentric INTEGER DEFAULT 2,
  default_tempo_pause_bottom INTEGER DEFAULT 0,
  default_tempo_concentric INTEGER DEFAULT 1,
  default_tempo_pause_top INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

Add migration for existing users (after seed block):
```typescript
// Migration: Add tempo columns to split_exercises
await db.runAsync(`
  ALTER TABLE split_exercises ADD COLUMN default_tempo_eccentric INTEGER DEFAULT 2
`);
// ... repeat for other 3 columns (use try-catch to ignore if column exists)
```

### 2. `src/types/index.ts`
Update `SplitExercise` interface:
```typescript
export interface SplitExercise {
  id: string;
  splitId: string;
  exerciseId: string;
  exerciseName: string;
  primaryZone: string;
  defaultSets: number;
  defaultReps: number;
  defaultTempoEccentric: number;
  defaultTempoPauseBottom: number;
  defaultTempoConcentric: number;
  defaultTempoPauseTop: number;
  sortOrder: number;
}
```

Update `SplitExerciseInput` interface:
```typescript
export interface SplitExerciseInput {
  exerciseId: string;
  sets: number;
  reps: number;
  tempoEccentric?: number;
  tempoPauseBottom?: number;
  tempoConcentric?: number;
  tempoPauseTop?: number;
}
```

### 3. `src/db/splits.ts` (or wherever split queries live)
Update `createSplit` to insert tempo values.
Update `getSplitExercises` to select tempo columns.

### 4. `src/screens/workout/SplitCreateScreen.tsx`
Add tempo controls to the exercise config UI:
- Add a row below sets/reps with 4 small number inputs for tempo
- Default values: 2-0-1-0
- Compact UI: `TEMPO: [2]-[0]-[1]-[0]`

### 5. `src/hooks/useSplits.ts` (or relevant hook)
Update to handle tempo in create/fetch operations.

### 6. Workout Session Integration
When starting a workout from a split, pass tempo defaults to the set logging screen:
- File: wherever workout sets are created from split data
- Pre-populate tempo fields with split defaults

## UI Design for Split Create Screen

Current row:
```
Cable Fly     SETS [-] 3 [+]   REPS [-] 10 [+]   X
CHEST
```

Updated row (add tempo below or inline):
```
Cable Fly     SETS [-] 3 [+]   REPS [-] 10 [+]   TEMPO [2]-[0]-[1]-[0]   X
CHEST
```

Or expandable:
```
Cable Fly     SETS [-] 3 [+]   REPS [-] 10 [+]   [v]   X
CHEST
  └─ TEMPO: ECC [2]  PAUSE [0]  CON [1]  PAUSE [0]
```

## Implementation Order
1. Database schema + migration
2. Types update
3. Split queries (create/fetch)
4. UI for split creation
5. Pass tempo to workout session

## Verification
1. Create a new split with custom tempo (e.g., 3-1-2-1)
2. Save split
3. View split detail - verify tempo shows
4. Start workout from split
5. Verify tempo is pre-filled in set logging
