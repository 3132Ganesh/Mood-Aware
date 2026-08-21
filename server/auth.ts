import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const isProd = app.get("env") === "production";

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "mood_aware_default_dev_secret_change_in_production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true, // Prevents XSS cookie theft
      secure: isProd, // Requires HTTPS in production
      sameSite: "lax", // Protects against Cross-Site Request Forgery (CSRF)
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  if (isProd) {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (!username || !password) {
          return done(null, false, { message: "Email and password are required" });
        }
        const normalizedUsername = username.trim().toLowerCase();
        const user = await storage.getUserByUsername(normalizedUsername);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid email or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Helper to strip sensitive password hash before sending to client
  const sanitizeUser = (user: SelectUser) => {
    const { password: _, ...safeUser } = user;
    return safeUser;
  };

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await storage.getUserByUsername(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || normalizedEmail.split('@')[0],
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(sanitizeUser(user));
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: { message?: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.status(200).json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json(sanitizeUser(req.user as SelectUser));
    } else {
      res.status(401).json(null);
    }
  });
}
