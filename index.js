// index.js — Main entry point

const { validateConfig } = require("./modules/config");
const logger             = require("./modules/logger");

// Always validate config first
validateConfig();

const { weekMoods, getAverageMood, getBestDay, getWorstDay, getHighDays } = require("./modules/mood");
const { fetchFitnessData, analyzeFitness } = require("./modules/fitness");

async function runDailyReport() {
  logger.info("Starting daily report...");

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║      MOOD-AWARE APP — DAY 6          ║");
  console.log("╚══════════════════════════════════════╝\n");

  // ── Mood Analysis ──────────────────────────────────────
  console.log("😊 MOOD ANALYSIS");
  console.log("─".repeat(40));
  console.log(`  Average this week:  ${getAverageMood(weekMoods)}/10`);
  console.log(`  Best day:           ${getBestDay(weekMoods).date} — ${getBestDay(weekMoods).score}/10`);
  console.log(`  Worst day:          ${getWorstDay(weekMoods).date} — ${getWorstDay(weekMoods).score}/10`);
  console.log(`  High mood days:     ${getHighDays(weekMoods).length} out of ${weekMoods.length}`);

  // ── Fitness Analysis ───────────────────────────────────
  console.log("\n🏃 FITNESS ANALYSIS");
  console.log("─".repeat(40));

  const fitness = await fetchFitnessData("ganesh_nayak");
  console.log(`  Steps:             ${fitness.steps.toLocaleString()}`);
  console.log(`  Sleep:             ${fitness.sleepHours} hours`);
  console.log(`  Active minutes:    ${fitness.activeMinutes}`);
  console.log(`  Calories:          ${fitness.calories.toLocaleString()}`);

  console.log("\n💡 FITNESS INSIGHTS");
  console.log("─".repeat(40));
  const insights = analyzeFitness(fitness);
  insights.forEach(insight => console.log(`  ${insight}`));
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
  // ── Summary ────────────────────────────────────────────
  console.log("\n📊 TODAY'S QUICK SUMMARY");
  console.log("─".repeat(40));

  const avgMood  = getAverageMood(weekMoods);
  const moodLabel  = avgMood >= 7 ? "🟢 Good"   : avgMood >= 5 ? "🟡 Okay"   : "🔴 Rough";
  const stepLabel  = fitness.steps >= 8000 ? "🟢 Active" : fitness.steps >= 5000 ? "🟡 Moderate" : "🔴 Low";
  const sleepLabel = fitness.sleepHours >= 7 ? "🟢 Rested" : fitness.sleepHours >= 6 ? "🟡 Okay"  : "🔴 Tired";

  console.log(`  Mood this week:   ${moodLabel} (${avgMood}/10)`);
  console.log(`  Movement today:   ${stepLabel} (${fitness.steps.toLocaleString()} steps)`);
  console.log(`  Sleep last night: ${sleepLabel} (${fitness.sleepHours}h)`);
  console.log("\n" + "═".repeat(40));

  logger.ok("Daily report complete!");
}

runDailyReport();