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