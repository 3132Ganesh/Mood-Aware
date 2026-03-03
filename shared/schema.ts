import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  ageGroup: text("age_group"),
  occupation: text("occupation"),
  sleepTime: text("sleep_time"),
  wakeTime: text("wake_time"),
  breakFrequency: text("break_frequency"),
  caffeineIntake: text("caffeine_intake"),
  physicalActivity: text("physical_activity"),
  musicApp: text("music_app"),
  // Stored as JSON arrays
  musicMoods: text("music_moods").array(),
  playsGames: boolean("plays_games"),
  gamePlatforms: text("game_platforms").array(),
  gameTypes: text("game_types").array(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // mental, physical, music, game
  duration: integer("duration"), // minutes
  difficulty: text("difficulty"), // easy, medium
  timeHint: text("time_hint"), // morning, afternoon, evening
});

export const moodLogs = pgTable("mood_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  moodScore: integer("mood_score").notNull(),
  moodLabel: text("mood_label"),
  stressScore: integer("stress_score"),
  sleepScore: integer("sleep_score"),
  energyScore: integer("energy_score"),
  notes: text("notes"),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

export const planItems = pgTable("plan_items", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plans.id),
  dayDate: date("day_date").notNull(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  isCompleted: boolean("is_completed").default(false),
});

export const dailyHabits = pgTable("daily_habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  routineFollowed: boolean("routine_followed"),
  extraPhysicalActivity: boolean("extra_physical_activity"),
  screenTimeHours: integer("screen_time_hours"),
});

export const feelingsNotes = pgTable("feelings_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
  title: text("title"),
  content: text("content").notNull(),
  sentimentScore: integer("sentiment_score"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, userId: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({ id: true, userId: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, userId: true });
export const insertPlanItemSchema = createInsertSchema(planItems).omit({ id: true });
export const insertDailyHabitSchema = createInsertSchema(dailyHabits).omit({ id: true, userId: true });
export const insertFeelingsNoteSchema = createInsertSchema(feelingsNotes).omit({ id: true, userId: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type MoodLog = typeof moodLogs.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type PlanItem = typeof planItems.$inferSelect;
export type DailyHabit = typeof dailyHabits.$inferSelect;
export type FeelingsNote = typeof feelingsNotes.$inferSelect;

export type PlanWithItems = Plan & { items: (PlanItem & { task: Task })[] };
