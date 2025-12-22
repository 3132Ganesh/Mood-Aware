import { 
  User, InsertUser, 
  UserProfile, UserProfile as InsertUserProfile, 
  Task, MoodLog, Plan, PlanItem, DailyHabit, FeelingsNote,
  users, userProfiles, tasks, moodLogs, plans, planItems, dailyHabits, feelingsNotes,
  PlanWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { name: string }): Promise<User>;
  
  // Profile
  getProfile(userId: number): Promise<UserProfile | undefined>;
  createOrUpdateProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Tasks (Repo)
  getAllTasks(): Promise<Task[]>;
  getTasksByCategory(category: string): Promise<Task[]>;
  
  // Mood
  createMoodLog(log: MoodLog): Promise<MoodLog>;
  getMoodLogs(userId: number, limit?: number): Promise<MoodLog[]>;
  getLastMoodLog(userId: number): Promise<MoodLog | undefined>;
  
  // Plans
  createPlan(plan: Plan): Promise<Plan>;
  createPlanItems(items: PlanItem[]): Promise<PlanItem[]>;
  getActivePlan(userId: number): Promise<PlanWithItems | undefined>;
  completePlanItem(itemId: number, isCompleted: boolean): Promise<PlanItem>;
  
  // Habits
  createHabitLog(log: DailyHabit): Promise<DailyHabit>;
  getHabitLogs(userId: number, limit?: number): Promise<DailyHabit[]>;
  
  // Notes
  createNote(note: FeelingsNote): Promise<FeelingsNote>;
  getNotes(userId: number): Promise<FeelingsNote[]>;
  
  // Seeding
  seedTasks(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username)); // email is username
    return user;
  }

  async createUser(insertUser: InsertUser & { name: string }): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createOrUpdateProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    if (existing) {
      const [updated] = await db.update(userProfiles)
        .set(profile)
        .where(eq(userProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userProfiles)
        .values({ ...profile, userId } as any) // Force cast
        .returning();
      return created;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTasksByCategory(category: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.category, category));
  }

  async createMoodLog(log: MoodLog): Promise<MoodLog> {
    const [created] = await db.insert(moodLogs).values(log).returning();
    return created;
  }

  async getMoodLogs(userId: number, limit = 14): Promise<MoodLog[]> {
    return db.select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, userId))
      .orderBy(desc(moodLogs.date))
      .limit(limit);
  }

  async getLastMoodLog(userId: number): Promise<MoodLog | undefined> {
    const [log] = await db.select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, userId))
      .orderBy(desc(moodLogs.date))
      .limit(1);
    return log;
  }

  async createPlan(plan: Plan): Promise<Plan> {
    // Deactivate old plans
    await db.update(plans)
      .set({ isActive: false })
      .where(and(eq(plans.userId, plan.userId), eq(plans.isActive, true)));

    const [created] = await db.insert(plans).values(plan).returning();
    return created;
  }

  async createPlanItems(items: PlanItem[]): Promise<PlanItem[]> {
    return db.insert(planItems).values(items).returning();
  }

  async getActivePlan(userId: number): Promise<PlanWithItems | undefined> {
    const [plan] = await db.select()
      .from(plans)
      .where(and(eq(plans.userId, userId), eq(plans.isActive, true)));
    
    if (!plan) return undefined;

    const items = await db.select({
        id: planItems.id,
        planId: planItems.planId,
        dayDate: planItems.dayDate,
        taskId: planItems.taskId,
        isCompleted: planItems.isCompleted,
        task: tasks
      })
      .from(planItems)
      .innerJoin(tasks, eq(planItems.taskId, tasks.id))
      .where(eq(planItems.planId, plan.id))
      .orderBy(planItems.dayDate);

    return { ...plan, items };
  }

  async completePlanItem(itemId: number, isCompleted: boolean): Promise<PlanItem> {
    const [updated] = await db.update(planItems)
      .set({ isCompleted })
      .where(eq(planItems.id, itemId))
      .returning();
    return updated;
  }

  async createHabitLog(log: DailyHabit): Promise<DailyHabit> {
    const [created] = await db.insert(dailyHabits).values(log).returning();
    return created;
  }

  async getHabitLogs(userId: number, limit = 14): Promise<DailyHabit[]> {
    return db.select()
      .from(dailyHabits)
      .where(eq(dailyHabits.userId, userId))
      .orderBy(desc(dailyHabits.date))
      .limit(limit);
  }

  async createNote(note: FeelingsNote): Promise<FeelingsNote> {
    const [created] = await db.insert(feelingsNotes).values(note).returning();
    return created;
  }

  async getNotes(userId: number): Promise<FeelingsNote[]> {
    return db.select()
      .from(feelingsNotes)
      .where(eq(feelingsNotes.userId, userId))
      .orderBy(desc(feelingsNotes.timestamp));
  }

  async seedTasks() {
    const existing = await this.getAllTasks();
    if (existing.length > 0) return;

    const seedData = [
      { title: "5-min Meditation", category: "mental", duration: 5, difficulty: "easy", description: "Sit quietly and focus on your breath." },
      { title: "Gratitude Journaling", category: "mental", duration: 10, difficulty: "easy", description: "Write down 3 things you are grateful for." },
      { title: "Light Stretching", category: "physical", duration: 10, difficulty: "easy", description: "Stretch your arms, legs, and back." },
      { title: "20-min Walk", category: "physical", duration: 20, difficulty: "medium", description: "Go for a brisk walk outside." },
      { title: "Listen to 'Calm' Playlist", category: "music", duration: 15, difficulty: "easy", description: "Relax with some soothing music." },
      { title: "High Energy Dance", category: "music", duration: 10, difficulty: "medium", description: "Dance to your favorite upbeat song." },
      { title: "Puzzle Game Session", category: "game", duration: 15, difficulty: "easy", description: "Play a relaxing puzzle game." },
      { title: "Deep Breathing", category: "mental", duration: 5, difficulty: "easy", description: "Box breathing technique." },
    ];
    
    await db.insert(tasks).values(seedData);
  }
}

export const storage = new DatabaseStorage();
