const { initDB } = require("./modules/database");

async function runTests() {
  const db = await initDB();

  console.log("\n🗄️  DATABASE TEST\n" + "═".repeat(45));

  db.logMood(7, ["motivated", "focused"], "Day 7 — MCP server day!");
  db.logMood(8, ["excited", "energetic"], "sql.js working perfectly!");

  db.logHabit("Morning Walk", true);
  db.logHabit("Duolingo",     true);
  db.logHabit("LeetCode",     false);

  db.saveFitnessLog({ steps: 9200, calories: 2300, activeMinutes: 52, sleepHours: 7.5 });

  const moods   = db.getMoodHistory(7);
  const avg     = db.getAverageMood(7);
  const fitness = db.getFitnessHistory(7);

  console.log("\n📊 MOOD HISTORY");
  moods.forEach(m => console.log(`  ${m.date} | ${m.score}/10 | ${m.emotions}`));

  console.log("\n📊 AVERAGES");
  console.log(`  Avg: ${avg.average}/10 | Low: ${avg.lowest} | High: ${avg.highest}`);

  console.log("\n📊 FITNESS");
  fitness.forEach(f => console.log(`  ${f.date} | ${f.steps} steps | ${f.sleep_hours}h sleep`));

  console.log("\n✅ All tests passed!\n");
}

runTests().catch(console.error);