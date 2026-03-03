// test_db.js — Test every database operation

const db = require("./modules/database");

console.log("\n🗄️  DATABASE TEST — mood_tracker.db\n");
console.log("═".repeat(45));

// ── Insert some moods ─────────────────────────────────────────────
console.log("\n📝 Inserting mood entries...");
db.logMood(7, ["motivated", "focused"],    "Day 4 done, building fast!");
db.logMood(8, ["excited", "energetic"],    "SQLite is working!");
db.logMood(6, ["tired", "okay"],           "Long day but productive");

// ── Insert some habits ────────────────────────────────────────────
console.log("📝 Logging habits...");
db.logHabit("Morning Walk",  true);
db.logHabit("Duolingo",      true);
db.logHabit("LeetCode",      false);
db.logHabit("Morning Walk",  true);
db.logHabit("Duolingo",      true);

// ── Insert fitness data ───────────────────────────────────────────
console.log("📝 Saving fitness data...");
db.saveFitnessLog({ steps: 9200, calories: 2300, activeMinutes: 52, sleepHours: 7.5 });

// ── Read everything back ──────────────────────────────────────────
console.log("\n📊 MOOD HISTORY (last 7 days)");
console.log("─".repeat(45));
const moods = db.getMoodHistory(7);
moods.forEach(m => {
  console.log(`  ${m.date} | ${m.score}/10 | ${m.emotions} | ${m.notes}`);
});

console.log("\n📊 MOOD AVERAGES");
console.log("─".repeat(45));
const avg = db.getAverageMood(7);
console.log(`  Average: ${avg.average}/10`);
console.log(`  Lowest:  ${avg.lowest}/10`);
console.log(`  Highest: ${avg.highest}/10`);
console.log(`  Entries: ${avg.total_entries}`);

console.log("\n📊 HABIT STREAKS");
console.log("─".repeat(45));
const walk   = db.getHabitStreak("Morning Walk");
const duo    = db.getHabitStreak("Duolingo");
const leet   = db.getHabitStreak("LeetCode");
console.log(`  Morning Walk: ${walk.streak} day streak`);
console.log(`  Duolingo:     ${duo.streak} day streak`);
console.log(`  LeetCode:     ${leet.streak} day streak`);

console.log("\n📊 FITNESS LOG");
console.log("─".repeat(45));
const fitness = db.getFitnessHistory(7);
fitness.forEach(f => {
  console.log(`  ${f.date} | Steps: ${f.steps} | Sleep: ${f.sleep_hours}h | Active: ${f.active_minutes}m`);
});

console.log("\n📊 MOOD vs SLEEP CORRELATION");
console.log("─".repeat(45));
const correlation = db.getMoodVsSleep(14);
correlation.forEach(r => {
  console.log(`  ${r.date} | Mood: ${r.mood_score}/10 | Sleep: ${r.sleep_hours ?? "no data"}h | Steps: ${r.steps ?? "no data"}`);
});

console.log("\n" + "═".repeat(45));
console.log("✅ All database operations working!\n");