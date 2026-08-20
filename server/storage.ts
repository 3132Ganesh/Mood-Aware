import { 
  User, InsertUser, 
  UserProfile, InsertUserProfile, 
  Task, MoodLog, Plan, PlanItem, DailyHabit, FeelingsNote,
  InsertMoodLog, InsertDailyHabit, InsertFeelingsNote, InsertPlan, InsertPlanItem,
  users, userProfiles, tasks, moodLogs, plans, planItems, dailyHabits, feelingsNotes,
  PlanWithItems
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

const DEFAULT_SEEDS = [
  { id: 1, title: "5-min Meditation", category: "mental", duration: 5, difficulty: "easy", description: "Sit quietly and focus on your breath.", timeHint: "morning" },
  { id: 2, title: "Gratitude Journaling", category: "mental", duration: 10, difficulty: "easy", description: "Write down 3 things you are grateful for.", timeHint: "morning" },
  { id: 3, title: "Light Stretching", category: "physical", duration: 10, difficulty: "easy", description: "Stretch your arms, legs, and back.", timeHint: "afternoon" },
  { id: 4, title: "20-min Walk", category: "physical", duration: 20, difficulty: "medium", description: "Go for a brisk walk outside.", timeHint: "afternoon" },
  { id: 5, title: "Listen to 'Calm' Playlist", category: "music", duration: 15, difficulty: "easy", description: "Relax with some soothing music.", timeHint: "evening" },
  { id: 6, title: "High Energy Dance", category: "music", duration: 10, difficulty: "medium", description: "Dance to your favorite upbeat song.", timeHint: "afternoon" },
  { id: 7, title: "Puzzle Game Session", category: "game", duration: 15, difficulty: "easy", description: "Play a relaxing puzzle game.", timeHint: "evening" },
  { id: 8, title: "Deep Breathing", category: "mental", duration: 5, difficulty: "easy", description: "Box breathing technique.", timeHint: "morning" },
];

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
  createMoodLog(log: InsertMoodLog & { userId: number }): Promise<MoodLog>;
  getMoodLogs(userId: number, limit?: number): Promise<MoodLog[]>;
  getLastMoodLog(userId: number): Promise<MoodLog | undefined>;
  
  // Plans
  createPlan(plan: InsertPlan & { userId: number }): Promise<Plan>;
  createPlanItems(items: InsertPlanItem[]): Promise<PlanItem[]>;
  getActivePlan(userId: number): Promise<PlanWithItems | undefined>;
  completePlanItem(itemId: number, isCompleted: boolean): Promise<PlanItem>;
  
  // Habits
  createHabitLog(log: InsertDailyHabit & { userId: number }): Promise<DailyHabit>;
  getHabitLogs(userId: number, limit?: number): Promise<DailyHabit[]>;
  
  // Notes
  createNote(note: InsertFeelingsNote & { userId: number; sentimentScore?: number | null; timestamp?: Date | null }): Promise<FeelingsNote>;
  getNotes(userId: number): Promise<FeelingsNote[]>;
  
  // Seeding
  seedTasks(): Promise<void>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User> = new Map();
  private userProfiles: Map<number, UserProfile> = new Map();
  private tasks: Map<number, Task> = new Map();
  private moodLogs: Map<number, MoodLog> = new Map();
  private plans: Map<number, Plan> = new Map();
  private planItems: Map<number, PlanItem> = new Map();
  private dailyHabits: Map<number, DailyHabit> = new Map();
  private feelingsNotes: Map<number, FeelingsNote> = new Map();

  private currentUserId = 1;
  private currentProfileId = 1;
  private currentTaskId = 1;
  private currentMoodLogId = 1;
  private currentPlanId = 1;
  private currentPlanItemId = 1;
  private currentHabitId = 1;
  private currentNoteId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    for (const task of DEFAULT_SEEDS) {
      this.tasks.set(task.id, task as Task);
      this.currentTaskId = Math.max(this.currentTaskId, task.id + 1);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === username.toLowerCase());
  }

  async createUser(insertUser: InsertUser & { name: string }): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getProfile(userId: number): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(p => p.userId === userId);
  }

  async createOrUpdateProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    if (existing) {
      const updated: UserProfile = { ...existing, ...profile };
      this.userProfiles.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentProfileId++;
      const created: UserProfile = {
        id,
        userId,
        ageGroup: profile.ageGroup || null,
        occupation: profile.occupation || null,
        sleepTime: profile.sleepTime || null,
        wakeTime: profile.wakeTime || null,
        breakFrequency: profile.breakFrequency || null,
        caffeineIntake: profile.caffeineIntake || null,
        physicalActivity: profile.physicalActivity || null,
        musicApp: profile.musicApp || null,
        musicMoods: (profile.musicMoods as string[]) || null,
        playsGames: profile.playsGames ?? null,
        gamePlatforms: (profile.gamePlatforms as string[]) || null,
        gameTypes: (profile.gameTypes as string[]) || null,
      };
      this.userProfiles.set(id, created);
      return created;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByCategory(category: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.category === category);
  }

  async createMoodLog(log: InsertMoodLog & { userId: number }): Promise<MoodLog> {
    const id = this.currentMoodLogId++;
    const created: MoodLog = {
      id,
      userId: log.userId,
      date: log.date,
      moodScore: log.moodScore,
      moodLabel: log.moodLabel || null,
      stressScore: log.stressScore || null,
      sleepScore: log.sleepScore || null,
      energyScore: log.energyScore || null,
      notes: log.notes || null,
    };
    this.moodLogs.set(id, created);
    return created;
  }

  async getMoodLogs(userId: number, limit = 14): Promise<MoodLog[]> {
    return Array.from(this.moodLogs.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getLastMoodLog(userId: number): Promise<MoodLog | undefined> {
    const logs = await this.getMoodLogs(userId, 1);
    return logs[0];
  }

  async createPlan(plan: InsertPlan & { userId: number }): Promise<Plan> {
    Array.from(this.plans.entries()).forEach(([id, p]) => {
      if (p.userId === plan.userId && p.isActive) {
        this.plans.set(id, { ...p, isActive: false });
      }
    });
    const id = this.currentPlanId++;
    const created: Plan = {
      id,
      userId: plan.userId,
      startDate: plan.startDate,
      endDate: plan.endDate,
      isActive: plan.isActive ?? true,
    };
    this.plans.set(id, created);
    return created;
  }

  async createPlanItems(items: InsertPlanItem[]): Promise<PlanItem[]> {
    const createdItems: PlanItem[] = [];
    for (const item of items) {
      const id = this.currentPlanItemId++;
      const created: PlanItem = {
        id,
        planId: item.planId,
        dayDate: item.dayDate,
        taskId: item.taskId,
        isCompleted: item.isCompleted ?? false,
      };
      this.planItems.set(id, created);
      createdItems.push(created);
    }
    return createdItems;
  }

  async getActivePlan(userId: number): Promise<PlanWithItems | undefined> {
    const plan = Array.from(this.plans.values()).find(p => p.userId === userId && p.isActive);
    if (!plan) return undefined;

    const items: (PlanItem & { task: Task })[] = [];
    Array.from(this.planItems.values()).forEach(item => {
      if (item.planId === plan.id) {
        const task = this.tasks.get(item.taskId) || {
          id: item.taskId,
          title: "Wellness Activity",
          description: "Take time for yourself",
          category: "mental",
          duration: 10,
          difficulty: "easy",
          timeHint: "morning",
        };
        items.push({ ...item, task });
      }
    });

    items.sort((a, b) => new Date(a.dayDate).getTime() - new Date(b.dayDate).getTime());
    return { ...plan, items };
  }

  async completePlanItem(itemId: number, isCompleted: boolean): Promise<PlanItem> {
    const item = this.planItems.get(itemId);
    if (!item) {
      const found = Array.from(this.planItems.values()).find(i => i.id === itemId || i.taskId === itemId);
      if (found) {
        const updated = { ...found, isCompleted };
        this.planItems.set(found.id, updated);
        return updated;
      }
      throw new Error(`Plan item ${itemId} not found`);
    }
    const updated = { ...item, isCompleted };
    this.planItems.set(itemId, updated);
    return updated;
  }

  async createHabitLog(log: InsertDailyHabit & { userId: number }): Promise<DailyHabit> {
    const id = this.currentHabitId++;
    const created: DailyHabit = {
      id,
      userId: log.userId,
      date: log.date,
      routineFollowed: log.routineFollowed ?? null,
      extraPhysicalActivity: log.extraPhysicalActivity ?? null,
      screenTimeHours: log.screenTimeHours ?? null,
    };
    this.dailyHabits.set(id, created);
    return created;
  }

  async getHabitLogs(userId: number, limit = 14): Promise<DailyHabit[]> {
    return Array.from(this.dailyHabits.values())
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createNote(note: InsertFeelingsNote & { userId: number; sentimentScore?: number | null; timestamp?: Date | null }): Promise<FeelingsNote> {
    const id = this.currentNoteId++;
    const created: FeelingsNote = {
      id,
      userId: note.userId,
      timestamp: note.timestamp || new Date(),
      title: note.title || null,
      content: note.content,
      sentimentScore: note.sentimentScore ?? 5,
    };
    this.feelingsNotes.set(id, created);
    return created;
  }

  async getNotes(userId: number): Promise<FeelingsNote[]> {
    return Array.from(this.feelingsNotes.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }

  async seedTasks(): Promise<void> {
    // Seeded in constructor
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    if (pool) {
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true,
      });
    } else {
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000,
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
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
        .values({ ...profile, userId } as any)
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

  async createMoodLog(log: InsertMoodLog & { userId: number }): Promise<MoodLog> {
    const [created] = await db.insert(moodLogs).values(log as any).returning();
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

  async createPlan(plan: InsertPlan & { userId: number }): Promise<Plan> {
    await db.update(plans)
      .set({ isActive: false })
      .where(and(eq(plans.userId, plan.userId), eq(plans.isActive, true)));

    const [created] = await db.insert(plans).values(plan as any).returning();
    return created;
  }

  async createPlanItems(items: InsertPlanItem[]): Promise<PlanItem[]> {
    return db.insert(planItems).values(items as any).returning();
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

  async createHabitLog(log: InsertDailyHabit & { userId: number }): Promise<DailyHabit> {
    const [created] = await db.insert(dailyHabits).values(log as any).returning();
    return created;
  }

  async getHabitLogs(userId: number, limit = 14): Promise<DailyHabit[]> {
    return db.select()
      .from(dailyHabits)
      .where(eq(dailyHabits.userId, userId))
      .orderBy(desc(dailyHabits.date))
      .limit(limit);
  }

  async createNote(note: InsertFeelingsNote & { userId: number; sentimentScore?: number | null; timestamp?: Date | null }): Promise<FeelingsNote> {
    const [created] = await db.insert(feelingsNotes).values(note as any).returning();
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
    await db.insert(tasks).values(DEFAULT_SEEDS.map(({ id, ...rest }) => rest));
  }
}

export const storage: IStorage = pool ? new DatabaseStorage() : new MemStorage();
