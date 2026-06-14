require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");

process.env.DB_PATH = path.resolve(__dirname, "../mood_tracker.db");

const { initDB }           = require("../modules/database");
const { getDuolingoStats } = require("../integrations/duolingo");
const { getLeetCodeStats } = require("../integrations/leetcode");
const { getMyTopArtists, getRecentlyPlayed, getRecentlyPlayedMood } = require("../integrations/spotify");

// ... (in the routes section)
app.get("/api/spotify/mood", async (req, res) => {
  try {
    const moodData = await getRecentlyPlayedMood(20);
    res.json(moodData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Spotify mood" });
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