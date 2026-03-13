// script/testGoalEngine.js

require("dotenv").config();
const { initDB }           = require("../modules/database");
const {
  analyzeUserPatterns,
  generateRoadmap,
  getDailyMotivation,
  checkProgress,
}                          = require("../modules/goalEngine");

async function test() {
  const db = await initDB();

  console.log("\n🎯 GOAL ENGINE TEST\n" + "═".repeat(45));

  // 1. Analyze user patterns
  const patterns = analyzeUserPatterns(db);
  console.log("\n📊 YOUR LEARNING PROFILE:");
  console.log(`  Learning pace:    ${patterns.learningPace}`);
  console.log(`  Daily capacity:   ${patterns.dailyMins} mins/day`);
  console.log(`  Best day:         ${patterns.bestDay}`);
  console.log(`  Existing skills:  ${patterns.existingSkills.join(", ")}`);
  console.log(`  Duolingo streak:  ${patterns.duoStreak} days`);

  // 2. Set a goal
  const goalTitle    = "Data Analyst";
  const targetMonths = 4;
  const goal         = db.createGoal(
    `Become a ${goalTitle}`,
    `Learn all skills needed to get a job as a ${goalTitle}`,
    new Date(Date.now() + targetMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  console.log(`\n🎯 GOAL SET: ${goal.title}`);
  console.log(`  Target date: ${goal.targetDate}`);

  // 3. Generate roadmap
  const roadmap = generateRoadmap(goalTitle, targetMonths, patterns);
  console.log(`\n🗺️  YOUR PERSONALIZED ROADMAP (${targetMonths} months):`);

  for (const phase of roadmap) {
    const dbPhase = db.createPhase(goal.id, phase.phase, phase.title, phase.weeks);
    console.log(`\n  Phase ${phase.phase}: ${phase.title} (${phase.weeks} weeks)`);

    for (const task of phase.tasks) {
      db.createTask(goal.id, dbPhase.id, task.title, "", task.mins, task.difficulty);
      console.log(`    • [${task.difficulty.padEnd(6)}] ${task.title} (${task.mins} mins)`);
    }
  }

  // 4. Get today's motivation
  const todayMood = db.getTodayMood();
  const moodScore = todayMood?.score || 7;
  console.log(`\n💬 TODAY'S MOTIVATION (mood: ${moodScore}/10):`);
  console.log(`  ${getDailyMotivation(moodScore, goalTitle, patterns.duoStreak, patterns)}`);

  // 5. Check progress
  const progress = db.getTaskProgress(goal.id);
  console.log(`\n📈 PROGRESS: ${progress.completed}/${progress.total} tasks (${progress.percentage}%)`);

  console.log("\n" + "═".repeat(45));
  console.log("✅ Goal Engine working!\n");
}

test().catch(console.error);