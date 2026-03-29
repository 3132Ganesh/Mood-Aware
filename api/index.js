require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");

process.env.DB_PATH = path.resolve(__dirname, "../mood_tracker.db");

const { initDB }           = require("../modules/database");
const { getDuolingoStats } = require("../integrations/duolingo");
const { getLeetCodeStats } = require("../integrations/leetcode");
const { getMyTopArtists, getRecentlyPlayed } = require("../integrations/spotify");
const { generateAllInsights } = require("../modules/insights");
const { analyzeUserPatterns, getDailyMotivation } = require("../modules/goalEngine");

const app = express();
app.use(cors());
app.use(express.json());

let db;
initDB().then(d => { db = d; console.log("✅ API ready"); });

app.get("/api/snapshot", async (req, res) => {
  const mood     = db.getTodayMood();
  const avg      = db.getAverageMood(7);
  const habits   = db.getTodayHabits();
  const goal     = db.getActiveGoal();
  const progress = goal ? db.getTaskProgress(goal.id) : null;
  const tasks    = goal ? db.getTodayTasks(goal.id) : [];
  res.json({ mood, avg, habits, goal, progress, tasks });
});

app.get("/api/mood/history", (req, res) => {
  res.json(db.getMoodHistory(parseInt(req.query.days) || 14));
});

app.get("/api/mood/average", (req, res) => {
  res.json(db.getAverageMood(parseInt(req.query.days) || 7));
});

app.post("/api/mood/log", (req, res) => {
  const { score, emotions, notes } = req.body;
  res.json(db.logMood(score, emotions || [], notes || ""));
});

app.get("/api/habits", (req, res) => {
  const habits = db.getAllHabits();
  res.json(habits.map(h => ({ ...h, streak: db.getHabitStreak(h.name).streak })));
});

app.get("/api/habits/today", (req, res) => res.json(db.getTodayHabits()));

app.post("/api/habits/log", (req, res) => {
  res.json(db.logHabit(req.body.name, req.body.completed));
});

app.get("/api/insights", (req, res) => {
  const moodHistory   = db.getMoodHistory(30);
  const moodSleepData = db.getMoodVsSleep(30);
  const habits        = db.getAllHabits();
  const habitLogs     = [];
  habits.forEach(h => {
    const streak = db.getHabitStreak(h.name);
    for (let i = 0; i < Math.min(streak.streak, 30); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      habitLogs.push({ name: h.name, date: date.toISOString().split("T")[0], completed: true });
    }
  });
  res.json(generateAllInsights({ moodHistory, moodSleepData, habitLogs }));
});

app.get("/api/learning", async (req, res) => {
  const [duo, lc] = await Promise.all([
    getDuolingoStats(process.env.DUOLINGO_USERNAME),
    getLeetCodeStats(process.env.LEETCODE_USERNAME),
  ]);
  res.json({ duolingo: duo, leetcode: lc });
});
// POST - Log goal progress note
app.post("/api/goal-progress", (req, res) => {
  try {
    const { note, mood_score } = req.body;
    const db = global.moodDB;
    db.run(
      `INSERT INTO goal_progress_notes (note, mood_score) VALUES (?, ?)`,
      [note, mood_score || null]
    );
    res.json({ success: true, message: "Progress note logged" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Get goal progress notes
app.get("/api/goal-progress", (req, res) => {
  try {
    const days = req.query.days || 30;
    const db = global.moodDB;
    const result = db.exec(
      `SELECT * FROM goal_progress_notes WHERE date >= date('now', '-${days} days') ORDER BY date DESC`
    );
    const notes = result.length > 0 ? result[0].values : [];
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/spotify", async (req, res) => {
  const [artists, recent] = await Promise.all([
    getMyTopArtists(5),
    getRecentlyPlayed(20),
  ]);
  res.json({ artists, recent });
});

app.get("/api/goal", (req, res) => {
  const goal = db.getActiveGoal();
  if (!goal) return res.json(null);
  res.json({ goal, phases: db.getGoalPhases(goal.id), progress: db.getTaskProgress(goal.id), tasks: db.getTodayTasks(goal.id) });
});

app.get("/api/motivation", (req, res) => {
  const goal      = db.getActiveGoal();
  const todayMood = db.getTodayMood();
  const moodScore = todayMood?.score || 7;
  const patterns  = analyzeUserPatterns(db);
  const message   = getDailyMotivation(moodScore, goal?.title || "your goal", patterns.duoStreak, patterns);
  res.json({ message, moodScore });
});

app.post("/api/sweatcoin/log", (req, res) => {
  const { steps, coins, notes } = req.body;
  res.json(db.logSweatcoin(steps, coins, notes || ""));
});

app.get("/api/sweatcoin/history", (req, res) => {
  res.json(db.getSweatcoinHistory(parseInt(req.query.days) || 7));
});

app.listen(4000, () => console.log("🚀 API running on http://localhost:4000"));