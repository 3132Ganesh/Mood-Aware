// scripts/testGoogleFit.js

require("dotenv").config();
const { getDailyActivity } = require("../integrations/googleFit");

async function test() {
  console.log("\n🏃 Testing Google Fit Integration...\n");

  const today     = await getDailyActivity(new Date());
  const yesterday = await getDailyActivity(new Date(Date.now() - 86400000));

  console.log("📅 TODAY:");
  console.log(`   Steps:          ${today.steps.toLocaleString()}`);
  console.log(`   Calories:       ${today.calories.toLocaleString()}`);
  console.log(`   Active minutes: ${today.activeMinutes}`);

  console.log("\n📅 YESTERDAY:");
  console.log(`   Steps:          ${yesterday.steps.toLocaleString()}`);
  console.log(`   Calories:       ${yesterday.calories.toLocaleString()}`);
  console.log(`   Active minutes: ${yesterday.activeMinutes}`);

  console.log("\n✅ Google Fit integration working!\n");
}

test().catch(console.error);