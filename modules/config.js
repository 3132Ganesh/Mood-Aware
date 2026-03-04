// modules/config.js — Config loader + startup validator

require("dotenv").config();

const config = {
  app: {
    name:    process.env.APP_NAME    || "Mood-Aware",
    version: process.env.APP_VERSION || "1.0.0",
    env:     process.env.NODE_ENV    || "development",
  },
  db: {
    path: process.env.DB_PATH || "./mood_tracker.db",
  },
  learning: {
    duolingo:   process.env.DUOLINGO_USERNAME   || null,
    leetcode:   process.env.LEETCODE_USERNAME   || null,
    hackerrank: process.env.HACKERRANK_USERNAME || null,
  },
  google: {
    clientId:     process.env.GOOGLE_CLIENT_ID     || null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || null,
  },
  spotify: {
    clientId:     process.env.SPOTIFY_CLIENT_ID     || null,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || null,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN || null,
  },
};

function validateConfig() {
  const warnings = [];
  const errors   = [];

  if (!config.db.path)             errors.push("DB_PATH is missing");
  if (!config.learning.duolingo)   warnings.push("DUOLINGO_USERNAME not set");
  if (!config.learning.leetcode)   warnings.push("LEETCODE_USERNAME not set");
  if (!config.google.clientId)     warnings.push("GOOGLE_CLIENT_ID not set");
  if (!config.spotify.clientId)    warnings.push("SPOTIFY_CLIENT_ID not set");

  if (warnings.length > 0) {
    console.log("\n⚠️  CONFIG WARNINGS:");
    warnings.forEach(w => console.log(`   • ${w}`));
  }

  if (errors.length > 0) {
    console.log("\n❌ CONFIG ERRORS — App cannot start:");
    errors.forEach(e => console.log(`   • ${e}`));
    process.exit(1);
  }

  console.log(`\n✅ Config loaded — ${config.app.name} v${config.app.version} (${config.app.env})\n`);
}

module.exports = { config, validateConfig };