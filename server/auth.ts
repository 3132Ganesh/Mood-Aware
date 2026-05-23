import { createClient } from "@supabase/supabase-js";
import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Middleware to verify Supabase JWT
  const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Sync Supabase user with our database
      // In a real SaaS, we'd ensure the user exists in our 'users' table
      let localUser = await storage.getUserByUsername(user.email!);
      if (!localUser) {
        localUser = await storage.createUser({
          email: user.email!,
          password: "EXTERNAL_AUTH", // Supabase handles password
          name: user.user_metadata.full_name || user.email!.split('@')[0],
        });
      }

      // Attach to request
      (req as any).user = localUser;
      next();
    } catch (err) {
      next(err);
    }
  };

  app.use(verifyToken);

  // Helper for routes to check if authenticated
  // (req.isAuthenticated is a passport helper, we'll keep it or mock it)
  app.use((req, res, next) => {
    req.isAuthenticated = () => !!(req as any).user;
    next();
  });

  // Supabase Auth typically happens on the frontend. 
  // These routes are kept for compatibility or can be removed if strictly using Supabase SDK on client.
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json(null);
    }
  });

  app.post("/api/logout", (req, res) => {
    // Client clears local storage for Supabase, backend just acknowledges
    res.sendStatus(200);
  });
}
