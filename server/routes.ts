import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { generatePlanWithAI, analyzeSentiment } from "./openai_helper";
import { insertMoodLogSchema, insertDailyHabitSchema, insertUserProfileSchema, insertFeelingsNoteSchema } from "@shared/schema";

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
      const { id, taskId } = req.params; // id is planId, but we might not need it if we trust item ID logic or have direct item update
      // Wait, my route path is /api/plans/:id/tasks/:taskId/complete
      // But my storage method completePlanItem takes itemId (the plan_item id).
      // Let's assume the frontend passes the plan_item id as taskId or I need to find it.
      // Actually, looking at the route definition: /api/plans/:id/tasks/:taskId/complete
      // Ideally I should just have /api/plan-items/:id/complete. 
      // But let's stick to the route def. taskId here likely refers to plan_item.id if the frontend follows standard REST for "item in plan".
      // OR it refers to the actual task ID and I need to find the plan item for today?
      // Let's assume the :taskId param in the URL is actually the plan_item.id for simplicity given the storage method.
      
      const planItemId = parseInt(taskId);
      const isCompleted = req.body.isCompleted;

      const updated = await storage.completePlanItem(planItemId, isCompleted);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Mood Routes ===
  app.post(api.mood.log.path, requireAuth, async (req, res) => {
    try {
      const input = insertMoodLogSchema.parse(req.body);
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

  // === Habit Routes ===
  app.post(api.habits.log.path, requireAuth, async (req, res) => {
    try {
      const input = insertDailyHabitSchema.parse(req.body);
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

  // Seed tasks on startup
  await storage.seedTasks();

  return httpServer;
}
