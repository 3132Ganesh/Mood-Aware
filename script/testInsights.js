// scripts/testInsights.js

require("dotenv").config();
const { initDB }            = require("../modules/database");
const { generateAllInsights } = require("../modules/insights");

async function test() {
  const db = await initDB();

  console.log("\n🧠 INSIGHT ENGINE TEST\n" + "═".repeat(45));

  // Get all data needed
  const moodHistory   = db.getMoodHistory(30);
  const moodSleepData = db.getMoodVsSleep(30);

  // Build habit logs from DB
  const habits    = db.getAllHabits();
  const habitLogs = [];
  habits.forEach(h => {
    const streak = db.getHabitStreak(h.name);
    // Simulate habit logs from streak data
    for (let i = 0; i < streak.streak; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      habitLogs.push({
        name:      h.name,
        date:      date.toISOString().split("T")[0],
        completed: true,
      });
    }
  });

  const insights = generateAllInsights({ moodHistory, moodSleepData, habitLogs });

  console.log("\n📈 MOOD TREND");
  console.log("  " + insights.trend.insight);
  if (insights.trend.avgFirstHalf) {
    console.log(`  First half avg: ${insights.trend.avgFirstHalf}/10`);
    console.log(`  Second half avg: ${insights.trend.avgSecondHalf}/10`);
  }

  console.log("\n💤 SLEEP IMPACT");
  console.log("  " + insights.sleep.insight);
  if (insights.sleep.avgMoodGoodSleep) {
    console.log(`  Good sleep (7h+): ${insights.sleep.avgMoodGoodSleep}/10`);
    console.log(`  Poor sleep (<7h): ${insights.sleep.avgMoodPoorSleep}/10`);
  }

  console.log("\n📅 BEST DAY OF WEEK");
  console.log("  " + insights.bestDay.insight);
  if (insights.bestDay.dayAverages) {
    insights.bestDay.dayAverages.forEach(d => {
      const bar = "█".repeat(Math.round(d.avg));
      console.log(`  ${d.day.padEnd(12)} ${bar} ${d.avg}/10 (${d.count} entries)`);
    });
  }

  console.log("\n🏆 HABIT IMPACT");
  if (insights.habits.impacts.length > 0) {
    insights.habits.impacts.forEach(h => console.log("  " + h.insight));
  } else {
    console.log("  " + insights.habits.insight);
  }

  console.log("\n" + "═".repeat(45));
  console.log("✅ Insight engine working!\n");
}

test().catch(console.error);