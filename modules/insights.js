// modules/insights.js — Mood pattern analysis engine

const logger = require("./logger");

// ══════════════════════════════════════════════════════════════════
// PATTERN 1 — Mood vs Sleep correlation
// "Do you feel better when you sleep more?"
// ══════════════════════════════════════════════════════════════════
function analyzeMoodVsSleep(moodSleepData) {
  if (!moodSleepData || moodSleepData.length < 3) {
    return { insight: "Not enough data yet — keep logging!", correlation: null };
  }

  const withSleep = moodSleepData.filter(d => d.sleep_hours > 0);
  if (withSleep.length < 3) {
    return { insight: "Need more fitness data to find sleep patterns.", correlation: null };
  }

  const goodSleep  = withSleep.filter(d => d.sleep_hours >= 7);
  const poorSleep  = withSleep.filter(d => d.sleep_hours < 7);

  const avgMoodGoodSleep = goodSleep.length
    ? Math.round(goodSleep.reduce((s, d) => s + d.mood_score, 0) / goodSleep.length * 10) / 10
    : null;

  const avgMoodPoorSleep = poorSleep.length
    ? Math.round(poorSleep.reduce((s, d) => s + d.mood_score, 0) / poorSleep.length * 10) / 10
    : null;

  let insight = "";
  let correlation = "neutral";

  if (avgMoodGoodSleep && avgMoodPoorSleep) {
    const diff = avgMoodGoodSleep - avgMoodPoorSleep;
    if (diff >= 1.5) {
      insight = `💤 Sleep makes a BIG difference for you! Mood is ${diff} points higher on 7h+ sleep days.`;
      correlation = "strong_positive";
    } else if (diff >= 0.5) {
      insight = `💤 Sleep helps your mood. You score ${diff} points higher on well-rested days.`;
      correlation = "moderate_positive";
    } else if (diff <= -0.5) {
      insight = `💤 Interesting — your mood doesn't drop much on low sleep days. You're resilient!`;
      correlation = "negative";
    } else {
      insight = `💤 Sleep doesn't seem to strongly affect your mood yet. Keep logging!`;
      correlation = "neutral";
    }
  } else {
    insight = "💤 Need data from both good and poor sleep nights to compare.";
  }

  return {
    insight,
    correlation,
    avgMoodGoodSleep,
    avgMoodPoorSleep,
    goodSleepDays: goodSleep.length,
    poorSleepDays: poorSleep.length,
  };
}

// ══════════════════════════════════════════════════════════════════
// PATTERN 2 — Mood trend (improving or declining?)
// "Is your mood getting better or worse over time?"
// ══════════════════════════════════════════════════════════════════
function analyzeMoodTrend(moodHistory) {
  if (!moodHistory || moodHistory.length < 4) {
    return { insight: "Need at least 4 days of data to find trends.", trend: null };
  }

  const sorted   = [...moodHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const half     = Math.floor(sorted.length / 2);
  const firstHalf  = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);

  const avgFirst  = firstHalf.reduce((s, d) => s + d.score, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, d) => s + d.score, 0) / secondHalf.length;
  const diff      = Math.round((avgSecond - avgFirst) * 10) / 10;

  let insight = "";
  let trend   = "";

  if (diff >= 1) {
    insight = `📈 Your mood is IMPROVING! Up ${diff} points compared to earlier this period.`;
    trend   = "improving";
  } else if (diff >= 0.3) {
    insight = `📈 Slight upward trend — mood is slowly getting better (+${diff}).`;
    trend   = "slightly_improving";
  } else if (diff <= -1) {
    insight = `📉 Your mood has been declining (${diff} points). Worth reflecting on what changed.`;
    trend   = "declining";
  } else if (diff <= -0.3) {
    insight = `📉 Slight downward trend in mood (${diff}). Keep an eye on this.`;
    trend   = "slightly_declining";
  } else {
    insight = `➡️  Your mood is stable. Consistent is good!`;
    trend   = "stable";
  }

  return {
    insight,
    trend,
    avgFirstHalf:  Math.round(avgFirst  * 10) / 10,
    avgSecondHalf: Math.round(avgSecond * 10) / 10,
    diff,
  };
}

// ══════════════════════════════════════════════════════════════════
// PATTERN 3 — Best and worst days of week
// "Which day do you feel best?"
// ══════════════════════════════════════════════════════════════════
function analyzeBestDayOfWeek(moodHistory) {
  if (!moodHistory || moodHistory.length < 7) {
    return { insight: "Need at least 7 entries to find your best day.", bestDay: null };
  }

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayScores = {};

  moodHistory.forEach(entry => {
    const day = days[new Date(entry.date).getDay()];
    if (!dayScores[day]) dayScores[day] = [];
    dayScores[day].push(entry.score);
  });

  const dayAverages = Object.entries(dayScores)
    .filter(([, scores]) => scores.length > 0)
    .map(([day, scores]) => ({
      day,
      avg:   Math.round(scores.reduce((s, v) => s + v, 0) / scores.length * 10) / 10,
      count: scores.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  const best  = dayAverages[0];
  const worst = dayAverages[dayAverages.length - 1];

  return {
    insight: `📅 Best day: ${best.day} (avg ${best.avg}/10) | Worst day: ${worst.day} (avg ${worst.avg}/10)`,
    bestDay:  best.day,
    worstDay: worst.day,
    dayAverages,
  };
}

// ══════════════════════════════════════════════════════════════════
// PATTERN 4 — Habit impact on mood
// "Which habits actually improve your mood?"
// ══════════════════════════════════════════════════════════════════
function analyzeHabitImpact(moodHistory, habitLogs) {
  if (!moodHistory || moodHistory.length < 5 || !habitLogs || habitLogs.length < 5) {
    return { insight: "Need more mood + habit data to find correlations.", impacts: [] };
  }

  const moodByDate = {};
  moodHistory.forEach(m => { moodByDate[m.date] = m.score; });

  const habitNames = [...new Set(habitLogs.map(h => h.name))];
  const impacts    = [];

  habitNames.forEach(habitName => {
    const doneDays    = habitLogs.filter(h => h.name === habitName && h.completed);
    const notDoneDays = habitLogs.filter(h => h.name === habitName && !h.completed);

    const moodWhenDone    = doneDays.map(h => moodByDate[h.date]).filter(Boolean);
    const moodWhenNotDone = notDoneDays.map(h => moodByDate[h.date]).filter(Boolean);

    if (moodWhenDone.length < 2) return;

    const avgDone    = moodWhenDone.reduce((s, v) => s + v, 0) / moodWhenDone.length;
    const avgNotDone = moodWhenNotDone.length
      ? moodWhenNotDone.reduce((s, v) => s + v, 0) / moodWhenNotDone.length
      : null;

    const diff = avgNotDone !== null
      ? Math.round((avgDone - avgNotDone) * 10) / 10
      : null;

    impacts.push({
      habit:       habitName,
      avgMoodDone: Math.round(avgDone * 10) / 10,
      avgMoodSkipped: avgNotDone ? Math.round(avgNotDone * 10) / 10 : "no skip data",
      moodBoost:   diff,
      insight:     diff !== null
        ? diff >= 0.5
          ? `✅ ${habitName} boosts your mood by +${diff} points!`
          : diff <= -0.5
          ? `⚠️  ${habitName} shows lower mood days — maybe timing issue?`
          : `➡️  ${habitName} has neutral mood impact`
        : `✅ ${habitName} — avg mood ${Math.round(avgDone * 10) / 10}/10 on completion days`,
    });
  });

  impacts.sort((a, b) => (b.moodBoost || 0) - (a.moodBoost || 0));

  return {
    insight: impacts.length > 0
      ? `🏆 Most impactful habit: ${impacts[0].habit}`
      : "Keep logging habits to see their impact!",
    impacts,
  };
}

// ══════════════════════════════════════════════════════════════════
// MASTER — Run all insights at once
// ══════════════════════════════════════════════════════════════════
function generateAllInsights(data) {
  const { moodHistory, moodSleepData, habitLogs } = data;

  logger.info("Generating insights...");

  return {
    trend:      analyzeMoodTrend(moodHistory),
    sleep:      analyzeMoodVsSleep(moodSleepData),
    bestDay:    analyzeBestDayOfWeek(moodHistory),
    habits:     analyzeHabitImpact(moodHistory, habitLogs),
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  analyzeMoodTrend,
  analyzeMoodVsSleep,
  analyzeBestDayOfWeek,
  analyzeHabitImpact,
  generateAllInsights,
};