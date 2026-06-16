// integrations/duolingo.js — Fetch your real Duolingo data

require("dotenv").config();
const https  = require("https");
const logger = require("../modules/logger");

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept":     "application/json",
      }
    };

    https.get(url, options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Failed to parse response")); }
      });
    }).on("error", reject);
  });
}

async function getDuolingoStats(username) {
  try {
    const url  = `https://www.duolingo.com/2017-06-30/users?username=${username}`;
    const data = await httpsGet(url);
    const user = data.users?.[0];

    if (!user) {
      return { error: "User not found — check your Duolingo username in .env" };
    }

    // Extract learning languages
    const courses = user.courses?.map(c => ({
      language:       c.title,
      xp:             c.xp,
      crowns:         c.crowns,
      proficiency:    Math.round(c.crowns / 5 * 10) / 10,
    })) || [];

    return {
      username:        user.username,
      name:            user.name,
      streak:          user.streak,
      totalXP:         user.totalXp,
      lingots:         user.lingots,
      courses,
      topLanguage:     courses.sort((a, b) => b.xp - a.xp)[0]?.language || "none",
      longestStreak:   user.longestStreak || user.streak,
    };

  } catch (err) {
    logger.error("Duolingo fetch failed: " + err.message);
    return { error: err.message };
  }
}

module.exports = { getDuolingoStats };