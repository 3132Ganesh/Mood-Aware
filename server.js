// server.js — Mood-Aware MCP Server

const { McpServer }          = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z }                  = require("zod");
const { validateConfig }     = require("./modules/config");
const logger                 = require("./modules/logger");
const { initDB } = require("./modules/database");
// ── Validate config before anything starts ────────────────────────
validateConfig();

// ── Create MCP Server ─────────────────────────────────────────────
const server = new McpServer({
  name:    "mood-aware",
  version: "1.0.0",
});

// ══════════════════════════════════════════════════════════════════
// TOOL 1 — log_mood
// "Claude, log my mood as 8, feeling focused and happy"
// ══════════════════════════════════════════════════════════════════
server.tool(
  "log_mood",
  {
    score:    z.number().min(1).max(10).describe("Mood score from 1 to 10"),
    emotions: z.array(z.string()).optional().describe("List of emotions e.g. ['happy','focused']"),
    notes:    z.string().optional().describe("Any notes about your mood today"),
  },
  async ({ score, emotions = [], notes = "" }) => {
    try {
      const entry = global.moodDB.logMood(score, emotions, notes);
      logger.ok(`Mood logged: ${score}/10`);
      return {
        content: [{
          type: "text",
          text: `✅ Mood logged!\n📅 Date: ${new Date().toLocaleDateString()}\n😊 Score: ${score}/10\n💭 Emotions: ${emotions.join(", ") || "none"}\n📝 Notes: ${notes || "none"}`,
        }]
      };
    } catch (err) {
      logger.error("log_mood failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Failed to log mood: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 2 — get_mood_history
// "Claude, show me my mood for the last 7 days"
// ══════════════════════════════════════════════════════════════════
server.tool(
  "get_mood_history",
  {
    days: z.number().default(7).describe("Number of days to look back"),
  },
  async ({ days }) => {
    try {
      const moods = db.getMoodHistory(days);
      const avg   = db.getAverageMood(days);

      if (moods.length === 0) {
        return { content: [{ type: "text", text: "No mood entries found. Log your first mood!" }] };
      }

      let output = `📊 MOOD HISTORY — Last ${days} days\n${"─".repeat(40)}\n`;
      moods.forEach(m => {
        const bar = "█".repeat(m.score) + "░".repeat(10 - m.score);
        output += `📅 ${m.date}  [${bar}] ${m.score}/10\n`;
        if (m.emotions) output += `   💭 ${m.emotions}\n`;
        if (m.notes)    output += `   📝 ${m.notes}\n`;
      });

      output += `\n${"─".repeat(40)}\n`;
      output += `📈 Average: ${avg.average}/10\n`;
      output += `🌟 Highest: ${avg.highest}/10\n`;
      output += `⚠️  Lowest:  ${avg.lowest}/10\n`;
      output += `📋 Entries: ${avg.total_entries}`;

      return { content: [{ type: "text", text: output }] };
    } catch (err) {
      logger.error("get_mood_history failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 3 — log_habit
// "Claude, mark my morning walk as done today"
// ══════════════════════════════════════════════════════════════════
server.tool(
  "log_habit",
  {
    habit_name: z.string().describe("Name of the habit e.g. 'Morning Walk'"),
    completed:  z.boolean().default(true).describe("true = done, false = skipped"),
  },
  async ({ habit_name, completed }) => {
    try {
      const result = db.logHabit(habit_name, completed);
      const streak = db.getHabitStreak(habit_name);
      const status = completed ? "✅ completed" : "❌ skipped";

      return {
        content: [{
          type: "text",
          text: `${status} — ${habit_name}\n🔥 Current streak: ${streak.streak} day${streak.streak !== 1 ? "s" : ""}`,
        }]
      };
    } catch (err) {
      logger.error("log_habit failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 4 — get_habit_streaks
// "Claude, what are my current habit streaks?"
// ══════════════════════════════════════════════════════════════════
server.tool(
  "get_habit_streaks",
  {
    habit_name: z.string().optional().describe("Specific habit name, or leave empty for all habits"),
  },
  async ({ habit_name }) => {
    try {
      if (habit_name) {
        const streak = db.getHabitStreak(habit_name);
        return {
          content: [{
            type: "text",
            text: `🔥 ${habit_name}: ${streak.streak} day streak`,
          }]
        };
      }

      const habits = db.getAllHabits();
      if (habits.length === 0) {
        return { content: [{ type: "text", text: "No habits logged yet. Start one today!" }] };
      }

      let output = "🏆 HABIT STREAKS\n" + "─".repeat(30) + "\n";
      habits.forEach(h => {
        const streak = db.getHabitStreak(h.name);
        const fire   = streak.streak > 0 ? "🔥".repeat(Math.min(streak.streak, 5)) : "❌";
        output += `${fire} ${h.name}: ${streak.streak} day${streak.streak !== 1 ? "s" : ""}\n`;
      });

      return { content: [{ type: "text", text: output }] };
    } catch (err) {
      logger.error("get_habit_streaks failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 5 — get_daily_snapshot
// "Claude, give me my full daily snapshot"
// ══════════════════════════════════════════════════════════════════
server.tool(
  "get_daily_snapshot",
  {},
  async () => {
    try {
      const mood    = db.getTodayMood();
      const avg     = db.getAverageMood(7);
      const habits  = db.getTodayHabits();
      const fitness = db.getFitnessHistory(1)[0] || null;

      let output = `📊 DAILY SNAPSHOT — ${new Date().toLocaleDateString()}\n${"═".repeat(40)}\n`;

      // Mood
      output += `\n😊 MOOD\n`;
      if (mood) {
        output += `   Today:   ${mood.score}/10 — ${mood.emotions || "no emotions logged"}\n`;
        output += `   Notes:   ${mood.notes || "none"}\n`;
      } else {
        output += `   Not logged yet today — log your mood!\n`;
      }
      output += `   7-day avg: ${avg.average ?? "no data"}/10\n`;

      // Habits
      output += `\n✅ HABITS TODAY\n`;
      if (habits.length === 0) {
        output += `   No habits logged today\n`;
      } else {
        habits.forEach(h => {
          output += `   ${h.completed ? "✅" : "❌"} ${h.name}\n`;
        });
      }

      // Fitness
      output += `\n🏃 FITNESS\n`;
      if (fitness) {
        output += `   Steps:  ${fitness.steps?.toLocaleString() ?? 0}\n`;
        output += `   Sleep:  ${fitness.sleep_hours}h\n`;
        output += `   Active: ${fitness.active_minutes} mins\n`;
      } else {
        output += `   No fitness data yet — connect Google Fit soon!\n`;
      }

      output += `\n${"═".repeat(40)}`;
      return { content: [{ type: "text", text: output }] };
    } catch (err) {
      logger.error("get_daily_snapshot failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════════
async function main() {
  const db        = await initDB(); // wait for DB to initialize
  const transport = new StdioServerTransport();

  // Pass db into all tools by updating each tool to use the local db
  // (we handle this by making db available in scope)
  global.moodDB = db; // make available globally for tools

  await server.connect(transport);
  logger.ok("Mood-Aware MCP Server running!");
}

main().catch(err => {
  logger.error("Server failed to start: " + err.message);
  process.exit(1);
});