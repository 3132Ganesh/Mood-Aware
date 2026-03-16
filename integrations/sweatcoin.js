// integrations/sweatcoin.js — Manual Sweatcoin tracker
// No public API exists — we track manually via MCP tool

require("dotenv").config();
const logger = require("../modules/logger");

// Returns today's Sweatcoin log from DB
function getTodaySweatcoin(db) {
  try {
    return db.get(
      "SELECT * FROM sweatcoin_logs WHERE date = date('now')"
    ) || null;
  } catch (err) {
    logger.error("Sweatcoin fetch failed: " + err.message);
    return null;
  }
}

function getSweatcoinHistory(db, days = 7) {
  try {
    return db.all(
      `SELECT * FROM sweatcoin_logs
       WHERE date >= date('now', '-' || ? || ' days')
       ORDER BY date DESC`,
      [days]
    );
  } catch (err) {
    logger.error("Sweatcoin history failed: " + err.message);
    return [];
  }
}

function getSweatcoinStats(db, days = 7) {
  const history = getSweatcoinHistory(db, days);
  if (!history.length) return { avgSteps: 0, avgCoins: 0, totalCoins: 0, totalSteps: 0 };

  const totalSteps = history.reduce((s, d) => s + (d.steps || 0), 0);
  const totalCoins = history.reduce((s, d) => s + (d.coins || 0), 0);

  return {
    avgSteps:   Math.round(totalSteps / history.length),
    avgCoins:   Math.round(totalCoins / history.length * 10) / 10,
    totalCoins: Math.round(totalCoins * 10) / 10,
    totalSteps,
    days:       history.length,
  };
}

module.exports = { getTodaySweatcoin, getSweatcoinHistory, getSweatcoinStats };