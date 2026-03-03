// week.js — My first week of mood data

const { get } = require("mongoose");

const WeekMoods = [
  { date: "2025-02-22", score: 6, emotions: ["tired", "okay"],           notes: "Slow start to the week" },
  { date: "2025-02-23", score: 8, emotions: ["focused", "energetic"],    notes: "Got a lot done today" },
  { date: "2025-02-24", score: 5, emotions: ["stressed", "anxious"],     notes: "Too many things at once" },
  { date: "2025-02-25", score: 7, emotions: ["calm", "motivated"],       notes: "Good balance today" },
  { date: "2025-02-26", score: 4, emotions: ["sad", "low energy"],       notes: "Didn't sleep well" },
  { date: "2025-02-27", score: 9, emotions: ["happy", "excited"],        notes: "Really good day" },
  { date: "2025-02-28", score: 7, emotions: ["motivated", "excited"],    notes: "Day 1 of my app!" },
];
// ── FUNCTION 1: Print all entries ─────────────────────────────────
function printAllMoods(moods) {
  console.log("\n📋 THIS WEEK'S MOOD LOG");
  console.log("═".repeat(45));

  moods.forEach(function(entry) {
    const bar = "█".repeat(entry.score) + "░".repeat(10 - entry.score);
    console.log(`📅 ${entry.date}  [${bar}] ${entry.score}/10`);
    console.log(`   💭 ${entry.emotions.join(", ")}`);
    console.log(`   📝 ${entry.notes}`);
    console.log("─".repeat(45));
  });
}

// ── FUNCTION 2: Calculate average mood ───────────────────────────
function getAverageMood(moods) {
  const total = moods.reduce(function(sum, entry) {
    return sum + entry.score;
  }, 0);

  const average = total / moods.length;
  return Math.round(average * 10) / 10; // round to 1 decimal
}

// ── FUNCTION 3: Find best day ─────────────────────────────────────
function getBestDay(moods) {
  let best = moods[0];

  moods.forEach(function(entry) {
    if (entry.score > best.score) {
      best = entry;
    }
  });

  return best;
}

// ── FUNCTION 4: Find worst day ────────────────────────────────────
function getWorstDay(moods) {
  let worst = moods[0];

  moods.forEach(function(entry) {
    if (entry.score < worst.score) {
      worst = entry;
    }
  });

  return worst;
}

// ── FUNCTION 5: Weekly summary ────────────────────────────────────
function printWeeklySummary(moods) {
  const avg   = getAverageMood(moods);
  const best  = getBestDay(moods);
  const worst = getWorstDay(moods);

  console.log("\n📊 WEEKLY SUMMARY");
  console.log("═".repeat(45));
  console.log(`📈 Average Mood:  ${avg}/10`);
  console.log(`🌟 Best Day:      ${best.date} — ${best.score}/10 (${best.notes})`);
  console.log(`⚠️  Worst Day:     ${worst.date} — ${worst.score}/10 (${worst.notes})`);
  console.log(`📅 Days Logged:   ${moods.length} days`);
  console.log("═".repeat(45));
}

function getHighDays(moods){
    return moods.filter(function(entry){
        return entry.score>=7;
    });
}
const goodDays=getHighDays(WeekMoods);
console.log(`\n🌟 HIGH MOOD DAYS (7+): ${goodDays.length} out of ${WeekMoods.length}`);
goodDays.forEach(function(entry){
    console.log(`📅 ${entry.date} — ${entry.score}/10 -${entry.notes}`);
});
// ── RUN EVERYTHING ────────────────────────────────────────────────
printAllMoods(WeekMoods);
printWeeklySummary(WeekMoods);

