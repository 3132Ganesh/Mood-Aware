// script/testLearning.js

require("dotenv").config();
const { getDuolingoStats } = require("../integrations/duolingo");
const { getLeetCodeStats } = require("../integrations/leetcode");

async function test() {
  console.log("\n📚 LEARNING STATS\n" + "═".repeat(45));

  // Duolingo
  console.log("\n🦉 DUOLINGO:");
  const duo = await getDuolingoStats(process.env.DUOLINGO_USERNAME);
  if (duo.error) {
    console.log("  ❌ " + duo.error);
  } else {
    console.log(`  Username:   ${duo.username}`);
    console.log(`  Streak:     🔥 ${duo.streak} days`);
    console.log(`  Longest:    ${duo.longestStreak} days`);
    console.log(`  Total XP:   ${duo.totalXP?.toLocaleString()}`);
    console.log(`  Lingots:    ${duo.lingots}`);
    console.log(`  Learning:`);
    duo.courses.forEach(c => {
      console.log(`    • ${c.language} — ${c.xp} XP | ${c.crowns} crowns`);
    });
  }

  // LeetCode
  console.log("\n💻 LEETCODE:");
  const lc = await getLeetCodeStats(process.env.LEETCODE_USERNAME);
  if (lc.error) {
    console.log("  ❌ " + lc.error);
  } else {
    console.log(`  Username:   ${lc.username}`);
    console.log(`  Solved:     ${lc.solved.total} total`);
    console.log(`    Easy:     ${lc.solved.easy}`);
    console.log(`    Medium:   ${lc.solved.medium}`);
    console.log(`    Hard:     ${lc.solved.hard}`);
    console.log(`  Streak:     ${lc.streak} days`);
    console.log(`  Active days: ${lc.activeDays}`);
  }

  console.log("\n" + "═".repeat(45));
  console.log("✅ Learning stats test done!\n");
}

test().catch(console.error);
