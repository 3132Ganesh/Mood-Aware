import { 
  User, InsertUser, 
  UserProfile, InsertUserProfile, 
  Task, MoodLog, MoodSwing, Plan, PlanItem, DailyHabit, FeelingsNote, TimeCapsule,
  InsertMoodLog, InsertMoodSwing, InsertDailyHabit, InsertFeelingsNote, InsertPlan, InsertPlanItem, InsertTimeCapsule,
  users, userProfiles, tasks, moodLogs, moodSwings, plans, planItems, dailyHabits, feelingsNotes, timeCapsules,
  PlanWithItems
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, ilike } from "drizzle-orm";
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
  getMoodLogByDate(userId: number, date: string): Promise<MoodLog | undefined>;
  createMoodSwing(swing: InsertMoodSwing & { userId: number }): Promise<MoodSwing>;
  getMoodSwings(userId: number, limit?: number): Promise<MoodSwing[]>;
  getTodayMoodSwings(userId: number, date: string): Promise<MoodSwing[]>;
  
  // Plans
  createPlan(plan: InsertPlan & { userId: number }): Promise<Plan>;
  createPlanItems(items: InsertPlanItem[]): Promise<PlanItem[]>;
  getActivePlan(userId: number): Promise<PlanWithItems | undefined>;
  completePlanItem(planId: number, itemId: number, isCompleted: boolean): Promise<PlanItem | undefined>;
  
  // Habits
  createHabitLog(log: InsertDailyHabit & { userId: number }): Promise<DailyHabit>;
  getHabitLogs(userId: number, limit?: number): Promise<DailyHabit[]>;
  getHabitLogByDate(userId: number, date: string): Promise<DailyHabit | undefined>;
  
  // Notes
  createNote(note: InsertFeelingsNote & { userId: number; sentimentScore?: number | null; timestamp?: Date | null }): Promise<FeelingsNote>;
  getNotes(userId: number): Promise<FeelingsNote[]>;
  
  // Time Capsules
  createTimeCapsule(capsule: InsertTimeCapsule & { userId: number }): Promise<TimeCapsule>;
  getTimeCapsules(userId: number): Promise<TimeCapsule[]>;
  getUndeliveredCapsule(userId: number): Promise<TimeCapsule | undefined>;
  markCapsuleDelivered(id: number, userId: number): Promise<TimeCapsule | undefined>;
  
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
  private timeCapsules: Map<number, TimeCapsule> = new Map();
  private moodSwings: Map<number, MoodSwing> = new Map();

  private currentUserId = 1;
  private currentProfileId = 1;
  private currentTaskId = 1;
  private currentMoodLogId = 1;
  private currentMoodSwingId = 1;
  private currentPlanId = 1;
  private currentPlanItemId = 1;
  private currentHabitId = 1;
  private currentNoteId = 1;
  private currentCapsuleId = 1;

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
    const clean = username.trim().toLowerCase();
    return Array.from(this.users.values()).find(u => u.email.trim().toLowerCase() === clean);
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
        feedback: profile.feedback || null,
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
      createdAt: new Date(),
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

  async getMoodLogByDate(userId: number, date: string): Promise<MoodLog | undefined> {
    const cleanDate = date.split('T')[0];
    return Array.from(this.moodLogs.values()).find(
      m => m.userId === userId && String(m.date).split('T')[0] === cleanDate
    );
  }

  async createMoodSwing(swing: InsertMoodSwing & { userId: number }): Promise<MoodSwing> {
    const id = this.currentMoodSwingId++;
    const created: MoodSwing = {
      id,
      userId: swing.userId,
      timestamp: new Date(),
      date: swing.date,
      previousMoodScore: swing.previousMoodScore ?? null,
      newMoodScore: swing.newMoodScore,
      newMoodLabel: swing.newMoodLabel,
      trigger: swing.trigger ?? null,
      intensity: swing.intensity ?? 3,
      notes: swing.notes ?? null,
    };
    this.moodSwings.set(id, created);
    return created;
  }

  async getMoodSwings(userId: number, limit = 20): Promise<MoodSwing[]> {
    return Array.from(this.moodSwings.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, limit);
  }

  async getTodayMoodSwings(userId: number, date: string): Promise<MoodSwing[]> {
    const cleanDate = date.split('T')[0];
    return Array.from(this.moodSwings.values())
      .filter(s => s.userId === userId && String(s.date).split('T')[0] === cleanDate)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
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

  async completePlanItem(planId: number, itemId: number, isCompleted: boolean): Promise<PlanItem | undefined> {
    const item = this.planItems.get(itemId);
    if (item && item.planId === planId) {
      const updated = { ...item, isCompleted };
      this.planItems.set(itemId, updated);
      return updated;
    }
    const found = Array.from(this.planItems.values()).find(i => (i.id === itemId || i.taskId === itemId) && i.planId === planId);
    if (found) {
      const updated = { ...found, isCompleted };
      this.planItems.set(found.id, updated);
      return updated;
    }
    return undefined;
  }

  async createHabitLog(log: InsertDailyHabit & { userId: number }): Promise<DailyHabit> {
    const id = this.currentHabitId++;
    const created: DailyHabit = {
      id,
      userId: log.userId,
      date: log.date,
      createdAt: new Date(),
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

  async getHabitLogByDate(userId: number, date: string): Promise<DailyHabit | undefined> {
    const cleanDate = date.split('T')[0];
    return Array.from(this.dailyHabits.values()).find(
      h => h.userId === userId && String(h.date).split('T')[0] === cleanDate
    );
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

  async createTimeCapsule(capsule: InsertTimeCapsule & { userId: number }): Promise<TimeCapsule> {
    const id = this.currentCapsuleId++;
    const created: TimeCapsule = {
      id,
      userId: capsule.userId,
      message: capsule.message,
      moodScore: capsule.moodScore,
      createdAt: new Date(),
      isDelivered: false,
      deliveredAt: null,
    };
    this.timeCapsules.set(id, created);
    return created;
  }

  async getTimeCapsules(userId: number): Promise<TimeCapsule[]> {
    return Array.from(this.timeCapsules.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getUndeliveredCapsule(userId: number): Promise<TimeCapsule | undefined> {
    return Array.from(this.timeCapsules.values())
      .find(c => c.userId === userId && !c.isDelivered);
  }

  async markCapsuleDelivered(id: number, userId: number): Promise<TimeCapsule | undefined> {
    const capsule = this.timeCapsules.get(id);
    if (!capsule || capsule.userId !== userId) return undefined;
    const updated: TimeCapsule = {
      ...capsule,
      isDelivered: true,
      deliveredAt: new Date(),
    };
    this.timeCapsules.set(id, updated);
    return updated;
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
    const clean = username.trim();
    const [user] = await db.select().from(users).where(ilike(users.email, clean));
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

  async getMoodLogByDate(userId: number, date: string): Promise<MoodLog | undefined> {
    const cleanDate = date.split('T')[0];
    const [log] = await db.select()
      .from(moodLogs)
      .where(and(eq(moodLogs.userId, userId), eq(moodLogs.date, cleanDate)))
      .limit(1);
    return log;
  }

  async createMoodSwing(swing: InsertMoodSwing & { userId: number }): Promise<MoodSwing> {
    const [created] = await db.insert(moodSwings).values(swing as any).returning();
    return created;
  }

  async getMoodSwings(userId: number, limit = 20): Promise<MoodSwing[]> {
    return db.select()
      .from(moodSwings)
      .where(eq(moodSwings.userId, userId))
      .orderBy(desc(moodSwings.timestamp))
      .limit(limit);
  }

  async getTodayMoodSwings(userId: number, date: string): Promise<MoodSwing[]> {
    const cleanDate = date.split('T')[0];
    return db.select()
      .from(moodSwings)
      .where(and(eq(moodSwings.userId, userId), eq(moodSwings.date, cleanDate)))
      .orderBy(desc(moodSwings.timestamp));
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

  async completePlanItem(planId: number, itemId: number, isCompleted: boolean): Promise<PlanItem | undefined> {
    const [updated] = await db.update(planItems)
      .set({ isCompleted })
      .where(and(eq(planItems.id, itemId), eq(planItems.planId, planId)))
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

  async getHabitLogByDate(userId: number, date: string): Promise<DailyHabit | undefined> {
    const cleanDate = date.split('T')[0];
    const [log] = await db.select()
      .from(dailyHabits)
      .where(and(eq(dailyHabits.userId, userId), eq(dailyHabits.date, cleanDate)))
      .limit(1);
    return log;
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

  async createTimeCapsule(capsule: InsertTimeCapsule & { userId: number }): Promise<TimeCapsule> {
    const [created] = await db.insert(timeCapsules).values(capsule as any).returning();
    return created;
  }

  async getTimeCapsules(userId: number): Promise<TimeCapsule[]> {
    return db.select()
      .from(timeCapsules)
      .where(eq(timeCapsules.userId, userId))
      .orderBy(desc(timeCapsules.createdAt));
  }

  async getUndeliveredCapsule(userId: number): Promise<TimeCapsule | undefined> {
    const [found] = await db.select()
      .from(timeCapsules)
      .where(and(eq(timeCapsules.userId, userId), eq(timeCapsules.isDelivered, false)))
      .limit(1);
    return found;
  }

  async markCapsuleDelivered(id: number, userId: number): Promise<TimeCapsule | undefined> {
    const [updated] = await db.update(timeCapsules)
      .set({ isDelivered: true, deliveredAt: new Date() })
      .where(and(eq(timeCapsules.id, id), eq(timeCapsules.userId, userId)))
      .returning();
    return updated;
  }

  async seedTasks() {
    const existing = await this.getAllTasks();
    if (existing.length > 0) return;
    await db.insert(tasks).values(DEFAULT_SEEDS.map(({ id, ...rest }) => rest));
  }
}

export const storage: IStorage = new DatabaseStorage();
