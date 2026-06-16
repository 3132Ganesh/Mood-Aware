// integrations/leetcode.js — Basic LeetCode stats

require("dotenv").config();
const https  = require("https");
const logger = require("../modules/logger");

async function getLeetCodeStats(username) {
  try {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
              userCalendar {
                streak
                totalActiveDays
              }
            }
          }
        `,
        variables: { username },
      });

      const options = {
        hostname: "leetcode.com",
        path:     "/graphql",
        method:   "POST",
        headers:  {
          "Content-Type":   "application/json",
          "Content-Length": body.length,
          "User-Agent":     "Mozilla/5.0",
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          try {
            const json   = JSON.parse(data);
            const user   = json.data?.matchedUser;

            if (!user) {
              resolve({ error: "User not found" });
              return;
            }

            const stats  = user.submitStats?.acSubmissionNum || [];
            const easy   = stats.find(s => s.difficulty === "Easy")?.count  || 0;
            const medium = stats.find(s => s.difficulty === "Medium")?.count || 0;
            const hard   = stats.find(s => s.difficulty === "Hard")?.count  || 0;

            resolve({
              username,
              solved: {
                easy,
                medium,
                hard,
                total: easy + medium + hard,
              },
              streak:      user.userCalendar?.streak        || 0,
              activeDays:  user.userCalendar?.totalActiveDays || 0,
            });
          } catch (e) {
            reject(new Error("Parse failed: " + e.message));
          }
        });
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  } catch (err) {
    logger.error("LeetCode fetch failed: " + err.message);
    return { error: err.message };
  }
}

module.exports = { getLeetCodeStats };
