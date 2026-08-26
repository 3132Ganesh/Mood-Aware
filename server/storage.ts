import { 
  User, InsertUser, 
  UserProfile, InsertUserProfile, 
  Task, MoodLog, MoodSwing, Plan, PlanItem, DailyHabit, FeelingsNote, TimeCapsule, SleepSession,
  UserGoal, GoalRoadmap, GoalCheckpoint, UserGoalWithDetails,
  InsertMoodLog, InsertMoodSwing, InsertDailyHabit, InsertFeelingsNote, InsertPlan, InsertPlanItem, InsertTimeCapsule, InsertSleepSession,
  InsertUserGoal, InsertGoalRoadmap, InsertGoalCheckpoint,
  users, userProfiles, tasks, moodLogs, moodSwings, plans, planItems, dailyHabits, feelingsNotes, timeCapsules, sleepSessions,
  userGoals, goalRoadmaps, goalCheckpoints,
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
  // --- EASY (🟢 Daily Micro-Habits & Nutrition) ---
  { id: 1, title: "5-min Meditation & Mind Reset", category: "mental", duration: 5, difficulty: "easy", taskType: "mind", dietTip: null, description: "Sit quietly and focus on box breathing.", timeHint: "morning" },
  { id: 2, title: "Hydration Goal: 500ml Water", category: "diet", duration: 2, difficulty: "easy", taskType: "diet", dietTip: "Drink a glass of water right after waking up to boost metabolism.", description: "Kickstart your day with pure hydration.", timeHint: "morning" },
  { id: 3, title: "Software Concept: Read 1 Tech Article", category: "career", duration: 10, difficulty: "easy", taskType: "career", dietTip: null, description: "Read a short system design or clean code snippet.", timeHint: "morning" },
  { id: 4, title: "Data Analyst: Review 1 SQL Command", category: "career", duration: 5, difficulty: "easy", taskType: "career", dietTip: null, description: "Review JOINs, GROUP BY, or Window functions.", timeHint: "afternoon" },
  { id: 5, title: "Product Tip: Inspect 1 Favorite App UI", category: "career", duration: 10, difficulty: "easy", taskType: "career", dietTip: null, description: "Analyze user flow & friction points in an app you use.", timeHint: "afternoon" },
  { id: 6, title: "Protein Nudge: Eat 20g Protein Snack", category: "diet", duration: 5, difficulty: "easy", taskType: "diet", dietTip: "Boiled eggs, Greek yogurt, or protein shake keeps energy steady.", description: "Refuel your body mid-day.", timeHint: "afternoon" },
  { id: 7, title: "10-min Evening Decompression", category: "mental", duration: 10, difficulty: "easy", taskType: "mind", dietTip: null, description: "Unplug screens 30 mins before sleep and journal key wins.", timeHint: "evening" },

  // --- MEDIUM (🟡 Weekday Skill & Fitness Workouts) ---
  { id: 8, title: "20-min Brisk Walk or Core Stretch", category: "physical", duration: 20, difficulty: "medium", taskType: "fitness", dietTip: "Stay hydrated during exercise.", description: "Elevate your heart rate and loosen tight muscles.", timeHint: "afternoon" },
  { id: 9, title: "Software Eng: Solve 1 Coding Problem", category: "career", duration: 25, difficulty: "medium", taskType: "career", dietTip: null, description: "Practice 1 algorithmic problem (Strings/Arrays).", timeHint: "afternoon" },
  { id: 10, title: "Data Science: Clean a CSV Dataset", category: "career", duration: 25, difficulty: "medium", taskType: "career", dietTip: null, description: "Handle missing values and plot simple histograms with Pandas.", timeHint: "afternoon" },
  { id: 11, title: "Product: Write 1 User Story & PRD outline", category: "career", duration: 20, difficulty: "medium", taskType: "career", dietTip: null, description: "Define acceptance criteria for a new feature.", timeHint: "morning" },
  { id: 12, title: "Cybersecurity: Study 1 Network Vulnerability", category: "career", duration: 20, difficulty: "medium", taskType: "career", dietTip: null, description: "Learn OWASP Top 10 mitigation strategies.", timeHint: "afternoon" },
  { id: 13, title: "Balanced Meal Prep: Color-Rich Plate", category: "diet", duration: 15, difficulty: "medium", taskType: "diet", dietTip: "Combine greens, lean protein, and complex carbs for steady focus.", description: "Prepare a clean meal for optimal recovery.", timeHint: "afternoon" },

  // --- HARD (🔴 Weekend Milestone Projects & Deep Challenges) ---
  { id: 14, title: "Weekend Project: Build 1 Micro-Feature", category: "career", duration: 45, difficulty: "hard", taskType: "career", dietTip: null, description: "Implement a full API route + React component for your portfolio project.", timeHint: "afternoon" },
  { id: 15, title: "Data Dashboard: Build Interactive Chart", category: "career", duration: 45, difficulty: "hard", taskType: "career", dietTip: null, description: "Transform raw data into a visual dashboard.", timeHint: "afternoon" },
  { id: 16, title: "Full Body Workout Session", category: "physical", duration: 45, difficulty: "hard", taskType: "fitness", dietTip: "Consume 25-30g protein within 45 mins post-workout.", description: "High-intensity cardio or strength training challenge.", timeHint: "morning" },
  { id: 17, title: "Weekly Goal & Mindset Audit", category: "mental", duration: 30, difficulty: "hard", taskType: "mind", dietTip: null, description: "Review past 7 days, identify habit blockers, set next week's focus.", timeHint: "evening" },
];

export interface IStorage {
  sessionStore: session.Store;
  
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { name: string }): Promise<User>;
  updateUser(id: number, data: Partial<Pick<User, "name">>): Promise<User | undefined>;
  
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
  
  // Sleep
  logSleepSession(userId: number, session: InsertSleepSession): Promise<SleepSession>;
  getTodaySleepSession(userId: number, date: string): Promise<SleepSession | undefined>;
  getSleepHistory(userId: number, limit?: number): Promise<SleepSession[]>;

  // Goals & Roadmaps
  createGoal(goal: InsertUserGoal & { userId: number }): Promise<UserGoal>;
  getUserGoals(userId: number): Promise<UserGoalWithDetails[]>;
  getGoalById(goalId: number, userId: number): Promise<UserGoalWithDetails | undefined>;
  deleteGoal(goalId: number, userId: number): Promise<boolean>;
  createGoalRoadmap(roadmap: InsertGoalRoadmap & { userId: number }): Promise<GoalRoadmap>;
  getGoalRoadmap(goalId: number): Promise<GoalRoadmap | undefined>;
  createGoalCheckpoints(checkpoints: InsertGoalCheckpoint[]): Promise<GoalCheckpoint[]>;
  getGoalCheckpoints(goalId: number): Promise<GoalCheckpoint[]>;
  toggleCheckpoint(checkpointId: number, userId: number, isCompleted: boolean): Promise<GoalCheckpoint | undefined>;

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
  private sleepSessions: Map<number, SleepSession> = new Map();

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
  private currentSleepSessionId = 1;

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

  async updateUser(id: number, data: Partial<Pick<User, "name">>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
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
      moodScore: capsule.moodScore ?? 5,
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

  async logSleepSession(userId: number, data: InsertSleepSession): Promise<SleepSession> {
    const cleanDate = String(data.date).split('T')[0];
    const existing = await this.getTodaySleepSession(userId, cleanDate);
    if (existing) {
      const updated: SleepSession = {
        ...existing,
        ...data,
        lastDeviceUse: new Date(data.lastDeviceUse),
        firstDevicePickup: new Date(data.firstDevicePickup),
        alignmentScore: data.alignmentScore ?? 100,
        isConfirmed: data.isConfirmed ?? false,
        notes: data.notes ?? null,
      };
      this.sleepSessions.set(existing.id, updated);
      return updated;
    }
    const id = this.currentSleepSessionId++;
    const session: SleepSession = {
      id,
      userId,
      date: cleanDate,
      createdAt: new Date(),
      lastDeviceUse: new Date(data.lastDeviceUse),
      firstDevicePickup: new Date(data.firstDevicePickup),
      durationMinutes: data.durationMinutes,
      alignmentScore: data.alignmentScore ?? 100,
      isConfirmed: data.isConfirmed ?? false,
      notes: data.notes ?? null,
    };
    this.sleepSessions.set(id, session);
    return session;
  }

  async getTodaySleepSession(userId: number, date: string): Promise<SleepSession | undefined> {
    const cleanDate = date.split('T')[0];
    return Array.from(this.sleepSessions.values()).find(
      s => s.userId === userId && String(s.date).split('T')[0] === cleanDate
    );
  }

  async getSleepHistory(userId: number, limit = 14): Promise<SleepSession[]> {
    return Array.from(this.sleepSessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async seedTasks(): Promise<void> {
    // Seeded in constructor
  }

  // --- Goals & Roadmaps ---
  private userGoalsMap: Map<number, UserGoal> = new Map();
  private goalRoadmapsMap: Map<number, GoalRoadmap> = new Map();
  private goalCheckpointsMap: Map<number, GoalCheckpoint> = new Map();
  private currentGoalId = 1;
  private currentRoadmapId = 1;
  private currentCheckpointId = 1;

  async createGoal(goal: InsertUserGoal & { userId: number }): Promise<UserGoal> {
    const id = this.currentGoalId++;
    const created: UserGoal = {
      id,
      userId: goal.userId,
      title: goal.title,
      category: goal.category,
      description: goal.description || null,
      targetDeadline: goal.targetDeadline || "30 Days",
      skillLevel: goal.skillLevel || "scratch",
      status: goal.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userGoalsMap.set(id, created);
    return created;
  }

  async getUserGoals(userId: number): Promise<UserGoalWithDetails[]> {
    const goals = Array.from(this.userGoalsMap.values())
      .filter(g => g.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const result: UserGoalWithDetails[] = [];
    for (const goal of goals) {
      const roadmap = await this.getGoalRoadmap(goal.id);
      const checkpoints = await this.getGoalCheckpoints(goal.id);
      const completedCount = checkpoints.filter(c => c.isCompleted).length;
      const progressPercent = checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;

      result.push({
        ...goal,
        roadmap,
        checkpoints,
        progressPercent,
      });
    }
    return result;
  }

  async getGoalById(goalId: number, userId: number): Promise<UserGoalWithDetails | undefined> {
    const goal = this.userGoalsMap.get(goalId);
    if (!goal || goal.userId !== userId) return undefined;
    const roadmap = await this.getGoalRoadmap(goal.id);
    const checkpoints = await this.getGoalCheckpoints(goal.id);
    const completedCount = checkpoints.filter(c => c.isCompleted).length;
    const progressPercent = checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;
    return {
      ...goal,
      roadmap,
      checkpoints,
      progressPercent,
    };
  }

  async deleteGoal(goalId: number, userId: number): Promise<boolean> {
    const goal = this.userGoalsMap.get(goalId);
    if (!goal || goal.userId !== userId) return false;
    this.userGoalsMap.delete(goalId);
    Array.from(this.goalRoadmapsMap.entries()).forEach(([id, r]) => {
      if (r.goalId === goalId) this.goalRoadmapsMap.delete(id);
    });
    Array.from(this.goalCheckpointsMap.entries()).forEach(([id, c]) => {
      if (c.goalId === goalId) this.goalCheckpointsMap.delete(id);
    });
    return true;
  }

  async createGoalRoadmap(roadmap: InsertGoalRoadmap & { userId: number }): Promise<GoalRoadmap> {
    Array.from(this.goalRoadmapsMap.entries()).forEach(([id, r]) => {
      if (r.goalId === roadmap.goalId) this.goalRoadmapsMap.delete(id);
    });
    const id = this.currentRoadmapId++;
    const created: GoalRoadmap = {
      id,
      goalId: roadmap.goalId,
      userId: roadmap.userId,
      title: roadmap.title,
      aiSelfTrainedSummary: roadmap.aiSelfTrainedSummary || null,
      phases: roadmap.phases,
      recommendedTools: roadmap.recommendedTools || null,
      searchQueries: roadmap.searchQueries || null,
      createdAt: new Date(),
    };
    this.goalRoadmapsMap.set(id, created);
    return created;
  }

  async getGoalRoadmap(goalId: number): Promise<GoalRoadmap | undefined> {
    return Array.from(this.goalRoadmapsMap.values()).find(r => r.goalId === goalId);
  }

  async createGoalCheckpoints(checkpoints: InsertGoalCheckpoint[]): Promise<GoalCheckpoint[]> {
    const createdList: GoalCheckpoint[] = [];
    for (const cp of checkpoints) {
      const id = this.currentCheckpointId++;
      const created: GoalCheckpoint = {
        id,
        roadmapId: cp.roadmapId,
        goalId: cp.goalId,
        phaseIndex: cp.phaseIndex,
        title: cp.title,
        instruction: cp.instruction || null,
        isCompleted: cp.isCompleted ?? false,
        dueDate: cp.dueDate || null,
      };
      this.goalCheckpointsMap.set(id, created);
      createdList.push(created);
    }
    return createdList;
  }

  async getGoalCheckpoints(goalId: number): Promise<GoalCheckpoint[]> {
    return Array.from(this.goalCheckpointsMap.values())
      .filter(c => c.goalId === goalId)
      .sort((a, b) => a.phaseIndex - b.phaseIndex || a.id - b.id);
  }

  async toggleCheckpoint(checkpointId: number, userId: number, isCompleted: boolean): Promise<GoalCheckpoint | undefined> {
    const cp = this.goalCheckpointsMap.get(checkpointId);
    if (!cp) return undefined;
    const goal = this.userGoalsMap.get(cp.goalId);
    if (!goal || goal.userId !== userId) return undefined;
    const updated = { ...cp, isCompleted };
    this.goalCheckpointsMap.set(checkpointId, updated);
    return updated;
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

  async updateUser(id: number, data: Partial<Pick<User, "name">>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated;
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

  async logSleepSession(userId: number, data: InsertSleepSession): Promise<SleepSession> {
    const cleanDate = String(data.date).split('T')[0];
    const existing = await this.getTodaySleepSession(userId, cleanDate);
    if (existing) {
      const [updated] = await db.update(sleepSessions)
        .set({
          lastDeviceUse: new Date(data.lastDeviceUse),
          firstDevicePickup: new Date(data.firstDevicePickup),
          durationMinutes: data.durationMinutes,
          alignmentScore: data.alignmentScore ?? 100,
          isConfirmed: data.isConfirmed ?? false,
          notes: data.notes ?? null,
        })
        .where(eq(sleepSessions.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(sleepSessions)
      .values({
        ...data,
        userId,
        date: cleanDate,
        lastDeviceUse: new Date(data.lastDeviceUse),
        firstDevicePickup: new Date(data.firstDevicePickup),
        alignmentScore: data.alignmentScore ?? 100,
        isConfirmed: data.isConfirmed ?? false,
      } as any)
      .returning();
    return created;
  }

  async getTodaySleepSession(userId: number, date: string): Promise<SleepSession | undefined> {
    const cleanDate = String(date).split('T')[0];
    const [found] = await db.select()
      .from(sleepSessions)
      .where(and(eq(sleepSessions.userId, userId), eq(sleepSessions.date, cleanDate)))
      .limit(1);
    return found;
  }

  async getSleepHistory(userId: number, limit = 14): Promise<SleepSession[]> {
    return db.select()
      .from(sleepSessions)
      .where(eq(sleepSessions.userId, userId))
      .orderBy(desc(sleepSessions.date))
      .limit(limit);
  }

  async seedTasks() {
    const existing = await this.getAllTasks();
    if (existing.length > 0) return;
    await db.insert(tasks).values(DEFAULT_SEEDS.map(({ id, ...rest }) => rest));
  }

  // --- Goals & Roadmaps ---
  async createGoal(goal: InsertUserGoal & { userId: number }): Promise<UserGoal> {
    const [created] = await db.insert(userGoals).values(goal as any).returning();
    return created;
  }

  async getUserGoals(userId: number): Promise<UserGoalWithDetails[]> {
    const goalsList = await db.select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));

    const result: UserGoalWithDetails[] = [];
    for (const goal of goalsList) {
      const roadmap = await this.getGoalRoadmap(goal.id);
      const checkpoints = await this.getGoalCheckpoints(goal.id);
      const completedCount = checkpoints.filter(c => c.isCompleted).length;
      const progressPercent = checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;

      result.push({
        ...goal,
        roadmap,
        checkpoints,
        progressPercent,
      });
    }
    return result;
  }

  async getGoalById(goalId: number, userId: number): Promise<UserGoalWithDetails | undefined> {
    const [goal] = await db.select()
      .from(userGoals)
      .where(and(eq(userGoals.id, goalId), eq(userGoals.userId, userId)))
      .limit(1);

    if (!goal) return undefined;

    const roadmap = await this.getGoalRoadmap(goal.id);
    const checkpoints = await this.getGoalCheckpoints(goal.id);
    const completedCount = checkpoints.filter(c => c.isCompleted).length;
    const progressPercent = checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;

    return {
      ...goal,
      roadmap,
      checkpoints,
      progressPercent,
    };
  }

  async deleteGoal(goalId: number, userId: number): Promise<boolean> {
    const [deleted] = await db.delete(userGoals)
      .where(and(eq(userGoals.id, goalId), eq(userGoals.userId, userId)))
      .returning();
    return !!deleted;
  }

  async createGoalRoadmap(roadmap: InsertGoalRoadmap & { userId: number }): Promise<GoalRoadmap> {
    await db.delete(goalRoadmaps).where(eq(goalRoadmaps.goalId, roadmap.goalId));
    const [created] = await db.insert(goalRoadmaps).values(roadmap as any).returning();
    return created;
  }

  async getGoalRoadmap(goalId: number): Promise<GoalRoadmap | undefined> {
    const [found] = await db.select()
      .from(goalRoadmaps)
      .where(eq(goalRoadmaps.goalId, goalId))
      .limit(1);
    return found;
  }

  async createGoalCheckpoints(checkpoints: InsertGoalCheckpoint[]): Promise<GoalCheckpoint[]> {
    if (!checkpoints || checkpoints.length === 0) return [];
    await db.delete(goalCheckpoints).where(eq(goalCheckpoints.goalId, checkpoints[0].goalId));
    return db.insert(goalCheckpoints).values(checkpoints as any).returning();
  }

  async getGoalCheckpoints(goalId: number): Promise<GoalCheckpoint[]> {
    return db.select()
      .from(goalCheckpoints)
      .where(eq(goalCheckpoints.goalId, goalId))
      .orderBy(goalCheckpoints.phaseIndex, goalCheckpoints.id);
  }

  async toggleCheckpoint(checkpointId: number, userId: number, isCompleted: boolean): Promise<GoalCheckpoint | undefined> {
    const [cp] = await db.select().from(goalCheckpoints).where(eq(goalCheckpoints.id, checkpointId)).limit(1);
    if (!cp) return undefined;

    const [goal] = await db.select().from(userGoals).where(and(eq(userGoals.id, cp.goalId), eq(userGoals.userId, userId))).limit(1);
    if (!goal) return undefined;

    const [updated] = await db.update(goalCheckpoints)
      .set({ isCompleted })
      .where(eq(goalCheckpoints.id, checkpointId))
      .returning();
    return updated;
  }
}

export const storage: IStorage = new DatabaseStorage();
