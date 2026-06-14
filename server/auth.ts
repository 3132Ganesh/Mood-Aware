import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { ExpressAuth, getSession } from "@auth/express";
import { Express, Request, Response, NextFunction } from "express";
import { User as SelectUser } from "@shared/schema";

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Required for the adapter

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export async function setupAuth(app: Express) {
  // Dynamic imports for ESM compatibility
  const { SupabaseAdapter } = await import("@auth/supabase-adapter");
  const Google = (await import("@auth/express/providers/google")).default;
  const Credentials = (await import("@auth/express/providers/credentials")).default;

  // Auth.js configuration
  const authConfig: any = {
    trustHost: true,
    skipCSRFCheck: require("@auth/core").skipCSRFCheck,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      Credentials({
        name: "Credentials",
        credentials: {
          username: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials: any) {
          const user = await storage.getUserByUsername(credentials.username);
          if (user && user.password && bcrypt.compareSync(credentials.password, user.password)) {
            return user;
          }
          return null;
        }
      })
    ],
    adapter: SupabaseAdapter({
      url: supabaseUrl,
      secret: supabaseServiceKey,
    }),
    secret: process.env.AUTH_SECRET,
    callbacks: {
      async session({ session, user }: any) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  };

  // Auth.js middleware
  app.use("/api/auth", ExpressAuth(authConfig));

  // Middleware to attach Auth.js session to Express req.user
  const attachUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await getSession(req, authConfig);
      if (session?.user) {
        // Mock req.user for backward compatibility with Passport patterns
        (req as any).user = session.user;
        (req as any).isAuthenticated = () => true;
      } else {
        (req as any).user = null;
        (req as any).isAuthenticated = () => false;
      }
      next();
    } catch (err) {
      console.error("Auth.js session error:", err);
      next();
    }
  };

  app.use(attachUser);

  // Helper route to get current user
  app.get("/api/user", (req, res) => {
    if ((req as any).isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json(null);
    }
  });
}

