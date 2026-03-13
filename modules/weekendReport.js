// modules/weekendReport.js — Weekly comparative report

const logger = require("./logger");

function getWeekRange(weeksAgo = 0) {
  const now      = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const monday   = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1 - weeksAgo * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday   = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split("T")[0],
    end:   sunday.toISOString().split("T")[0],
  };
}

function filterByWeek(entries, dateField, weekRange) {
  return entries.filter(e => {
    const d = e[dateField];
    return d >= weekRange.start && d <= weekRange.end;
  });
}

function average(arr) {
  if (!arr.length) return null;
  return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 10) / 10;
}

function generateWeekendReport(data) {
  const { moodHistory, habitLogs, duoStats, lcStats, spotifyRecent } = data;

  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(1);

  logger.info("Generating weekend report...");

  // ── MOOD ────────────────────────────────────────────────────────
  const moodThis = filterByWeek(moodHistory, "date", thisWeek);
  const moodLast = filterByWeek(moodHistory, "date", lastWeek);

  const avgMoodThis = average(moodThis.map(m => m.score));
  const avgMoodLast = average(moodLast.map(m => m.score));
  const moodDiff    = avgMoodThis && avgMoodLast
    ? Math.round((avgMoodThis - avgMoodLast) * 10) / 10
    : null;

  const moodTrend = moodDiff === null ? "no data"
    : moodDiff >= 1   ? "📈 Much better"
    : moodDiff >= 0.3 ? "📈 Slightly better"
    : moodDiff <= -1  ? "📉 Much worse"
    : moodDiff <= -0.3? "📉 Slightly worse"
    : "➡️  About the same";

  // ── HABITS ──────────────────────────────────────────────────────
  const habitsThis = filterByWeek(habitLogs, "date", thisWeek);
  const habitsLast = filterByWeek(habitLogs, "date", lastWeek);

  const completedThis = habitsThis.filter(h => h.completed).length;
  const completedLast = habitsLast.filter(h => h.completed).length;
  const habitDiff     = completedThis - completedLast;

  // ── DUOLINGO ────────────────────────────────────────────────────
  const duoStreak = duoStats?.streak || 0;
  const duoXP     = duoStats?.totalXP || 0;

  // ── LEETCODE ────────────────────────────────────────────────────
  const lcSolved  = lcStats?.solved?.total || 0;
  const lcStreak  = lcStats?.streak || 0;

  // ── BUILD REPORT ────────────────────────────────────────────────
  const report = {
    period: {
      thisWeek,
      lastWeek,
    },
    mood: {
      thisWeekAvg:  avgMoodThis,
      lastWeekAvg:  avgMoodLast,
      diff:         moodDiff,
      trend:        moodTrend,
      entriesThis:  moodThis.length,
      entriesLast:  moodLast.length,
      emotions:     [...new Set(moodThis.flatMap(m => m.emotions?.split(",") || []))].filter(Boolean),
    },
    habits: {
      completedThis,
      completedLast,
      diff:         habitDiff,
      trend:        habitDiff > 0 ? "📈 More consistent" : habitDiff < 0 ? "📉 Less consistent" : "➡️  Same",
    },
    learning: {
      duoStreak,
      duoXP,
      lcSolved,
      lcStreak,
    },
    generatedAt: new Date().toISOString(),
  };

  return report;
}

function formatWeekendReport(report) {
  const { mood, habits, learning, period } = report;

  let out = `\n📊 WEEKEND REPORT\n${"═".repeat(45)}\n`;
  out += `📅 ${period.thisWeek.start} → ${period.thisWeek.end}\n`;

  // Mood section
  out += `\n😊 MOOD\n${"─".repeat(30)}\n`;
  if (mood.thisWeekAvg) {
    out += `  This week:   ${mood.thisWeekAvg}/10\n`;
    out += `  Last week:   ${mood.lastWeekAvg || "no data"}/10\n`;
    out += `  Trend:       ${mood.trend}\n`;
    out += `  Entries:     ${mood.entriesThis} this week\n`;
    if (mood.emotions.length > 0) {
      out += `  Emotions:    ${mood.emotions.join(", ")}\n`;
    }
  } else {
    out += `  No mood data this week — keep logging!\n`;
  }

  // Habits section
  out += `\n✅ HABITS\n${"─".repeat(30)}\n`;
  out += `  This week:   ${habits.completedThis} completed\n`;
  out += `  Last week:   ${habits.completedLast} completed\n`;
  out += `  Trend:       ${habits.trend}\n`;

  // Learning section
  out += `\n📚 LEARNING\n${"─".repeat(30)}\n`;
  out += `  🦉 Duolingo streak:  🔥 ${learning.duoStreak} days\n`;
  out += `  🦉 Total XP:         ${learning.duoXP?.toLocaleString()}\n`;
  out += `  💻 LeetCode solved:  ${learning.lcSolved} problems\n`;
  out += `  💻 LeetCode streak:  ${learning.lcStreak} days\n`;

  // Weekly verdict
  out += `\n🏆 WEEKLY VERDICT\n${"─".repeat(30)}\n`;
  const wins = [];
  const improvements = [];

  if (mood.diff >= 0.3)       wins.push("Mood improved");
  if (habits.completedThis >= habits.completedLast) wins.push("Habits consistent");
  if (learning.duoStreak > 0) wins.push(`Duolingo streak alive 🔥`);
  if (learning.lcSolved > 0)  wins.push("LeetCode progress");

  if (mood.diff < 0)          improvements.push("Focus on mood next week");
  if (habits.completedThis < habits.completedLast) improvements.push("Push harder on habits");

  if (wins.length > 0) {
    out += `  ✅ Wins:\n`;
    wins.forEach(w => out += `     • ${w}\n`);
  }

  if (improvements.length > 0) {
    out += `  💪 Improve next week:\n`;
    improvements.forEach(i => out += `     • ${i}\n`);
  }

  out += `\n${"═".repeat(45)}\n`;
  return out;
}

module.exports = { generateWeekendReport, formatWeekendReport, getWeekRange };