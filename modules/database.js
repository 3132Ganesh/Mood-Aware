// modules/database.js — SQLite via sql.js (pure JS, no native bindings)

const initSqlJs  = require("sql.js");
const fs         = require("fs");
const path       = require("path");
const { config } = require("./config");
const logger     = require("./logger");

const DB_PATH = path.resolve(config.db.path);

let db; // will be initialized async

async function initDB() {
  const SQL = await initSqlJs();

  // Load existing DB file or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Save helper — writes DB to disk after every write operation
  function save() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  // ── Create tables ───────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    score INTEGER NOT NULL,
    emotions TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT DEFAULT (date('now')),
    completed INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS fitness_logs (
    date TEXT PRIMARY KEY,
    steps INTEGER DEFAULT 0,
    calories INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    sleep_hours REAL DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS spotify_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    valence INTEGER,
    energy INTEGER,
    inferred_mood TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
)`);

db.run(`CREATE TABLE IF NOT EXISTS goal_phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL,
  phase_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  status TEXT DEFAULT 'pending'
)`);

db.run(`CREATE TABLE IF NOT EXISTS daily_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL,
  phase_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_mins INTEGER DEFAULT 20,
  difficulty TEXT DEFAULT 'medium'
)`);

db.run(`CREATE TABLE IF NOT EXISTS task_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  date TEXT DEFAULT (date('now')),
  completed INTEGER DEFAULT 0,
  mood_at_completion INTEGER,
  notes TEXT
)`);

  save();
  logger.ok("Database initialized — " + DB_PATH);

  // ── Helper: run a query that returns rows ──────────────────────
  function all(sql, params = []) {
    const stmt   = db.prepare(sql);
    stmt.bind(params);
    const rows   = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  // ── Helper: run a query that returns one row ───────────────────
  function get(sql, params = []) {
    const rows = all(sql, params);
    return rows[0] || null;
  }

  // ── Helper: run INSERT/UPDATE/DELETE ──────────────────────────
  function run(sql, params = []) {
    db.run(sql, params);
    save();
    return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0][0] };
  }

  // ══════════════════════════════════════════════════════════════
  // MOOD OPERATIONS
  // ══════════════════════════════════════════════════════════════
  function logMood(score, emotions = [], notes = "") {
    const result = run(
      "INSERT INTO moods (score, emotions, notes) VALUES (?, ?, ?)",
      [score, emotions.join(","), notes]
    );
    return { id: result.lastInsertRowid, score, emotions, notes };
  }

  function getMoodHistory(days = 7) {
    return all(
      `SELECT id, date, score, emotions, notes FROM moods
       WHERE date >= date('now', '-' || ? || ' days')
       ORDER BY date DESC`,
      [days]
    );
  }

  function getTodayMood() {
    return get(
      "SELECT * FROM moods WHERE date = date('now') ORDER BY created_at DESC LIMIT 1"
    );
  }

  function getAverageMood(days = 7) {
    const rows = all(
      `SELECT score FROM moods
       WHERE date >= date('now', '-' || ? || ' days')`,
      [days]
    );
    if (!rows.length) return { average: null, lowest: null, highest: null, total_entries: 0 };
    const scores = rows.map(r => r.score);
    const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      average:       Math.round(avg * 10) / 10,
      lowest:        Math.min(...scores),
      highest:       Math.max(...scores),
      total_entries: scores.length,
    };
  }

  // ══════════════════════════════════════════════════════════════
  // HABIT OPERATIONS
  // ══════════════════════════════════════════════════════════════
  function logHabit(habitName, completed = true) {
    let habit = get("SELECT id FROM habits WHERE name = ?", [habitName]);
    if (!habit) {
      const result = run("INSERT INTO habits (name) VALUES (?)", [habitName]);
      habit = { id: result.lastInsertRowid };
    }
    run("INSERT INTO habit_logs (habit_id, completed) VALUES (?, ?)", [habit.id, completed ? 1 : 0]);
    return { habit: habitName, completed };
  }

  function getHabitStreak(habitName) {
    const rows = all(
      `SELECT hl.date, hl.completed FROM habit_logs hl
       JOIN habits h ON h.id = hl.habit_id
       WHERE h.name = ? ORDER BY hl.date DESC LIMIT 30`,
      [habitName]
    );
    let streak = 0;
    for (const row of rows) {
      if (row.completed) streak++;
      else break;
    }
    return { habit: habitName, streak };
  }

  function getAllHabits() {
    return all("SELECT * FROM habits ORDER BY name ASC");
  }

  function getTodayHabits() {
    return all(
      `SELECT h.name, hl.completed FROM habit_logs hl
       JOIN habits h ON h.id = hl.habit_id
       WHERE hl.date = date('now')`
    );
  }

  // ══════════════════════════════════════════════════════════════
  // FITNESS OPERATIONS
  // ══════════════════════════════════════════════════════════════
  function saveFitnessLog(data) {
    run(
      `INSERT INTO fitness_logs (date, steps, calories, active_minutes, sleep_hours)
       VALUES (date('now'), ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         steps = excluded.steps,
         calories = excluded.calories,
         active_minutes = excluded.active_minutes,
         sleep_hours = excluded.sleep_hours`,
      [data.steps, data.calories, data.activeMinutes, data.sleepHours]
    );
  }

  function getFitnessHistory(days = 7) {
    return all(
      `SELECT * FROM fitness_logs
       WHERE date >= date('now', '-' || ? || ' days')
       ORDER BY date DESC`,
      [days]
    );
  }

  function getMoodVsSleep(days = 14) {
    return all(
      `SELECT m.date, m.score AS mood_score, f.sleep_hours, f.steps
       FROM moods m
       LEFT JOIN fitness_logs f ON f.date = m.date
       WHERE m.date >= date('now', '-' || ? || ' days')
       ORDER BY m.date DESC`,
      [days]
    );
  }
// ══════════════════════════════════════════════════════════════════
// GOAL OPERATIONS
// ══════════════════════════════════════════════════════════════════
function createGoal(title, description, targetDate) {
  const result = run(
    "INSERT INTO goals (title, description, target_date) VALUES (?, ?, ?)",
    [title, description, targetDate]
  );
  return { id: result.lastInsertRowid, title, description, targetDate };
}

function getActiveGoal() {
  return get("SELECT * FROM goals WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
}

function createPhase(goalId, phaseNumber, title, durationWeeks) {
  const result = run(
    "INSERT INTO goal_phases (goal_id, phase_number, title, duration_weeks) VALUES (?, ?, ?, ?)",
    [goalId, phaseNumber, title, durationWeeks]
  );
  return { id: result.lastInsertRowid, goalId, phaseNumber, title, durationWeeks };
}

function getGoalPhases(goalId) {
  return all("SELECT * FROM goal_phases WHERE goal_id = ? ORDER BY phase_number", [goalId]);
}

function createTask(goalId, phaseId, title, description, estimatedMins, difficulty) {
  const result = run(
    "INSERT INTO daily_tasks (goal_id, phase_id, title, description, estimated_mins, difficulty) VALUES (?, ?, ?, ?, ?, ?)",
    [goalId, phaseId, title, description, estimatedMins, difficulty]
  );
  return { id: result.lastInsertRowid, title };
}

function getTasksForPhase(phaseId) {
  return all("SELECT * FROM daily_tasks WHERE phase_id = ?", [phaseId]);
}

function logTask(taskId, completed, moodScore, notes = "") {
  run(
    "INSERT INTO task_logs (task_id, completed, mood_at_completion, notes) VALUES (?, ?, ?, ?)",
    [taskId, completed ? 1 : 0, moodScore, notes]
  );
  return { taskId, completed };
}

function getTaskProgress(goalId) {
  const total     = all("SELECT COUNT(*) as count FROM daily_tasks WHERE goal_id = ?", [goalId])[0]?.count || 0;
  const completed = all(
    "SELECT COUNT(*) as count FROM task_logs WHERE completed = 1 AND task_id IN (SELECT id FROM daily_tasks WHERE goal_id = ?)",
    [goalId]
  )[0]?.count || 0;
  return { total, completed, percentage: total ? Math.round(completed / total * 100) : 0 };
}

function getTodayTasks(goalId) {
  return all(
    `SELECT dt.* FROM daily_tasks dt
     JOIN goal_phases gp ON gp.id = dt.phase_id
     WHERE dt.goal_id = ? AND gp.status = 'active'
     LIMIT 3`,
    [goalId]
  );
}
  return {
    logMood, getMoodHistory, getTodayMood, getAverageMood,
    logHabit, getHabitStreak, getAllHabits, getTodayHabits,
    saveFitnessLog, getFitnessHistory, getMoodVsSleep,
    createGoal, getActiveGoal, createPhase, getGoalPhases, createTask, getTasksForPhase, logTask, getTaskProgress, getTodayTasks
  };
}

module.exports = { initDB };