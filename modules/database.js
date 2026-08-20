import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create/open the database file
const db = new Database(path.join(__dirname, "../mood_tracker.db"));

// ── Enable WAL mode for better performance ────────────────────────
db.pragma("journal_mode = WAL");

// ══════════════════════════════════════════════════════════════════
// SCHEMA — Create all tables if they don't exist
// ══════════════════════════════════════════════════════════════════
db.exec(`
  CREATE TABLE IF NOT EXISTS moods (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    DEFAULT (date('now')),
    score      INTEGER NOT NULL,
    emotions   TEXT,
    notes      TEXT,
    created_at TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS habits (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id   INTEGER NOT NULL,
    date       TEXT    DEFAULT (date('now')),
    completed  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS fitness_logs (
    date           TEXT PRIMARY KEY,
    steps          INTEGER DEFAULT 0,
    calories       INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    sleep_hours    REAL    DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS spotify_logs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    date          TEXT DEFAULT (date('now')),
    valence       INTEGER,
    energy        INTEGER,
    inferred_mood TEXT
  );
`);

// ══════════════════════════════════════════════════════════════════
// MOOD OPERATIONS
// ══════════════════════════════════════════════════════════════════
function logMood(score, emotions = [], notes = "") {
  const result = db.prepare(`
    INSERT INTO moods (score, emotions, notes)
    VALUES (?, ?, ?)
  `).run(score, emotions.join(","), notes);

  return { id: result.lastInsertRowid, score, emotions, notes };
}

function getMoodHistory(days = 7) {
  return db.prepare(`
    SELECT id, date, score, emotions, notes, created_at
    FROM moods
    WHERE date >= date('now', '-' || ? || ' days')
    ORDER BY date DESC
  `).all(days);
}

function getTodayMood() {
  return db.prepare(`
    SELECT * FROM moods
    WHERE date = date('now')
    ORDER BY created_at DESC
    LIMIT 1
  `).get();
}

function getAverageMood(days = 7) {
  const result = db.prepare(`
    SELECT ROUND(AVG(score), 1) as average,
           MIN(score)           as lowest,
           MAX(score)           as highest,
           COUNT(*)             as total_entries
    FROM moods
    WHERE date >= date('now', '-' || ? || ' days')
  `).get(days);
  return result;
}

// ══════════════════════════════════════════════════════════════════
// HABIT OPERATIONS
// ══════════════════════════════════════════════════════════════════
function logHabit(habitName, completed = true) {
  // Get or create habit
  let habit = db.prepare(`SELECT id FROM habits WHERE name = ?`).get(habitName);

  if (!habit) {
    const result = db.prepare(`INSERT INTO habits (name) VALUES (?)`).run(habitName);
    habit = { id: result.lastInsertRowid };
  }

  db.prepare(`
    INSERT INTO habit_logs (habit_id, completed)
    VALUES (?, ?)
  `).run(habit.id, completed ? 1 : 0);

  return { habit: habitName, completed, date: new Date().toISOString().split("T")[0] };
}

function getHabitStreak(habitName) {
  const rows = db.prepare(`
    SELECT hl.date, MAX(hl.completed) as completed
    FROM habit_logs hl
    JOIN habits h ON h.id = hl.habit_id
    WHERE h.name = ?
    GROUP BY hl.date
    ORDER BY hl.date DESC
    LIMIT 30
  `).all(habitName);

  let streak = 0;
  if (rows.length === 0) return { habit: habitName, streak: 0, history: [] };

  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  // If the most recent log is neither today nor yesterday, streak is reset
  const latestDate = rows[0].date;
  if (latestDate !== today && latestDate !== yesterday) {
    return { habit: habitName, streak: 0, history: rows };
  }

  let expectedDate = new Date(latestDate);
  for (const row of rows) {
    const expectedStr = expectedDate.toISOString().split("T")[0];
    if (row.date === expectedStr && row.completed === 1) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }
  return { habit: habitName, streak, history: rows };
}

function getTodayHabits() {
  return db.prepare(`
    SELECT h.name, hl.completed, hl.date
    FROM habit_logs hl
    JOIN habits h ON h.id = hl.habit_id
    WHERE hl.date = date('now')
  `).all();
}

// ══════════════════════════════════════════════════════════════════
// FITNESS OPERATIONS
// ══════════════════════════════════════════════════════════════════
function saveFitnessLog(data) {
  db.prepare(`
    INSERT INTO fitness_logs (date, steps, calories, active_minutes, sleep_hours)
    VALUES (date('now'), ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      steps          = excluded.steps,
      calories       = excluded.calories,
      active_minutes = excluded.active_minutes,
      sleep_hours    = excluded.sleep_hours
  `).run(data.steps, data.calories, data.activeMinutes, data.sleepHours);
}

function getFitnessHistory(days = 7) {
  return db.prepare(`
    SELECT * FROM fitness_logs
    WHERE date >= date('now', '-' || ? || ' days')
    ORDER BY date DESC
  `).all(days);
}

// ══════════════════════════════════════════════════════════════════
// INSIGHT QUERY — Mood vs Sleep correlation
// ══════════════════════════════════════════════════════════════════
function getMoodVsSleep(days = 14) {
  return db.prepare(`
    SELECT
      m.date,
      m.score      AS mood_score,
      f.sleep_hours,
      f.steps
    FROM moods m
    LEFT JOIN fitness_logs f ON f.date = m.date
    WHERE m.date >= date('now', '-' || ? || ' days')
    ORDER BY m.date DESC
  `).all(days);
}

// ── Export everything ─────────────────────────────────────────────
export {
  db,
  logMood,
  getMoodHistory,
  getTodayMood,
  getAverageMood,
  logHabit,
  getHabitStreak,
  getTodayHabits,
  saveFitnessLog,
  getFitnessHistory,
  getMoodVsSleep,
};