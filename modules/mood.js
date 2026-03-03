// modules/mood.js — Mood logic module

const weekMoods = [
  { date: "2025-02-22", score: 6, emotions: ["tired", "okay"],        notes: "Slow start to the week" },
  { date: "2025-02-23", score: 8, emotions: ["focused", "energetic"], notes: "Got a lot done today" },
  { date: "2025-02-24", score: 5, emotions: ["stressed", "anxious"],  notes: "Too many things at once" },
  { date: "2025-02-25", score: 7, emotions: ["calm", "motivated"],    notes: "Good balance today" },
  { date: "2025-02-26", score: 4, emotions: ["sad", "low energy"],    notes: "Didn't sleep well" },
  { date: "2025-02-27", score: 9, emotions: ["happy", "excited"],     notes: "Really good day" },
  { date: "2025-02-28", score: 7, emotions: ["motivated", "excited"], notes: "Day 1 of my app!" },
];

function getAverageMood(moods) {
  const total = moods.reduce((sum, entry) => sum + entry.score, 0);
  return Math.round((total / moods.length) * 10) / 10;
}

function getBestDay(moods) {
  return moods.reduce((best, entry) => entry.score > best.score ? entry : best, moods[0]);
}

function getWorstDay(moods) {
  return moods.reduce((worst, entry) => entry.score < worst.score ? entry : worst, moods[0]);
}

function getHighDays(moods) {
  return moods.filter(entry => entry.score >= 7);
}

// ← THIS is how you share code between files
module.exports = {
  weekMoods,
  getAverageMood,
  getBestDay,
  getWorstDay,
  getHighDays,
};