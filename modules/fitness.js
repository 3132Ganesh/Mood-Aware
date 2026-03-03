// modules/fitness.js — Fitness logic module

async function fetchFitnessData(userId) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve({
        userId,
        steps:         8432,
        sleepHours:    7.5,
        activeMinutes: 45,
        calories:      2100,
      });
    }, 1000);
  });
}

function analyzeFitness(data) {
  const insights = [];

  if (data.steps >= 8000) {
    insights.push("✅ Great step count today — above 8k target!");
  } else if (data.steps >= 5000) {
    insights.push("⚠️  Decent steps but try to hit 8k tomorrow.");
  } else {
    insights.push("❌ Low step count — even a 15 min walk helps your mood.");
  }

  if (data.sleepHours >= 7) {
    insights.push("✅ Good sleep — your mood baseline will be stronger.");
  } else if (data.sleepHours >= 6) {
    insights.push("⚠️  Slightly low sleep — aim for 7h+ tonight.");
  } else {
    insights.push("❌ Poor sleep — this is your #1 priority today.");
  }

  return insights;
}

module.exports = {
  fetchFitnessData,
  analyzeFitness,
};