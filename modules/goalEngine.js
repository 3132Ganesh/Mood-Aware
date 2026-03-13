
// modules/goalEngine.js — AI-powered Goal Engine

const logger = require("./logger");

// ══════════════════════════════════════════════════════════════════
// ANALYZE USER PATTERNS
// ══════════════════════════════════════════════════════════════════
function analyzeUserPatterns(db) {
  const moodHistory = db.getMoodHistory(30);
  const avgMood     = db.getAverageMood(30);
  const habits      = db.getAllHabits();
  const streaks     = habits.map(h => ({ ...h, ...db.getHabitStreak(h.name) }));
  const duoStreak   = parseInt(process.env.DUOLINGO_STREAK || "0");

  // Learning pace — based on Duolingo consistency
  const learningPace = duoStreak >= 100 ? "high"
    : duoStreak >= 30  ? "medium"
    : "low";

  // Daily capacity — based on mood + habit completion
  const avgMoodScore = avgMood.average || 5;
  const dailyMins    = learningPace === "high"  ? 45
    : learningPace === "medium" ? 30
    : 20;

  // Best day of week
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayScores = {};
  moodHistory.forEach(m => {
    const day = days[new Date(m.date).getDay()];
    if (!dayScores[day]) dayScores[day] = [];
    dayScores[day].push(m.score);
  });

  const bestDay = Object.entries(dayScores)
    .map(([day, scores]) => ({
      day,
      avg: scores.reduce((s, v) => s + v, 0) / scores.length
    }))
    .sort((a, b) => b.avg - a.avg)[0]?.day || "Friday";

  // Existing skills from habits + LeetCode
  const existingSkills = [];
  if (streaks.find(h => h.name === "LeetCode" && h.streak > 0)) existingSkills.push("problem_solving");
  if (process.env.DUOLINGO_USERNAME) existingSkills.push("consistent_learning");
  existingSkills.push("sql"); // from project context

  return {
    learningPace,
    dailyMins,
    avgMoodScore,
    bestDay,
    existingSkills,
    duoStreak,
    habitCount: habits.length,
  };
}

// ══════════════════════════════════════════════════════════════════
// GENERATE ROADMAP
// ══════════════════════════════════════════════════════════════════
function generateRoadmap(goalTitle, targetMonths, patterns) {
  const { learningPace, dailyMins, existingSkills, bestDay } = patterns;

  const roadmaps = {
    "data analyst": [
      {
        phase: 1,
        title: "Python Foundations",
        weeks: existingSkills.includes("problem_solving") ? 2 : 4,
        tasks: [
          { title: "Python basics — variables, loops, functions", mins: dailyMins, difficulty: "easy" },
          { title: "Practice on HackerRank Python track", mins: dailyMins, difficulty: "easy" },
          { title: "Pandas introduction — DataFrames", mins: dailyMins, difficulty: "medium" },
        ]
      },
      {
        phase: 2,
        title: "Statistics & Math",
        weeks: 3,
        tasks: [
          { title: "Descriptive statistics — mean, median, std", mins: dailyMins, difficulty: "medium" },
          { title: "Probability basics", mins: dailyMins, difficulty: "medium" },
          { title: "Khan Academy statistics course", mins: 20, difficulty: "easy" },
        ]
      },
      {
        phase: 3,
        title: "SQL & Data Wrangling",
        weeks: existingSkills.includes("sql") ? 1 : 3,
        tasks: [
          { title: "Advanced SQL — JOINs, subqueries, CTEs", mins: dailyMins, difficulty: "medium" },
          { title: "Pandas data cleaning exercises", mins: dailyMins, difficulty: "medium" },
          { title: "Real dataset practice on Kaggle", mins: 30, difficulty: "hard" },
        ]
      },
      {
        phase: 4,
        title: "Data Visualization",
        weeks: 2,
        tasks: [
          { title: "Matplotlib & Seaborn basics", mins: dailyMins, difficulty: "medium" },
          { title: "Tableau/PowerBI free course", mins: 30, difficulty: "medium" },
          { title: "Build your first dashboard", mins: 45, difficulty: "hard" },
        ]
      },
      {
        phase: 5,
        title: "Real Projects",
        weeks: 3,
        tasks: [
          { title: "Kaggle beginner competition", mins: 45, difficulty: "hard" },
          { title: "End-to-end analysis project", mins: 45, difficulty: "hard" },
          { title: "GitHub portfolio setup", mins: 30, difficulty: "medium" },
        ]
      },
      {
        phase: 6,
        title: "Job Ready",
        weeks: 2,
        tasks: [
          { title: "Resume + LinkedIn optimization", mins: 30, difficulty: "easy" },
          { title: "Mock interview practice", mins: 45, difficulty: "hard" },
          { title: "Apply to 3 jobs/day", mins: 30, difficulty: "medium" },
        ]
      },
    ],
    "software developer": [
      {
        phase: 1, title: "CS Fundamentals", weeks: 3,
        tasks: [
          { title: "Data structures — arrays, linked lists, trees", mins: dailyMins, difficulty: "medium" },
          { title: "Algorithms — sorting, searching", mins: dailyMins, difficulty: "medium" },
          { title: "LeetCode easy problems daily", mins: 30, difficulty: "easy" },
        ]
      },
      {
        phase: 2, title: "Web Development", weeks: 4,
        tasks: [
          { title: "HTML + CSS basics", mins: dailyMins, difficulty: "easy" },
          { title: "JavaScript fundamentals", mins: dailyMins, difficulty: "medium" },
          { title: "React basics", mins: dailyMins, difficulty: "medium" },
        ]
      },
      {
        phase: 3, title: "Backend Development", weeks: 4,
        tasks: [
          { title: "Node.js + Express", mins: dailyMins, difficulty: "medium" },
          { title: "REST APIs", mins: dailyMins, difficulty: "medium" },
          { title: "Database design", mins: dailyMins, difficulty: "medium" },
        ]
      },
      {
        phase: 4, title: "Projects + Portfolio", weeks: 3,
        tasks: [
          { title: "Full stack project", mins: 60, difficulty: "hard" },
          { title: "GitHub portfolio", mins: 30, difficulty: "medium" },
          { title: "Deploy to cloud", mins: 45, difficulty: "hard" },
        ]
      },
    ],
    "ai/ml engineer": [
      {
        phase: 1, title: "Math Foundations", weeks: 4,
        tasks: [
          { title: "Linear algebra basics", mins: dailyMins, difficulty: "hard" },
          { title: "Calculus fundamentals", mins: dailyMins, difficulty: "hard" },
          { title: "Statistics for ML", mins: dailyMins, difficulty: "medium" },
        ]
      },
      {
        phase: 2, title: "Python for ML", weeks: 3,
        tasks: [
          { title: "NumPy + Pandas", mins: dailyMins, difficulty: "medium" },
          { title: "Scikit-learn basics", mins: dailyMins, difficulty: "medium" },
          { title: "Kaggle Python course", mins: 30, difficulty: "easy" },
        ]
      },
      {
        phase: 3, title: "ML Algorithms", weeks: 4,
        tasks: [
          { title: "Supervised learning — regression, classification", mins: dailyMins, difficulty: "hard" },
          { title: "Unsupervised learning — clustering", mins: dailyMins, difficulty: "hard" },
          { title: "Model evaluation + tuning", mins: dailyMins, difficulty: "hard" },
        ]
      },
      {
        phase: 4, title: "Deep Learning", weeks: 4,
        tasks: [
          { title: "Neural networks basics", mins: 45, difficulty: "hard" },
          { title: "TensorFlow/PyTorch intro", mins: 45, difficulty: "hard" },
          { title: "Build your first model", mins: 60, difficulty: "hard" },
        ]
      },
      {
        phase: 5, title: "Projects", weeks: 3,
        tasks: [
          { title: "Kaggle competition", mins: 60, difficulty: "hard" },
          { title: "End-to-end ML project", mins: 60, difficulty: "hard" },
          { title: "Research paper reading", mins: 30, difficulty: "medium" },
        ]
      },
    ]
  };

  // Find matching roadmap
  const key = Object.keys(roadmaps).find(k =>
    goalTitle.toLowerCase().includes(k)
  );

  const phases = roadmaps[key] || roadmaps["data analyst"];

  // Adjust weeks based on target months
  const totalWeeks    = targetMonths * 4;
  const roadmapWeeks  = phases.reduce((s, p) => s + p.weeks, 0);
  const scaleFactor   = totalWeeks / roadmapWeeks;

  return phases.map(p => ({
    ...p,
    weeks: Math.max(1, Math.round(p.weeks * scaleFactor)),
  }));
}

// ══════════════════════════════════════════════════════════════════
// MOOD-BASED DAILY MOTIVATION
// ══════════════════════════════════════════════════════════════════
function getDailyMotivation(moodScore, goalTitle, streak, patterns) {
  const { bestDay, duoStreak } = patterns;
  const today = new Date().toLocaleDateString("en", { weekday: "long" });
  const isBestDay = today === bestDay;

  let message = "";

  if (moodScore >= 8) {
    message = `🔥 You're in peak state today! Perfect time to tackle the hardest task on your ${goalTitle} roadmap. You've kept a ${duoStreak}-day Duolingo streak — that same discipline will make you a ${goalTitle}. Push hard today!`;
  } else if (moodScore >= 6) {
    message = `💪 Solid energy today. Stick to your ${goalTitle} plan — even 20 focused minutes moves the needle. Your ${duoStreak}-day streak proves you show up consistently. Today is no different.`;
  } else if (moodScore >= 4) {
    message = `🌱 Low energy day — that's okay. Do the EASIEST task on your list today. Progress is progress. You didn't build a ${duoStreak}-day streak by quitting on hard days.`;
  } else {
    message = `💙 Tough day Ganesh. Just do ONE thing — even 10 minutes of reading counts. Your ${duoStreak}-day Duolingo streak means you already know how to show up when you don't feel like it. Rest if you must, but don't quit.`;
  }

  if (isBestDay) {
    message += ` And hey — ${today} is historically your best mood day. You've got this! 🚀`;
  }

  return message;
}

// ══════════════════════════════════════════════════════════════════
// CHECK IF FALLING BEHIND + ADJUST
// ══════════════════════════════════════════════════════════════════
function checkProgress(goal, phases, taskProgress, moodHistory) {
  const startDate  = new Date(goal.created_at);
  const today      = new Date();
  const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const weeksElapsed = Math.floor(daysElapsed / 7);

  const expectedProgress = Math.min(
    Math.round(weeksElapsed / phases.reduce((s, p) => s + p.weeks, 0) * 100),
    100
  );

  const actualProgress = taskProgress.percentage;
  const gap            = expectedProgress - actualProgress;

  let status  = "on_track";
  let message = "";
  let adjustment = null;

  if (gap >= 20) {
    status  = "behind";
    message = `⚠️ You're ${gap}% behind schedule. Let's adjust — adding 10 mins/day to catch up.`;
    adjustment = { extraMins: 10, skipDifficulty: "hard" };
  } else if (gap >= 10) {
    status  = "slightly_behind";
    message = `📊 Slightly behind by ${gap}%. Keep pushing — you can catch up this week.`;
    adjustment = { extraMins: 5, skipDifficulty: null };
  } else if (gap <= -10) {
    status  = "ahead";
    message = `🚀 You're ${Math.abs(gap)}% AHEAD of schedule! Consider tackling harder tasks.`;
    adjustment = { extraMins: 0, skipDifficulty: null };
  } else {
    status  = "on_track";
    message = `✅ You're right on track! Keep the pace.`;
  }

  return { status, message, adjustment, expectedProgress, actualProgress, gap };
}

module.exports = {
  analyzeUserPatterns,
  generateRoadmap,
  getDailyMotivation,
  checkProgress,
};