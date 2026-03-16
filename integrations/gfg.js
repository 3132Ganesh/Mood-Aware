// integrations/gfg.js — GeeksForGeeks stats

require("dotenv").config();
const https  = require("https");
const logger = require("../modules/logger");

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Parse failed")); }
      });
    }).on("error", reject);
  });
}

async function getGFGStats(username) {
  // Try API 1
  try {
    const data = await httpsGet(
      `https://gfg-api-fefa.onrender.com/${username}`
    );
    if (data && !data.error) {
      return {
        username,
        info: {
          name:        data.userName       || username,
          rank:        data.rank           || "N/A",
          score:       data.overallScore   || 0,
          streak:      data.streak         || 0,
          totalSolved: data.totalProblemsSolved || 0,
          languages:   data.languages      || "",
          institute:   data.instituteName  || "",
        },
        solved: {
          school: data.school  || 0,
          basic:  data.basic   || 0,
          easy:   data.easy    || 0,
          medium: data.medium  || 0,
          hard:   data.hard    || 0,
        },
      };
    }
  } catch (e) { /* try next */ }

  // Try API 2
  try {
    const data = await httpsGet(
      `https://gfgstatscard.vercel.app/${username}?raw=true`
    );
    if (data && !data.error) {
      return {
        username,
        info: {
          name:        data.userName       || username,
          rank:        data.globalRank     || "N/A",
          score:       data.codingScore    || 0,
          streak:      data.currentStreak  || 0,
          totalSolved: data.totalProblemsSolved || 0,
        },
        solved: {
          school: data.school?.count  || 0,
          basic:  data.basic?.count   || 0,
          easy:   data.easy?.count    || 0,
          medium: data.medium?.count  || 0,
          hard:   data.hard?.count    || 0,
        },
      };
    }
  } catch (e) { /* failed */ }

  return { error: "Could not fetch GFG data" };
}

module.exports = { getGFGStats };