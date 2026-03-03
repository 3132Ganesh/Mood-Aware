// async.js — Understanding async with mood data

// ── STEP 1: A fake API call (simulates Google Fit / Spotify) ──────
function fetchMoodFromServer(userId) {
  return new Promise(function(resolve, reject) {

    console.log(`⏳ Fetching mood data for user: ${userId}...`);

    // Simulate network delay (1.5 seconds like a real API)
    setTimeout(function() {

      // Fake data that would come from your DB
      const moodData = {
        userId:  userId,
        score:   7,
        emotions: ["focused", "motivated"],
        notes:   "Building my app!",
        fetchedAt: new Date().toISOString()
      };

      resolve(moodData); // ← "here's your data, it's ready!"

    }, 1500);
  });
}

// ── STEP 2: A fake API call that can FAIL ─────────────────────────
function fetchFitnessData(userId) {
  return new Promise(function(resolve, reject) {

    console.log(`⏳ Fetching fitness data for user: ${userId}...`);

    setTimeout(function() {
      const success = true; // change to false to see error handling!

      if (success) {
        resolve({
          steps:         8432,
          sleepHours:    7.5,
          activeMinutes: 45,
          calories:      2100
        });
      } else {
        reject(new Error("Google Fit API is down!")); // ← simulate failure
      }

    }, 2000);
  });
}

// ── STEP 3: Use async/await to call both ──────────────────────────
async function getDailySnapshot(userId) {
  console.log("\n🚀 Starting daily snapshot fetch...\n");

  try {
    // Fetch mood data — WAIT for it to finish
    const mood = await fetchMoodFromServer(userId);
    console.log("✅ Mood data received!");
    console.log(`   Score: ${mood.score}/10`);
    console.log(`   Emotions: ${mood.emotions.join(", ")}`);

    // Fetch fitness data — WAIT for it to finish
    const fitness = await fetchFitnessData(userId);
    console.log("\n✅ Fitness data received!");
    console.log(`   Steps: ${fitness.steps.toLocaleString()}`);
    console.log(`   Sleep: ${fitness.sleepHours} hours`);
    console.log(`   Active: ${fitness.activeMinutes} minutes`);

    // Combine everything into one snapshot
    const snapshot = {
      userId,
      mood,
      fitness,
      generatedAt: new Date().toISOString()
    };

    console.log("\n📊 DAILY SNAPSHOT READY:");
    console.log("─".repeat(40));
    console.log(`👤 User:    ${snapshot.userId}`);
    console.log(`😊 Mood:    ${snapshot.mood.score}/10`);
    console.log(`🚶 Steps:   ${snapshot.fitness.steps.toLocaleString()}`);
    console.log(`😴 Sleep:   ${snapshot.fitness.sleepHours}h`);
    console.log(`⚡ Active:  ${snapshot.fitness.activeMinutes} mins`);
    console.log("─".repeat(40));

    return snapshot;

  } catch (error) {
    console.log(`\n❌ Something went wrong: ${error.message}`);
    console.log("💡 Tip: Check your API connection and try again.");
  }
}

// ── STEP 4: Run it ────────────────────────────────────────────────
getDailySnapshot("ganesh_nayak");