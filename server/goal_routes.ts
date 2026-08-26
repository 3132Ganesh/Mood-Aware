import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertUserGoalSchema } from "@shared/schema";
import { generateMasterRoadmapWithAI, RoadmapPhase } from "./ai_goal_engine";

export function registerGoalRoutes(app: Express) {
  // GET /api/goals - List all goals for logged-in user
  app.get("/api/goals", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const goals = await storage.getUserGoals(req.user!.id);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching user goals:", error);
      res.status(500).json({ message: "Failed to fetch user goals" });
    }
  });

  // POST /api/goals - Create new goal and auto-generate AI roadmap
  app.post("/api/goals", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const parseResult = insertUserGoalSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid goal input", errors: parseResult.error });
      }

      const userId = req.user!.id;
      const createdGoal = await storage.createGoal({
        ...parseResult.data,
        userId,
      });

      // Extract custom AI headers if user supplied their own OpenRouter key/model
      const customKey = req.headers["x-openrouter-key"] as string | undefined;
      const customModel = req.headers["x-openrouter-model"] as string | undefined;

      // Generate AI Master Roadmap
      const aiData = await generateMasterRoadmapWithAI(
        {
          title: createdGoal.title,
          category: createdGoal.category,
          description: createdGoal.description || undefined,
          targetDeadline: createdGoal.targetDeadline || undefined,
          skillLevel: createdGoal.skillLevel || undefined,
        },
        customKey,
        customModel
      );

      // Save Roadmap
      const roadmap = await storage.createGoalRoadmap({
        goalId: createdGoal.id,
        userId,
        title: aiData.title,
        aiSelfTrainedSummary: aiData.aiSelfTrainedSummary,
        phases: aiData.phases as any,
        recommendedTools: aiData.recommendedTools as any,
        searchQueries: aiData.searchQueries as any,
      });

      // Insert Checkpoints
      const checkpointInserts: any[] = [];
      aiData.phases.forEach((phase: RoadmapPhase) => {
        phase.checkpoints.forEach((cp) => {
          checkpointInserts.push({
            roadmapId: roadmap.id,
            goalId: createdGoal.id,
            phaseIndex: phase.phaseIndex,
            title: cp.title,
            instruction: `${cp.instruction} (Due: ${cp.dueDateHint})`,
            isCompleted: false,
            dueDate: cp.dueDateHint,
          });
        });
      });

      const checkpoints = await storage.createGoalCheckpoints(checkpointInserts);

      const fullDetails = await storage.getGoalById(createdGoal.id, userId);
      res.status(201).json(fullDetails);
    } catch (error) {
      console.error("Error creating user goal:", error);
      res.status(500).json({ message: "Failed to create goal and generate roadmap" });
    }
  });

  // GET /api/goals/:id - Fetch single goal details
  app.get("/api/goals/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const goalId = parseInt(req.params.id);
      if (isNaN(goalId)) return res.status(400).json({ message: "Invalid goal ID" });

      const goal = await storage.getGoalById(goalId, req.user!.id);
      if (!goal) return res.status(404).json({ message: "Goal not found" });

      res.json(goal);
    } catch (error) {
      console.error("Error fetching goal detail:", error);
      res.status(500).json({ message: "Failed to fetch goal detail" });
    }
  });

  // POST /api/goals/:id/generate - Re-train / Re-generate AI Roadmap
  app.post("/api/goals/:id/generate", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const goalId = parseInt(req.params.id);
      if (isNaN(goalId)) return res.status(400).json({ message: "Invalid goal ID" });

      const goal = await storage.getGoalById(goalId, req.user!.id);
      if (!goal) return res.status(404).json({ message: "Goal not found" });

      const customKey = req.headers["x-openrouter-key"] as string | undefined;
      const customModel = req.headers["x-openrouter-model"] as string | undefined;

      const aiData = await generateMasterRoadmapWithAI(
        {
          title: goal.title,
          category: goal.category,
          description: goal.description || undefined,
          targetDeadline: goal.targetDeadline || undefined,
          skillLevel: goal.skillLevel || undefined,
        },
        customKey,
        customModel
      );

      const roadmap = await storage.createGoalRoadmap({
        goalId: goal.id,
        userId: req.user!.id,
        title: aiData.title,
        aiSelfTrainedSummary: aiData.aiSelfTrainedSummary,
        phases: aiData.phases as any,
        recommendedTools: aiData.recommendedTools as any,
        searchQueries: aiData.searchQueries as any,
      });

      const checkpointInserts: any[] = [];
      aiData.phases.forEach((phase: RoadmapPhase) => {
        phase.checkpoints.forEach((cp) => {
          checkpointInserts.push({
            roadmapId: roadmap.id,
            goalId: goal.id,
            phaseIndex: phase.phaseIndex,
            title: cp.title,
            instruction: `${cp.instruction} (Due: ${cp.dueDateHint})`,
            isCompleted: false,
            dueDate: cp.dueDateHint,
          });
        });
      });

      await storage.createGoalCheckpoints(checkpointInserts);

      const updated = await storage.getGoalById(goal.id, req.user!.id);
      res.json(updated);
    } catch (error) {
      console.error("Error re-generating roadmap:", error);
      res.status(500).json({ message: "Failed to re-generate roadmap" });
    }
  });

  // PATCH /api/goals/:id/checkpoints/:cpId - Toggle milestone checkpoint
  app.patch("/api/goals/:id/checkpoints/:cpId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const cpId = parseInt(req.params.cpId);
      const { isCompleted } = req.body;

      if (isNaN(cpId) || typeof isCompleted !== "boolean") {
        return res.status(400).json({ message: "Invalid payload" });
      }

      const updatedCp = await storage.toggleCheckpoint(cpId, req.user!.id, isCompleted);
      if (!updatedCp) {
        return res.status(404).json({ message: "Checkpoint not found" });
      }

      const updatedGoal = await storage.getGoalById(updatedCp.goalId, req.user!.id);
      res.json(updatedGoal);
    } catch (error) {
      console.error("Error toggling checkpoint:", error);
      res.status(500).json({ message: "Failed to toggle checkpoint" });
    }
  });

  // DELETE /api/goals/:id - Delete goal
  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const goalId = parseInt(req.params.id);
      if (isNaN(goalId)) return res.status(400).json({ message: "Invalid goal ID" });

      const success = await storage.deleteGoal(goalId, req.user!.id);
      if (!success) return res.status(404).json({ message: "Goal not found" });

      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });
}
