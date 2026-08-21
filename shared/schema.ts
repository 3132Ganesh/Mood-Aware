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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  feedback: text("feedback"),
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  moodScore: integer("mood_score").notNull(),
  moodLabel: text("mood_label"),
  stressScore: integer("stress_score"),
  sleepScore: integer("sleep_score"),
  energyScore: integer("energy_score"),
  notes: text("notes"),
});

export const moodSwings = pgTable("mood_swings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow(),
  date: date("date").notNull(),
  previousMoodScore: integer("previous_mood_score"),
  newMoodScore: integer("new_mood_score").notNull(),
  newMoodLabel: text("new_mood_label").notNull(),
  trigger: text("trigger"),
  intensity: integer("intensity").default(3),
  notes: text("notes"),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

export const planItems = pgTable("plan_items", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  dayDate: date("day_date").notNull(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  isCompleted: boolean("is_completed").default(false),
});

export const dailyHabits = pgTable("daily_habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  routineFollowed: boolean("routine_followed"),
  extraPhysicalActivity: boolean("extra_physical_activity"),
  screenTimeHours: integer("screen_time_hours"),
});

export const feelingsNotes = pgTable("feelings_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow(),
  title: text("title"),
  content: text("content").notNull(),
  sentimentScore: integer("sentiment_score"),
});

export const timeCapsules = pgTable("time_capsules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  message: text("message").notNull(),
  moodScore: integer("mood_score").default(5), // Mood score when written (e.g. 5)
  isDelivered: boolean("is_delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
});

export const sleepSessions = pgTable("sleep_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastDeviceUse: timestamp("last_device_use").notNull(),
  firstDevicePickup: timestamp("first_device_pickup").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  alignmentScore: integer("alignment_score").default(100),
  isConfirmed: boolean("is_confirmed").default(false),
  notes: text("notes"),
});

export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, userId: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({ id: true, userId: true, createdAt: true });
export const insertMoodSwingSchema = createInsertSchema(moodSwings).omit({ id: true, userId: true, timestamp: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, userId: true });
export const insertPlanItemSchema = createInsertSchema(planItems).omit({ id: true });
export const insertDailyHabitSchema = createInsertSchema(dailyHabits).omit({ id: true, userId: true, createdAt: true });
export const insertFeelingsNoteSchema = createInsertSchema(feelingsNotes).omit({ id: true, userId: true, timestamp: true });
export const insertTimeCapsuleSchema = createInsertSchema(timeCapsules).omit({ id: true, userId: true, createdAt: true, isDelivered: true, deliveredAt: true });
export const insertSleepSessionSchema = createInsertSchema(sleepSessions).omit({ id: true, userId: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type MoodLog = typeof moodLogs.$inferSelect;
export type MoodSwing = typeof moodSwings.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type PlanItem = typeof planItems.$inferSelect;
export type DailyHabit = typeof dailyHabits.$inferSelect;
export type FeelingsNote = typeof feelingsNotes.$inferSelect;
export type TimeCapsule = typeof timeCapsules.$inferSelect;
export type SleepSession = typeof sleepSessions.$inferSelect;

export type PlanWithItems = Plan & { items: (PlanItem & { task: Task })[] };

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;
export type InsertMoodSwing = z.infer<typeof insertMoodSwingSchema>;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertPlanItem = z.infer<typeof insertPlanItemSchema>;
export type InsertDailyHabit = z.infer<typeof insertDailyHabitSchema>;
export type InsertFeelingsNote = z.infer<typeof insertFeelingsNoteSchema>;
export type InsertTimeCapsule = z.infer<typeof insertTimeCapsuleSchema>;
export type InsertSleepSession = z.infer<typeof insertSleepSessionSchema>;

export * from "./models/chat";
