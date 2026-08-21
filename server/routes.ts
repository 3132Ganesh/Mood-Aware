import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { generatePlanWithAI, analyzeSentiment } from "./openai_helper";
import { insertMoodLogSchema, insertMoodSwingSchema, insertDailyHabitSchema, insertUserProfileSchema, insertFeelingsNoteSchema, insertTimeCapsuleSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Helper middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // === Profile Routes ===
  app.get(api.profile.get.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfile(req.user!.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post(api.profile.update.path, requireAuth, async (req, res) => {
    try {
      const input = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createOrUpdateProfile(req.user!.id, input);
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Task Routes ===
  app.get(api.tasks.list.path, requireAuth, async (req, res) => {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  // === Plan Routes ===
  app.get(api.plans.current.path, requireAuth, async (req, res) => {
    const plan = await storage.getActivePlan(req.user!.id);
    if (!plan) {
      return res.status(404).json({ message: "No active plan found" });
    }
    res.json(plan);
  });

  app.post(api.plans.generate.path, requireAuth, async (req, res) => {
    try {
      const userProfile = await storage.getProfile(req.user!.id);
      const lastMood = await storage.getLastMoodLog(req.user!.id);
      const allTasks = await storage.getAllTasks();

      if (!userProfile) {
        return res.status(400).json({ message: "Complete profile first" });
      }

      // Default mood if none exists
      const moodData = lastMood || { moodScore: 3, moodLabel: "Neutral", stressScore: 3, energyScore: 3, notes: "" };

      // Generate Plan using AI
      const aiPlan = await generatePlanWithAI(userProfile, moodData, allTasks);
      
      if (!aiPlan || !aiPlan.days) {
        return res.status(500).json({ message: "Failed to generate plan" });
      }

      // Create Plan record
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6); // 7 days

      const newPlan = await storage.createPlan({
        userId: req.user!.id,
        startDate: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],
        isActive: true,
      });

      // Create Plan Items
      const planItemsToInsert = [];
      for (const day of aiPlan.days) {
        const itemDate = new Date(startDate);
        itemDate.setDate(startDate.getDate() + day.dayOffset);
        
        for (const taskId of day.taskIds) {
          planItemsToInsert.push({
            planId: newPlan.id,
            dayDate: itemDate.toISOString().split('T')[0],
            taskId: taskId,
            isCompleted: false,
          });
        }
      }

      await storage.createPlanItems(planItemsToInsert);
      
      // Return the created plan (client will likely refetch 'current')
      res.status(201).json(newPlan);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.plans.completeTask.path, requireAuth, async (req, res) => {
    try {
      const { id, taskId } = req.params;
      const planId = parseInt(id);
      const planItemId = parseInt(taskId);
      const isCompleted = Boolean(req.body.isCompleted);

      // Verify the active plan belongs to the logged-in user (prevents IDOR)
      const userPlan = await storage.getActivePlan(req.user!.id);
      if (!userPlan || userPlan.id !== planId) {
        return res.status(403).json({ message: "Forbidden: You cannot modify another user's plan" });
      }

      const updated = await storage.completePlanItem(planId, planItemId, isCompleted);
      if (!updated) {
        return res.status(404).json({ message: "Plan task not found" });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Mood Routes ===
  app.post(api.mood.log.path, requireAuth, async (req, res) => {
    try {
      const input = insertMoodLogSchema.parse(req.body);
      const existing = await storage.getMoodLogByDate(req.user!.id, input.date);
      if (existing) {
        return res.status(400).json({ 
          message: "Daily check-in is already completed for today. It will reset after 24 hours for your next day reflection. Use 'Record Mood Swing' to log any intraday mood changes!",
          alreadyCheckedIn: true 
        });
      }
      const log = await storage.createMoodLog({ ...input, userId: req.user!.id });
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.mood.history.path, requireAuth, async (req, res) => {
    const logs = await storage.getMoodLogs(req.user!.id);
    res.json(logs);
  });

  // === Mood Swings Routes (Intraday Fluctuations) ===
  app.post(api.mood.logSwing.path, requireAuth, async (req, res) => {
    try {
      const input = insertMoodSwingSchema.parse(req.body);
      const swing = await storage.createMoodSwing({ ...input, userId: req.user!.id });
      res.status(201).json(swing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.mood.swingsHistory.path, requireAuth, async (req, res) => {
    try {
      const date = req.query.date as string | undefined;
      if (date) {
        const swings = await storage.getTodayMoodSwings(req.user!.id, date);
        return res.json(swings);
      }
      const swings = await storage.getMoodSwings(req.user!.id);
      res.json(swings);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Habit Routes ===
  app.post(api.habits.log.path, requireAuth, async (req, res) => {
    try {
      const input = insertDailyHabitSchema.parse(req.body);
      const existing = await storage.getHabitLogByDate(req.user!.id, input.date);
      if (existing) {
        return res.status(400).json({ message: "You have already logged your habits for today." });
      }
      const log = await storage.createHabitLog({ ...input, userId: req.user!.id });
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.habits.history.path, requireAuth, async (req, res) => {
    const logs = await storage.getHabitLogs(req.user!.id);
    res.json(logs);
  });

  // === Notes Routes ===
  app.get(api.notes.list.path, requireAuth, async (req, res) => {
    const notes = await storage.getNotes(req.user!.id);
    res.json(notes);
  });

  app.post(api.notes.create.path, requireAuth, async (req, res) => {
    try {
      const input = insertFeelingsNoteSchema.parse(req.body);
      
      // Analyze sentiment
      const sentimentScore = await analyzeSentiment(input.content);
      
      const note = await storage.createNote({ 
        ...input, 
        userId: req.user!.id,
        sentimentScore
      });
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Capsules Routes ===
  app.get(api.capsules.list.path, requireAuth, async (req, res) => {
    const capsules = await storage.getTimeCapsules(req.user!.id);
    res.json(capsules);
  });

  app.post(api.capsules.create.path, requireAuth, async (req, res) => {
    try {
      const input = insertTimeCapsuleSchema.parse(req.body);
      const capsule = await storage.createTimeCapsule({
        ...input,
        userId: req.user!.id,
      });
      res.status(201).json(capsule);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.capsules.undelivered.path, requireAuth, async (req, res) => {
    const capsule = await storage.getUndeliveredCapsule(req.user!.id);
    res.json(capsule || null);
  });

  app.patch(api.capsules.markDelivered.path, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markCapsuleDelivered(id, req.user!.id);
      if (!updated) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed tasks on startup
  await storage.seedTasks();

  return httpServer;
}
