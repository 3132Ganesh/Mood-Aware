// script/testWeekendReport.js

require("dotenv").config();
const { initDB }                                  = require("../modules/database");
const { generateWeekendReport, formatWeekendReport } = require("../modules/weekendReport");
const { getDuolingoStats }                        = require("../integrations/duolingo");
const { getLeetCodeStats }                        = require("../integrations/leetcode");

async function test() {
  const db  = await initDB();
  const duo = await getDuolingoStats(process.env.DUOLINGO_USERNAME);
  const lc  = await getLeetCodeStats(process.env.LEETCODE_USERNAME);

  const moodHistory = db.getMoodHistory(14);

  // Build habit logs
  const habits    = db.getAllHabits();
  const habitLogs = [];
  habits.forEach(h => {
    const streak = db.getHabitStreak(h.name);
    for (let i = 0; i < Math.min(streak.streak, 14); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      habitLogs.push({
        name:      h.name,
        date:      date.toISOString().split("T")[0],
        completed: true,
      });
    }
  });

  const report    = generateWeekendReport({ moodHistory, habitLogs, duoStats: duo, lcStats: lc });
  const formatted = formatWeekendReport(report);

  console.log(formatted);
  console.log("✅ Weekend report done!\n");
}

test().catch(console.error);