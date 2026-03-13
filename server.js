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
// TOOL 6 — get_insights
// "Claude, what patterns do you see in my mood data?"
// ══════════════════════════════════════════════════════════════════
const { generateAllInsights } = require("./modules/insights");

server.tool(
  "get_insights",
  {},
  async () => {
    try {
      const db            = global.moodDB;
      const moodHistory   = db.getMoodHistory(30);
      const moodSleepData = db.getMoodVsSleep(30);
      const habits        = db.getAllHabits();
      const habitLogs     = [];

      habits.forEach(h => {
        const streak = db.getHabitStreak(h.name);
        for (let i = 0; i < streak.streak; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          habitLogs.push({
            name:      h.name,
            date:      date.toISOString().split("T")[0],
            completed: true,
          });
        }
      });

      const insights = generateAllInsights({ moodHistory, moodSleepData, habitLogs });

      let output = `🧠 YOUR MOOD INSIGHTS\n${"═".repeat(40)}\n`;

      output += `\n📈 TREND\n   ${insights.trend.insight}\n`;
      output += `\n💤 SLEEP\n   ${insights.sleep.insight}\n`;
      output += `\n📅 BEST DAY\n   ${insights.bestDay.insight}\n`;
      output += `\n🏆 HABITS\n`;

      if (insights.habits.impacts.length > 0) {
        insights.habits.impacts.forEach(h => output += `   ${h.insight}\n`);
      } else {
        output += `   ${insights.habits.insight}\n`;
      }

      output += `\n${"═".repeat(40)}`;
      return { content: [{ type: "text", text: output }] };

    } catch (err) {
      logger.error("get_insights failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);
// ══════════════════════════════════════════════════════════════════
// TOOL 7 — get_learning_stats
// "Claude, how is my learning going?"
// ══════════════════════════════════════════════════════════════════
const { getDuolingoStats } = require("./integrations/duolingo");
const { getLeetCodeStats } = require("./integrations/leetcode");

server.tool(
  "get_learning_stats",
  {},
  async () => {
    try {
      const duo = await getDuolingoStats(process.env.DUOLINGO_USERNAME);
      const lc  = await getLeetCodeStats(process.env.LEETCODE_USERNAME);

      let output = `📚 LEARNING STATS\n${"═".repeat(40)}\n`;

      output += `\n🦉 DUOLINGO\n`;
      if (duo.error) {
        output += `   ❌ ${duo.error}\n`;
      } else {
        output += `   Streak:    🔥 ${duo.streak} days\n`;
        output += `   Longest:   ${duo.longestStreak} days\n`;
        output += `   Total XP:  ${duo.totalXP?.toLocaleString()}\n`;
        duo.courses.forEach(c => {
          output += `   ${c.language}: ${c.xp} XP | ${c.crowns} crowns\n`;
        });
      }

      output += `\n💻 LEETCODE\n`;
      if (lc.error) {
        output += `   ❌ ${lc.error}\n`;
      } else {
        output += `   Solved:    ${lc.solved.total} problems\n`;
        output += `   Easy:      ${lc.solved.easy}\n`;
        output += `   Medium:    ${lc.solved.medium}\n`;
        output += `   Hard:      ${lc.solved.hard}\n`;
        output += `   Streak:    ${lc.streak} days\n`;
      }

      output += `\n${"═".repeat(40)}`;
      return { content: [{ type: "text", text: output }] };

    } catch (err) {
      logger.error("get_learning_stats failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 8 — get_spotify_stats
// "Claude, what have I been listening to?"
// ══════════════════════════════════════════════════════════════════
const { getMyTopArtists, getRecentlyPlayed } = require("./integrations/spotify");

server.tool(
  "get_spotify_stats",
  {},
  async () => {
    try {
      const artists = await getMyTopArtists(5);
      const recent  = await getRecentlyPlayed(20);

      let output = `🎵 SPOTIFY STATS\n${"═".repeat(40)}\n`;

      output += `\n🏆 TOP ARTISTS (last 4 weeks)\n`;
      artists.forEach(a => {
        output += `   ${a.rank}. ${a.name} — ${a.genres[0] || "various"}\n`;
      });

      output += `\n⏱️  RECENT LISTENING\n`;
      output += `   Total time: ${recent.totalHrs} hours\n`;

      output += `\n🎤 MOST PLAYED (recent)\n`;
      recent.topArtists.forEach(a => {
        output += `   ${a.rank}. ${a.artist} — ${a.tracks} tracks (~${a.estMins} mins)\n`;
      });

      output += `\n${"═".repeat(40)}`;
      return { content: [{ type: "text", text: output }] };

    } catch (err) {
      logger.error("get_spotify_stats failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);
// TOOL 9 — get_weekend_report
const { generateWeekendReport, formatWeekendReport } = require("./modules/weekendReport");
const { getDuolingoStats } = require("./integrations/duolingo");
const { getLeetCodeStats } = require("./integrations/leetcode");

server.tool(
  "get_weekend_report",
  {},
  async () => {
    try {
      const db  = global.moodDB;
      const duo = await getDuolingoStats(process.env.DUOLINGO_USERNAME);
      const lc  = await getLeetCodeStats(process.env.LEETCODE_USERNAME);

      const moodHistory = db.getMoodHistory(14);
      const habits      = db.getAllHabits();
      const habitLogs   = [];

      habits.forEach(h => {
        const streak = db.getHabitStreak(h.name);
        for (let i = 0; i < Math.min(streak.streak, 14); i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          habitLogs.push({
            name:      h.name,
            date:      date.toISOString().split("T")[0],
            completed: true,
          });
        }
      });

      const report    = generateWeekendReport({ moodHistory, habitLogs, duoStats: duo, lcStats: lc });
      const formatted = formatWeekendReport(report);

      return { content: [{ type: "text", text: formatted }] };
    } catch (err) {
      logger.error("get_weekend_report failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);
// ══════════════════════════════════════════════════════════════════
// TOOL 10 — set_goal
// ══════════════════════════════════════════════════════════════════
const {
  analyzeUserPatterns,
  generateRoadmap,
  getDailyMotivation,
  checkProgress,
} = require("./modules/goalEngine");

server.tool(
  "set_goal",
  {
    goal:   z.string().describe("Your goal e.g. 'Data Analyst', 'Software Developer', 'AI/ML Engineer'"),
    months: z.number().min(1).max(24).default(4).describe("Target months to achieve goal"),
  },
  async ({ goal, months }) => {
    try {
      const db       = global.moodDB;
      const patterns = analyzeUserPatterns(db);
      const newGoal  = db.createGoal(
        `Become a ${goal}`,
        `Learn all skills to get a job as a ${goal}`,
        new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      );

      const roadmap = generateRoadmap(goal, months, patterns);
      let totalTasks = 0;

      for (const phase of roadmap) {
        const dbPhase = db.createPhase(newGoal.id, phase.phase, phase.title, phase.weeks);
        for (const task of phase.tasks) {
          db.createTask(newGoal.id, dbPhase.id, task.title, "", task.mins, task.difficulty);
          totalTasks++;
        }
      }

      let output = `🎯 GOAL SET!\n${"═".repeat(40)}\n`;
      output += `\n📌 Goal:        Become a ${goal}\n`;
      output += `📅 Target:      ${newGoal.targetDate}\n`;
      output += `⏱️  Daily time:  ${patterns.dailyMins} mins/day\n`;
      output += `📈 Your pace:   ${patterns.learningPace}\n`;
      output += `\n🗺️  ROADMAP (${months} months)\n`;
      roadmap.forEach(p => {
        output += `  Phase ${p.phase}: ${p.title} — ${p.weeks} weeks\n`;
      });
      output += `\n📋 Total tasks: ${totalTasks}\n`;
      output += `\n💡 Based on your ${patterns.duoStreak}-day Duolingo streak,\n`;
      output += `   you already have the discipline. Now aim it at ${goal}!\n`;
      output += `\n${"═".repeat(40)}`;

      return { content: [{ type: "text", text: output }] };
    } catch (err) {
      logger.error("set_goal failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 11 — get_daily_tasks
// ══════════════════════════════════════════════════════════════════
server.tool(
  "get_daily_tasks",
  {},
  async () => {
    try {
      const db   = global.moodDB;
      const goal = db.getActiveGoal();

      if (!goal) return { content: [{ type: "text", text: "No active goal! Use set_goal first." }] };

      const patterns   = analyzeUserPatterns(db);
      const todayMood  = db.getTodayMood();
      const moodScore  = todayMood?.score || 7;
      const tasks      = db.getTodayTasks(goal.id);
      const progress   = db.getTaskProgress(goal.id);
      const motivation = getDailyMotivation(moodScore, goal.title, patterns.duoStreak, patterns);

      let output = `📋 TODAY'S TASKS\n${"═".repeat(40)}\n`;
      output += `\n🎯 Goal: ${goal.title}\n`;
      output += `📈 Progress: ${progress.completed}/${progress.total} (${progress.percentage}%)\n`;
      output += `\n💬 ${motivation}\n`;
      output += `\n📝 YOUR TASKS TODAY:\n`;

      if (tasks.length === 0) {
        output += `  No tasks found — make sure your goal phases are set up!\n`;
      } else {
        tasks.forEach((t, i) => {
          output += `\n  ${i + 1}. ${t.title}\n`;
          output += `     ⏱️  ${t.estimated_mins} mins | difficulty: ${t.difficulty}\n`;
        });
      }

      output += `\n${"═".repeat(40)}`;
      return { content: [{ type: "text", text: output }] };
    } catch (err) {
      logger.error("get_daily_tasks failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 12 — complete_task
// ══════════════════════════════════════════════════════════════════
server.tool(
  "complete_task",
  {
    task_id: z.number().describe("Task ID to mark complete"),
    notes:   z.string().optional().describe("Any notes about completing this task"),
  },
  async ({ task_id, notes = "" }) => {
    try {
      const db        = global.moodDB;
      const todayMood = db.getTodayMood();
      const moodScore = todayMood?.score || 7;

      db.logTask(task_id, true, moodScore, notes);
      const goal     = db.getActiveGoal();
      const progress = db.getTaskProgress(goal.id);

      return {
        content: [{
          type: "text",
          text: `✅ Task completed!\n📈 Overall progress: ${progress.percentage}%\n🎯 Keep going — ${goal.title} is getting closer!`,
        }]
      };
    } catch (err) {
      logger.error("complete_task failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 13 — get_goal_progress
// ══════════════════════════════════════════════════════════════════
server.tool(
  "get_goal_progress",
  {},
  async () => {
    try {
      const db      = global.moodDB;
      const goal    = db.getActiveGoal();
      if (!goal) return { content: [{ type: "text", text: "No active goal! Use set_goal first." }] };

      const phases   = db.getGoalPhases(goal.id);
      const progress = db.getTaskProgress(goal.id);
      const moodHistory = db.getMoodHistory(30);
      const check    = checkProgress(goal, phases, progress, moodHistory);

      const daysLeft = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24));

      let output = `📊 GOAL PROGRESS\n${"═".repeat(40)}\n`;
      output += `\n🎯 ${goal.title}\n`;
      output += `📅 Target: ${goal.target_date} (${daysLeft} days left)\n`;
      output += `\n📈 PROGRESS\n`;
      output += `  Completed:  ${progress.completed}/${progress.total} tasks\n`;
      output += `  Percentage: ${progress.percentage}%\n`;
      output += `  Expected:   ${check.expectedProgress}%\n`;
      output += `\n${check.message}\n`;
      output += `\n📋 PHASES\n`;
      phases.forEach(p => {
        output += `  Phase ${p.phase_number}: ${p.title} — ${p.duration_weeks} weeks\n`;
      });
      output += `\n${"═".repeat(40)}`;

      return { content: [{ type: "text", text: output }] };
    } catch (err) {
      logger.error("get_goal_progress failed: " + err.message);
      return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
    }
  }
);

// ══════════════════════════════════════════════════════════════════
// TOOL 14 — get_motivation
// ══════════════════════════════════════════════════════════════════
server.tool(
  "get_motivation",
  {},
  async () => {
    try {
      const db        = global.moodDB;
      const goal      = db.getActiveGoal();
      const todayMood = db.getTodayMood();
      const moodScore = todayMood?.score || 7;
      const patterns  = analyzeUserPatterns(db);

      const goalTitle  = goal?.title || "your goal";
      const motivation = getDailyMotivation(moodScore, goalTitle, patterns.duoStreak, patterns);

      return { content: [{ type: "text", text: `💬 ${motivation}` }] };
    } catch (err) {
      logger.error("get_motivation failed: " + err.message);
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