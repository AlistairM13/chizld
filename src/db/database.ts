import { type SQLiteDatabase } from 'expo-sqlite';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  // Create all tables with WAL journal mode for performance
  // Enable foreign keys for cascade deletes
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      primary_zone TEXT NOT NULL,
      secondary_zones TEXT,
      equipment TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      notes TEXT,
      photo_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES workout_sessions(id),
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      set_number INTEGER NOT NULL,
      weight_kg REAL,
      reps INTEGER,
      rpe REAL,
      tempo_eccentric INTEGER,
      tempo_pause_bottom INTEGER,
      tempo_concentric INTEGER,
      tempo_pause_top INTEGER,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS progress_photos (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      view_type TEXT DEFAULT 'front',
      taken_at TEXT NOT NULL,
      session_id TEXT REFERENCES workout_sessions(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      meal_type TEXT,
      calories REAL NOT NULL,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      fiber_g REAL,
      input_method TEXT NOT NULL,
      photo_path TEXT,
      logged_at TEXT NOT NULL,
      servings REAL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS diet_targets (
      id TEXT PRIMARY KEY,
      calories REAL NOT NULL,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      effective_from TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sleep_logs (
      id TEXT PRIMARY KEY,
      bed_time TEXT NOT NULL,
      wake_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      quality_rating INTEGER,
      tags TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sunlight_sessions (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS zone_stats (
      zone_id TEXT PRIMARY KEY,
      total_xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_trained_at TEXT,
      personal_records TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS xp_history (
      id TEXT PRIMARY KEY,
      zone_id TEXT NOT NULL,
      xp_amount INTEGER NOT NULL,
      source TEXT NOT NULL,
      source_id TEXT,
      earned_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sleep_reminders (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      time TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_splits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS split_exercises (
      id TEXT PRIMARY KEY,
      split_id TEXT NOT NULL REFERENCES workout_splits(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      default_sets INTEGER DEFAULT 3,
      default_reps INTEGER DEFAULT 10,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_split_exercises_split_id ON split_exercises(split_id);
  `);

  // Seed data only on first launch (when exercises table is empty)
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises'
  );

  if ((count?.count ?? 0) === 0) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      // Seed exercises — 35 total across 8 zones
      const exercises: Array<{ id: string; name: string; zone: string }> = [
        // traps (4)
        { id: 'traps-01', name: 'Barbell Shrug', zone: 'traps' },
        { id: 'traps-02', name: 'Dumbbell Shrug', zone: 'traps' },
        { id: 'traps-03', name: 'Face Pulls', zone: 'traps' },
        { id: 'traps-04', name: 'Upright Row', zone: 'traps' },
        // biceps (4)
        { id: 'biceps-01', name: 'Barbell Curl', zone: 'biceps' },
        { id: 'biceps-02', name: 'Hammer Curl', zone: 'biceps' },
        { id: 'biceps-03', name: 'Preacher Curl', zone: 'biceps' },
        { id: 'biceps-04', name: 'Concentration Curl', zone: 'biceps' },
        // forearms (4)
        { id: 'forearms-01', name: 'Wrist Curl', zone: 'forearms' },
        { id: 'forearms-02', name: 'Reverse Wrist Curl', zone: 'forearms' },
        { id: 'forearms-03', name: "Farmer's Walk", zone: 'forearms' },
        { id: 'forearms-04', name: 'Dead Hang', zone: 'forearms' },
        // tibialis (3)
        { id: 'tibialis-01', name: 'Tibialis Raise', zone: 'tibialis' },
        { id: 'tibialis-02', name: 'Toe Walk', zone: 'tibialis' },
        { id: 'tibialis-03', name: 'Ankle Dorsiflexion', zone: 'tibialis' },
        // neck (4)
        { id: 'neck-01', name: 'Neck Curl', zone: 'neck' },
        { id: 'neck-02', name: 'Neck Extension', zone: 'neck' },
        { id: 'neck-03', name: 'Neck Side Raise', zone: 'neck' },
        { id: 'neck-04', name: 'Jaw Clench', zone: 'neck' },
        // shoulders (5)
        { id: 'shoulders-01', name: 'Overhead Press', zone: 'shoulders' },
        { id: 'shoulders-02', name: 'Lateral Raise', zone: 'shoulders' },
        { id: 'shoulders-03', name: 'Front Raise', zone: 'shoulders' },
        { id: 'shoulders-04', name: 'Arnold Press', zone: 'shoulders' },
        { id: 'shoulders-05', name: 'Reverse Fly', zone: 'shoulders' },
        // abs (5)
        { id: 'abs-01', name: 'Plank', zone: 'abs' },
        { id: 'abs-02', name: 'Cable Crunch', zone: 'abs' },
        { id: 'abs-03', name: 'Hanging Leg Raise', zone: 'abs' },
        { id: 'abs-04', name: 'Ab Rollout', zone: 'abs' },
        { id: 'abs-05', name: 'Russian Twist', zone: 'abs' },
        // quads (6)
        { id: 'quads-01', name: 'Barbell Squat', zone: 'quads' },
        { id: 'quads-02', name: 'Leg Press', zone: 'quads' },
        { id: 'quads-03', name: 'Leg Extension', zone: 'quads' },
        { id: 'quads-04', name: 'Bulgarian Split Squat', zone: 'quads' },
        { id: 'quads-05', name: 'Hip Thrust', zone: 'quads' },
        { id: 'quads-06', name: 'Calf Raise', zone: 'quads' },
      ];

      for (const ex of exercises) {
        await txn.runAsync(
          'INSERT INTO exercises (id, name, primary_zone) VALUES (?, ?, ?)',
          ex.id,
          ex.name,
          ex.zone
        );
      }

      // Seed zone_stats — one row per zone with default values
      const zones = [
        'traps',
        'biceps',
        'forearms',
        'tibialis',
        'neck',
        'shoulders',
        'abs',
        'quads',
      ];

      for (const zoneId of zones) {
        await txn.runAsync(
          'INSERT OR IGNORE INTO zone_stats (zone_id) VALUES (?)',
          zoneId
        );
      }
    });
  }
}
